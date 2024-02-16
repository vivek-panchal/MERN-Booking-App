const express = require('express');
const app = express();
const User =require('./models/User.js');
const jwt = require('jsonwebtoken')
const cors=require('cors');
const mongoose=require("mongoose");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
require('dotenv').config();


const bcryptSalt= bcrypt.genSaltSync(10);
const jwtSecret = 'vguhjhgsrttf2554gh78vhg5fxvb8gdftxb3'

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}))


mongoose.connect(process.env.MONGO_URL);


app.get('/test',(req,res) =>{
    res.json('test passed')
})


//Register routes
app.post('/register',async (req,res)=>{
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
app.post('/login', async (req,res) => {
    
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

  app.get('/profile', (req,res) => {
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
 
app.listen(4000);