import React, { useState } from 'react';
import './Login.css';
import '../../index.css';
import api from '../../api/axios';

function Login({ onForgot, onLogin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState(''); // Nuevo estado para el mensaje de error

    const onSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        try {
            const resp = await api.post('/auth/login', {
                usuario: user, // Se usa 'usuario' para la autenticación
                password: pass, // Usar 'password' para coincidir con el backend y la BD
            });

            // El backend devuelve la estructura: { error, status, body }
            // El token (o payload) viene en resp.data.body
            console.log('login response', resp.data);

            const token = resp?.data?.body;
            if (token) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('username', user); // Guardar el nombre de usuario
                if (onLogin) onLogin(token); // onLogin solo espera el token según App.jsx
            }
        } catch (err) {
            console.error('Login error:', err);
            const message = err?.response?.data?.body || err?.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
            setError(message); // Establece el mensaje de error en el estado
        }
    };

    return (
        <main className="page login-page">
            <section className="login-wrapper" aria-labelledby="login-heading">
                <div className="brand">
                    <div className="logo" aria-hidden="true">GE</div>
                    <h1 id="login-heading">Gestión de equipos</h1>
                    <p className="subtitle">Accede a tu panel</p>
                </div>

                <form className="login-card" onSubmit={onSubmit} aria-describedby="desc">
                    {error && <div className="form-message error">{error}</div>} {/* Muestra el mensaje de error */}

                    <p id="desc" className="sr-only">Ingresa tu usuario y contraseña para acceder</p>

                    <div className="field">
                        <label htmlFor="input-user" className="label-text">Usuario</label>
                        <div className="input-wrap">
                            <input
                                id="input-user"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                type="text"
                                placeholder="Nombre de usuario"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-pass" className="label-text">Contraseña</label>
                        <div className="input-wrap">
                            <input
                                id="input-pass"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                type="password"
                                placeholder="********"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn primary" type="submit">
                            Iniciar sesión
                        </button>
                    </div>
                </form>

                <footer className="login-footer">
                    <small>© {new Date().getFullYear()} Gestión Informática</small><div className='Logoinstitucional'></div>
                </footer>
            </section>
        </main>
    );
}

export default Login;