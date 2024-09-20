import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

const ModalDictionary = () => {
  //modal diccionario
  const [showModalDictionary, setShowModalDictionary] = useState(false);
  const handleAcceptDictionary = () => {
    handleCloseModalDictionary();
  };
  const handleShowModalDictionary = () => {
    setShowModalDictionary(true);
  };
  const handleCloseModalDictionary = () => {
    setShowModalDictionary(false);
  };

  
  return (
    <>
    <Button variant="info" onClick={handleShowModalDictionary}>
          Abrir diccionario
        </Button>

          <Modal show={showModalDictionary} onHide={handleCloseModalDictionary}>
            <Modal.Header closeButton>
              <Modal.Title>Diccionario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Lo que sea que lleva el diccionario</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModalDictionary}>
                Cerrar
              </Button>
              <Button variant="primary" onClick={handleAcceptDictionary}>
                Aceptar
              </Button>
            </Modal.Footer>
          </Modal>
</>
  );
};

export default ModalDictionary;
