import { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { Container } from 'react-bootstrap';

function Signup({getUsers}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("User");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
      firstName: firstName,
      lastName: lastName,
      role: role,
      email: email,
      password: password
    }).then((response) => {
      setError(false);
      setMsg('Usuario registrado correctamente');
      setPasswordError("");
      getUsers();
    }).catch((error) => {      
      console.error('Ocurrió un error:', error);
      setError(true);
    });
  }

  return (
    <Container>
      <div className="Login">
        {msg.length > 0 && <div className="successMsg"> {msg} </div>}
        {error && <div className="error">Hubo un error con el Registro, por favor trata nuevamente.</div>}
        {passwordError && <div className="error">{passwordError}</div>}

        <form onSubmit={handleSubmit}>
        <label>
            Rol:
            <select 
              name="role" 
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          
          <label>
            Nombre:
            <input 
              type="text" 
              name="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </label>

          <label>
            Apellido:
            <input 
              type="text" 
              name="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </label>

          <label>
            Email:
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña:
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirmar contraseña:
            <input 
              type="password" 
              name="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        
          <input type="submit" value="Registrarse" />
        </form>
      </div>
    </Container>
  );
}

export default Signup;
