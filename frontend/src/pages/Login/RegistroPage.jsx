import React, { useState } from 'react';
import './RegistroPage.css';
import '../../index.css';
import api from '../../api/axios';

function RegistroPage({ onBack }) {
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
        <main className="page registro-page">
            <section className="registro-wrapper" aria-labelledby="registro-heading">
                <div className="brand">
                    <div className="logo" aria-hidden="true">GE</div>
                    <h1 id="registro-heading">Crear una cuenta</h1>
                    <p className="subtitle">Únete a la plataforma de gestión</p>
                </div>

                <form className="registro-card" onSubmit={handleSubmit} aria-describedby="desc">
                    <p id="desc" className="sr-only">Ingresa tu nombre, correo y contraseña para crear una cuenta</p>
                    {error && <div className="form-message error">{error}</div>}
                    {success && <div className="form-message success">{success}</div>}

                    <div className="field">
                        <label htmlFor="input-nombre">Nombre completo</label>
                        <div className="input-wrap">
                            <input
                                id="input-nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                type="text"
                                placeholder="Tu nombre y apellido"
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-correo">Correo electrónico</label>
                        <div className="input-wrap">
                            <input
                                id="input-correo"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                type="email"
                                placeholder="ejemplo@correo.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-usuario">Nombre de usuario</label>
                        <div className="input-wrap">
                            <input
                                id="input-usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                type="text"
                                placeholder="Tu nombre de usuario"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-pass-reg">Contraseña</label>
                        <div className="input-wrap">
                            <input id="input-pass-reg" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="********" required autoComplete="new-password" />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-confirm-pass">Confirmar contraseña</label>
                        <div className="input-wrap">
                            <input id="input-confirm-pass" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="********" required autoComplete="new-password" />
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear cuenta'}
                        </button>
                        <button type="button" className="link small" onClick={onBack} style={{color: 'var(--primary)', background:'none',border:'none',padding:0,marginTop:8,cursor:'pointer'}}>
                            ¿Ya tienes una cuenta? Inicia sesión
                        </button>
                    </div>
                </form>
                <footer className="registro-footer"><small>© {new Date().getFullYear()} Gestión Informática</small><div className='Logoinstitucional'></div></footer>
            </section>
        </main>
    );
}

export default RegistroPage;