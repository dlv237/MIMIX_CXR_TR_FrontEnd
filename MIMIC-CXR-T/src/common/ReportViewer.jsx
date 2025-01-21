import { useState, useEffect, useContext } from 'react';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import './translator.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { Container, Col, Row } from 'react-bootstrap';
import { getReportFromGroupReports } from '../utils/api';
import Viewer from '../Components/ReportViewer/Viewer';

function ReportViewer() {
  const { token } = useContext(AuthContext);
  const { groupId, reportId } = useParams();
  const [report, setReport] = useState({});

  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportResponse = await getReportFromGroupReports(groupId, reportId, token);
        const data = reportResponse;
        const sortById = (a, b) => a.id - b.id;
        
        data.report.sentences.background.sort(sortById);
        data.report.sentences.findings.sort(sortById);
        data.report.sentences.impression.sort(sortById);

        data.report.translated_sentences.background.sort(sortById);
        data.report.translated_sentences.findings.sort(sortById);
        data.report.translated_sentences.impression.sort(sortById);
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };
    fetchReport();
  }, [reportId, token]);




  return (
    <>
      <NavBarReportSelection />
        <Container className="translator-container">
          <Row>
            <Col >
              {report.report && report.report.sentences?  (
                <Viewer report={report}/>
              ) : (
                <p>Loading translated sentences...</p>
              )}
            </Col>
          </Row>
        </Container>
    </>
  );
}

export default ReportViewer;