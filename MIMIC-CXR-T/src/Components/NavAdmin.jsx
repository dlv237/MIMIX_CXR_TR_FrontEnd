import { Nav, Navbar, Button } from 'react-bootstrap';
import LogoutButton from '../profile/Logout';

function NavAdmin() {
  return (
    <Navbar className="justify-content-end relative" bg="dark" data-bs-theme="dark" 
      style={{position: 'relative', padding: '1rem', height: '4rem '}}
    >
      <Navbar.Brand>MIMIC-CXR</Navbar.Brand>
      <Nav className="ml-auto" style={{position: 'relative'}}> 
        <Nav.Link href="/mimix-cxr-tr/admin">
          <Button variant="info">
            Vista Admin
          </Button>
        </Nav.Link>
        <Nav.Link href="/mimix-cxr-tr/reportselection">
          <Button variant="success">
            Vista Usuario
          </Button>
        </Nav.Link>
        <Nav.Link>
          <LogoutButton/>
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default NavAdmin;

