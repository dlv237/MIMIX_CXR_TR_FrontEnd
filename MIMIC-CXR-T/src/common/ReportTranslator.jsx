import { useState, useEffect, useContext } from 'react';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import Viewer from '../Components/ReportTranslator';
import './translator.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { Container, Col, Row } from 'react-bootstrap';
import {
  getIsReportCompleted, getReportGroupReportsLength, getReportFromGroupReports
} from '../utils/api';
import { useNavigate } from 'react-router-dom';

function ReportTranslator() {
  const { token } = useContext(AuthContext);
  const { groupId, reportId } = useParams();
  const [report, setReport] = useState({});
  const [reportsLength, setReportsLength] = useState(0);

  const navigate = useNavigate();
  
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

  useEffect(() => {
    const fetchReportsLenght = async () => {
      try {
        const response = await getReportGroupReportsLength(groupId, token);
        setReportsLength(response);
      } catch (error) {
        console.error('Error fetching report groups:', error);
      }
    };
    
    fetchReportsLenght();
  }, [groupId, token]);
  

  const goToNextReport = async () => {
    navigate(`/translator/${groupId}/report/${report.report.index+1}`);
    scrollTo(0, 0);
  };
  

  const goToPreviousReport = () => {
    const previousIndex = (reportsLength + report.report.index - 1) % reportsLength;
    navigate(`/translator/${groupId}/report/${previousIndex}`);
  };


  return (
    <>
      <NavBarReportSelection />
        <Container className="translator-container">
          <Row>
            <Col >
              {report.report && report.report.sentences?  (
                <Viewer
                  groupId={groupId}
                  report={report}
                  currentIndex={report.report.index}
                  checkAreReportsCompleted={getIsReportCompleted}
                  goToNextReport={goToNextReport}
                  goToPreviousReport={goToPreviousReport}
                  />
              ) : (
                <p>Loading translated sentences...</p>
              )}
            </Col>
          </Row>
        </Container>
    </>
  );
}

export default ReportTranslator;