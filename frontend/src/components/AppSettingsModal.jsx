import React, { useState } from 'react';
import './modals.css'; // Usaremos un CSS común para los modales

function AppSettingsModal({ onClose }) {
    const [theme, setTheme] = useState('light'); // 'light', 'dark'
    const [language, setLanguage] = useState('es'); // 'es', 'en'

    const handleSave = () => {
        // Aquí iría la lógica para guardar la configuración
        // Por ejemplo, guardarla en localStorage y aplicar el tema
        console.log('Guardando configuración:', { theme, language });
        alert('Funcionalidad de guardado aún no implementada.');
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ajustes de la Aplicación</h3>
                    <button onClick={onClose} className="close-modal-btn">×</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="theme-select">Tema Visual</label>
                        <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                            <option value="light">Claro</option>
                            <option value="dark">Oscuro (Próximamente)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="language-select">Idioma</label>
                        <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="es">Español</option>
                            <option value="en">Inglés (Próximamente)</option>
                        </select>
                    </div>
                    <p className="muted small">Más ajustes, como el formato de hora, estarán disponibles pronto.</p>
                </div>
                <div className="modal-footer">
                    <button className="action-btn" onClick={handleSave}>Guardar Cambios</button>
                    <button className="action-btn cancel" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default AppSettingsModal;