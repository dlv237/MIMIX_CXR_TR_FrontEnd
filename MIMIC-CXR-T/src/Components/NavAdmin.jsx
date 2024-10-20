import { Nav, Navbar, Button } from 'react-bootstrap';
import LogoutButton from '../profile/Logout';

function NavAdmin() {
  return (
    <Navbar className="justify-content-end relative" bg="dark" data-bs-theme="dark" expand="lg" 
      style={{position: 'relative', padding: '0', height: '4rem '}}
    >
      <Nav className="ml-auto" style={{position: 'relative'}}> 
        <Nav.Link href="/mimix-cxr-tr/admin">
          <Button variant="info">
            vista admin
          </Button>
        </Nav.Link>
        <Nav.Link href="/mimix-cxr-tr/reportselection">
          <Button variant="success">
              Vista usuario
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

