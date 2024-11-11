import React, {useContext, useState} from 'react';
import './Login.css';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { Button } from 'react-bootstrap';
import LogoutIcon from '@mui/icons-material/Logout';


const LogoutButton = () => {
  const navigate = useNavigate();
  const {logout} = useContext(AuthContext);
  const [msg, setMsg] = useState("");

  const handleLogout = () => {
    logout();
    setMsg("Has hecho logout con éxito!")
    navigate('/');
  }

  return (
    <>
      {msg.length > 0 && <div className="successMsg"> {msg} </div>}
      <button onClick={handleLogout} className=' text-white bg-transparent text-center flex'>
        <LogoutIcon className='mr-2'/>
        Cerrar sesión
      </button>
    </>
  );
}

export default LogoutButton;