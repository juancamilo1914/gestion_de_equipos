
import './Login.css'


function Login() {
    return (
        <div className="login-form">
            <h2>Iniciar Sesión</h2>
            <form>
                <div className="user-box">
                    <input
                        type="text"
                        placeholder="Usuario"
                        required
                    />
                </div>
                <div className="user-box">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        required
                    />
                </div>
                <button type="submit">Iniciar sesión</button>
            </form>
        </div>
    );
}

export default Login