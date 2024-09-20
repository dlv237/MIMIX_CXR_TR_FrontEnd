import { useState, useContext, useEffect } from 'react';
import { Tab, Nav, Col, Row } from 'react-bootstrap';
import CreateReportGroup from '../Components/CreateReportGroup';
import TableDisplayReports from '../Components/TableDisplayReportGroup';
import { AuthContext } from '../auth/AuthContext';
import { getAllReportGroupReports, createReportGroups, createUserReportGroups } from '../utils/api';
import NavAdmin from '../Components/NavAdmin';
import CreateUserReportGroup from '../Components/CreateUserReportGroup';
import DisplayUsers from '../Components/TableDisplayUsers';
import ModalUploadReports from '../Components/CreateJsonBatchReports';
import { useNavigate } from 'react-router-dom';
import Signup from '../profile/Signup';
import './admin.css';
import { getAllUsers} from '../utils/api';

function Admin() {
  const { token } = useContext(AuthContext);
  const [reportGroupReports, setReportGroupReports] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const getReportGroupReports = async () => {
    try {
      const response = await getAllReportGroupReports(token);
      setReportGroupReports(response);
      console.log(response);
    } catch (error) {
      console.error('Error fetching reportGroupReports:', error);
    } 
  };

  const handleDeleteReportGroup = (deletedReportId) => {
    setReportGroupReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };
  
  const handleDeleteUser = (deletedUserId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
  };

  const handleCreateUserReportGroup = async (userReportGroupData) => {
    try {
      const response = await createUserReportGroups(userReportGroupData, token);
      console.log("La respuesta de la creación de usuario en grupo de reportes es:", response);
      return response;
    } catch (error) {
      console.error('Error creating user report group:', error);
      return error.response;
    }
  };
  

  const getUsers = async () => {
    try {
      const usersData = await getAllUsers(token);
      setUsers(usersData);
      console.log(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    getReportGroupReports();
    getUsers();
  }, [token]);


  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate("/access-denied");
    }
  }, [user, navigate]);

  return (
    <>
    <Tab.Container id="left-tabs-example" defaultActiveKey="first" >
      <Row className="container-admin">
        <NavAdmin />
      </Row>
      
        <Row>
          <Col sm={3}>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="first">Ver o eliminar grupos de reportes</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Asociar usuario a grupo de reportes</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="third">Ver lista de usuarios registrados</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fourth">Cargar json con batch de reportes</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fifth">Registro de usuarios</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="first" unmountOnExit mountOnEnter>
                <TableDisplayReports reportGroupReports={reportGroupReports} onDeleteReportGroup={handleDeleteReportGroup}/>
              </Tab.Pane>
              <Tab.Pane eventKey="second" unmountOnExit mountOnEnter> 
                <CreateUserReportGroup handleCreateUserReportGroup={handleCreateUserReportGroup} allUsers={users} reportGroupReports={reportGroupReports} getReportGroupReports={getReportGroupReports} />
              </Tab.Pane>
              <Tab.Pane eventKey="third" unmountOnExit mountOnEnter>
                <DisplayUsers allUsers={users} onDeleteUser={handleDeleteUser}/>
              </Tab.Pane>
              <Tab.Pane eventKey="fourth" unmountOnExit mountOnEnter>
                <ModalUploadReports getReportGroupReports={getReportGroupReports} />
              </Tab.Pane>
              <Tab.Pane eventKey="fifth" unmountOnExit mountOnEnter>
                <Signup getUsers={getUsers}/>
              </Tab.Pane>
            </Tab.Content>
          </Col>

        </Row>
      </Tab.Container>
    </>
  );
}

export default Admin;