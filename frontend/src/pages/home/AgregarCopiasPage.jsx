import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './AgregarEquipoPage.css'; // Reutilizar el CSS de AgregarEquipoPage

function AgregarCopiasPage({ onAgregado }) {
    const [formData, setFormData] = useState({
        usuario: '',
        area: '',
        tipo: '',
        marca: '',
        tipo_de_copia: '',
        frecuencia: '',
        ultima_copia: '',
        proxima_copia: '',
        ubicacion: '',
        observaciones: '',
        fecha: '',
    });
    const [equipos, setEquipos] = useState([]);
    const [selectedEquipoId, setSelectedEquipoId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [autofillMessage, setAutofillMessage] = useState('');

    useEffect(() => {
        fetchEquipos();
    }, []);

    const fetchEquipos = async () => {
        try {
            const response = await api.get('/equipos');
            setEquipos(response.data.body || []);
        } catch (err) {
            console.error("Error fetching equipos:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'equipoId') {
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                setFormData(prev => ({
                    ...prev,
                    usuario: selectedEquipo.nombre_de_usuario_asignado,
                    area: selectedEquipo.Area,
                    tipo: selectedEquipo.tipo,
                    marca: selectedEquipo.marca,
                }));
                setAutofillMessage(`Datos autocompletados del equipo: Usuario: ${selectedEquipo.nombre_de_usuario_asignado}, Área: ${selectedEquipo.Area}, Tipo: ${selectedEquipo.tipo}, Marca: ${selectedEquipo.marca}`);
            } else {
                setFormData(prev => ({
                    ...prev,
                    usuario: '',
                    area: '',
                    tipo: '',
                    marca: '',
                }));
                setAutofillMessage('');
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/CopiasDeSeguridad', formData);
            setSuccess(`¡Copia de seguridad agregada con éxito! ID: ${response.data.body.insertId}`);

            // Limpiar el formulario
            setFormData({
                usuario: '',
                area: '',
                tipo: '',
                marca: '',
                tipo_de_copia: '',
                frecuencia: '',
                ultima_copia: '',
                proxima_copia: '',
                ubicacion: '',
                observaciones: '',
                fecha: '',
            });
            setSelectedEquipoId('');
            setAutofillMessage('');

            if (onAgregado) {
                onAgregado();
            }
        } catch (err) {
            console.error("Error al agregar la copia de seguridad:", err);
            const message = err.response?.data?.message || 'No se pudo agregar la copia de seguridad. Revisa los campos.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agregar-equipo-page">
            <header className="page-header">
                <h1>Agregar Nueva Copia de Seguridad</h1>
                <p>Registra una nueva copia de seguridad para un equipo existente.</p>
            </header>

            <div className="form-container card">
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-message error">{error}</div>}
                    {success && <div className="form-message success">{success}</div>}
                    {autofillMessage && <div className="form-message info">{autofillMessage}</div>}

                    <div className="form-grid">
                        <label>
                            Seleccionar Equipo
                            <select name="equipoId" value={selectedEquipoId} onChange={handleChange} required>
                                <option value="">-- Seleccionar un equipo --</option>
                                {equipos.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nombre_de_usuario_asignado} ({eq.tipo} - {eq.marca})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Usuario
                            <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} placeholder="Usuario del equipo" required disabled={!!selectedEquipoId} />
                        </label>
                        <label>
                            Área
                            <select name="area" value={formData.area} onChange={handleChange} required disabled={!!selectedEquipoId}>
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
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required disabled={!!selectedEquipoId}>
                                <option value="">Selecciona un tipo</option>
                                <option value="Portátil">Portátil</option>
                                <option value="Escritorio">Escritorio</option>
                            </select>
                        </label>
                        <label>
                            Marca
                            <select name="marca" value={formData.marca} onChange={handleChange} required disabled={!!selectedEquipoId}>
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
                        <label>
                            Tipo de Copia
                            <select name="tipo_de_copia" value={formData.tipo_de_copia} onChange={handleChange} required>
                                <option value="">-- Seleccionar tipo --</option>
                                <option value="Completa">Completa</option>
                                <option value="Incremental">Incremental</option>
                                <option value="Diferencial">Diferencial</option>
                            </select>
                        </label>
                        <label>
                            Frecuencia
                            <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} required>
                                <option value="">-- Seleccionar frecuencia --</option>
                                <option value="Diaria">Diaria</option>
                                <option value="Semanal">Semanal</option>
                                <option value="Mensual">Mensual</option>
                            </select>
                        </label>
                        <label>
                            Fecha
                            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                        </label>
                        <label>
                            Última Copia
                            <input type="date" name="ultima_copia" value={formData.ultima_copia} onChange={handleChange} />
                        </label>
                        <label>
                            Próxima Copia
                            <input type="date" name="proxima_copia" value={formData.proxima_copia} onChange={handleChange} />
                        </label>
                        <label>
                            Ubicación
                            <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ubicación de la copia" />
                        </label>
                        <label className="full-width">
                            Observaciones
                            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" placeholder="Observaciones adicionales"></textarea>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn save" disabled={loading}>
                            {loading ? 'Agregando...' : 'Agregar Copia de Seguridad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AgregarCopiasPage;
