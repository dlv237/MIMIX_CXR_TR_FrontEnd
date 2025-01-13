import { useState, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { AuthContext } from '../../auth/AuthContext';
import { createReportBatch } from '../../utils/api';
import toast from 'react-hot-toast';

const ModalUploadReport = ({getReportGroupReports}) => {
  const [showModal, setShowModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const { token } = useContext(AuthContext);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLoadFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', handleFileInputChange);
    fileInput.click();
  };

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileContent = await readFileAsync(file);
        setFileContent(fileContent);
        setShowModal(true);
      } catch (error) {
        console.error('Error reading file:', error);
        handleCloseModal();
      }
    }
  };

const handleAccept = async (event) => {
  event.preventDefault();
  try {
    await createReportBatch(fileContent, token);
    handleCloseModal(); 
    toast.success('Reporte creado correctamente');
    getReportGroupReports();
  } catch (error) {
    console.error('Error saving file content:', error);
    console.error('Error details:', error.response.data); 
  }
};

  return (
    <>
      <Button variant="primary" onClick={handleLoadFile}>
        Cargar Reporte
      </Button>
      <Modal show={showModal} onHide={handleCloseModal} className='mt-32'>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body className='h-96 overflow-auto'>
          <p>Contenido del archivo JSON:</p>
          <pre>{fileContent}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalUploadReport;
