import { useState, useEffect, useContext } from 'react';
import { Row, Button, Table } from 'react-bootstrap';
import NavBarReportSelection from '../Components/NavBarReportSelect';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getReportGroupsByUser, getUserReportGroup, getReportGroupReportsLength } from '../utils/api';

import './reportgroupselection.css';
import toast from 'react-hot-toast';

const ReportGroupSelection = () => {
  const { token } = useContext(AuthContext);
  const [reportGroups, setReportGroups] = useState([]);
  const [reportProgress, setReportProgress] = useState({});
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [progressSortDirection, setProgressSortDirection] = useState('asc');
  const [lastTranslatedReportId, setLastTranslatedReportId] = useState([]);

  const navigate = useNavigate();

  const handleSelectButtonClick = async (groupId) => {
    try {
      if (lastTranslatedReportId[groupId] + 1 < reportGroups.length) {
        navigate(`/translator/${groupId}/report/${lastTranslatedReportId[groupId]}`);
      } else {
        toast.error('No hay más reportes para traducir en este grupo');
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
        const totalReports = await getReportGroupReportsLength(reportGroupId, token);
        let lastTranslatedReportId = response.lastTranslatedReportId;
        setReportProgress((prevProgress) => ({ ...prevProgress, [reportGroupId]: lastTranslatedReportId ? (lastTranslatedReportId / totalReports) * 100 : 0 }));
        setLastTranslatedReportId((prevLastTranslatedReportId) => ({ ...prevLastTranslatedReportId, [reportGroupId]: lastTranslatedReportId }));
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
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
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
      <Row style={{width: '50rem', textAlignLast: 'center', borderRadius: '0.5rem'}} className="justify-content-center rounded-lg">
        <table className="custom-table divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="w-28" onClick={() => handleColumnHeaderClick('id')}>
                ID {sortColumn === 'id' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className="w-50" onClick={handleProgressColumnHeaderClick}>
                Progreso {sortColumn === 'progress' && <span>{progressSortDirection === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className="w-50">Fecha de creación</th>
              <th className="w-50">Traducir</th>
              <th className="w-50">Ver Reportes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200"> 
            {sortGroups().map((group, index) => (
              <tr key={index} className='items-center'>
                <td className="w-28">{group.id}</td>
                <td className="w-50">
                  {Math.round(reportProgress[group.id])}%
                  <div className="overflow-hidden rounded-full bg-gray-200">
                    <div style={{ width: `${Math.round(reportProgress[group.id])}%` }} className="h-3 rounded-full bg-indigo-600" />
                  </div>
                </td>
                <td className="w-50">
                  {(group.createdAt).slice(8,10)+(group.createdAt).slice(4,8)+(group.createdAt).slice(0,4)}
                </td>

                <td className="w-50">
                  <button variant="primary" onClick={() => handleSelectButtonClick(group.id, reportProgress[group.id])} className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">Traducir</button>
                </td>
                <td className="w-50">
                  <button variant="secondary" onClick={() => viewTableUserDisplayReportGroup(group.id)} className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Reportes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Row>
    </div>
  );
};

export default ReportGroupSelection;
