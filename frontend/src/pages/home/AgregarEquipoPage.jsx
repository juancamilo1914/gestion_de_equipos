import React, { useState } from 'react';
import api from '../../api/axios';
import './AgregarEquipoPage.css';

function AgregarEquipoPage({ onEquipoAgregado }) {
    const [formData, setFormData] = useState({
        usuario: '',
        area: '',
        tipo: '',
        marca: '',
        codigo: '', // Basado en el modelo de la documentación
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // El endpoint para crear equipos según tu documentación es /api/equipos
            const response = await api.post('/equipos', formData);
            
            setSuccess(`¡Equipo "${formData.usuario}" agregado con éxito! ID: ${response.data.body.insertId}`);
            
            // Limpiar el formulario
            setFormData({
                usuario: '',
                area: '',
                tipo: '',
                marca: '',
                codigo: '',
            });

            // Opcional: llamar a una función para notificar al componente padre
            if (onEquipoAgregado) {
                onEquipoAgregado();
            }

        } catch (err) {
            console.error("Error al agregar el equipo:", err);
            const message = err.response?.data?.message || 'No se pudo agregar el equipo. Revisa los campos.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agregar-equipo-page">
            <header className="page-header">
                <h1>Agregar Nuevo Equipo</h1>
                <p>Crea un registro central para un nuevo equipo. Luego podrás asociarle mantenimientos, licencias y más.</p>
            </header>

            <div className="form-container card">
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-message error">{error}</div>}
                    {success && <div className="form-message success">{success}</div>}

                    <div className="form-grid">
                        <label>
                            Nombre de Usuario / Asignado
                            <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} placeholder="Ej: jvalencia" required />
                        </label>
                        <label>
                            Área / Departamento
                            <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Ej: Contabilidad" required />
                        </label>
                        <label>
                            Tipo de Equipo
                            <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Ej: Portátil, PC de escritorio" required />
                        </label>
                        <label>
                            Marca
                            <input type="text" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej: Dell, HP" required />
                        </label>
                        <label className="full-width">
                            Código de Inventario (Opcional)
                            <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: EQ-00123" />
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn save" disabled={loading}>
                            {loading ? 'Agregando...' : 'Agregar Equipo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AgregarEquipoPage;