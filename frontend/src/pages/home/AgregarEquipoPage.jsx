import React, { useState } from 'react';
import api from '../../api/axios';
import './AgregarEquipoPage.css';

function AgregarEquipoPage({ onEquipoAgregado }) {
    const [formData, setFormData] = useState({
        nombre_de_usuario_asignado: '',
        Area: '',
        tipo: '',
        marca: '',
        codigo_de_equipo: '', // Ajustado a los nombres de columnas de la base de datos
        fecha_ultimo_mantenimiento: '',
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
            
            setSuccess(`¡Equipo "${formData.nombre_de_usuario_asignado}" agregado con éxito! ID: ${response.data.body.insertId}`);

            // Limpiar el formulario
            setFormData({
                nombre_de_usuario_asignado: '',
                Area: '',
                tipo: '',
                marca: '',
                codigo_de_equipo: '',
                fecha_ultimo_mantenimiento: '',
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
                            <input type="text" name="nombre_de_usuario_asignado" value={formData.nombre_de_usuario_asignado} onChange={handleChange} placeholder="Ej: jvalencia" required />
                        </label>
                        <label>
                            Área / Departamento
                            <select name="Area" value={formData.Area} onChange={handleChange} required>
                                <option value="">Selecciona un área</option>
                                <option value="DIRECCION GENERAL">DIRECCION GENERAL</option>
                                <option value="SECRETARIA DIRECCION GENERAL">SECRETARIA DIRECCION GENERAL</option>
                                <option value="APOYO SECRETARIA GENERAL">APOYO SECRETARIA GENERAL</option>
                                <option value="SECRETARIA GENERAL">SECRETARIA GENERAL</option>
                                <option value="ALMACEN">ALMACEN</option>
                                <option value="RECEPCION">RECEPCION</option>
                                <option value="JURIDICA">JURIDICA</option>
                                <option value="VIVIENDA">VIVIENDA</option>
                                <option value="SALUD">SALUD</option>
                                <option value="ADMINISTRATIVA">ADMINISTRATIVA</option>
                                <option value="PLANEACION">PLANEACION</option>
                                <option value="Workstation">Workstation</option>
                                <option value="SERVIDOR">SERVIDOR</option>
                                <option value="SISTEMAS">SISTEMAS</option>
                                <option value="VIAS">VIAS</option>
                                <option value="EDUCACION">EDUCACION</option>
                                <option value="ARCHIVO">ARCHIVO</option>
                                <option value="CONTROL Y EVALUACION INSTITUCIONAL">CONTROL Y EVALUACION INSTITUCIONAL</option>
                                <option value="PROYECTOS PRODUCTIVOS">PROYECTOS PRODUCTIVOS</option>
                                <option value="AUDITORIO">AUDITORIO</option>
                                <option value="PRESUPUESTO">PRESUPUESTO</option>
                                <option value="FINANCIERA">FINANCIERA</option>
                                <option value="OFICINA DE LA PLATA">OFICINA DE LA PLATA</option>
                                <option value="OFICINA DE BELALCAZAR">OFICINA DE BELALCAZAR</option>
                                <option value="COMUNICACIONES">COMUNICACIONES</option>
                                <option value="SEDE BOGOTA">SEDE BOGOTA</option>
                                <option value="FORTALECIMIENTO">FORTALECIMIENTO</option>
                                <option value="MINISTERIO DEL INTERIOR">MINISTERIO DEL INTERIOR</option>
                            </select>
                        </label>
                        <label>
                            Tipo de Equipo
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="">Selecciona un tipo</option>
                                <option value="Portátil">Portátil</option>
                                <option value="Escritorio">Escritorio</option>
                            </select>
                        </label>
                        <label>
                            Marca
                            <select name="marca" value={formData.marca} onChange={handleChange} required>
                                <option value="">Selecciona una marca</option>
                                <option value="Dell">Dell</option>
                                <option value="HP">HP</option>
                                <option value="Lenovo">Lenovo</option>
                                <option value="Acer">Acer</option>
                                <option value="Asus">Asus</option>
                                <option value="Apple">Apple</option>
                                <option value="Toshiba">Toshiba</option>
                                <option value="Sony">Sony</option>
                                <option value="Samsung">Samsung</option>
                                <option value="MSI">MSI</option>
                            </select>
                        </label>
                        <label className="full-width">
                            Código de Inventario (Opcional)
                            <input type="text" name="codigo_de_equipo" value={formData.codigo_de_equipo} onChange={handleChange} placeholder="Ej: EQ-00123" />
                        </label>
                        <label>
                            Fecha Último Mantenimiento
                            <input type="date" name="fecha_ultimo_mantenimiento" value={formData.fecha_ultimo_mantenimiento} onChange={handleChange} />
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