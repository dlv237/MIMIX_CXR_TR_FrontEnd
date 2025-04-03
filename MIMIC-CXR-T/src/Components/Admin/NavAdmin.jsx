import { Nav, Navbar, Button } from 'react-bootstrap';
import LogoutButton from '../../profile/Logout';
import HomeIcon from '@mui/icons-material/Home';

function NavAdmin() {
  return (
    <Navbar className="justify-content-end relative" bg="dark" data-bs-theme="dark" 
      style={{position: 'relative', padding: '1rem', height: '4rem '}}
    >
      <Navbar.Brand>MIMIC-CXR</Navbar.Brand>
      <Nav className="ml-auto justify-between w-full" style={{position: 'relative'}}> 
        <Nav.Link href="/reportselection">
          <button variant="success" className=' text-white bg-blue-800 text-center flex'>
            <HomeIcon className='mr-2'/>
            Home
          </button>
        </Nav.Link>
        <Nav.Link>
          <LogoutButton/>
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default NavAdmin;

