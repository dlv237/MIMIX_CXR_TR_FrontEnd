import { useState, useEffect, useContext } from 'react';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import Viewer from '../Components/Viewer';
import './translator.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { Container, Col, Row, Alert } from 'react-bootstrap';
import { getUserTranslatedSentencesByReportGroup, 
  updateUserReportGroupProgress, getIsReportCompleted, fetchTotalTranslatedSentences, 
  getReportGroupReportsLength, getReportFromGroupReports
} from '../utils/api';
import { useNavigate } from 'react-router-dom';

function ReportTranslator() {
  const { token } = useContext(AuthContext);
  const { groupId, reportId } = useParams();
  const [report, setReport] = useState({});
  const [reportsLength, setReportsLength] = useState(0);

  const [progressTranslatedSentences, setProgressTranslatedSentences] = useState(0);
  const [reviewedTranslatedSentences, setReviewedTranslatedSentences] = useState(0);
  const [totalTranslatedSentences, setTotalTranslatedSentences] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const dismissDelay = 1400;
  const navigate = useNavigate();


  const calculateProgressTranslatedSentences = () => {
    return totalTranslatedSentences ? (reviewedTranslatedSentences / totalTranslatedSentences) * 100 : 0;
  };
  
  const closeGeneralAlert = () => {
    setShowAlert(false);
  };

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

  useEffect(() => {
    const newProgress = calculateProgressTranslatedSentences();
    setProgressTranslatedSentences(newProgress);
    updateProgressTranslatedSentencesInDatabase(newProgress).catch(error => {
      console.error('Error updating progress:', error);
    });
  }, [reviewedTranslatedSentences, totalTranslatedSentences]);

  const calculateTotalTranslatedSentences = async () => {
    const totalTranslatedSentencesResponse = await fetchTotalTranslatedSentences(groupId, token);
    const total = totalTranslatedSentencesResponse.totalTranslatedSentences;
    return total;
  };

  useEffect(() => {
    const fetchTotalSentences = async () => {
      const total = await calculateTotalTranslatedSentences();
      setTotalTranslatedSentences(total);
    };
    fetchTotalSentences();
  }, [groupId, token]);
  
  

  const updateProgressTranslatedSentencesInDatabase = async (progressTranslatedSentencesValue) => {
    try {
      await updateUserReportGroupProgress(progressTranslatedSentencesValue, groupId, token);
      } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchUserTranslatedSentences(groupId);
    
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [groupId, token]);

  const triggerProgressTranslatedSentencesRecalculation = async () => {
    await fetchUserTranslatedSentences(groupId);
    const newProgressTranslatedSentences = calculateProgressTranslatedSentences();
    setProgressTranslatedSentences(newProgressTranslatedSentences);
    updateProgressTranslatedSentencesInDatabase(newProgressTranslatedSentences).catch(error => {
      console.error('Error updating progress:', error);
    });
  };

  const fetchUserTranslatedSentences = async (groupId) => {
    try {
      console.log(groupId);
      /*let translatedPhrasesReviewed = 0;
      const response = await getUserTranslatedSentencesByReportGroup(groupId, token);
      if (response) {
          const numUserTranslatedPhrases = response.length;
          translatedPhrasesReviewed += numUserTranslatedPhrases;
        }
        setReviewedTranslatedSentences(translatedPhrasesReviewed);
      console.log("translatedPhrasesReviewed: ", translatedPhrasesReviewed)*/
    } catch (error) {
      console.error('Error fetching reviewed phrases:', error);
    }
  };

  const goToNextReport = async () => {
    try {
      const isCurrentReportCompleted = await getIsReportCompleted(report.report.reportId, token);
      if (isCurrentReportCompleted.completed) {
        navigate(`/translator/${groupId}/report/${report.report.reportId}`);
      } else {
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, dismissDelay);
      }
    } catch (error) {
      console.error('Error checking report completion:', error);
    }
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
            <Col>
              <Alert 
                show={showAlert} 
                variant="danger" 
                onClose={closeGeneralAlert} 
                dismissible
                className="custom-alert"
              >
                El reporte actual no está completo. Por favor, revisa todas las oraciones antes de avanzar.
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col >
              {report.report && report.report.sentences?  (
                <Viewer
                  groupId={groupId}
                  report={report}
                  triggerProgressTranslatedSentencesRecalculation={triggerProgressTranslatedSentencesRecalculation}
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