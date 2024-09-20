import { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import LogoutButton from '../profile/Logout';
import { AuthContext } from '../auth/AuthContext';
import { getUser }  from '../utils/api';

const NavBarReportSelection = () => {

  const [user, setUser] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(token);
        //console.log('Response:', response);
        setUser(response);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }
  , [token]);


  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Navbar.Brand>MIMIC-CXR</Navbar.Brand>
      <Nav className="ml-auto">
        <Nav.Link href="/mimix-cxr-tr/reportselection">
          <Button variant="success">Home</Button>
        </Nav.Link>
        {user && user.role === 'Admin' && (
          <Nav.Link href="/mimix-cxr-tr/admin">
            <Button variant="primary">Vista Admin</Button>
          </Nav.Link>
        )}
        <Nav.Link>
          <LogoutButton />
        </Nav.Link>
      </Nav>
    </Navbar>
  );
};

export default NavBarReportSelection;
