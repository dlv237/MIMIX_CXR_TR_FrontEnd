import { useState, useContext, useLayoutEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { deleteReportGroupReport, generateStatsFromBatch } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalReport from './ModalReport';
import ModalConfirmDelete from './ModalConfirmDelete';
import { Modal } from 'react-bootstrap';
import { createReportBatch } from '../utils/api';
import toast from 'react-hot-toast';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './TableDisplayReportGroup.css';
import classNames from 'classnames';

const TableDisplayReports = ({ reportGroupReports, onDeleteReportGroup, getReportGroupReports, batchsProgress }) => {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const updatedReports = reportGroupReports;
  const [showFileModal, setShowFileModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [showGeneratedFilesModal, setShowGeneratedFilesModal] = useState(false);


  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  console.log(reportGroupReports);
  console.log(batchsProgress);

  const handleCloseUploadModal = () => {
    setShowFileModal(false);
  };

  const handleOpenStatsModal = (groupId) => {
    setSelectedGroupId(groupId);
    setShowStatsModal(true);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
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

  const downloadReport = async () => {
    setShowStatsModal(false);
    setIsLoading(true);
  
    const newFiles = [];
    for (const userId of selectedUsers) {
      try {
        const response = await generateStatsFromBatch(selectedGroupId, userId, token);
  
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const fileName = `reporte_${userId}.pdf`;
  
        newFiles.push({
          userId,
          name: fileName,
          url,
        });
      } catch (error) {
        console.error('Error generando el reporte:', error);
      }
    }
  
    setGeneratedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setIsLoading(false);
    setShowGeneratedFilesModal(true);
  };
  
  

  useLayoutEffect(() => {
    const allUsers = batchsProgress[selectedGroupId] || [];
    const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < allUsers.length;
    setChecked(selectedUsers.length === allUsers.length);
    setIndeterminate(isIndeterminate);
  
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
    
    console.log("Checkbox checked:", checked);
    console.log("Checkbox indeterminate:", indeterminate);
    console.log("Selected Users:", selectedUsers);

  }, [selectedUsers, selectedGroupId, batchsProgress]);
  
  const toggleAll = () => {
    const allUsers = batchsProgress[selectedGroupId] || [];
    if (checked) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUsers);
    }
    setChecked(!checked);
    setIndeterminate(false);
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

      <div className="sm:flex sm:items-center justify-self-center" style={{ width: '90%' }}>
        <div className="sm:flex-auto text-start">
          <p className="text-lg text-gray-700 font-semibold">Listado de batches de reportes</p>
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
              <td className="w-1/6"> {reportGroupReport.id}</td>
              <td className="w-1/6">
                <OverlayTrigger placement="top" overlay={<Tooltip>{reportGroupReport.model}</Tooltip>}>
                  <span className="truncate-text">{reportGroupReport.model}</span>
                </OverlayTrigger>
              </td>
              <td className="w-1/6"> {reportGroupReport.reports.length}</td>
              <td className="w-1/6"> {new Date(reportGroupReport.reports[0].createdAt).toLocaleDateString()} </td>
              <td className="w-2/6 flex justify-around">
                <a href="#" className="text-indigo-600 hover:text-indigo-900 cursor-pointer" onClick={() => handleShowModal(reportGroupReport)}>
                  Detalles
                </a>
                <a
                  href="#"
                  className={classNames(
                    batchsProgress[reportGroupReport.id]?.length ? 'text-indigo-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed hover:text-gray-400'
                  )}
                  onClick={(e) => {
                    if (!batchsProgress[reportGroupReport.id]?.length) {
                      e.preventDefault();
                      return;
                    }
                    handleOpenStatsModal(reportGroupReport.id);
                  }}
                >
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

      <Modal show={showFileModal} onHide={handleCloseUploadModal} className="mt-32">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body className="h-96 overflow-auto">
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

      <Modal show={showStatsModal} onHide={handleCloseStatsModal} className="mt-32">
        <Modal.Header closeButton>
          <Modal.Title>Generar Reporte de estadísticas</Modal.Title>
        </Modal.Header>
        <Modal.Body className="h-96 overflow-auto">
          <p>Los siguientes usuarios completaron el batch {selectedGroupId}. Selecciona los usuarios para la generación de estadísticas</p>
          <div className="py-2 flex justify-center">
            <div className="relative">
              <table className="table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <div className="group absolute left-4 top-1/2 -mt-2 grid size-4 grid-cols-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-white checked:bg-indigo-600 checked:border-indigo-600"
                          ref={checkbox}
                          checked={checked}
                          onChange={toggleAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      User ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(batchsProgress[selectedGroupId] || []).map((userId) => (
                    <tr key={userId} className={selectedUsers.includes(userId) ? 'bg-gray-50' : undefined}>
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedUsers.includes(userId) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <div className="group absolute left-4 top-1/2 -mt-2 grid size-4 grid-cols-1">
                        <input
                          type="checkbox"
                          className="col-start-1 row-start-1 rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          value={userId}
                          checked={selectedUsers.includes(userId)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedUsers((prevSelected) =>
                              isChecked
                                ? [...prevSelected, userId]
                                : prevSelected.filter((id) => id !== userId)
                            );
                          }}
                        />
                        </div>
                      </td>
                      <td
                        className={classNames(
                          'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                          selectedUsers.includes(userId) ? 'text-indigo-600' : 'text-gray-900',
                        )}
                      >
                        {userId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStatsModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={downloadReport}>
            Generar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGeneratedFilesModal} onHide={() => setShowGeneratedFilesModal(false)} className="mt-32">
        <Modal.Header closeButton>
          <Modal.Title>Archivos Generados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {generatedFiles.length > 0 ? (
            <table className="table-fixed w-full divide-y divide-gray-300">
              <thead>
                <tr className='w-full'>
                  <th className="w-2/6 py-2 px-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="w-2/6 py-2 px-4 text-left text-sm font-semibold text-gray-900">Usuario</th>
                  <th className="w-2/6 py-2 px-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {generatedFiles.map((file, index) => (
                  <tr key={index}>
                    <td className="w-1/3 py-2 px-4 truncate">{file.name}</td>
                    <td className="w-1/6 py-2 px-4 truncate">{file.userId}</td>
                    <td className="w-1/2 py-2 px-4 flex flex-row">
                      <a
                        href='#'
                        onClick={() => window.open(file.url, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 bg-transparent"
                      >
                        Previsualizar
                      </a>
                      <a
                        href={file.url}
                        download={file.name}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Descargar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay archivos generados.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGeneratedFilesModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>


      <ModalReport show={showModal} handleCloseModal={handleCloseModalViewReport} selectedGroup={selectedReport} />
      <ModalConfirmDelete show={showModalDelete} handleClose={handleCloseModalDeleteReport} handleConfirm={handleDeleteReportGroup} msg={"reporte"} />
    </>
  );
};

export default TableDisplayReports;