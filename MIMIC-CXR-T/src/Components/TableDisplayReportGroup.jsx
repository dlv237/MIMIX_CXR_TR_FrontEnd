import { useState, useContext} from 'react';
import { Button, Alert} from 'react-bootstrap';
import './tabledisplayreportgroup.css';
import { deleteReportGroupReport } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalReport from './ModalReport';
import ModalConfirmDelete from './ModalConfirmDelete';
import { Modal } from 'react-bootstrap';
import { createReportBatch } from '../utils/api';


const TableDisplayReports = ({ reportGroupReports, onDeleteReportGroup, getReportGroupReports }) => {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const updatedReports = reportGroupReports;
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [showUploadAlert, setShowUploadAlert] = useState(false);

  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowFileModal(false);
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
        setShowFileModal(true);
      } catch (error) {
        console.error('Error reading file:', error);
        handleCloseUploadModal();
      }
    }
  };

  const handleAccept = async (event) => {
    event.preventDefault();
    try {
      await createReportBatch(fileContent, token);
      handleCloseUploadModal(); 
      setShowAlert(true);   
      getReportGroupReports();
    } catch (error) {
      console.error('Error saving file content:', error);
      console.error('Error details:', error.response.data); 
    }
  };

  const handleCloseModalViewReport = () => {
    setShowModal(false);
  };
  const handleShowModalDelete = (report) => {
    setSelectedReport(report);
    setShowModalDelete(true);
  };

  const handleCloseModalDeleteReport = () => {
    setShowModalDelete(false);
  };

  const handleDeleteReportGroup = async () => {
    try {
      await deleteReportGroupReport(selectedReport.id, token);
      onDeleteReportGroup(selectedReport.id);
      setShowAlert(true);
    } catch (error) {
      console.error('Error deleting report group report:', error);
    } finally {
      setShowModalDelete(false);
    }
  };


  return (
    <> 
      <Alert show={showAlert} variant="success" onClose={() => setShowAlert(false)} dismissible>
        Batch eliminado exitosamente 
      </Alert>
      <Alert show={showUploadAlert} variant="success" onClose={() => setShowUploadAlert(false)} dismissible>
          Batch creado exitosamente
      </Alert>
      
      <div className="sm:flex sm:items-center justify-self-center" 
        style={{width: '90%'}}
      >
        <div className="sm:flex-auto text-start">
          <p className="text-lg text-gray-700 font-semibold">
            Listado de batches de reportes
          </p>
        </div>
        <div className="sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleLoadFile}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cargar Reportes
          </button>
        </div>
      </div>

      <table className="w-96 divide-y divide-gray-300 mt-20  justify-self-center">
        <thead>
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:pl-0">Batch Id</th>
            <th className="py-3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:pl-0">Reportes</th>
            <th className="py-3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:pl-0">Eliminar Grupo</th>
          </tr>
        </thead>
        <tbody>
          {updatedReports.map((reportGroupReport) => (
            <tr key={reportGroupReport.id}>
              <td>{reportGroupReport.id}</td>
              <td>
                <a href="#" className="text-indigo-600 hover:text-indigo-900 cursor-pointer" onClick={() => handleShowModal(reportGroupReport)}>
                  Ver detalles
                </a>
              </td>
              <td>
                <a href="#" className="text-red-600 hover:text-red-900 cursor-pointer" onClick={() => handleShowModalDelete(reportGroupReport)}>
                  Eliminar
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showFileModal} onHide={handleCloseUploadModal} className='mt-32'>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body className='h-96 overflow-auto'>
          <p>Contenido del archivo JSON:</p>
          <pre>{fileContent}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUploadModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

      <ModalReport show={showModal} handleCloseModal={handleCloseModalViewReport} selectedGroup={selectedReport}/>
      <ModalConfirmDelete show={showModalDelete} handleClose={handleCloseModalDeleteReport} handleConfirm={handleDeleteReportGroup} msg={"reporte"}/>
    </>
  );
};

export default TableDisplayReports;

