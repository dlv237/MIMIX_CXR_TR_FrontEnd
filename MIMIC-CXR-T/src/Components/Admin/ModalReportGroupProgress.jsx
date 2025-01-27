import { useEffect, useState, useContext } from "react";
import { Modal, Table } from "react-bootstrap";
import { getReportGroupProgress, getUsersByList } from "../../utils/api";
import { AuthContext } from "../../auth/AuthContext";

function ModalReportGroupProgress({ show, handleClose, batch }) {
  const { users, id: batchId } = batch;
  const { token } = useContext(AuthContext);

  const [usersList, setUsersList] = useState([]);
  const [reportProgress, setReportProgress] = useState({});
  
  useEffect(() => {
    const fetchUsersReportGroupProgress = async () => {
      try {
        let response = await getReportGroupProgress(batchId, token);
        for (let i = 0; i < users.length; i++) {
          const nReports = batch.reports.length;
          setReportProgress((prev) => ({
            ...prev,
            [users[i]]: (response[i].lastTranslatedReportId / nReports) * 100,
          }));
        }
      } catch (error) {
        console.error('Error fetching user report group:', error);
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await getUsersByList(users.join(','), token);
        setUsersList(response);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsersReportGroupProgress();
    fetchUsers();
  }, [batch.reports.length, batchId, token, users]);


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Progreso de los usuarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped hover>
          <thead>
            <tr>
              <th className='w-[50%] text-center'>Usuario</th>
              <th className='w-[50%] text-center'>Progreso</th>
            </tr>
          </thead>
          <tbody className="w-full">
            {Array.isArray(usersList) && usersList.map((user) => (
              <tr key={user.id}>
                <td className="w-full">{user.email}</td>
                <td className="w-full text-center">
                  {Math.round(reportProgress[user.id])}%
                  <div className="overflow-hidden rounded-full bg-gray-400">
                    <div style={{ width: `${Math.round(reportProgress[user.id])}%` }} className="h-3 rounded-full bg-indigo-600" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}

export default ModalReportGroupProgress;