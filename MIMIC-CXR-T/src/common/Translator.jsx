import { useState, useEffect, useContext } from 'react';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import Viewer from '../Components/Viewer';
import './translator.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { Container, Col, Row, Alert } from 'react-bootstrap';
import { getReportGroupReports, getUserTranslatedSentencesByReportGroup, 
  updateUserReportGroupProgress, checkIsReportCompleted } from '../utils/api';

function Translator() {
  const { token } = useContext(AuthContext);
  const { groupId } = useParams(); //aqui iria el reportprogress si va en url
  const [reports, setReports] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressTranslatedSentences, setProgressTranslatedSentences] = useState(0);
  const [reviewedTranslatedSentences, setReviewedTranslatedSentences] = useState(0);
  const [totalTranslatedSentences, setTotalTranslatedSentences] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const dismissDelay = 1400; // 2000 milliseconds = 2 seconds

  const calculateProgressTranslatedSentences = () => {
    return totalTranslatedSentences ? (reviewedTranslatedSentences / totalTranslatedSentences) * 100 : 0;
  };
  
  const closeGeneralAlert = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    const newProgress = calculateProgressTranslatedSentences();
    setProgressTranslatedSentences(newProgress);
    updateProgressTranslatedSentencesInDatabase(newProgress).catch(error => {
      console.error('Error updating progress:', error);
    });
  }, [reviewedTranslatedSentences, totalTranslatedSentences]);

  const calculateTotalTranslatedSentences = () => {
    let total = 0;
    reports.forEach((report) => {
      const translatedSentences = report.report.translated_sentences;
      Object.keys(translatedSentences).forEach((type) => {
        total += translatedSentences[type].filter((sentence) => sentence.text.trim() !== "").length;
      });
    });
    return total;
  };

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
        const reportsResponse = await getReportGroupReports(groupId, token);
        setReports(reportsResponse);
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
      let translatedPhrasesReviewed = 0;
      const response = await getUserTranslatedSentencesByReportGroup(groupId, token);
      if (response) {
          const numUserTranslatedPhrases = response.length;
          translatedPhrasesReviewed += numUserTranslatedPhrases;
        }
        setReviewedTranslatedSentences(translatedPhrasesReviewed);
      console.log("translatedPhrasesReviewed: ", translatedPhrasesReviewed)
    } catch (error) {
      console.error('Error fetching reviewed phrases:', error);
    }
  };

  const goToNextReport = async () => {
    try {
      const nextIndex = (currentIndex + 1) % reports.length;
      const isCurrentReportCompleted = await checkIsReportCompleted(reports[currentIndex].report.reportId, token);
      if (isCurrentReportCompleted.completed) {
        setCurrentIndex(nextIndex);
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
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reports.length) % reports.length);
  };

  useEffect(() => {
    setTotalTranslatedSentences(calculateTotalTranslatedSentences());
  }, [reports]);

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
            {(reports.length > 0) ? (
              <Viewer
                groupId={groupId}
                report={reports[currentIndex]}
                triggerProgressTranslatedSentencesRecalculation={triggerProgressTranslatedSentencesRecalculation}
                reports={reports}
                currentIndex={currentIndex}
                checkIsReportCompleted={checkIsReportCompleted}
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

export default Translator;