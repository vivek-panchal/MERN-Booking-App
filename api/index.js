const express = require('express');
const app = express();
const User =require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const jwt = require('jsonwebtoken')
const cors=require('cors');
const mongoose=require("mongoose");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const multer = require('multer');
const imageDownloader = require('image-downloader');
const fs = require('fs')

const bcryptSalt= bcrypt.genSaltSync(10);
const jwtSecret = 'vguhjhgsrttf2554gh78vhg5fxvb8gdftxb3'

app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(cors({
    credentials:true,
    origin:'https://hotelbazaar.vercel.app/'
}))


mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/api/test',(req,res) =>{
    res.json('test passed')
})


//Register routes
app.post('/api/register',async (req,res)=>{
    const{name,email,password} = req.body;
    try {
        const userDoc = await User.create({
          name,
          email,
          password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
      } catch (e) {
        res.status(422).json(e);
      }
});


//login Route
app.post('/api/login', async (req,res) => {
    
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id
         
        }, jwtSecret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json(userDoc);
        });
      } else {
        res.status(422).json('Incorrect Password');
      }
    } else {
      return res.json('not found');
      
    }
  });

  //profile route
  app.get('/api/profile', (req,res) => {
    const {token} = req.cookies;

    if(token){
      jwt.verify(token, jwtSecret,{}, async (err, userData)=>{
        if(err) throw err;
        const {name, email, _id} = await User.findById(userData.id)
        res.json({name, email,_id});
      });
    } else{
        res.json(null);
    }
    
  })

  app.post('/api/logout', (req,res) => {
    res.cookie('token', '').json(true);
  });

  app.post('/api/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' +newName,
    });
    
    res.json(newName);
  });


  const photosMiddleware = multer({dest:'uploads/'});
  app.post('/api/upload',photosMiddleware.array('photos',100), (req,res)=>{
    
    const uploadedFiles = [];
    for(let i=0; i<req.files.length; i++){
      const {path, orignalname} = req.files[i];
      const parts = orignalname.split('.');
      const ext = parts[parts.length -1];
      const newPath = path + '.' + ext;
      fs.renameSync(path,newPath);
      uploadedFiles.push(newPath.replace('uploads/',''));
    }
    
    res.json(uploadedFiles);
  });


  app.post('/api/places', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    const {
      title,address,addedPhotos,description,price,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.create({
        owner:userData.id,price,
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,
      });
      res.json(placeDoc);
    });
  });

  app.get('/api/user-places', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      const {id} = userData;
      res.json( await Place.find({owner:id}) );
    });
  });

  app.get('/api/places/:id', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    res.json(await Place.findById(id));
  });

  app.put('/api/places', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    const {
      id, title,address,addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.findById(id);
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,address,photos:addedPhotos,description,
          perks,extraInfo,checkIn,checkOut,maxGuests,price,
        });
        await placeDoc.save();
        res.json('ok');
      }
    });
  });

  app.get('/api/places', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json( await Place.find() );
  });
 
  app.post('/api/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {
      place,checkIn,checkOut,numberOfGuests,name,phone,price,
    } = req.body;
    Booking.create({
      place,checkIn,checkOut,numberOfGuests,name,phone,price,
      user:userData.id,
    }).then((doc) => {
      res.json(doc);
    }).catch((err) => {
      throw err;
    });
  });
  
  
  
  app.get('/api/bookings', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json( await Booking.find({user:userData.id}).populate('place') );
  });

app.listen(4000);