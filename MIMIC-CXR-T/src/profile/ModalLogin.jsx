
import { useState, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom'; 


function ModalLogin() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { token, setToken } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();

    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log('Login successful');
        setError(false);
        setMsg('Login exitoso!');
        // Recibimos el token y lo procesamos
        const access_token = response.data.access_token;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        //console.log('Se seteo el token: ', token, access_token);

        // Cerrar el modal después del login exitoso
        handleClose();

        // Redirige a la vista para seleccionar reportes a traducir 
        // después del inicio de sesión
        navigate('/reportselection');
      })
      .catch((error) => {
        console.error('An error occurred while trying to login:', error);
        setError(true); // aquí puede haber más lógica para tratar los errores
      });
  };


  return (
    <>
      <Button variant="info" onClick={handleShow}>
        Iniciar sesión
      </Button>

      <Modal 
        show={show} 
        onHide={handleClose} 
        backdrop="static" 
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Iniciar Sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="3">
                Email:
              </Form.Label>
              <Col sm="8">
                <Form.Control
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
              <Form.Label column sm="3">
                Contraseña:
              </Form.Label>
              <Col sm="8">
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>

            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} type="submit">
              Enviar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalLogin;
