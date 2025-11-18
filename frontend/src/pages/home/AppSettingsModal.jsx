import React, { useState } from 'react';
import './SettingsModal.css';

function AppSettingsModal({ onClose }) {
    const [language, setLanguage] = useState('es');
    const [darkMode, setDarkMode] = useState(false);

    const handleSave = () => {
        // Lógica para aplicar y guardar la configuración
        console.log('Guardando configuración de la app:', { language, darkMode });
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        onClose();
    };

    return (
        <div className="settings-modal" onClick={onClose}>
            <div className="settings-panel card" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h3><span className="icon">⚙️</span>Ajustes de la Aplicación</h3>
                    {/* <button className="close-modal-btn" onClick={onClose}>×</button> */}
                </div>
                <div className="settings-form">
                    <div className="setting-item">
                        <label htmlFor="language-select">Lenguaje</label>
                        <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="es">Español</option>
                            <option value="en">Inglés (No disponible)</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label htmlFor="dark-mode-toggle">Modo Noche</label>
                        <label className="switch">
                            <input id="dark-mode-toggle" type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="form-actions">
                        <button onClick={handleSave} className="action-btn save">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppSettingsModal;