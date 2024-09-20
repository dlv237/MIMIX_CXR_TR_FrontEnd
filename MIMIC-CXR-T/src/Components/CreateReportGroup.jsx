import { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert} from 'react-bootstrap';
import {createReportGroups, getAllReportGroupReports} from '../utils/api';
import { AuthContext } from '../auth/AuthContext';

const CreateReportGroup = ({ setReportGroupReports, reportGroupReports, setCurrentView}) => {

  const { token } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(false);
  const [reportGroupData, setReportGroupData] = useState({
    name: '',
    reportIds: [],
  });

  const handleCreateReportGroup = async (reportGroupData) => {
    try {
      const response = await createReportGroups(reportGroupData, token);
      setReportGroupReports([...reportGroupReports, response.reportgroup]);
    } catch (error) {
      console.error('Error creating report group:', error);
      setShowAlert(true);
    } 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportGroupData({
      ...reportGroupData,
      [name]: value,
    });
  };

  const handleSendClick = async () => {
    try {
      const reportIdsArray = reportGroupData.reportIds.split(',').map((id) => Number(id.trim()));
      const requestBody = {
        name: reportGroupData.name,
        reportIds: reportIdsArray,
      };
      handleCreateReportGroup(requestBody);
    } catch (error) {
     
      console.error('Error al enviar el formulario:', error);
    }
  };

  return (
    <Container>
       <Alert show={showAlert} variant="success" onClose={() => setShowAlert(false)} dismissible>
        Error al enviar el formulario, ingresa ids correctos y separados por coma
      </Alert>

      <Form>
        <Form.Group controlId="formGroupName">
          <Form.Label>Report Group Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="name"
            value={reportGroupData.name}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="formGroupReportIds">
          <Form.Label>Report IDs (separado por coma)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter report IDs"
            name="reportIds"
            value={reportGroupData.reportIds}
            onChange={handleInputChange}
          />
        </Form.Group>
      </Form>
      <Button onClick={handleSendClick}>Enviar</Button>
    </Container>
  );
};

export default CreateReportGroup;
