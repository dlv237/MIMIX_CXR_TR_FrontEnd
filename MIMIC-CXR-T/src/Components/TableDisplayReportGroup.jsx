import { useState, useContext, useEffect } from 'react';
import { Table, Button, Col, Alert} from 'react-bootstrap';
import './tabledisplayreportgroup.css';
import { deleteReportGroupReport } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalReport from './ModalReport';
import ModalConfirmDelete from './ModalConfirmDelete';


const TableDisplayReports = ({ reportGroupReports, onDeleteReportGroup }) => {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const updatedReports = reportGroupReports;
  

  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
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
      
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>Batch Id</th>
              <th>Reportes</th>
              <th>Eliminar Grupo</th>
            </tr>
          </thead>
          <tbody>
            {updatedReports.map((reportGroupReport) => (
              <tr key={reportGroupReport.id}>
                <td>{reportGroupReport.id}</td>
                <td>
                  <Button onClick={() => handleShowModal(reportGroupReport)}>Ver detalles</Button>
                </td>
                <td>
                  <Button variant="danger" onClick={() => handleShowModalDelete(reportGroupReport)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      
      <ModalReport show={showModal} handleCloseModal={handleCloseModalViewReport} selectedGroup={selectedReport}/>
      <ModalConfirmDelete show={showModalDelete} handleClose={handleCloseModalDeleteReport} handleConfirm={handleDeleteReportGroup} msg={"reporte"}/>
    </>
  );
};

export default TableDisplayReports;

