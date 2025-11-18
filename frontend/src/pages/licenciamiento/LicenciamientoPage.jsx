import React, { useEffect, useState } from "react";
import './licenciamientoPage.css';
import api from '../../api/axios';
import moment from 'moment'; // Importar moment para manejar fechas si es necesario

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logo from '../../assets/LOGO_INSTITUCIONAL.jpg';
function LicenciamientoPage() {
    const [licenciamientoData, setLicenciamientoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isAdding, setIsAdding] = useState(false); // Para controlar el modal de "agregar"
    const [newLicenciamientoData, setNewLicenciamientoData] = useState(null); // Datos para el nuevo licenciamiento
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [equipos, setEquipos] = useState([]); // Nuevo estado para almacenar los equipos
    const [selectedEquipoId, setSelectedEquipoId] = useState(''); // Estado para el equipo seleccionado en el dropdown
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLicenciamientoData();
        fetchEquipos(); // Cargar equipos una vez al montar el componente
    }, []);

    async function fetchLicenciamientoData() {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/licenciamiento');
            setLicenciamientoData(response.data.body || []);
        } catch (err) {
            console.error("Error fetching licenciamiento data:", err);
            setError("Error al cargar los datos de licenciamiento. Por favor, inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchEquipos() {
        try {
            const response = await api.get('/equipos');
            setEquipos(response.data.body || []);
        } catch (err) {
            console.error("Error fetching equipos:", err);
            // No es un error fatal para la vista principal, solo para la edición.
        }
    }

    async function handleRowClick(item) {
        if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null);
            setDetailedData(null);
            return;
        }
        setIsEditing(false);
        setEditFormData(null);
        setSelectedItem(item);
        setDetailedData(null);
        setLoadingDetails(true);
        // Intentar encontrar un equipo que coincida para pre-seleccionar en el dropdown
        const matchingEquipo = equipos.find(eq =>
            eq.usuario === item.usuario &&
            eq.area === item.area &&
            eq.tipo === item.tipo
            // La marca no está en el modelo de licenciamiento, así que no la usamos para la coincidencia
        );
        setSelectedEquipoId(matchingEquipo ? matchingEquipo.id : '');
        try {
            const response = await api.get(`/licenciamiento/${item.id}`);
            setDetailedData(response.data.body);
        } catch (err) {
            console.error("Error fetching licenciamiento details:", err);
            setError("Error al cargar los detalles del licenciamiento.");
            setDetailedData(null);
        } finally {
            setLoadingDetails(false);
        }
    }

    const handleOpenAddModal = () => {
        // Inicializa el formulario para un nuevo licenciamiento
        setNewLicenciamientoData({
            usuario: '',
            area: '',
            tipo: '',
            codigo: '',
            descripcion: '',
            sistema_operativo: '',
            software_de_oficina: '',
            otro_software: '',
        });
        setSelectedEquipoId(''); // Resetea el equipo seleccionado
        setSelectedItem(null); // Cierra el panel de detalles si está abierto
        setDetailedData(null); // Limpia los datos detallados del item anterior
        setIsAdding(true);
    };

    const handleEdit = () => {
        setEditFormData({ ...detailedData });
        setIsEditing(true);
        setSelectedEquipoId(equipos.find(eq => eq.usuario === detailedData.usuario && eq.area === detailedData.area && eq.tipo === detailedData.tipo)?.id || '');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData(null);
        setIsAdding(false);
        setSelectedEquipoId(''); // Limpiar selección de equipo
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "equipoId") {
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                setEditFormData(prev => ({
                    ...prev,
                    usuario: selectedEquipo.usuario,
                    area: selectedEquipo.area,
                    tipo: selectedEquipo.tipo,
                }));
            } else {
                // Si no se selecciona ningún equipo, limpiar los campos relacionados
                setEditFormData(prev => ({ ...prev, usuario: '', area: '', tipo: '' }));
            }
        } else
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "equipoId") {
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                setNewLicenciamientoData(prev => ({
                    ...prev,
                    usuario: selectedEquipo.usuario,
                    area: selectedEquipo.area,
                    tipo: selectedEquipo.tipo,
                    codigo: selectedEquipo.codigo,
                }));
            } else {
                setNewLicenciamientoData(prev => ({ ...prev, usuario: '', area: '', tipo: '', codigo: '' }));
            }
        } else {
            setNewLicenciamientoData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editFormData, id: detailedData.id };
            await api.put(`/licenciamiento/${detailedData.id}`, payload);
            // Volvemos a pedir los datos para tener la versión más actualizada
            const response = await api.get(`/licenciamiento/${detailedData.id}`);
            setDetailedData(response.data.body);
            setIsEditing(false);
            // Actualizamos la lista principal para reflejar los cambios
            fetchLicenciamientoData();
        } catch (err) {
            console.error("Error saving licenciamiento data:", err);
            setError("Error al guardar los cambios.");
        }
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        if (!selectedEquipoId) {
            setError("Por favor, selecciona un equipo para asociar el licenciamiento.");
            return;
        }
        const selectedEquipo = equipos.find(eq => eq.id === parseInt(selectedEquipoId, 10));
        if (!selectedEquipo || !selectedEquipo.codigo) {
            setError("El equipo seleccionado no tiene un código de inventario válido. No se puede crear el licenciamiento.");
            return;
        }

        try {
            const dataToSend = {
                ...newLicenciamientoData,
                // Enviamos el ID del equipo para crear la relación
                equipo_id: parseInt(selectedEquipoId, 10)
            };
            await api.post('/licenciamiento', dataToSend);
            setIsAdding(false);
            setNewLicenciamientoData(null);
            await fetchLicenciamientoData();
        } catch (err) {
            console.error("Error creating new licenciamiento:", err);
            setError("Error al crear el nuevo licenciamiento.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el licenciamiento #${detailedData.id}?`)) {
            try {
                await api.delete(`/licenciamiento/${detailedData.id}`);
                setSelectedItem(null); // Cierra el modal
                fetchLicenciamientoData(); // Actualiza la lista
            } catch (err) {
                console.error("Error deleting licenciamiento data:", err);
                setError("Error al eliminar el registro.");
            }
        }
    };

    const handleDownloadPdf = () => {
        if (!detailedData) return;

        const doc = new jsPDF();
        const margin = 14;

        // Encabezado
        doc.addImage(logo, 'JPEG', margin, 10, 40, 20);
        doc.setFontSize(20);
        doc.text('Reporte de Licenciamiento', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Código: FT-LICE-001`, doc.internal.pageSize.getWidth() - margin, 15, { align: 'right' });
        doc.text(`Versión: 1.0`, doc.internal.pageSize.getWidth() - margin, 20, { align: 'right' });
        doc.text(`Fecha: ${moment().format('DD/MM/YYYY')}`, doc.internal.pageSize.getWidth() - margin, 25, { align: 'right' });

        // Información del Equipo
        autoTable(doc, {
            startY: 40,
            head: [['Información del Equipo']],
            body: [
                [{ content: `Usuario: ${detailedData.usuario || 'N/A'}` }],
                [`Área: ${detailedData.area || 'N/A'}`],
                [`Tipo de Equipo: ${detailedData.tipo || 'N/A'}`],
                [`Código de Inventario: ${detailedData.id || 'N/A'}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        // Detalles del Licenciamiento
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Detalles del Licenciamiento']],
            body: [
                [{ content: 'Descripción:', styles: { fontStyle: 'bold' } }],
                [detailedData.descripcion || 'Sin descripción.'],
                [{ content: `Sistema Operativo: ${detailedData.sistema_operativo || 'N/A'}` }],
                [{ content: `Software de Oficina: ${detailedData.software_de_oficina || 'N/A'}` }],
                [{ content: `Otro Software: ${detailedData.otro_software || 'N/A'}` }],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        doc.save(`Reporte_Licenciamiento_${detailedData.id}.pdf`);
    };

    return (
        <div className="licenciamiento-page">
            <div className="page-header">
                <h2 className="page-title">Gestión de Licenciamiento</h2>
                <button className="action-btn save" onClick={handleOpenAddModal} disabled={loading}>
                    Crear Licenciamiento
                </button>
                <button className="refresh-btn" onClick={fetchLicenciamientoData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && licenciamientoData.length === 0 && <div className="loading-message">Cargando datos de licenciamiento...</div>}

            {!loading && licenciamientoData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de licenciamiento disponibles.</div>
            )}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por ID (código) o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {!loading && licenciamientoData.length > 0 && (
                <div className="licenciamiento-table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Área</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licenciamientoData
                            .filter(item =>
                                (item.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()))
                            ).map((item) => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} className={selectedItem?.id === item.id ? 'selected' : ''}>
                                    <td>{item.id}</td>
                                    <td>{item.usuario}</td>
                                    <td>{item.area}</td>
                                    <td>{item.tipo}</td>
                                    <td>{item.descripcion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(selectedItem || isAdding) && (
                <div className="details-modal" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedItem(null); setIsAdding(false); } }}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}> {/* Eliminar el botón de cerrar */}
                        <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                        {loadingDetails ? (
                            <div className="loading-message">Cargando detalles...</div>
                        ) : detailedData ? (
                            <form onSubmit={handleSave}>
                                <div className="details-header">
                                    <h3>Detalles del Licenciamiento #{detailedData.id}</h3>
                                    <div className="details-actions">
                                        {isEditing ? (
                                            <>
                                                <button type="submit" className="action-btn save">Guardar</button>
                                                <button type="button" className="action-btn cancel" onClick={handleCancel}>Cancelar</button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" className="action-btn" onClick={handleEdit}>Editar</button>
                                                <button type="button" className="action-btn delete" onClick={handleDelete}>Eliminar</button>
                                                <button type="button" className="action-btn download" onClick={handleDownloadPdf}>Descargar PDF</button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="details-grid">
                                    {isEditing ? (
                                        <>
                                            <label>
                                                Seleccionar Equipo:
                                                <select name="equipoId" value={selectedEquipoId} onChange={handleFormChange}>
                                                    <option value="">-- Seleccionar un equipo --</option>
                                                    {equipos.map(eq => (
                                                        <option key={eq.id} value={eq.id}>
                                                            {eq.usuario} ({eq.tipo} - {eq.marca})
                                                        </option>
                                                    ))}
                                                </select>
                                            </label><hr/>
                                            <label>Usuario <input name="usuario" value={editFormData.usuario || ''} onChange={handleFormChange} placeholder="Usuario del equipo" /></label>
                                            <label>Área <input name="area" value={editFormData.area || ''} onChange={handleFormChange} placeholder="Área del equipo" /></label>
                                            <label>Tipo <input name="tipo" value={editFormData.tipo || ''} onChange={handleFormChange} placeholder="Tipo de equipo" /></label>
                                            <label>Sistema Operativo <input name="sistema_operativo" value={editFormData.sistema_operativo || ''} onChange={handleFormChange} placeholder="Sistema Operativo" /></label>
                                            <label>Software de Oficina <input name="software_de_oficina" value={editFormData.software_de_oficina || ''} onChange={handleFormChange} /></label>
                                            <label>Otro Software <input name="otro_software" value={editFormData.otro_software || ''} onChange={handleFormChange} /></label>
                                            <label className="full-width">Descripción <textarea name="descripcion" value={editFormData.descripcion || ''} onChange={handleFormChange} rows="3"></textarea></label>
                                        </>
                                    ) : (
                                        <>
                                            <div className="detail-item"><span>Usuario:</span><p>{detailedData.usuario}</p></div>
                                            <div className="detail-item"><span>Área:</span><p>{detailedData.area}</p></div>
                                            <div className="detail-item"><span>Tipo de Equipo:</span><p>{detailedData.tipo}</p></div>
                                            <div className="detail-item full-width"><span>Descripción:</span><p>{detailedData.descripcion}</p></div>
                                            <div className="detail-item"><span>Sistema Operativo:</span><p>{detailedData.sistema_operativo || 'N/A'}</p></div>
                                            <div className="detail-item"><span>Software de Oficina:</span><p>{detailedData.software_de_oficina || 'N/A'}</p></div>
                                            <div className="detail-item"><span>Otro Software:</span><p>{detailedData.otro_software || 'N/A'}</p></div>
                                        </>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="error-message">No se pudieron cargar los detalles.</div>
                        )}
                        {isAdding && newLicenciamientoData && (
                            <>
                                <div className="details-header">
                                    <h3>Crear Nuevo Licenciamiento</h3>
                                    <div className="details-actions">
                                        <button type="button" className="action-btn save" onClick={handleSaveNew}>Guardar</button>
                                        <button type="button" className="action-btn cancel" onClick={() => setIsAdding(false)}>Cancelar</button>
                                    </div>
                                </div>
                                <form onSubmit={handleSaveNew}>
                                    <div className="details-grid">
                                        <label>
                                            Seleccionar Equipo Existente:
                                            <select name="equipoId" value={selectedEquipoId} onChange={handleNewFormChange} required>
                                                <option value="">-- Seleccionar un equipo --</option>
                                                {equipos.map(eq => (
                                                    <option key={eq.id} value={eq.id}>
                                                        {eq.usuario} ({eq.tipo} - {eq.marca})
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <hr className="full-width"/>
                                        <label>Usuario <input name="usuario" value={newLicenciamientoData.usuario} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Área <input name="area" value={newLicenciamientoData.area} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Tipo <input name="tipo" value={newLicenciamientoData.tipo} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Código Inventario <input name="codigo" value={newLicenciamientoData.codigo} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Sistema Operativo <input name="sistema_operativo" value={newLicenciamientoData.sistema_operativo} onChange={handleNewFormChange} placeholder="Ej: Windows 11 Pro" /></label>
                                        <label>Software de Oficina <input name="software_de_oficina" value={newLicenciamientoData.software_de_oficina} onChange={handleNewFormChange} placeholder="Ej: Microsoft Office 2021" /></label>
                                        <label>Otro Software <input name="otro_software" value={newLicenciamientoData.otro_software} onChange={handleNewFormChange} placeholder="Ej: Adobe Photoshop" /></label>
                                        <label className="full-width">
                                            Descripción
                                            <textarea name="descripcion" value={newLicenciamientoData.descripcion} onChange={handleNewFormChange} rows="3" placeholder="Detalles adicionales del licenciamiento"></textarea>
                                        </label>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LicenciamientoPage;