import React, { useState } from 'react';
import './RegistroPage.css';
import '../../index.css';
import api from '../../api/axios';

function RegistroPage({ onBack }) {
    const [formData, setFormData] = useState({
        usuario: '',
        email: '',
        password: '',
        confirmarPassword: '',
        nombre: '',
        role: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        // Validar campos obligatorios
        if (!formData.usuario || !formData.email || !formData.password || !formData.confirmarPassword || !formData.nombre || !formData.role) {
            setError('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const resp = await api.post('/auth/register', {
                usuario: formData.usuario,
                email: formData.email,
                password: formData.password,
            });

            console.log('register response', resp.data);
            setMessage(resp.data.body.message || '¡Registro exitoso! Revisa tu correo para confirmar.');
            setFormData({ usuario: '', email: '', password: '', confirmarPassword: '', nombre: '', role: '' });
            // Opcional: redirigir al login después de unos segundos
            setTimeout(() => onBack && onBack(), 5000);
        } catch (err) {
            console.error('Register error', err);
            const errorMessage = err?.response?.data?.body?.message || err?.response?.data?.body || err?.response?.data?.message || 'Error en el registro.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page registro-page">
            <section className="registro-wrapper" aria-labelledby="registro-heading">
                <div className="brand">
                    <div className="logo" aria-hidden="true">GE</div>
                    <h1 id="registro-heading">Gestión de equipos</h1>
                    <p className="subtitle">Crea tu cuenta</p>
                </div>

                <form className="registro-card" onSubmit={handleSubmit} aria-describedby="desc">
                    {error && <div className="form-message error">{error}</div>}
                    {message && <div className="form-message success">{message}</div>}

                    <p id="desc" className="sr-only">Ingresa tu usuario, email y contraseña para registrarte</p>

                    <div className="field">
                        <label htmlFor="input-user" className="label-text">Usuario</label>
                        <div className="input-wrap">
                            <input
                                id="input-user"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                type="text"
                                placeholder="Nombre de usuario"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-email" className="label-text">Correo electrónico</label>
                        <div className="input-wrap">
                            <input
                                id="input-email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-pass" className="label-text">Contraseña</label>
                        <div className="input-wrap">
                            <input
                                id="input-pass"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type="password"
                                placeholder="********"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-confirm-pass" className="label-text">Confirmar contraseña</label>
                        <div className="input-wrap">
                            <input
                                id="input-confirm-pass"
                                name="confirmarPassword"
                                value={formData.confirmarPassword}
                                onChange={handleChange}
                                type="password"
                                placeholder="********"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-nombre" className="label-text">Nombre</label>
                        <div className="input-wrap">
                            <input
                                id="input-nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                type="text"
                                placeholder="Tu nombre completo"
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="input-role" className="label-text">Rol</label>
                        <div className="input-wrap">
                            <select
                                id="input-role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuario</option>
                                <option value="tecnico">Técnico</option>
                            </select>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>

                        <div className="alt-links">
                            <button type="button" className="link tiny" onClick={(e) => { e.preventDefault(); onBack && onBack(); }}>
                                ¿Ya tienes una cuenta? Inicia sesión
                            </button>
                        </div>
                    </div>
                </form>

                <footer className="registro-footer">
                    <small>© {new Date().getFullYear()} Gestión Informática</small>
                    <div className="logo-institucional"></div>
                </footer>
            </section>
        </main>
    );
}

export default RegistroPage;
