import React, { useState } from 'react';
import './olvidasteLaContraseña.css';

function OlvidasteLaContraseña({ onBack }) {
    const [email, setEmail] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: integrar con backend
        console.log('olvidaste la contraseña', { email });
    };

    return (
        <main className="page olvidaste-la-contraseña-page">
            <section className="olvidaste-la-contraseña-wrapper" aria-labelledby="olvidaste-heading">
                <div className="brand">
                    <div className="logo" aria-hidden="true">GE</div>
                    <h1 id="olvidaste-heading">Recuperar contraseña</h1>
                    <p className="subtitle">Ingresa tu correo electrónico para restablecer tu contraseña</p>
                </div>
                <form className="olvidaste-la-contraseña-card" onSubmit={onSubmit} aria-describedby="desc">
                    <p id="desc" className="sr-only">Ingresa tu correo electrónico para restablecer tu contraseña</p>

                    <div className="field">
                        <label htmlFor="input-email" className="label-text">Correo electrónico</label>
                        <div className="input-wrap">
                            <input
                                id="input-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="tu-email@ejemplo.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn primary" type="submit">Enviar enlace de recuperación</button>
                        <button type="button" className="link small" onClick={(e) => { e.preventDefault(); onBack && onBack(); }} style={{background:'none',border:'none',padding:0,marginTop:8}}>
                            Volver al inicio de sesión
                        </button>
                    </div>
                </form>

                <footer className="olvidaste-la-contraseña-footer"><small>© {new Date().getFullYear()} Gestión Informática</small></footer>
            </section>
        </main>
    );
}

export default OlvidasteLaContraseña;