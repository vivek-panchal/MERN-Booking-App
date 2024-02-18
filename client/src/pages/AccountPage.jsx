import { useContext, useState } from "react"
import { UserContext } from "../UserContext.jsx"
import { Navigate, useParams } from "react-router-dom";
import { Link , useLocation} from "react-router-dom";
import axios from "axios";


export default function AccountPage(){
    const {ready,user,setUser}= useContext(UserContext);
    const [redirect,setRedirect] = useState(null);

    const {pathname} = useLocation();
    let subpage = pathname.split('/')?.[2];

    if (subpage === undefined) {
        subpage = 'profile';
    }

    async function logout() {
        await axios.post('/logout');
        setRedirect('/');
        setUser(null)
      }

    if(!ready){
        return 'Loading....';
    }
    if(ready && !user && !redirect){
        return <Navigate to={'/login'} />
    }
    
    

    function linkClasses(type=null){
        let classes = 'inline-flex gap-1 py-2 px-6 rounded-full';
        if (type === subpage) {
           classes += ' bg-primary text-white';
        } else {
           classes += ' bg-blue-200';
        }
        return classes;
    }

    if(redirect){
        return <Navigate to={redirect}/>
    }

    return (
        <div>
            <nav className="w-full flex justify-center mt-8 gap-2 mb-8">
               <Link className={linkClasses('profile')} to={'/account'}>
                    My Profile
                </Link>
                <Link className={linkClasses('bookings')}  to={'/account/bookings'}>
                    My Bookings
                </Link>
                <Link className={linkClasses('places')}  to={'/account/places'}>
                    My Accomodations
                </Link>

            </nav>
            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                Logged in as {user.name} ({user.email})<br />
                <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
                </div>
            )}
            
        </div>
    )
}