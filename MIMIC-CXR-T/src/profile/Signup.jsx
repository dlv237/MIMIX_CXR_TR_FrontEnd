import { useState } from 'react';
import axios from 'axios';
import './Login.css'; 

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
    }).then(() => {
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
      <div className="">
        {msg.length > 0 && <div className="successMsg"> {msg} </div>}
        {error && <div className="error">Hubo un error con el Registro, por favor trata nuevamente.</div>}
        {passwordError && <div className="error">{passwordError}</div>}
        
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className='flex flex-row text-start'>
                <p className='font-bold'>
                  Rol:
                </p>
                
                <select 
                  name="role" 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                  className='bg-white rounded-[5px] ml-5'
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              
              <div>
                <label htmlFor="firstName" className="text-start block text-sm font-medium leading-6 text-gray-900">
                  Nombre
                </label>
                <div className="mt-2 rounded-md border">
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-3  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>


              <div>
                <label htmlFor="lastName" className="text-start block text-sm font-medium leading-6 text-gray-900">
                  Apellido
                </label>
                <div className="mt-2 rounded-md border">
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-3  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-start block text-sm font-medium leading-6 text-gray-900">
                  Email
                </label>
                <div className="mt-2 rounded-md border">
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-3  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-start block text-sm font-medium leading-6 text-gray-900">
                  Contraseña
                </label>
                <div className="mt-2 rounded-md border">
                  <input
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-3  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-start block text-sm font-medium leading-6 text-gray-900">
                  Confirmar contraseña
                </label>
                <div className="mt-2 rounded-md border">
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-3  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Registrar usuario
                </button>
              </div>
            </form>
          </div>
        </div>
        
      </div>
  );
}

export default Signup;
