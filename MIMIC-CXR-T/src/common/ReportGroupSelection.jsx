import { useState, useEffect, useContext } from 'react';
import { Row, Button, Table, ProgressBar } from 'react-bootstrap';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getReportGroupsByUser, getUserReportGroup, getReportGroupReports } from '../utils/api';

import './reportgroupselection.css';

const ReportGroupSelection = () => {
  const { token } = useContext(AuthContext);
  const [reportGroups, setReportGroups] = useState([]);
  const [reportProgress, setReportProgress] = useState({});
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [progressSortDirection, setProgressSortDirection] = useState('asc');

  const navigate = useNavigate();

  const handleSelectButtonClick = async (groupId) => {
    try {
      const response = await getReportGroupReports(groupId, token);
      if (response.length > 0) {
        const firstReportId = response[0].report.reportId; // Obtener el primer reporte del grupo
        navigate(`/translator/${groupId}/report/${firstReportId}`); // Navegar a la ruta con groupId y reportId
      }
    } catch (error) {
      console.error('Error fetching reports for group:', error);
    }
  };

  const viewTableUserDisplayReportGroup = (groupId) => {
    navigate(`/tablereportgroup/${groupId}`);
  };

  const fetchUserReportGroupProgress = async (reportGroupId) => {
    try {
      const response = await getUserReportGroup(reportGroupId, token);
      if (response) {
        let progressReportGroup = response.progressReports;
        setReportProgress((prevProgress) => ({ ...prevProgress, [reportGroupId]: progressReportGroup }));
      }
      // Devuelve la promesa resultante
      return response;
    } catch (error) {
      console.error('Error fetching user report group:', error);
      throw error; // Propaga el error para que Promise.all lo maneje
    }
  };

  useEffect(() => {
    const fetchUserReportGroups = async () => {
      try {
        const response = await getReportGroupsByUser(token);
        setReportGroups(response);
      } catch (error) {
        console.error('Error fetching report groups:', error);
      }
    };

    fetchUserReportGroups();
  }, [token]);

  useEffect(() => {
    const fetchProgressForAllGroups = async () => {
      const promises = reportGroups.map((group) =>
        fetchUserReportGroupProgress(group.id)
      );
      await Promise.all(promises);
    };

    fetchProgressForAllGroups();
  }, [reportGroups, token]);

  const sortGroups = () => {
    const sortedGroups = [...reportGroups].sort((a, b) => {
      if (sortColumn === 'id') {
        return (a.id - b.id) * (sortDirection === 'asc' ? 1 : -1);
      } else if (sortColumn === 'progress') {
        return (Math.round(reportProgress[a.id]) - Math.round(reportProgress[b.id])) * (progressSortDirection === 'asc' ? 1 : -1);
      }
      return 0;
    });

    return sortedGroups;
  };

  const handleColumnHeaderClick = (column) => {
    if (column === sortColumn) {
      // Si se hace clic en la misma columna, cambiar la dirección
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      // Si se hace clic en una nueva columna, cambiar la columna y establecer la dirección a ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleProgressColumnHeaderClick = () => {
    setSortColumn('progress');
    setSortDirection('asc');
    setProgressSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div>
      <NavBarReportSelection />
      <h3>Selecciona un grupo de reportes a traducir:</h3>
      <Row>
        <Table striped bordered hover variant="primary" responsive='sm' className="custom-table">
          <thead>
            <tr>
              <th className="w-10" onClick={() => handleColumnHeaderClick('id')}>
                ID {sortColumn === 'id' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className="w-50" onClick={handleProgressColumnHeaderClick}>
                Progreso {sortColumn === 'progress' && <span>{progressSortDirection === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className="w-50">Fecha de creación</th>
              {/* Otros encabezados de columnas si los hay */}
              <th className="w-50">Traducir</th>
              <th className="w-50">Ver Reportes</th>
            </tr>
          </thead>
          <tbody>
            {sortGroups().map((group, index) => (
              <tr key={index}>
                <td className="w-10">{group.id}</td>
                <td className="w-50">
                  <ProgressBar striped animated className="custom-progress-bar"
                    now={Math.round(reportProgress[group.id])}
                    label={`${Math.round(reportProgress[group.id])}%`}
                    variant={
                      Math.round(reportProgress[group.id]) <= 33 ? "danger" :
                      Math.round(reportProgress[group.id]) <= 99 ? "warning" :
                      "success"
                    } />
                </td>
                <td className="w-50">
                  {(group.createdAt).slice(8,10)+(group.createdAt).slice(4,8)+(group.createdAt).slice(0,4)}
                </td>
                {/* Otros datos de la fila si los hay */}
                <td className="w-50">
                  <Button variant="primary" onClick={() => handleSelectButtonClick(group.id, reportProgress[group.id])}>Traducir</Button>
                </td>
                <td className="w-50">
                  <Button variant="secondary" onClick={() => viewTableUserDisplayReportGroup(group.id)}>Reportes</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </div>
  );
};

export default ReportGroupSelection;
