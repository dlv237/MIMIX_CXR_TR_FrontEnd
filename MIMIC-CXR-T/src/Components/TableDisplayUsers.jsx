import { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Col, Alert } from 'react-bootstrap';
import { deleteUser } from '../utils/api';
import { AuthContext } from '../auth/AuthContext';
import ModalConfirmDelete from './ModalConfirmDelete';

const DisplayUsers = ({allUsers, onDeleteUser}) => {
 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const { token } = useContext(AuthContext);

  const users = allUsers;


  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id, token);
      setShowAlert(true);
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
    <>
      <Alert show={showAlert} variant="success" onClose={() => setShowAlert(false)} dismissible>
        Usuario eliminado exitosamente
      </Alert>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">View Details</th>
            <th scope="col">Delete User</th>
          
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.role}</td>
              <td>{user.email}</td>
              
              <td>
                <Button variant="danger" onClick={() => handleShowModalDelete(user)}>
                  Borrar Usuario
                </Button>
              </td>
           
            </tr>
          ))}
        </tbody>
        </table>

      <ModalConfirmDelete show={showModalDelete} handleClose={handleCloseModalDeleteReport} handleConfirm={handleDeleteUser} msg="usuario"/>
    </>

    
  );
};

export default DisplayUsers;

