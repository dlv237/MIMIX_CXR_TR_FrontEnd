import Container from 'react-bootstrap/Container';
import { Nav, Navbar } from 'react-bootstrap';
import ModalLogin from '../profile/ModalLogin';

function MyNavBar() {
  return (
    <Navbar collapseOnSelect bg="dark" data-bs-theme="dark" className="bg-body-tertiary" >
      <Container className='justify-around flex'>
        <Navbar.Brand href="#home">MIMIC-CXR</Navbar.Brand>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className='place-content-end'>
            <ModalLogin/>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default MyNavBar;

