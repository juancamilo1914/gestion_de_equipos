import React, { useState } from 'react';
import './RegistroPage.css';
import '../../index.css';
import api from '../../api/axios';

function RegistroPage() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
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
                contraseña: password,
            });
            
            setSuccess('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            // Limpiar formulario tras el éxito
            setNombre('');
            setCorreo('');
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

                <form className="registro-card" onSubmit={handleSubmit}>
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
                        <a className="link small" href="/login">¿Ya tienes una cuenta? Inicia sesión</a>
                    </div>
                </form>
                <footer className="registro-footer"><small>© {new Date().getFullYear()} Gestión Informática</small></footer>
            </section>
        </main>
    );
}

export default RegistroPage;