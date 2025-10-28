import React, { useState } from 'react';
import './UserSettingsModal.css';
import api from '../api/axios';

function UserSettingsModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      await api.post('/usuarios/change-password', { oldPassword, newPassword });
      setSuccess('Contraseña actualizada con éxito');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
    }
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Configuración de Usuario</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="settings-modal-body">
          <form onSubmit={handleSubmit}>
            <h3>Cambiar contraseña</h3>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <div className="form-group">
              <label htmlFor="oldPassword">Contraseña actual</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Cambiar contraseña</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserSettingsModal;
