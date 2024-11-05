import { useState, useContext, useEffect } from 'react';
import { Button, Modal, Form, Row, Card, 
  Alert, Badge, Accordion } from 'react-bootstrap';
import { AuthContext } from '../../auth/AuthContext';
import {
  getPreviousUserSuggestion,
  updateSuggestion,
  createSuggestion,
  findSentence,
  createCorrection,
  getPreviousUserCorrections,
  deleteUserCorrectionsTranslatedSentence,
} from '../../utils/api';
import '../../utils/modalScripts';
import WordSelector from './WordSelector';
import '../modal.css';
import ModalHeaderCorrecction from './ModalHeaderCorrecction';

function ModalSuggestions({ show, onHide, selectedTranslatedSentenceId, onCloseWithoutSave, onSave }) {
  const [modalText, setModalText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [previousSuggestion, setPreviousSuggestion] = useState(null);
  const [previousCorrection, setPreviousCorrection] = useState(null);
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [originalSentence, setOriginalSentence] = useState('');
  const [editedTranslatedSentence, setEditedTranslatedSentence] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [otherErrorDescription, setOtherErrorDescription] = useState('');
  const { token } = useContext(AuthContext);
  const [selectedOptionsByType, setSelectedOptionsByType] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);
  const [showNoChangesAlert, setShowNoChangesAlert] = useState({ show: false, message: '' });


  const loadSentenceAndTranslation = async (selectedTranslatedSentenceId) => {
    try {
      const sentenceAndTranslatedSentence = await findSentence(selectedTranslatedSentenceId);
      if (sentenceAndTranslatedSentence) {
        setOriginalSentence(sentenceAndTranslatedSentence.sentence.text);
        setTranslatedSentence(sentenceAndTranslatedSentence.translatedSentence.text);
        loadPreviousSuggestionData(selectedTranslatedSentenceId);
        if (editedTranslatedSentence === '') 
        {setEditedTranslatedSentence(sentenceAndTranslatedSentence.translatedSentence.text)}
    }
   } catch (error) {
      console.error('Error loading sentence and translation:', error);
    }
  };

  const loadPreviousSuggestionData = async (selectedTranslatedSentenceId) => {
    try {
      const previousSuggestionResponse = await getPreviousUserSuggestion(selectedTranslatedSentenceId, token);
      if (previousSuggestionResponse) {
        setPreviousSuggestion(previousSuggestionResponse);
        setModalText(previousSuggestionResponse.comments);
        setEditedTranslatedSentence(previousSuggestionResponse.changesFinalTranslation);
      } else {
        setModalText('');
        setEditedTranslatedSentence(translatedSentence);
      }
    } catch (error) {
      console.error('Error loading previous suggestion data:', error);
    }
  };

  const loadPreviousCorrectionData = async (selectedTranslatedSentenceId) => {
    try {
      const previousCorrectionResponse = await getPreviousUserCorrections(selectedTranslatedSentenceId, token);
      if (previousCorrectionResponse) {
        setPreviousCorrection(previousCorrectionResponse);
        const selectedOptionsByType = {};
        const selectedWords = [];
  
        previousCorrectionResponse.forEach((correction) => {
          const type = correction.errorType;
          const option = {
            word: { index: correction.wordIndex, text: correction.wordSelected },
            type: correction.errorType.toString(), 
          };
          if (selectedOptionsByType[type]) {
            selectedOptionsByType[type].push(option);
          } else {
            selectedOptionsByType[type] = [option];
          }
  
          // Agregar la palabra seleccionada al array
          selectedWords.push({
            word: correction.wordSelected,
            index: correction.wordIndex,
            type: correction.errorType.toString(),
          });
        });
  
        setSelectedOptionsByType(selectedOptionsByType);
        setSelectedWords(selectedWords);
      } else {
        setPreviousCorrection(null);
      }
    } catch (error) {
      console.error('Error loading previous correction data:', error);
      setPreviousCorrection(null);
    }
  };
  
  const handleOptionClick = (options, type) => {
    setSelectedOptionsByType((prevOptionsByType) => {
      const updatedOptionsByType = { ...prevOptionsByType };
      updatedOptionsByType[type] = options;
      return updatedOptionsByType;
    });
  };

  const handleModalSave = async (event) => {
    event.preventDefault();
    try {
      const isModified =
        editedTranslatedSentence !== translatedSentence && selectedOptions.length > 0 

      const hasSelectedErrors = Object.values(selectedOptionsByType).some(
        (options) => options.length > 0
      );

    
      if (!hasSelectedErrors) {
        setShowNoChangesAlert({ show: true, message: "Por favor haga click en al menos una palabra de los errores mostrados" });
        return;
      }
  
      if (!isModified) {
        setShowNoChangesAlert({ show: true, message: "Por favor modifique la traducción final antes de guardar." });
        return;
      }

      if (previousSuggestion === null) {
        // Your existing logic for creating a new suggestion and corrections
        await createSuggestion(
          selectedTranslatedSentenceId,
          modalText,
          editedTranslatedSentence,
          otherErrorDescription,
          token
        );

        await Promise.all(
          selectedOptions.map(async (option) => {
            const word = option.word;
            const instanceData = {
              translatedSentenceId: selectedTranslatedSentenceId,
              wordSelected: word.text,
              wordIndex: word.index,
              errorType: option.type,
            };
            return createCorrection(instanceData, token);
          })
        );
      } else {
        // Your existing logic for updating suggestion and corrections
        if (previousSuggestion.translatedSentenceId === selectedTranslatedSentenceId) {
          await updateSuggestion(
            selectedTranslatedSentenceId,
            modalText,
            editedTranslatedSentence,
            otherErrorDescription,
            token
          );
  
        } else {
          await createSuggestion(
            selectedTranslatedSentenceId,
            modalText,
            editedTranslatedSentence,
            otherErrorDescription,
            token
          );
        }
        if (previousCorrection !== null) {
          await deleteUserCorrectionsTranslatedSentence(selectedTranslatedSentenceId, token);
        }
        await Promise.all(
          selectedOptions.map(async (option) => {
            const word = option.word;
            const instanceData = {
              translatedSentenceId: selectedTranslatedSentenceId,
              wordSelected: word.text,
              wordIndex: word.index,
              errorType: option.type,
            };
            return createCorrection(instanceData, token);
          })
        );
      }
      onSave(editedTranslatedSentence);
      onHide();
      loadPreviousSuggestionData(selectedTranslatedSentenceId);
    } catch (error) {
      console.error('Error saving modal:', error);
      // Handle errors appropriately
    }
  };
  
  const handleModalClose = () => {
    setSelectedOptions([]);
    setPreviousSuggestion(null);
    onHide();
    onCloseWithoutSave(); 
  };

  useEffect(() => {
    const selectedOptions = Object.keys(selectedOptionsByType)
      .filter((key) => Array.isArray(selectedOptionsByType[key]))
      .flatMap((key) => selectedOptionsByType[key])
      .filter(Boolean);
    setSelectedOptions(selectedOptions);
  }, [selectedOptionsByType]);
  

  return (
    <>
      <Modal show={show} onShow={() => {
        loadSentenceAndTranslation(selectedTranslatedSentenceId);
        loadPreviousSuggestionData(selectedTranslatedSentenceId);
        loadPreviousCorrectionData(selectedTranslatedSentenceId);
      
      }} onHide={{}} className="fixed-modal" size="xl" >
        
        <ModalHeaderCorrecction originalSentence={originalSentence} translatedSentence={translatedSentence}/>

        <Modal.Body className="modal-body">
          <Form>
            <Form.Group>
              <div className="">
                <Card className="mb-4 border-primary " >      
                  <Accordion>
                    <Accordion.Item eventKey="0">
                    <Accordion.Header>Si encuentra, <strong>&nbsp;seleccione&nbsp;</strong> palabras con <strong>&nbsp;errores terminológicos</strong></Accordion.Header>
                    <Accordion.Body className="examples-text">
                      Este tipo de error se produce cuando la traducción no refleja con precisión los términos o conceptos médicos específicos, lo que puede afectar 
                      la comprensión adecuada del informe médico o dando información plenamente equivocada.<br/>
                      <br/><strong>Ejemplo:</strong><br/>
                      Original (inglés): The patient has <u>type II</u> diabetes mellitus<br/>
                      Traducción incorrecta (español): El paciente tiene diabetes mellitus <u>tipo I</u><br/>
                      Traducción correcta (español): El paciente tiene diabetes mellitus <u>tipo II</u><br/>
                    </Accordion.Body>
                    </Accordion.Item>
                    <Card border="light" className="card-accordion">
                      <WordSelector
                        sentence={translatedSentence}
                        variant="primary"
                        selectedOptions={selectedOptionsByType['terminological']}
                        initialSelectedWords={selectedWords}
                        onOptionClick={(option) => handleOptionClick(option, 'terminological')}
                      />
                    </Card>
                  </Accordion>
                </Card>

                <Card className="mb-4 border-success">      
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Si encuentra, <strong>&nbsp;seleccione&nbsp;</strong> sobre palabras con <strong>&nbsp;errores gramaticales</strong></Accordion.Header>
                      <Accordion.Body className="examples-text">
                        Este tipo de error se refiere a todos los tipos de error gramaticales, semánticos, léxicos, etc. que no representen correctamente el significado
                        de la oración original al estar mal escritas o cambiando el significado original.<br/>
                        <br/><strong>Ejemplo:</strong><br/>
                        Original (inglés): The patient <u>explained</u> his complications to the doctor.<br/>
                        Traducción incorrecta (español): El paciente <u>explicado</u> sus complicaciones al médico.<br/>
                        Traducción correcta (español): El paciente <u>explicó</u> sus complicaciones al médico.
                      </Accordion.Body>
                    </Accordion.Item>
                    <Card border="light" className="card-accordion">
                      <WordSelector
                        sentence={translatedSentence}
                        variant="success"
                        selectedOptions={selectedOptionsByType['grammatical']}
                        initialSelectedWords={selectedWords}
                        onOptionClick={(option) => handleOptionClick(option, 'grammatical')}
                      />
                    </Card>
                  </Accordion>
                </Card>  

                <Card className="mb-1 border border-warning" >      
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Si encuentra, <strong>&nbsp;selecciones&nbsp;</strong> sobre palabras con <strong>&nbsp;errores funcionales</strong></Accordion.Header>
                      <Accordion.Body className="examples-text">
                        Ocurren cuando la traducción, si bien transmite el significado general del texto de origen, carece del flujo natural.
                        Este tipo de error puede hacer parecer forzada la traducción y no representan como un nativo en el idioma diría la frase correspondiente.<br/>
                        <br/><strong>Ejemplo:</strong><br/>
                        Original (inglés): The patient received <u>oral</u> medication.<br/>
                        Traducción incorrecta (español): El paciente recibió medicación <u>por boca</u>. <br/>
                        Traducción correcta (español): El paciente recibió medicación <u>oral</u>.<br/>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Card border="light" className="card-accordion">
                      <WordSelector
                        sentence={translatedSentence}
                        variant="warning"
                        selectedOptions={selectedOptionsByType['functional']}
                        initialSelectedWords={selectedWords}
                        onOptionClick={(option) => handleOptionClick(option, 'functional')}
                      />
                    </Card>
                  </Accordion>
                </Card>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Form.Group className="edit-frase">
          <Row className="mx-2 my-2" >
            <Form.Label className="h4" >
              <Badge  bg="danger" >
                Escriba la traducción corregida
              </Badge>
            </Form.Label> 
            <Form.Control
              as="textarea"
              rows={2}
              value={editedTranslatedSentence}
              onChange={(evento) => setEditedTranslatedSentence(evento.target.value)}
              className="border border-secondary"
            />
          </Row>
            
        </Form.Group>

    
       
        <Modal.Footer className="modal-footer">
        <Alert
          variant="warning"
          show={showNoChangesAlert.show}
          onClose={() => setShowNoChangesAlert({ show: false, message: '' })}
          dismissible
        >
          {showNoChangesAlert.message || 'Por favor modifique la traducción final antes de guardar.'}
        </Alert>

          <Button variant="secondary" onClick={handleModalClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={handleModalSave}
            disabled={!modalText && selectedOptions.length === 0 && !editedTranslatedSentence}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  );
}

export default ModalSuggestions;
