import React, { useState } from 'react';
import './SettingsModal.css'; // Usaremos un CSS compartido para los modales

function UserSettingsModal({ user, onClose }) {
    const [nombre, setNombre] = useState(user?.nombre || '');
    const [correo, setCorreo] = useState(user?.correo || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword && newPassword !== confirmPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }

        // Aquí iría la lógica para llamar a la API y guardar los cambios
        console.log('Guardando perfil de usuario:', { nombre, correo });
        if (newPassword) {
            console.log('Cambiando contraseña...');
        }

        setSuccess('¡Perfil actualizado con éxito! (Simulación)');
        // setTimeout(onClose, 2000); // Opcional: cerrar después de un tiempo
    };

    return (
        <div className="settings-modal" onClick={onClose}>
            <div className="settings-panel card" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h3><span className="icon">👤</span>Ajustes de Usuario</h3>
                    {/* <button className="close-modal-btn" onClick={onClose}>×</button> */}
                </div>
                <form onSubmit={handleSubmit} className="settings-form">
                    {error && <div className="form-message error">{error}</div>}
                    {success && <div className="form-message success">{success}</div>}

                    <h4>Información del Perfil</h4>
                    <label>
                        Nombre de Usuario
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
                    </label>
                    <label>
                        Correo Electrónico
                        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" />
                    </label>

                    <hr />

                    <h4>Cambiar Contraseña</h4>
                    <label>
                        Contraseña Actual
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="********" />
                    </label>
                    <label>
                        Nueva Contraseña
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
                    </label>
                    <label>
                        Confirmar Nueva Contraseña
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" />
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="action-btn save">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserSettingsModal;