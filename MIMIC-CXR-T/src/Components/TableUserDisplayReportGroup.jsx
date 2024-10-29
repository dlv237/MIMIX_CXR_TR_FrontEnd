import { useState, useContext, useEffect } from 'react';
import { Table, Button, Col, Container, Row, Spinner, Pagination } from 'react-bootstrap';
import NavBarReportSelection from './NavBarReportSelect';
import { AuthContext } from '../auth/AuthContext';
import { getReportGroupReports, getReportById, getUserReportGroup } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { getIsReportCompleted } from '../utils/api';
import Tooltip from './Tooltip';

const TableUserDisplayReportGroup = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [reportDetails, setReportDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const { groupId } = useParams();
  const [lastTranslatedReportId, setLastTranslatedReportId] = useState(0);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataReports = await getReportGroupReports(groupId, token);
        dataReports.sort((a, b) => a.report.index - b.report.index);
        setReports(dataReports);
        const reportDetailsObject = {};

        for (const report of dataReports) {
          const reportId = report.report.reportId;
          const reportContent = await getReportById(reportId, token);
          const concatenatedString = reportContent.background + reportContent.findings + reportContent.impression;
          const truncatedString = concatenatedString.slice(0, 150);

          reportDetailsObject[reportId] = {
            content: truncatedString,
          };
        }

        setReportDetails(reportDetailsObject);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    const fetchLastTranslatedReportId = async () => {
      try {
        const response = await getUserReportGroup(groupId, token);
        if (response) {
          setLastTranslatedReportId(response.lastTranslatedReportId);
        }
      } catch (error) {
        console.error('Error fetching user report group:', error);
      }
    };

    fetchLastTranslatedReportId();
    fetchData();
  }, [groupId, setLastTranslatedReportId, token]);

  const getIndexReport = async (reportId) => {
    for (const report of reports) {
      if (report.report.reportId === reportId) {
        return report.report.index;
      }
    }
  };

  const startTranslationReport = async (groupId, reportId) => {
    try {
      const indexReport = await getIndexReport(reportId);
      if (indexReport > 0) {
        const previousReportId = reports[indexReport - 1].report.reportId;
        const isReportCompleted = await getIsReportCompleted(previousReportId, token);
        if (!isReportCompleted.completed) {
          return;
        } else {
          navigate(`/translator/${groupId}/report/${reportId - 1}`);
        }
      } else {
        navigate(`/translator/${groupId}/report/${reportId - 1}`);
      }
    } catch (error) {
      console.error('Error checking report completion:', error);
    }
  };

  const loadingSpinner = (
    <div className="loading-spinner-container">
      <Spinner animation="grow" variant="primary" />
      <span className="sr-only">Cargando...</span>
    </div>
  );

  // Lógica para la paginación
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Container className="mt-10 w-[90vw]">
        <Row>
          <NavBarReportSelection />
        </Row>
        <Row>
          <Col>
            {loading ? (
              loadingSpinner
            ) : (
              <>
                <h2 className='font-medium text-start pt-8 pb-4 text-2xl'>Reportes del batch numero {groupId}</h2>
                <Table striped bordered hover className="rounded">
                  <thead>
                    <tr>
                      <th className="w-[12%]">N° Reporte</th>
                      <th className="w-[73%]">Contenido</th>
                      <th className="w-[15%]">Ver reporte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map((report) => {
                      const reportId = report.report.reportId;
                      const reportDetail = reportDetails[reportId] || {};

                      return (
                        <tr key={report.report.index}>
                          <td className="w-[12%]">{report.report.index}</td>
                          <td className="w-[73%] text-start">{reportDetail.content || ''}</td>
                          <td className="w-[15%]">
                            <Tooltip
                              message={
                                report.report.index > lastTranslatedReportId
                                  ? "Debes traducir el reporte anterior"
                                  : "Traducir este reporte"
                              }
                            >
                              <Button
                                onClick={() => startTranslationReport(groupId, report.report.index + 1)}
                                disabled={report.report.index > lastTranslatedReportId}
                              >
                                Traducir
                              </Button>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                <Pagination>
                  {[...Array(Math.ceil(reports.length / reportsPerPage)).keys()].map((number) => (
                    <Pagination.Item key={number} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                      {number + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TableUserDisplayReportGroup;
