import { useState, useContext, useEffect } from 'react';
import { Table, Button, Col, Container, Row, Alert, Spinner } from 'react-bootstrap';
import './tabledisplayreportgroup.css';
import NavBarReportSelection from './NavBarReportSelect';
import { AuthContext } from '../auth/AuthContext';
import { getReportGroupReports, getUserReportGroup, getReportById } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { getIsReportCompleted } from '../utils/api';

const TableUserDisplayReportGroup = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [reportDetails, setReportDetails] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const { groupId } = useParams();
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const dataReports = await getReportGroupReports(groupId, token);
        setReports(dataReports);
        const numberOfReports = dataReports.length;
        const userReportGroup = await getUserReportGroup(groupId, token);
        const progressReports = userReportGroup.progressReports || 0;
        const individualReportProgress = 100 / numberOfReports;
        const reportDetailsObject = {};
        var remainingProgressReport = progressReports;

        for (const report of dataReports) {
          const reportId = report.report.reportId;
          const reportContent = await getReportById(reportId, token);
          const concatenatedString = reportContent.background + reportContent.findings + reportContent.impression;
          const truncatedString = concatenatedString.slice(0, 150);
          const translatedSentencesReport = report.report.translated_sentences;
          const userTranslatedSentence = [];
         
        
          let totalTranslatedSentencesReport = 0;
          Object.keys(translatedSentencesReport).forEach((type) => {
            totalTranslatedSentencesReport += translatedSentencesReport[type].filter((sentence) => sentence.text.trim() !== "").length;
          });
          const translatedSentencesProgress = Math.round((userTranslatedSentence.length / totalTranslatedSentencesReport) * 100);
          //console.log("translatedSentencesProgress: ", translatedSentencesProgress);

          const numberOfReviewedTranslatedSentences = Math.round(translatedSentencesProgress * totalTranslatedSentencesReport / 100);
          const individualTransaltedSentencesProgress = Math.round((numberOfReviewedTranslatedSentences / totalTranslatedSentencesReport) * 100);

          var remainingProgressTranslatedSentencesReport = translatedSentencesProgress;

          let progressReport = 0;
          if (remainingProgressReport > 0) {
            progressReport = 100;
            remainingProgressReport -= individualReportProgress;
            if (remainingProgressReport < 0) {
              remainingProgressReport = 0;
            }
          }
          let translatedSentencesProgressReport = 0;
          if (remainingProgressTranslatedSentencesReport > 0) {
            translatedSentencesProgressReport = translatedSentencesProgress;
            remainingProgressTranslatedSentencesReport -= individualTransaltedSentencesProgress;
            
          }

          reportDetailsObject[reportId] = {
            content: truncatedString,
            progressReport,
            translatedSentencesProgressReport,
          };
        }

        setReportDetails(reportDetailsObject);
        setLoading(false); // Finaliza la carga
      } catch (error) {
        //console.error('Error fetching data:', error);
        setLoading(false); // Finaliza la carga
      }
    };

    fetchData();
  }, [groupId, token]);

  const getIndexReport = async (reportId) => {
    for (const report of reports) {
      if (report.report.reportId === reportId) {
        return report.report.index;
      }
    }
  };

  const startTranslationReport = async (groupId, reportId) => {
    try {
      //console.log(reports);
      const indexReport = await getIndexReport(reportId);
      //console.log("indexReport: ",indexReport);
      if (indexReport >0){
        const previousReportId = reports[indexReport-1].report.reportId;
        //console.log("previousReportId: ",previousReportId);
        const isReportCompleted = await getIsReportCompleted(previousReportId, token);
        //console.log("isReportCompleted: ",isReportCompleted);
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
    <Container>
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
                  <th>Report IDs</th>
                  <th>Contenido</th>
                  {/* <th>Progreso reportes</th>
                  <th>Progreso oraciones traducidas</th> */}
                  <th>Ver reporte</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const reportId = report.report.reportId;
                  const reportDetail = reportDetails[reportId] || {};

                  return (
                    <tr key={report.report.index}>
                      <td>{reportId}</td>
                      <td>{reportDetail.content || ''}</td>
                      {/* <td>
                        <ProgressBar
                          striped
                          animated
                          className="custom-progress-bar"
                          now={reportDetail.progressReport || 0}
                          label={`${Math.round(reportDetail.progressReport || 0)}%`}
                          variant={
                            Math.round(reportDetail.progressReport || 0) <= 33 ? 'danger' :
                            Math.round(reportDetail.progressReport || 0) <= 99 ? 'warning' :
                            'success'
                          }
                        />
                      </td>
                      <td>
                        <ProgressBar
                          striped
                          animated
                          className="custom-progress-bar"
                          now={reportDetail.translatedSentencesProgressReport || 0}
                          label={`${Math.round(reportDetail.translatedSentencesProgressReport || 0)}%`}
                          variant={
                            Math.round(reportDetail.translatedSentencesProgressReport || 0) <= 33 ? 'danger' :
                            Math.round(reportDetail.translatedSentencesProgressReport || 0) <= 99 ? 'warning' :
                            'success'
                          }
                        />
                      </td> */}
                      <td>
                        <Button onClick={() => startTranslationReport(groupId, reportId)}>Traducir</Button>
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