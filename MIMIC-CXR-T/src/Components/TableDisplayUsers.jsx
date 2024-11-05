import { useState, useContext } from 'react';
import { deleteUser } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalConfirmDelete from './ModalConfirmDelete';
import toast from 'react-hot-toast';

const DisplayUsers = ({allUsers, onDeleteUser}) => {
 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const { token } = useContext(AuthContext);

  const users = allUsers;


  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id, token);
      toast.success('Usuario eliminado correctamente');
      onDeleteUser(selectedUser.id);
      setShowModalDelete(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCloseModalDeleteReport = () => {
    setShowModalDelete(false);
  };

  const handleShowModalDelete = (user) => {
    setSelectedUser(user);
    setShowModalDelete(true);
  };

  return (
    <div className='m-16'>

      <table className="min-w-full divide-y divide-gray-300 text-start">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 w-[10%]" >
              User ID
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[25%]">
              Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[15%]">
              Role
              </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[50%]">
              Email
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
              <span className="sr-only">Action</span>
            </th>
          
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 w-[10%]" >
                {user.id}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 w-[25%]" >{user.firstName} {user.lastName}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 w-[15%]">{user.role}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 w-[35%]">{user.email}</td>
              
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 w-[15%]">
                <a className="text-indigo-600 hover:text-indigo-900 cursor-pointer" onClick={() => handleShowModalDelete(user)}>
                  Borrar Usuario
                </a>
              </td>
           
            </tr>
          ))}
        </tbody>
        </table>

      <ModalConfirmDelete show={showModalDelete} handleClose={handleCloseModalDeleteReport} handleConfirm={handleDeleteUser} msg="usuario"/>
    </div>

    
  );
};

export default DisplayUsers;

