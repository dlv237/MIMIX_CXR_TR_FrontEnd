import { useEffect , useState} from "react";
import { AuthContext } from "./AuthContext";
import { getUser } from "../utils/api";

function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null); // Agregar estado para el usuario (incluyendo el rol)

    function logout() {
        setToken(null)
        setUser(null); // Limpiar la información del usuario al cerrar sesión
    }

    useEffect(() => {
        localStorage.setItem('token', token);
    }, [token]);

    useEffect(() => {
        if (token) {
            getUser(token)
                .then((user) => {
                    setUser(user);
                })
                .catch((error) => {
                    console.error("Error getting user", error);
                });
        }
    }, [token]);
    
    return (
        <AuthContext.Provider value={{ token, setToken, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
    }
export default AuthProvider;