import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../common/App';
import Translator from '../common/Translator';
import ModalLogin from '../profile/ModalLogin';
import Signup from '../profile/Signup';
import ReportGroupSelection from '../common/ReportGroupSelection'; 
import Admin from '../common/Admin';
import TableUserDisplayReportGroup from '../Components/TableUserDisplayReportGroup';
import AccessDenied from '../Components/AccessDenied';

function Routing() {
  return (
    <BrowserRouter basename="/mimix-cxr-tr">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/translator/:groupId/" element={<Translator />} />
        <Route path="/tablereportgroup/:groupId" element={<TableUserDisplayReportGroup />} />
        <Route path="/login" element={<ModalLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reportselection" element={<ReportGroupSelection />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
