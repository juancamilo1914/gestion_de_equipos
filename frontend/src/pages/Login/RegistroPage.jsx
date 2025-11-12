import React, { useState } from 'react';
import '../Login/Login.css'; // Reutilizar los estilos del Login
import '../../index.css';
import api from '../../api/axios';

// Componente reutilizable para los campos del formulario
function InputField({ id, label, value, onChange, type = 'text', placeholder, required = false, autoComplete }) {
    return (
        <div className="field">
            <label htmlFor={id} className="label-text">{label}</label>
            <div className="input-wrap">
                <input
                    id={id}
                    value={value}
                    onChange={onChange}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                />
            </div>
        </div>
    );
}

function RegistroPage({ onBack, onForgot }) {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            // Basado en DOCUMENTATION.md, el endpoint es /api/auth/register
            await api.post('/auth/register', {
                nombre,
                correo,
                usuario,
                contraseña: password,
            });
            
            setSuccess('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            // Limpiar formulario tras el éxito
            setNombre('');
            setCorreo('');
            setUsuario('');
            setPassword('');
            setConfirmPassword('');

        } catch (err) {
            console.error('Error en el registro:', err);
            const message = err?.response?.data?.body || err?.response?.data?.message || 'Error al crear la cuenta.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page login-page">
            <section className="login-wrapper" aria-labelledby="registro-heading">
                <div className="brand">
                    <div className="logo" aria-hidden="true">GE</div>
                    <h1 id="registro-heading">Crear una cuenta</h1>
                    <p className="subtitle">Únete a la plataforma de gestión</p>
                </div>

                <form className="login-card" onSubmit={handleSubmit}>
                    {error && <div className="form-message error" aria-live="polite">{error}</div>}
                    {success && <div className="form-message success" aria-live="polite">{success}</div>}

                    <InputField
                        id="input-nombre"
                        label="Nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Tu nombre y apellido"
                        autoComplete="name"
                        required
                    />
                    <InputField
                        id="input-correo"
                        label="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        type="email"
                        placeholder="ejemplo@correo.com"
                        autoComplete="email"
                        required
                    />
                    <InputField
                        id="input-usuario"
                        label="Nombre de usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="Tu nombre de usuario"
                        autoComplete="username"
                        required
                    />
                    <InputField
                        id="input-pass-reg"
                        label="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="********"
                        autoComplete="new-password"
                        required
                    />
                    <InputField
                        id="input-confirm-pass"
                        label="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="********"
                        autoComplete="new-password"
                        required
                    />

                    <div className="actions">
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear cuenta'}
                        </button>
                        <div className="alt-links">
                    <button type="button" className="link tiny" onClick={(e) => { e.preventDefault(); onBack && onBack(); }}>
                        ¿Ya tienes una cuenta? <strong>Inicia sesión</strong>
                    </button>
                </div>
                    </div>
                </form>
                
                <footer className="login-footer">
                    <small>© {new Date().getFullYear()} Gestión Informática</small><div className='Logoinstitucional'></div>
                </footer>
            </section>
        </main>
    );
}

export default RegistroPage;