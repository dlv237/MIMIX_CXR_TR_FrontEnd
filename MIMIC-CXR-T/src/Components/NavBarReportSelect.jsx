import { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import LogoutButton from '../profile/Logout';
import { AuthContext } from '../auth/AuthContext';
import { getUser }  from '../utils/api';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';

const NavBarReportSelection = () => {

  const [user, setUser] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(token);
        setUser(response);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }
  , [token]);


  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Navbar.Brand>MIMIC-CXR</Navbar.Brand>
      <Nav className="ml-auto justify-between w-full">
        <div className='flex'>
          <Nav.Link href="/mimix-cxr-tr/reportselection">
            <button className=' text-white bg-blue-800 text-center flex rounded-lg'>
              <HomeIcon className='mr-2'/>
              Home
            </button>
          </Nav.Link>
          {user && user.role === 'Admin' && (
            <Nav.Link href="/mimix-cxr-tr/admin">
              <button className=' text-white bg-green-800 text-center flex'>
                <AdminPanelSettingsIcon className='mr-2'/>
                Admin
              </button>
            </Nav.Link>
          )}
        </div>
        <Nav.Link>
          <LogoutButton />
        </Nav.Link>
      </Nav>
    </Navbar>
  );
};

export default NavBarReportSelection;
