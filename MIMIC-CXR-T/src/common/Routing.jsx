import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../common/App';
import ReportTranslator from '../common/ReportTranslator';
import ModalLogin from '../profile/ModalLogin';
import Signup from '../profile/Signup';
import ReportGroupSelection from '../common/ReportGroupSelection'; 
import Admin2 from './Admin2';
import TableUserDisplayReportGroup from '../Components/TableUserDisplayReportGroup';
import AccessDenied from '../Components/AccessDenied';
import { useEffect } from 'react';

function Routing() {

  useEffect(() => {
    console.error = () => {};
    console.warn = () => {};
  }, []);

  return (
    <BrowserRouter basename="/mimix-cxr-tr/">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tablereportgroup/:groupId" element={<TableUserDisplayReportGroup />} />
        <Route path="/translator/:groupId/report/:reportId" element={<ReportTranslator />} />
        <Route path="/login" element={<ModalLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reportselection" element={<ReportGroupSelection />} />
        <Route path="/admin" element={<Admin2 />} />
        <Route path="/access-denied" element={<AccessDenied />} />

      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
