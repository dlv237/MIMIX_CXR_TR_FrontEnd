import { useState, useContext, useEffect } from 'react';
import { Table, Button, Col, Container, Row, Alert, Spinner } from 'react-bootstrap';
import NavBarReportSelection from './NavBarReportSelect';
import { AuthContext } from '../auth/AuthContext';
import { getReportGroupReports, getReportById , getUserReportGroup} from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { getIsReportCompleted } from '../utils/api';

const TableUserDisplayReportGroup = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [reportDetails, setReportDetails] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const { groupId } = useParams();
  const [ lastTranslatedReportId, setLastTranslatedReportId ] = useState(0);

  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const dataReports = await getReportGroupReports(groupId, token);
        setReports(dataReports);
        const reportDetailsObject = {};


        for (const report of dataReports) {
          const reportId = report.report.reportId;
          const reportContent = await getReportById(reportId, token);
          const concatenatedString = reportContent.background + reportContent.findings + reportContent.impression;
          const truncatedString = concatenatedString.slice(0, 150);

          reportDetailsObject[reportId] = {
            content: truncatedString,
          };
        }

        setReportDetails(reportDetailsObject);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    const fetchLastTranslatedReportId = async () => {
      try {
        const response = await getUserReportGroup(groupId, token);
        if (response) {
          setLastTranslatedReportId(response.lastTranslatedReportId);
        }
      } catch (error) {
        console.error('Error fetching user report group:', error);
      }
    };

    fetchLastTranslatedReportId();
    fetchData();
  }, [groupId, setLastTranslatedReportId, token]);

  const getIndexReport = async (reportId) => {
    for (const report of reports) {
      if (report.report.reportId === reportId) {
        return report.report.index;
      }
    }
  };

  const startTranslationReport = async (groupId, reportId) => {
    try {

      const indexReport = await getIndexReport(reportId);
      if (indexReport >0){
        const previousReportId = reports[indexReport-1].report.reportId;
        const isReportCompleted = await getIsReportCompleted(previousReportId, token);
        if (!isReportCompleted.completed) {
          setShowAlert(true);
          return;
        }
        else{
          setShowAlert(false);
          navigate(`/translator/${groupId}/report/${reportId-1}`);
        }
      }
      else{
        setShowAlert(false);
        navigate(`/translator/${groupId}/report/${reportId-1}`);
      }
    } catch (error) {
      console.error('Error checking report completion:', error);
    }
    
    
  };

  const loadingSpinner = (
    <div className="loading-spinner-container">
      <Spinner animation="grow" variant="primary" />
      <span className="sr-only">Cargando...</span>
    </div>
  );

  return (
    <>
    <Container className='mt-10 w-[90vw]'>
      <Row>
        <NavBarReportSelection />
      </Row>
      <Row style={{ marginTop: '6%' }}>
        <Col>
          <Alert variant="danger" show={showAlert}>
            <Alert.Heading>Reporte anterior incompleto</Alert.Heading>
            <p>Debe completar el reporte anterior para poder comenzar con el siguiente.</p>
          </Alert>
        </Col>
      </Row>
      <Row>
        <Col>
          {loading ? (
            loadingSpinner
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className='w-[12%]'>Report IDs</th>
                  <th className='w-[73%]'>Contenido</th>
                  {/* <th>Progreso reportes</th>
                  <th>Progreso oraciones traducidas</th> */}
                  <th className='w-[15%]'>Ver reporte</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const reportId = report.report.reportId;
                  const reportDetail = reportDetails[reportId] || {};

                  return (
                    <tr key={report.report.index}>
                      <td className='w-[12%]'>{reportId}</td>
                      <td className='w-[73%] text-start'>{reportDetail.content || ''}</td>
                      <td className='w-[15%]'>
                        <Button 
                          onClick={() => startTranslationReport(groupId, reportId)}
                          disabled={
                            !(reportId - 1 <= lastTranslatedReportId)
                          }
                        >
                          Traducir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  </>
  );
};

export default TableUserDisplayReportGroup;