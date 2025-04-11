import { useEffect, useState, useContext } from "react";
import { Modal, Table } from "react-bootstrap";
import { getReportGroupProgress, getUsersByList, getUserSuggestionsByGroupId } from "../../utils/api";
import { AuthContext } from "../../auth/AuthContext";

function ModalReportGroupProgress({ show, handleClose, batch }) {
  const { users, id: batchId } = batch;
  const { token } = useContext(AuthContext);

  const [usersList, setUsersList] = useState([]);
  const [reportProgress, setReportProgress] = useState({});

  const donwloadReport = async (userId) => {
    const user = usersList.find((user) => user.id === userId);
    if (user) {
      const response = await getUserSuggestionsByGroupId(batchId, user.id, token);
      console.log(response);
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `results_group_${batchId}_user_${user.email}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
  
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
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Progreso de los usuarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped hover >
          <thead>
            <tr>
              <th className='w-[40%] text-center'>Usuario</th>
              <th className='w-[30%] text-center'>Progreso</th>
              <th className='w-[30%] text-center'>Resultados</th>
            </tr>
          </thead>
          <tbody className="w-full">
            {Array.isArray(usersList) && usersList.map((user) => (
              <tr key={user.id}>
                <td className="w-[40%] ">{user.email}</td>
                <td className="w-[30%] text-center">
                  {Math.round(reportProgress[user.id])}%
                  <div className="overflow-hidden rounded-full bg-gray-400">
                    <div
                      style={{ width: `${Math.round(reportProgress[user.id])}%` }}
                      className="h-3 rounded-full bg-indigo-600"
                    />
                  </div>
                </td>
                <td className="w-[30%] text-center">
                  <button
                    onClick={() => donwloadReport(user.id)}
                    disabled={reportProgress[user.id] !== 100}
                    type="button"
                    className={`mt-2 rounded bg-white/10 px-2 py-1 text-xs font-semibold  shadow-sm${
                      reportProgress[user.id] !== 100
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200 text-gray'
                        : 'bg-indigo-600 hover:bg-indigo-100 text-black'
                    }`}
                  >
                    Descargar
                  </button>
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