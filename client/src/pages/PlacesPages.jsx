import { Link, useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Perks from "../Perks.jsx";

export default function PlacesPage(){
    const {action} = useParams();
    const [address, setAddress]=useState('');
    const [title, setTitle]=useState('');
    const [addedPhotos, setAddedPhotos]=useState([]);
    const [photoLink, setPhotoLink]=useState('');
    const [description,setDescription] = useState('');
    const [perks,setPerks] = useState('');
    const [extraInfo,setExtraInfo] = useState('');
    const [checkIn,setCheckIn] = useState('');
    const [checkOut,setCheckOut] = useState('');
    const [maxGuests,setMaxGuests] = useState(1);
    const [price,setPrice] = useState(1000);
    
    function inputHeader(text) {
        return (
          <h2 className="text-2xl mt-4">{text}</h2>
        );
      }

      function inputDescription(text) {
        return (
          <p className="text-gray-500 text-sm">{text}</p>
        );
      }
      function preInput(header,description) {
        return (
          <>
            {inputHeader(header)}
            {inputDescription(description)}
          </>
        );
      }
    async function addPhotoByLink(ev){
        ev.preventDefault();
        const {data:filename}= await axios.post('/upload-by-link',{link:photoLink});
        setAddedPhotos(prev =>{
            return [...prev,filename];
        })
        setPhotoLink('');
    }

    function uploadPhoto(ev){
        const files = ev.target.files;
        const data = new FormData();

        for(let i=0;i<files.length;i++){
            data.append('photos',files[i]);
        }
        
       axios.post('/upload',data,{
            headers: {'Content-type':'multipart/form-data'}
        }).then(response => {
            const {data:filenames} = response;
            setAddedPhotos(prev => {
                return [...prev,...filenames];
            });
        })
    }
      

    return(
        <div>
           {action !=='new' && (
            <div className="text-center">
               <Link className="bg-primary text-white py-2 px-6 rounded-full inline-flex gap-1" to={'/account/places/new'}>
               
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>

               Add new place
               </Link>
            </div>
           )}
            
            {action === 'new' && (
                <div>
                 <form>
                    {preInput('Title', 'Title for your place. should be short and catchy as in advertisement')} 
                    <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My lovely apt"/>
                    {preInput('Address', 'Address to this place')}
                    <input type="text" value={address} onChange={ev => setAddress(ev.target.value)}placeholder="address"/>
                    {preInput('Photos','more = better')}
                    <div className="flex gap-2">
                        <input value={photoLink} onChange={ev => setPhotoLink(ev.target.value)} type="text" placeholder="Add using a link ....Jpg"/>
                        <button onClick={addPhotoByLink} className="bg-primary text-white px-4  rounded-2xl">Add&nbsp;photos</button>
                    </div>

                    <div className="mt-2 grid gap-3 grid-cols-3 lg:grid-cols-6 md:grid-cols-4">
                     {addedPhotos.length > 0 && addedPhotos.map(link =>(
                        <div>
                            <img className="rounded-2xl " src={'http://localhost:4000/uploads/'+link} alt=""/>
                        </div>
                     ))}
                        <label className="border bg-transparent rounded-2xl p-2 text-2xl text-gray-600 flex justify-center items-center gap-1 cursor-pointer">
                         <input type="file" multiple className="hidden" onChange={uploadPhoto}/>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>
                            Upload
                        </label>
                    </div>
                    {preInput('Description','description of the place')}
                    <textarea value={description} onChange={ev => setDescription(ev.target.value)} />
                    {preInput('Perks','select all the perks of your place')}
                    <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-3">
                     <Perks selected={perks} onChange={setPerks} /> 
                    </div>
                    {preInput('Extra info','house rules, etc')}
                    <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)} />
                    {preInput('Check in&out times','add check in and out times, remember to have some time window for cleaning the room between guests')}
                    <div className="grid sm:grid-cols-3 gap-2">
                        <div>
                           <h3 className="mt-2 -mb-1">Check in time</h3>
                           <input type="text"
                            value={checkIn}
                            onChange={ev => setCheckIn(ev.target.value)}
                            placeholder="14:00"/>
                        </div>
                        <div>
                           <h3 className="mt-2 -mb-1">Check out time</h3>
                           <input type="text"
                            value={checkOut}
                            onChange={ev => setCheckOut(ev.target.value)}
                            placeholder="11:00" />
                        </div>
                        <div>
                           <h3 className="mt-2 -mb-1">Max number of guests</h3>
                           <input type="number" value={maxGuests}
                            onChange={ev => setMaxGuests(ev.target.value)}/>
                        </div>
                        <div>
                            <h3 className="mt-2 -mb-1">Price per night</h3>
                            <input type="number" value={price}
                                onChange={ev => setPrice(ev.target.value)}/>
                        </div>
                    </div>
                    <div className="my-4">
                        <button className="primary">Save</button>
                    </div>
                 </form>
                    
                </div>
            )}
        </div>
    );
}