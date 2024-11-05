import { useState, useContext, useEffect } from 'react';
import TableDisplayReports from '../Components/TableDisplayReportGroup';
import { AuthContext } from '../auth/AuthContext';
import { getAllReportGroupReports, createUserReportGroups } from '../utils/api';
import NavAdmin from '../Components/NavAdmin';
import CreateUserReportGroup from '../Components/CreateUserReportGroup';
import DisplayUsers from '../Components/TableDisplayUsers';
import { useNavigate } from 'react-router-dom';
import Signup from '../profile/Signup';

import { getAllUsers } from '../utils/api';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Admin2() {
  const { token } = useContext(AuthContext);
  const [reportGroupReports, setReportGroupReports] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("first");

  const getReportGroupReports = async () => {
    try {
      const response = await getAllReportGroupReports(token);
      setReportGroupReports(response);
    } catch (error) {
      console.error('Error fetching reportGroupReports:', error);
    } 
  };

  const handleDeleteReportGroup = (deletedReportId) => {
    setReportGroupReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };
  
  const handleDeleteUser = (deletedUserId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
  };

  const handleCreateUserReportGroup = async (userReportGroupData) => {
    try {
      const response = await createUserReportGroups(userReportGroupData, token);
      return response;
    } catch (error) {
      console.error('Error creating user report group:', error);
      return error.response;
    }
  };
  
  const getUsers = async () => {
    try {
      const usersData = await getAllUsers(token);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    getReportGroupReports();
    getUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate("/access-denied");
    }
  }, [user, navigate]);

  const navigationItems = [
    { name: "Agregar o eliminar grupos de reportes", eventKey: "first" },
    { name: "Asociar usuario a grupo de reportes", eventKey: "second" },
    { name: "Ver lista de usuarios registrados", eventKey: "third" },
    { name: "Registro de usuarios", eventKey: "fifth" },
  ];

  return (
    <>
      <div className='w-screen h-screen'>
        <NavAdmin style={{position: 'relative'}}/>
        <div className="flex flex-col">
          <div className="flex flex-1">
            <div className="hidden lg:flex lg:flex-col lg:w-72 bg-gray-900" style={{height:'93vh'}}>
              <nav className="flex flex-col text-start">
                <ul role="list" className="flex flex-col gap-y-7 p-6">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <a
                        onClick={() => setActiveTab(item.eventKey)}
                        className={classNames(
                          activeTab === item.eventKey ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer'
                        )}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex-1 p-6 overflow-y-auto" style={{height:'93vh'}}>
              {/* Contenido según la pestaña activa */}
              {activeTab === "first" && (
                <TableDisplayReports reportGroupReports={reportGroupReports} onDeleteReportGroup={handleDeleteReportGroup} getReportGroupReports={getReportGroupReports}/>
              )}
              {activeTab === "second" && (
                <CreateUserReportGroup handleCreateUserReportGroup={handleCreateUserReportGroup} allUsers={users} reportGroupReports={reportGroupReports} getReportGroupReports={getReportGroupReports} />
              )}
              {activeTab === "third" && (
                <DisplayUsers allUsers={users} onDeleteUser={handleDeleteUser} />
              )}
              {activeTab === "fifth" && (
                <Signup getUsers={getUsers} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin2;
