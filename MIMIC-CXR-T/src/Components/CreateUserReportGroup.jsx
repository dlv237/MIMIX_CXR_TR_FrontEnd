import { useState, useContext } from 'react';
import { Form, Button, ListGroup, Table, Col, Row, Alert  } from 'react-bootstrap';
import { AuthContext } from '../auth/AuthContext';


import './CreateUserReportGroup.css';

const CreateUserReportGroup = ({ handleCreateUserReportGroup, allUsers, reportGroupReports, getReportGroupReports}) => {

  const { token } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userReportGroupData, setUserReportGroupData] = useState({
    reportGroupId: '',
    userIds: [],
  });

  const users = allUsers;
  const updatedReports = reportGroupReports;

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserReportGroupData({
      ...userReportGroupData,
      [name]: value,
    });
  };

  const handleUserSelection = (userId) => {
    const isSelected = userReportGroupData.userIds.includes(userId);
    if (isSelected) {
      setUserReportGroupData({
        ...userReportGroupData,
        userIds: userReportGroupData.userIds.filter((id) => id !== userId),
      });
    } else {
      setUserReportGroupData({
        ...userReportGroupData,
        userIds: [...userReportGroupData.userIds, userId],
      });
    }
  };

  const handleSendClick = async () => {

    if (!userReportGroupData.reportGroupId) {
      setErrorMsg('Debe ingresar un ID de grupo de reporte.');
      setShowError(true);
      setShowAlert(false);
      return;
    }

    if (userReportGroupData.userIds.length === 0) {
      setErrorMsg('Debe seleccionar al menos un usuario.');
      setShowError(true);
      setShowAlert(false);
      return;
    }

    try {
      const reportGroupId = Number(userReportGroupData.reportGroupId);
      const requestBody = {
        reportGroupId,
        userIds: userReportGroupData.userIds.map((id) => Number(id)),
      };
      const response = await handleCreateUserReportGroup(requestBody, token);
      console.log("La respuesta de la creación de usuario en grupo de reportes es:", response);
      if (response.status === 201) {
        getReportGroupReports();
        setShowAlert(true);
        setShowError(false);
      } else {
        setErrorMsg(response.data.error);
        setShowError(true);
        setShowAlert(false);
      }
    } catch (error) {
      console.log('Error creating user report group:', error);
      setErrorMsg(error.response.data.error);
      setShowError(true);
      setShowAlert(false);
    }
  };

  
  return (
    <div className='w-fit justify-self-center'>
      <Row>
      <Alert show={showError} variant="danger" onClose={() => setShowError(false)} dismissible>{errorMsg}</Alert>
      <Alert show={showAlert} variant="success" onClose={() => setShowAlert(false)} dismissible>Asociación generada con éxito.</Alert>
      <div className='form-batch-users'> 
        <Form.Group controlId="formGroupReportGroupId">
          <Form.Label>Asociar usuarios a grupo de reportes</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese batch Id"
            name="reportGroupId"
            value={userReportGroupData.reportGroupId}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button className="button-send"onClick={handleSendClick}>Asociar</Button>
      </div>

      <Col md={{offset: 1 }}>
        <Table striped  hover>
          <thead>
            <tr>
              <th className='w-[30%]'>Batch Id</th>
              <th className='w-[70%]'>Usuarios asociados</th>
            </tr>
          </thead>
          <tbody>
            {updatedReports.map((reportGroupReport) => (
              <tr key={reportGroupReport.id}>
                <td className='w-[30%]'>{reportGroupReport.id}</td>
                <td className='w-[70%]'>
                  {reportGroupReport.users && reportGroupReport.users.length > 0 ? (
                    reportGroupReport.users.map((user) => (
                      <div key={user}>{user}</div>
                    ))
                  ) : (
                    'No users'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>

      <Col>
        <Form>
          <Form.Group controlId="formGroupUserIds">
            <Form.Label>Seleccionar Usuarios:</Form.Label>
            <ListGroup>
            {users.map((user) => (
                <ListGroup.Item key={`${user.id}-${user.firstName}-${user.lastName}`}>
                  <Form.Check
                    type="checkbox"
                    label={`${user.id} - ${user.firstName} ${user.lastName}`}
                    checked={userReportGroupData.userIds.includes(user.id.toString())}
                    onChange={() => handleUserSelection(user.id.toString())}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
        </Form>

      </Col>
      </Row>
    </div>
  );
};

export default CreateUserReportGroup;
