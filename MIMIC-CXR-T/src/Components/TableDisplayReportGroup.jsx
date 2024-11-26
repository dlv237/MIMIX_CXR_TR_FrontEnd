import { useState, useContext} from 'react';
import { Button } from 'react-bootstrap';
import { deleteReportGroupReport, generateStatsFromBatch} from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalReport from './ModalReport';
import ModalConfirmDelete from './ModalConfirmDelete';
import { Modal } from 'react-bootstrap';
import { createReportBatch } from '../utils/api';
import toast from 'react-hot-toast';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './TableDisplayReportGroup.css';


const TableDisplayReports = ({ reportGroupReports, onDeleteReportGroup, getReportGroupReports }) => {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const updatedReports = reportGroupReports;
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  console.log(reportGroupReports);

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
      toast.success('Batch de reportes cargado exitosamente');
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
      toast.success('Batch de reportes eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting report group report:', error);
    } finally {
      setShowModalDelete(false);
    }
  };

  const downloadReport = async (reportGroupId, userId) => {
    setIsLoading(true);
    try {
      const response = await generateStatsFromBatch(reportGroupId, userId, token);
      console.log(response);
  
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte.pdf';
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error descargando el reporte:', error);
    }
    setIsLoading(false);
  };
  

  return (
    <> 
      <div>
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold">Generando pdf del reporte</p>
              <p className="text-sm text-gray-500">Por favor, No recargue ni cierre esta ventana</p>
            </div>
          </div>
        )}
      </div>

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

      <table className="divide-y divide-gray-300 mt-20 justify-self-center w-[90%]">
        <thead>
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-center text-md font-semibold text-gray-900 sm:pl-0 w-1/6">Batch Id</th>
            <th className="py-3.5 pl-4 pr-3 text-center text-md font-semibold text-gray-900 sm:pl-0 w-1/6">Modelo</th>
            <th className="py-3.5 pl-4 pr-3 text-center text-md font-semibold text-gray-900 sm:pl-0 w-1/6">Reportes</th>    
            <th className="py-3.5 pl-4 pr-3 text-center text-md font-semibold text-gray-900 sm:pl-0 w-1/6">Fecha</th>
            <th className="py-3.5 pl-4 pr-3 text-center text-md font-semibold text-gray-900 sm:pl-0 w-2/6">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {updatedReports.map((reportGroupReport) => (
            <tr key={reportGroupReport.id}>
              <td className='w-1/6'> {reportGroupReport.id}</td>
              <td className='w-1/6'> 
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{reportGroupReport.model}</Tooltip>}
                >
                  <span className="truncate-text">{reportGroupReport.model}</span>
                </OverlayTrigger>
              </td>
              <td className='w-1/6'> {reportGroupReport.reports.length}</td>
              <td className='w-1/6'> {new Date(reportGroupReport.reports[0].createdAt).toLocaleDateString()} </td>
              <td className='w-2/6 flex justify-around'>
                <a href="#" className="text-indigo-600 hover:text-indigo-900 cursor-pointer" onClick={() => handleShowModal(reportGroupReport)}>
                  Detalles
                </a>
                <a href="#" className="text-indigo-600 hover:text-indigo-900 cursor-pointer" onClick={() => downloadReport(reportGroupReport.id, 1)}>
                  Stats
                </a>
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

