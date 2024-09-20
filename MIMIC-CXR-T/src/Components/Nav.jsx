import Container from 'react-bootstrap/Container';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import ModalLogin from '../profile/ModalLogin';

function MyNavBar() {
  return (
    <Navbar collapseOnSelect bg="dark" data-bs-theme="dark" expand="lg" className="bg-body-tertiary" >
    <Container>
      <Navbar.Brand href="#home">MIMIC-CXR</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          {/*
          <Nav.Link href="">Acerca de</Nav.Link>
          <Nav.Link href="/mimix-cxr-tr/translator">Traductor</Nav.Link>
          <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">
              Another action
            </NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">
              Separated link
            </NavDropdown.Item>
          </NavDropdown>
          */}
        </Nav>
        <Nav>
          <ModalLogin/>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  );
}
export default MyNavBar;

