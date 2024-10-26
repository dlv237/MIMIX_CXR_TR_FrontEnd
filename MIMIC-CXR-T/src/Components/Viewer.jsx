import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, ToggleButton, Form, Container, Row, Col, OverlayTrigger, Tooltip, Badge, Button } from 'react-bootstrap';
import './viewer.css';
import ModalSuggestions from './ModalSuggestionCorrecction/ModalSuggestionCorrecctions2';

import { getUserReportGroup, createUserTranslatedSentence, getPreviousUserTranslatedSentence, 
  updateUserTranslatedSentence, updateReportProgress, deleteUserCorrectionsTranslatedSentence, 
  deleteSuggestion, getPreviousUserSuggestion, getReportGroupReportsLength, getIsReportCompleted } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';

function Viewer({ groupId, report, triggerProgressTranslatedSentencesRecalculation, currentIndex, goToNextReport, goToPreviousReport }) {
  const [translatedSentencesState, setTranslatedSentencesState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranslatedSentenceId, setSelectedTranslatedSentenceId] = useState(null);
  const [isSwitchChecked, setIsSwitchChecked] = useState(true);
  const [progressReports, setProgressReports] = useState(0);
  const [reportsLenght, setReportsLenght] = useState(0);
  const { token } = useContext(AuthContext);
  const [suggestionData, setSuggestionData] = useState({});
  const [isCrossedSentences, setIsCrossedSentences] = useState({});
  const [sentencesSuggestions, setSentencesSuggestions] = useState({});
  const [lastTranslatedReportId, setLastTranslatedReportId] = useState(0);

  const handleModalSave = async (editedTranslatedSentence) => {
    setIsCrossedSentences(prev => ({ ...prev, [selectedTranslatedSentenceId]: true }));
    setSentencesSuggestions(prev => ({ ...prev, [selectedTranslatedSentenceId]: editedTranslatedSentence }));
    setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: false }));

    if (selectedTranslatedSentenceId in translatedSentencesState) {
      await updateUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
    } else {
      await createUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
    }

    triggerProgressTranslatedSentencesRecalculation();
  };

  const handleCloseWithoutSave = async () => {
    try {
      const response = await getPreviousUserSuggestion(selectedTranslatedSentenceId, token);

      if (response) {
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: false }));
      } else {
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, null, false, false, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: null }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, null, false, false, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: null }));
      } else {
        console.error('Error al cerrar el modal sin guardar:', error);
      }
    }
  };

  const calculateProgressByReports = () => {
    return (reportsLenght && lastTranslatedReportId) ? (lastTranslatedReportId / reportsLenght) * 100 : 0;
  };

  const renderTooltipProgressBarReports = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Progreso de reportes en el batch
    </Tooltip>
  );

  const handleNextReport = async () => {
    try {
      const isCurrentReportCompleted = await getIsReportCompleted(report.report.reportId, token);
      const newProgressByReports = calculateProgressByReports();
      if ( currentIndex === lastTranslatedReportId && isCurrentReportCompleted.completed) {
        await updateReportProgress(newProgressByReports, groupId, currentIndex + 1, token);
      }
      goToNextReport();
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const fetchReportsLenght = async () => {
      try {
        const response = await getReportGroupReportsLength(groupId, token);
        setReportsLenght(response);
        if (report) {
          const newProgressByReports = calculateProgressByReports();
          setProgressReports(newProgressByReports);
        }
      } catch (error) {
        console.error('Error fetching report groups:', error);
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
    fetchReportsLenght();
  }, [translatedSentencesState, token, lastTranslatedReportId, report, groupId, calculateProgressByReports]);

  useEffect(() => {
    if (report) {
      setTranslatedSentencesState({});

      const updatedState = {};
      Object.keys(report.report.translated_sentences).forEach((type) => {
        report.report.translated_sentences[type].forEach((translatedsentence) => {
          loadUserTranslatedPhrase(translatedsentence);
          loadUserSuggestion(translatedsentence);
        });
      });

      setTranslatedSentencesState((prev) => ({ ...prev, ...updatedState }));
    }
  }, [report, token]);

  const loadUserTranslatedPhrase = async (translatedsentence) => {
    try {
      const response = await getPreviousUserTranslatedSentence(translatedsentence.id, token);

      if (response) {
        if (response.isSelectedCheck && response.state)
          setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: true }));
        if (response.isSelectedTimes && !response.state)
          setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: false }));
      } else {
        setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: null }));
      }
    } catch (error) {
      console.error(`Error al cargar la traducción del usuario de la frase id: ${translatedsentence.id}:`, error)
    }
  };

  const loadUserSuggestion = async (translatedsentence) => {
    try {
      const response = await getPreviousUserSuggestion(translatedsentence.id, token);
      if (response) {
        await updateUserTranslatedSentence(translatedsentence.id, false, false, true, token);
        setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: false }));

        if (response.changesFinalTranslation !== null && response.changesFinalTranslation !== '') {
          setSuggestionData(prev => ({ ...prev, [translatedsentence.id]: response.changesFinalTranslation }));
        } else {
          setSuggestionData(prev => ({ ...prev, [translatedsentence.id]: 'no encontrada sugerencia' }));
        }
      }
    } catch (error) {
      console.error(`no encontrada sugerencia de tphrase id: ${translatedsentence.id}:`, error);
    }
  };

  const handleTranslatedSentenceClick = async (translatedSentences, check) => {
    if (check) {
      await deleteUserCorrectionsTranslatedSentence(translatedSentences.id, token);
      await deleteSuggestion(translatedSentences.id, token);

      if (translatedSentences.id in translatedSentencesState) {
        setTranslatedSentencesState(prev => ({ ...prev, [translatedSentences.id]: true }));
        await updateUserTranslatedSentence(translatedSentences.id, true, true, false, token);
      } else {
        setTranslatedSentencesState(prev => ({ ...prev, [translatedSentences.id]: true }));
        await createUserTranslatedSentence(translatedSentences.id, true, true, false, token);
      }
    } else {
      setSelectedTranslatedSentenceId(translatedSentences.id);
      setIsModalOpen(true);
    }

    triggerProgressTranslatedSentencesRecalculation();
  };


  function ReportTable({ report }) {
    const renderRows = (report) => {
      const originalSentences = report.sentences;
      const translatedSentences = report.translated_sentences;
      if (originalSentences == null || translatedSentences == null) {
        return null;
      }

      const types = ["background", "findings", "impression"];
      return types.map((type) => {
        const nonEmptyOriginalSentences = originalSentences[type].filter((sentence) => sentence.text.trim() !== "");
        const nonEmptyTranslatedSentences = translatedSentences[type].filter((sentence) => sentence.text.trim() !== "");

        if (nonEmptyOriginalSentences.length === 0 && nonEmptyTranslatedSentences.length === 0) {
          return null;
        }
        return (
          <React.Fragment key={type}>
            {isSwitchChecked && (
              <tr className="title-row">
                <th className="title-row">{type}</th>
                <th className="title-row"></th>
                <th className="title-row w-[100%]"></th>
              </tr>
            )}
            {nonEmptyOriginalSentences.map((sentence, index) => {
              const translatedSentenceId = translatedSentences[type][index].id;
              const isChecked = translatedSentencesState[translatedSentenceId] === true;
              const suggestionAvailable = suggestionData[translatedSentenceId] !== undefined;
              const isCrossed = suggestionAvailable && (isChecked === false);
              const notReviewed = translatedSentencesState[translatedSentenceId] === null;

              return (
                <tr key={index}>
                  <td className='w-[45%]'>{sentence.text}</td>
                  <td className='w-[45%]'>
                    {notReviewed ? (
                      <p>{nonEmptyTranslatedSentences[index]?.text}</p>
                    ) : (
                      <>
                        {isCrossed || isCrossedSentences[translatedSentenceId] ? (
                          <p style={{ textDecoration: 'line-through', color: 'red' }}>
                            {nonEmptyTranslatedSentences[index]?.text || ''}
                          </p>
                        ) : (
                          nonEmptyTranslatedSentences[index]?.text || ''
                        )}
                        <br />
                        <p style={{ color: 'green' }}>
                          {isCrossed && suggestionAvailable ? suggestionData[translatedSentenceId] : sentencesSuggestions[translatedSentenceId] || ''}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="button-row">
                    <ToggleButton
                      size="sm"
                      type="checkbox"
                      variant={isChecked ? 'success' : 'outline-success'}
                      onClick={() => handleTranslatedSentenceClick(translatedSentences[type][index], true)}
                      className="custom-toggle-button times"
                      id={`check-${translatedSentenceId || index}`}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </ToggleButton>
                    <ToggleButton
                      size="sm"
                      type="checkbox"
                      variant={translatedSentencesState[translatedSentenceId] === false ? 'danger' : 'outline-danger'}
                      onClick={() => handleTranslatedSentenceClick(translatedSentences[type][index], false)}
                      className="custom-toggle-button check"
                      id={`times-${translatedSentenceId || index}`}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </ToggleButton>
                  </td>
                </tr>
              );
            })}
          </React.Fragment>
        );
      });
    };

    return (
      <>
      <Container>
        <Row>
        <Col>
          <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltipProgressBarReports}
          >
          <div>
            <h4 className="sr-only text-lg">Status</h4>
            <p className="text-lg font-medium text-gray-900 mt-3">{(progressReports).toFixed(1)}% completado</p>
            <div aria-hidden="true" className="mt-6">
            <div className="overflow-hidden rounded-full bg-gray-200 m-6">
              <div
              style={{ width: `${progressReports}%` }}
              className="h-4 rounded-full bg-indigo-600"
              />
            </div>
            </div>
          </div>
          </OverlayTrigger>
        </Col>
        </Row>
        <Row className='flex justify-center mb-6'>
          <div className='flex justify-center w-9/12'>
            <Button
              variant="primary"
              onClick={goToPreviousReport}
              disabled={reportsLenght === 0 || currentIndex === 0}
              className='w-2/5 mx-6'
            >
              Reporte anterior
            </Button>
            <Button
              variant="primary"
              onClick={handleNextReport}
              disabled={reportsLenght === 0 || currentIndex === reportsLenght - 1}
              className='w-2/5 mx-6'
            >
              Siguiente reporte
            </Button>
          </div>
          
        </Row>
        <Row>
        <Col>
          <h3><Badge bg="secondary" className="badge-report">ID Reporte: {currentIndex}</Badge></h3>
        </Col>
        </Row>
        <Row>
        <Col xs={4}>
          <Form>
          <Form.Check
            type="switch"
            id="custom-switch"
            label="Mostrar encabezado de la sección"
            checked={isSwitchChecked}
            onChange={() => setIsSwitchChecked(!isSwitchChecked)}
            className="custom-switch"
          />
          </Form>
        </Col>
        </Row>
        <Row>
        <Table striped hover responsive="lg" className="custom-table text-start">
          <tbody className="custom-table">
          {renderRows(report)}
          </tbody>
        </Table>
        </Row>
        <Row className='flex justify-center mb-6 mt-8'>
          <div className='flex justify-center w-9/12'>
            <Button
              variant="primary"
              onClick={goToPreviousReport}
              disabled={reportsLenght === 0 || currentIndex === 0}
              className='w-2/5 mx-6'
            >
              Reporte anterior
            </Button>
            <Button
              variant="primary"
              onClick={handleNextReport}
              disabled={reportsLenght === 0 || currentIndex === reportsLenght - 1}
              className='w-2/5 mx-6'
            >
              Siguiente reporte
            </Button>
          </div>
          
        </Row>
      </Container>
      <ModalSuggestions
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        selectedTranslatedSentenceId={selectedTranslatedSentenceId}
        onCloseWithoutSave={handleCloseWithoutSave}
        onSave={handleModalSave}
      />
      </>
    );
  }

  return <ReportTable report={report.report} handleModalSave={handleModalSave} />;
}

export default Viewer;