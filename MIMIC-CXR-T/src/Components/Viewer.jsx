import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, ToggleButton, Form, Container, Row, Col ,
OverlayTrigger, Tooltip, ProgressBar, Badge, Button, ButtonGroup} from 'react-bootstrap';
import './viewer.css';
import ModalSuggestions from './ModalSuggestionCorrecction/ModalSuggestionCorrecctions2';

import { createUserTranslatedSentence, getPreviousUserTranslatedSentence, 
  updateUserTranslatedSentence, updateReportProgress, 
  deleteUserCorrectionsTranslatedSentence, deleteSuggestion, getPreviousUserSuggestion,
  } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';

function Viewer({ groupId, report, triggerProgressTranslatedSentencesRecalculation, reports, currentIndex, checkIsReportCompleted, goToNextReport, goToPreviousReport}) {
  const [translatedSentencesState, setTranslatedSentencesState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranslatedSentenceId, setSelectedTranslatedSentenceId] = useState(null);
  const [isSwitchChecked, setIsSwitchChecked] = useState(true);
  const [progressReports, setProgressReports] = useState(0);
  const [completedReports, setCompletedReports] = useState(0);
  const { token } = useContext(AuthContext);

  const [uniqueTranslatedSentenceIds, setUniqueTranslatedSentenceIds] = useState(new Set());
  
  const [totalReviewedSentences, setTotalReviewedSentences] = useState(0);
  const [totalSentencesByReport, setTotalSentencesByReport] = useState({});

  const [suggestionData, setSuggestionData] = useState({});
  const [renderCounter, setRenderCounter] = useState(0);

  const handleModalSave = async () => {
    console.log('Modal saved. Updating cell content...');
    setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: false }));
    console.log("seteo que frase esta mala: estado false");
    //selected times: true, selectedcheck : false
    console.log("translatedSentences.id: ",selectedTranslatedSentenceId);
    if (selectedTranslatedSentenceId in translatedSentencesState) {
      console.log("coloco rojo dela cruz")
      const updateUTS = await updateUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
      console.log("updateUserTranslatedSentence frase:", updateUTS);
    
    } 
    else {
      const createUTS = await createUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
      console.log("createUserTranslatedSentence frase:", createUTS);
     
    }
     //setSelectedTranslatedSentenceId(selectedTranslatedSentenceId);
    console.log("ahora se setea frase seleccioanda ");
    triggerProgressTranslatedSentencesRecalculation();

    calculateCompletedReports().then(result => {
          setCompletedReports(result.completedCount);
          });

    const newProgressByReports = calculateProgressByReports();
    setProgressReports(newProgressByReports);  

  };

  const handleCloseWithoutSave = async () => {
    try {
      console.log("handleCloseWithoutSave");
      console.log("selectedTranslatedSentenceId: ", selectedTranslatedSentenceId);
  
      // Realizar la solicitud para verificar si hay una sugerencia anterior
      const response = await getPreviousUserSuggestion(selectedTranslatedSentenceId, token);
  
      if (response) {      
        console.log('Modal closed without saving. EXISTS PREVIOUS SUGGESTION.');
        
        // Si hay una sugerencia anterior, actualizar la traducción a falsa
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, false, false, true, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: false }));
        console.log('Modal closed without saving. EXISTS PREVIOUS SUGGESTION.');
        console.log("translatedSentencesState: ", translatedSentencesState);

      } else {
        // Si no hay una sugerencia anterior, restaurar el estado de la celda a nulo
        console.log('Modal closed without saving. Cell content restored.');
        console.log("translatedSentencesState: ", translatedSentencesState);
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, null, false, false, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: null }));
      }
    } catch (error) {
      // Manejar el error 404 aquí
      if (error.response && error.response.status === 404) {
        console.log('No se encontró la sugerencia anterior. Cerrando modal sin guardar.');
        // Ejecutar la misma lógica que en el bloque else
        console.log('Modal closed without saving. Cell content restored.');
        console.log("translatedSentencesState antes: ", translatedSentencesState);
        await updateUserTranslatedSentence(selectedTranslatedSentenceId, null,false, false, token);
        setTranslatedSentencesState(prev => ({ ...prev, [selectedTranslatedSentenceId]: null }));
        
      } else {
        // Otros errores
        console.error('Error al cerrar el modal sin guardar:', error);
      }
    }
  };
  

  const calculateProgressByReports = () => {
    return reports.length ? (completedReports / reports.length) * 100 : 0;
  };
  
  const updateProgressForCurrentReport = () => {
    const translatedSentencesCount = Object.values(translatedSentencesState).filter((value) => value !== null).length;
    setTotalReviewedSentences(translatedSentencesCount);
  };

  const calculateCompletedReports = async () => {
    const reportsCompleted = reports.map((report) => ({
      reportId: report.report.reportId,
      completed: false
    }));
    for (const report of reportsCompleted) {
      try {
        const isReportCompleted = await checkIsReportCompleted(report.reportId, token);
        if (isReportCompleted.completed) {
          report.completed = true;
        }
      } catch (error) {
        console.error('Error checking report completion:', error);
      }
    }
    const completedCount = reportsCompleted.filter(report => report.completed).length;
    return {
      reportsCompleted,
      completedCount
    };
  };  

  const renderTooltipProgressBarReports = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Progreso de reportes en el batch
    </Tooltip>
  );

  const updateProgressReportInDatabase = async (newProgressByReports) => {
    try {
      await updateReportProgress(newProgressByReports, groupId, token);
      } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
    try {
      calculateCompletedReports().then(result => {
      setCompletedReports(result.completedCount);
      });
      const newProgressByReports = calculateProgressByReports();
      setProgressReports(newProgressByReports);
      updateProgressReportInDatabase(newProgressByReports).catch(error => {
        console.error('Error updating progress:', error);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    };

    fetchData();
  }, [completedReports, reports]);

  useEffect(() => {
    console.log("translatedSentencesState después del cambio: ", translatedSentencesState);
    
  }, [translatedSentencesState]); // Agregar renderCounter como dependencia
  

  
  useEffect(() => {
    if (report) {
      // Reset relevant state variables
      setTranslatedSentencesState({});
      setUniqueTranslatedSentenceIds(new Set());
  
      const updatedState = {};
      Object.keys(report.report.translated_sentences).forEach((type) => {
        report.report.translated_sentences[type].forEach((translatedsentence) => {
          loadUserTranslatedPhrase(translatedsentence);
          console.log("loadusersugg translatedsentence: ",translatedsentence);
          loadUserSuggestion(translatedsentence);
        });
      });
  
      // Actualizar el estado después de cargar todas las traducciones
      setTranslatedSentencesState((prev) => ({ ...prev, ...updatedState }));
    }
  }, [report, token]);

  const loadUserTranslatedPhrase = async (translatedsentence) => {
      try {
        const response = await getPreviousUserTranslatedSentence(translatedsentence.id, token);
         setUniqueTranslatedSentenceIds((prevIds) => new Set([...prevIds, translatedsentence.id]));

        if (response) {
          console.log("getPreviousUserTranslatedSentence:", response);
          if (response.isSelectedCheck && response.state) 
            setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: true }));
          if (response.isSelectedTimes && !response.state) 
            setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: false }));
          } else {
            setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: null }));
        }
      }
       catch (error) {
        // Manejar el error, por ejemplo, mostrar un mensaje de error o registrar en la consola
        console.error(`no encontrada UTP de tphrase id: ${translatedsentence.id}:`, error);
        setUniqueTranslatedSentenceIds((prevIds) => new Set([...prevIds, translatedsentence.id]));

      }
  }

  const loadUserSuggestion = async (translatedsentence) => {
    try {
      const response = await getPreviousUserSuggestion(translatedsentence.id, token);
      if (response) {
        //parche para corregir boton que queda desfasado en verde
        await updateUserTranslatedSentence(translatedsentence.id, false, false, true, token);
        setTranslatedSentencesState(prev => ({ ...prev, [translatedsentence.id]: false }));

        if (response.changesFinalTranslation !== null && response.changesFinalTranslation !== '') {
        setSuggestionData(prev => ({ ...prev, [translatedsentence.id]: response.changesFinalTranslation}));
      }
      else {
        setSuggestionData(prev => ({ ...prev, [translatedsentence.id]: 'no encontrada sugerencia'}));
      }
    }}
     catch (error) {
      // Manejar el error, por ejemplo, mostrar un mensaje de error o registrar en la consola
      console.error(`no encontrada sugerencia de tphrase id: ${translatedsentence.id}:`, error);
    }
}

  const handleTranslatedSentenceClick = async (translatedSentences, check) => {
    console.log("lo clique ");
    console.log("check:, " ,check);
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
        triggerProgressTranslatedSentencesRecalculation();

        calculateCompletedReports().then(result => {
          setCompletedReports(result.completedCount);
          });
        const newProgressByReports = calculateProgressByReports();
        setProgressReports(newProgressByReports);

      } else {
     
        setSelectedTranslatedSentenceId(translatedSentences.id);
        setIsModalOpen(true);

        triggerProgressTranslatedSentencesRecalculation();

        calculateCompletedReports().then(result => {
          setCompletedReports(result.completedCount);
          });

        const newProgressByReports = calculateProgressByReports();
        setProgressReports(newProgressByReports);  
    } 
    
    triggerProgressTranslatedSentencesRecalculation();
    updateProgressForCurrentReport(); // Update the totalReviewedSentences
  };

  useEffect(() => {
    setTotalSentencesByReport((prev) => ({
      ...prev,
      [report.reportId]: uniqueTranslatedSentenceIds.size,
    }));
  
    updateProgressForCurrentReport(); // Initial update when report is loaded
  }, [uniqueTranslatedSentenceIds, report]);


  function ReportTable({ report }) {
    const renderRows = (report) => {
      const originalSentences = report.sentences;
      const translatedSentences = report.translated_sentences;
      if (originalSentences == null || translatedSentences == null) {
        return null;
      }
    
      const types = ["background", "findings", "impression"];
      return types.map((type) => {
        // Filtra las oraciones vacías para este tipo
        const nonEmptyOriginalSentences = originalSentences[type].filter((sentence) => sentence.text.trim() !== "");
        const nonEmptyTranslatedSentences = translatedSentences[type].filter((sentence) => sentence.text.trim() !== "");
        // Si no hay oraciones no vacías, no renderiza nada para este tipo
        if (nonEmptyOriginalSentences.length === 0 && nonEmptyTranslatedSentences.length === 0) {
          return null;
        }
        return (
          <React.Fragment key={type}>
            {isSwitchChecked && (
              <tr className="title-row">
                <th className="title-row">{type}</th><th className="title-row"></th><th className="title-row"></th>
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
                  <td>{sentence.text}</td>
               
                  <td>
                    {notReviewed ? (
                      <p>{nonEmptyTranslatedSentences[index]?.text}</p>
                    ) : (
                      <>
                        {isCrossed ? (
                          <p style={{ textDecoration: 'line-through', color: 'red' }}>
                            {nonEmptyTranslatedSentences[index]?.text || ''}
                          </p>
                        ) : (
                          nonEmptyTranslatedSentences[index]?.text || ''
                        )}
                        <br />
                        <p style={{ color: 'green' }}>
                          {isCrossed && suggestionAvailable ? suggestionData[translatedSentenceId] : ''}
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
            <ProgressBar striped animated className="reports-progress-bar" 
              now={progressReports} 
              label={`(${completedReports}/${reports.length})  `+`${Math.round(progressReports)}%`} 
              variant={
                Math.round(progressReports) <= 33 ? "danger" :
                Math.round(progressReports) < 99 ? "warning" :
                "success"
              } />

          </OverlayTrigger>
          </Col>
        </Row>
        <Row >
          <ButtonGroup size="sm" >
            <Button
              variant="primary"
              onClick={goToPreviousReport}
              disabled={reports.length === 0 || currentIndex === 0}
            >
              Reporte anterior
            </Button>
            <Button
              variant="primary"
              onClick={goToNextReport}
              disabled={reports.length === 0 || currentIndex === reports.length - 1}
            >
              Siguiente reporte
            </Button>
          </ButtonGroup>
        </Row>

        <Row>
          <Col>
            <h3><Badge bg="secondary" className="badge-report" >ID Reporte: {report.reportId}</Badge> </h3>
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
          <Table striped hover responsive="lg" className="custom-table" key={renderCounter}>
            <tbody className="custom-table">{renderRows(report)}
    
            </tbody>
            </Table>
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
