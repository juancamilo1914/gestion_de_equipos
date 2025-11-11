import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './AgregarEquipoPage.css';

function AgregarEquipoPage({ onEquipoAgregado }) {
    const initialFormState = {
        usuario: '',
        area: '',
        tipo: '',
        marca: '',
        codigo: '', // Basado en el modelo de la documentación
    };

    const [formData, setFormData] = useState(initialFormState);
    const [equipos, setEquipos] = useState([]);
    const [editingId, setEditingId] = useState(null); // Para saber si estamos editando
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Listas para los campos de selección
    const areas = [
        'ADMINISTRATIVA',
        'ALMACEN',
        'APOYO SECRETARIA GENERAL',
        'ARCHIVO',
        'AUDITORIO',
        'COMUNICACIONES',
        'CONTROL Y EVALUACION INSTITUCIONAL',
        'DIRECCION GENERAL',
        'EDUCACION',
        'EDUCACIÓN',
        'FINANCIERA',
        'FORTALECIMIENTO',
        'JURIDICA',
        'MINISTERIO DEL INTERIOR',
        'OFICINA DE BELALCAZAR',
        'OFICINA DE LA PLATA',
        'PLANEACION',
        'PRESUPUESTO',
        'PROYECTOS PRODUCTIVOS',
        'RECEPCION',
        'SALUD',
        'SECRETARIA DIRECCION GENERAL',
        'SECRETARIA GENERAL',
        'SEDE BOGOTA',
        'SERVIDOR',
        'SISTEMAS',
        'VIAS',
        'VIVIENDA',
        'Workstation'
    ];

    const tiposDeEquipo = [
        'Portátil', 'PC de escritorio'
    ];

    const marcas = [
        'Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Cisco', 
        'Ubiquiti', 'Microsoft', 'Samsung', 'LG', 'Logitech'
    ];

    // Ordenar las listas alfabéticamente para facilitar la búsqueda
    areas.sort(); tiposDeEquipo.sort(); marcas.sort();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchEquipos = async () => {
        try {
            setLoadingList(true);
            const response = await api.get('/equipos');
            setEquipos(response.data.body || []);
        } catch (err) {
            console.error("Error al obtener los equipos:", err);
            setError('No se pudieron cargar los equipos.');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchEquipos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Preparamos los datos para el envío.
        // Si el código está vacío, lo enviamos como null para evitar problemas en la base de datos.
        // Nos aseguramos de enviar solo los campos que el backend espera.
        const dataToSend = {
            usuario: formData.usuario,
            area: formData.area,
            tipo: formData.tipo,
            marca: formData.marca,
            codigo: formData.codigo || null,
        };

        const apiCall = editingId
            ? api.put(`/equipos/${editingId}`, dataToSend)
            : api.post('/equipos', dataToSend);

        try {
            const response = await apiCall;

            if (editingId) {
                setSuccess(`¡Equipo "${formData.usuario}" actualizado con éxito!`);
            } else {
                setSuccess(`¡Equipo "${formData.usuario}" agregado con éxito! ID: ${response.data.body.insertId}`);
            }

            // Limpiar el formulario
            setFormData(initialFormState);
            setEditingId(null);

            // Refrescar la lista de equipos
            fetchEquipos();

            // Opcional: llamar a una función para notificar al componente padre
            // Esto podría ser útil si, por ejemplo, al agregar un equipo, quieres volver al dashboard.
            // Lo mantendré comentado por ahora para que te quedes en la página y veas la tabla actualizada.
            /* if (onEquipoAgregado && !editingId) {
                onEquipoAgregado();
            } */

        } catch (err) {
            console.error("Error al agregar el equipo:", err);
            // Intentamos obtener el mensaje de error específico del backend.
            // Si el backend envía { "error": "mensaje..." } o { "message": "mensaje..." }, lo capturaremos.
            const serverError = err.response?.data?.error || err.response?.data?.message;
            const errorMessage = serverError || 'Error del servidor. No se pudo completar la operación. Revisa la consola del backend para más detalles.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (equipo) => {
        window.scrollTo(0, 0); // Sube al inicio de la página para ver el formulario
        setEditingId(equipo.id);
        setFormData({
            usuario: equipo.usuario || '',
            area: equipo.area || '',
            tipo: equipo.tipo || '',
            marca: equipo.marca || '',
            codigo: equipo.codigo || '',
        });
        setSuccess(''); // Limpia mensajes anteriores
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
            try {
                await api.delete(`/equipos/${id}`);
                setSuccess('Equipo eliminado con éxito.');
                fetchEquipos(); // Refresca la lista
            } catch (err) {
                console.error("Error al eliminar el equipo:", err);
                setError('No se pudo eliminar el equipo.');
            }
        }
    };

    return (
        <div className="agregar-equipo-page">
            <header className="page-header">
                <h1>{editingId ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h1>
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
                            <select name="area" value={formData.area} onChange={handleChange} required>
                                <option value="">-- Seleccione un área --</option>
                                {areas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Tipo de Equipo
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="">-- Seleccione un tipo --</option>
                                {tiposDeEquipo.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Marca
                            <select name="marca" value={formData.marca} onChange={handleChange} required>
                                <option value="">-- Seleccione una marca --</option>
                                {marcas.map(marca => (
                                    <option key={marca} value={marca}>{marca}</option>
                                ))}
                            </select>
                        </label>
                        <label className="full-width">
                            Código de Inventario (Opcional)
                            <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: EQ-00123" />
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn save" disabled={loading}>
                            {loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Agregar Equipo')}
                        </button>
                        {editingId && (
                            <button type="button" className="action-btn cancel" onClick={handleCancelEdit} disabled={loading}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="list-container card">
                <h2>Equipos Registrados</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por usuario o código de inventario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                {loadingList ? <p>Cargando equipos...</p> : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Área</th>
                                    <th>Tipo</th>
                                    <th>Marca</th>
                                    <th>Código</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipos
                                .filter(equipo => 
                                    (equipo.usuario?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    (equipo.codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
                                ).map(equipo => (
                                    <tr key={equipo.id}>
                                        <td>{equipo.usuario}</td>
                                        <td>{equipo.area}</td>
                                        <td>{equipo.tipo}</td>
                                        <td>{equipo.marca}</td>
                                        <td>{equipo.codigo || 'N/A'}</td>
                                        <td className="actions-cell">
                                            <button className="action-btn-sm edit" onClick={() => handleEdit(equipo)}>Editar</button>
                                            <button className="action-btn-sm delete" onClick={() => handleDelete(equipo.id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loadingList && equipos.length === 0 && <p>No hay equipos registrados.</p>}
            </div>
        </div>
    );
}

export default AgregarEquipoPage;