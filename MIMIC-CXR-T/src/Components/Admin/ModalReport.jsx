
import { Modal, Button } from 'react-bootstrap';

const ModalReport = ({ show, handleCloseModal, selectedGroup }) => {
    return (
        <Modal show={show} onHide={handleCloseModal} className='mt-32'>
            <Modal.Header closeButton>
                <Modal.Title>{`Detalles del Grupo de Reportes ID: ${selectedGroup ? selectedGroup.id : ''}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='h-96 overflow-auto'>
                {selectedGroup && selectedGroup.reports && selectedGroup.reports.map((report, index) => (
                    <div key={index}>
                        <p><strong>Report Id:</strong> {report.mimic_id}</p>
                        <p><strong>Background:</strong> {report.background}</p>
                        <p><strong>Findings:</strong> {report.findings}</p>
                        <p><strong>Impression:</strong> {report.impression}</p>
                        <hr />
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalReport;
