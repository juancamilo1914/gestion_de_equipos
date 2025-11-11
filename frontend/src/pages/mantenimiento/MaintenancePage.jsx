import React, { useEffect, useState, useCallback } from "react";
import "./maintenancePage.css";
import api from '../../api/axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logo from '../../assets/LOGO_INSTITUCIONAL.jpg';

// Configuración para el calendario en español
moment.locale('es', {
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
    weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
    week: {
        dow: 1, // Monday is the first day of the week.
    },
    longDateFormat: {
        LL: 'D [de] MMMM [de] YYYY',
    }
});
const localizer = momentLocalizer(moment);

function MaintenancePage() {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false); // Para controlar el modal de "agregar"
    const [newMaintenanceData, setNewMaintenanceData] = useState(null); // Datos para el nuevo mantenimiento
    const [editFormData, setEditFormData] = useState(null);
    const [signatureType, setSignatureType] = useState('text');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [equipos, setEquipos] = useState([]); // Nuevo estado para almacenar los equipos
    const [selectedEquipoId, setSelectedEquipoId] = useState(''); // Estado para el equipo seleccionado en el dropdown
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMaintenanceData();
    }, []);

    async function fetchMaintenanceData() {
        await fetchEquipos(); // Asegurarse de tener los equipos antes de cargar mantenimientos
        try {
            setLoading(true);
            setError(null);
            // Asumiendo que el endpoint para obtener todos los mantenimientos es /api/mantenimiento
            const response = await api.get('/mantenimiento');
            // Ajusta 'response.data.body' si la estructura de tu API es diferente
            setMaintenanceData(response.data.body || []);
            // Después de cargar los mantenimientos, si hay un item seleccionado, intentar pre-seleccionar el equipo
            if (selectedItem) {
                handleRowClick(selectedItem); // Volver a procesar el item seleccionado para actualizar el dropdown
            }
        } catch (err) {
            console.error("Error fetching maintenance data:", err);
            setError("Error al cargar los datos de mantenimiento. Por favor, inténtalo de nuevo más tarde.");
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
        }
    }

    async function handleRowClick(item) {
        if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null); // Oculta el panel si se hace clic en el mismo item
            setDetailedData(null);
            return;
        }
        // Reset states when opening a new item
        setIsEditing(false);
        setSelectedItem(item);
        setEditFormData(null);
        setLoadingDetails(true);
        try {
            // Usamos el endpoint para obtener un solo registro
            const response = await api.get(`/mantenimiento/${item.id}`);
            const data = response.data.body;
            setDetailedData(data);

            // Centramos el calendario en la fecha del próximo mantenimiento si existe, si no, en la fecha actual.
            if (data.fecha_actual_de_mantenimiento) {
                setCalendarDate(new Date(data.fecha_actual_de_mantenimiento));
            } else {
                setCalendarDate(new Date());
            }

            // Intentar encontrar un equipo que coincida para pre-seleccionar en el dropdown
            const matchingEquipo = equipos.find(eq =>
                eq.usuario === data.usuario &&
                eq.area === data.area &&
                eq.tipo === data.tipo &&
                eq.marca === data.marca
            );
            setSelectedEquipoId(matchingEquipo ? matchingEquipo.id : '');
        } catch (err) {
            console.error("Error fetching maintenance details:", err);
            setError("Error al cargar los detalles del mantenimiento.");
            setDetailedData(null);
        } finally {
            setLoadingDetails(false);
        }
    }

    const handleOpenAddModal = () => {
        // Inicializa el formulario para un nuevo mantenimiento
        setNewMaintenanceData({
            usuario: '',
            area: '',
            tipo: '',
            marca: '',
            codigo: '',
            fecha_ultimo_mantenimiento: null,
            fecha_actual_de_mantenimiento: null,
            actividades_realizadas: '',
            observaciones: '',
            fecha_de_elaboracion: moment().format('YYYY-MM-DD'), // Fecha de hoy por defecto
            fecha_de_ejecucion: null,
            firmas_tecnico: '',
            firmas_aprobo: '',
            firmas_reviso: '',
        });
        setSelectedEquipoId(''); // Resetea el equipo seleccionado
        setSelectedItem(null); // Cierra el panel de detalles si está abierto
        setDetailedData(null); // Limpia los datos detallados del item anterior
        setIsAdding(true);
    };

    const handleEdit = () => {
        setEditFormData({ ...detailedData });
        setSignatureType(detailedData.firmas_tecnico?.startsWith('data:image') ? 'image' : 'text');
        setSelectedEquipoId(equipos.find(eq => eq.usuario === detailedData.usuario && eq.area === detailedData.area && eq.tipo === detailedData.tipo && eq.marca === detailedData.marca)?.id || '');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData(null);
        setIsAdding(false);
        setSelectedEquipoId(''); // Limpiar selección de equipo
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // 1. Preparamos los datos para enviar, creando una copia para no modificar el estado directamente.
            const dataToSave = { ...editFormData };
            // 2. Removemos propiedades que no deben estar en el cuerpo de la petición PUT.
            delete dataToSave.id;
            delete dataToSave.equipoId;

            // 4. Enviamos la petición PUT al backend con los datos procesados.
            await api.put(`/mantenimiento/${detailedData.id}`, dataToSave, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // 5. Actualizamos el estado local para reflejar los cambios inmediatamente.
            // Para asegurar que vemos los datos correctos (ej. firmas parseadas si el backend las devuelve)
            // es mejor volver a pedir los datos del item.
            const response = await api.get(`/mantenimiento/${detailedData.id}`);
            const updatedData = response.data.body;
            setDetailedData(updatedData);
            setIsEditing(false); // Salimos del modo edición.
            fetchMaintenanceData(); // Actualizamos la lista principal en segundo plano.
        } catch (err) {
            console.error("Error saving maintenance data:", err);
            setError("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
        }
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        if (!selectedEquipoId) {
            setError("Por favor, selecciona un equipo para asociar el mantenimiento.");
            return;
        }
        // Buscamos el equipo completo para obtener su código de inventario
        const selectedEquipo = equipos.find(eq => eq.id === parseInt(selectedEquipoId, 10));
        if (!selectedEquipo || !selectedEquipo.codigo) {
            setError("El equipo seleccionado no tiene un código de inventario válido. No se puede crear el mantenimiento.");
            return;
        }

        try {
            const dataToSend = {
                ...newMaintenanceData,
                // Enviamos el ID del equipo para crear la relación
                equipo_id: parseInt(selectedEquipoId, 10)
            };
            await api.post('/mantenimiento', dataToSend);
            setIsAdding(false);
            setNewMaintenanceData(null);
            await fetchMaintenanceData();
        } catch (err) {
            console.error("Error creating new maintenance:", err);
            setError("Error al crear el nuevo mantenimiento.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el mantenimiento #${detailedData.id}?`)) {
            try {
                await api.delete(`/mantenimiento/${detailedData.id}`);
                setSelectedItem(null); // Cierra el modal después de eliminar
                await fetchMaintenanceData();
            } catch (err) {
                console.error("Error deleting maintenance data:", err);
                setError("Error al eliminar el registro.");
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "equipoId") {
            const formDataSetter = isEditing ? setEditFormData : setNewMaintenanceData;
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                formDataSetter(prev => ({
                    ...prev,
                    usuario: selectedEquipo.usuario,
                    area: selectedEquipo.area,
                    tipo: selectedEquipo.tipo,
                    marca: selectedEquipo.marca,
                    codigo: selectedEquipo.codigo,
                }));
            } else {
                // Si no se selecciona ningún equipo, limpiar los campos relacionados
                formDataSetter(prev => ({ ...prev, usuario: '', area: '', tipo: '', marca: '', codigo: '' }));
            }
            if (isEditing) {
                setEditFormData(prev => ({ ...prev, [name]: value }));
            } else {
                setNewMaintenanceData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    // Función separada para el formulario de agregar
    const handleNewFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "equipoId") {
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            const data = selectedEquipo ? { usuario: selectedEquipo.usuario, area: selectedEquipo.area, tipo: selectedEquipo.tipo, marca: selectedEquipo.marca, codigo: selectedEquipo.codigo } : { usuario: '', area: '', tipo: '', marca: '', codigo: '' };
            setNewMaintenanceData(prev => ({ ...prev, ...data }));
        } else {
            setNewMaintenanceData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNewSignatureImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMaintenanceData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('LL');
    };

    const handleDownloadPdf = async () => {
        if (!detailedData) return;

        // 1. Obtener el historial de mantenimientos para este equipo
        let historial = [];
        if (detailedData.equipo_id) {
            try {
                const historialRes = await api.get(`/mantenimiento/historial/${detailedData.equipo_id}`);
                historial = historialRes.data.body || [];
            } catch (err) {
                console.error("Error al obtener el historial de mantenimiento:", err);
            }
        }
        const doc = new jsPDF();
        const margin = 14;

        // Encabezado
        doc.addImage(logo, 'JPEG', margin, 10, 40, 20);
        doc.setFontSize(20);
        doc.text('Reporte de Mantenimiento', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Código: FT-MANT-001`, doc.internal.pageSize.getWidth() - margin, 15, { align: 'right' });
        doc.text(`Versión: 1.0`, doc.internal.pageSize.getWidth() - margin, 20, { align: 'right' });
        doc.text(`Fecha: ${moment().format('DD/MM/YYYY')}`, doc.internal.pageSize.getWidth() - margin, 25, { align: 'right' });

        // Información del Equipo
        autoTable(doc, {
            startY: 40,
            head: [['Información del Equipo']],
            body: [
                [{ content: `Usuario: ${detailedData.usuario || 'N/A'}`, styles: { fontStyle: 'bold' } }],
                [`Área: ${detailedData.area || 'N/A'}`],
                [`Tipo de Equipo: ${detailedData.tipo || 'N/A'}`],
                [`Marca: ${detailedData.marca || 'N/A'}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        // Detalles del Mantenimiento
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Detalles del Mantenimiento']],
            body: [
                [{ content: 'Actividades Realizadas:', styles: { fontStyle: 'bold' } }],
                [detailedData.actividades_realizadas || 'Sin actividades registradas.'],
                [{ content: 'Observaciones:', styles: { fontStyle: 'bold' } }],
                [detailedData.observaciones || 'Sin observaciones.'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        // Fechas Clave
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Fechas Clave']],
            body: [
                [`Fecha de Elaboración: ${formatDate(detailedData.fecha_de_elaboracion)}`],
                [`Fecha de Ejecución: ${formatDate(detailedData.fecha_de_ejecucion)}`],
                [`Fecha Último Mantenimiento: ${formatDate(detailedData.fecha_ultimo_mantenimiento)}`],
                [`Fecha Próximo Mantenimiento: ${formatDate(detailedData.fecha_actual_de_mantenimiento)}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        // Tabla de Historial de Mantenimientos
        if (historial.length > 0) {
            const historialBody = historial.map(item => [
                formatDate(item.fecha_de_ejecucion),
                item.actividades_realizadas
            ]);

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Fecha de Ejecución', 'Actividades Realizadas']],
                body: historialBody,
                theme: 'striped',
                headStyles: { fillColor: [44, 62, 80] },
            });
        }

        // Firmas
        const finalY = doc.lastAutoTable.finalY + 15;
        const firmaTecnico = detailedData.firmas_tecnico;
        const firmaAprobo = detailedData.firmas_aprobo;
        const firmaReviso = detailedData.firmas_reviso;

        const addSignature = (signature, title, y) => {
            if (signature) {
                doc.setFontSize(10);
                doc.text(title, margin, y);
                if (signature.startsWith('data:image')) {
                    doc.addImage(signature, 'PNG', margin, y + 3, 60, 20);
                } else {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(12);
                    doc.text(signature, margin, y + 10);
                }
            }
        };

        addSignature(firmaTecnico, 'Firma del Técnico:', finalY);
        addSignature(firmaAprobo, 'Firma de Aprobación:', finalY + 30);
        addSignature(firmaReviso, 'Firma de Revisión:', finalY + 60);

        doc.save(`mantenimiento_${detailedData.usuario}.pdf`);
    };

    const calendarEvents = detailedData ? [
        detailedData.fecha_ultimo_mantenimiento && moment(detailedData.fecha_ultimo_mantenimiento).isValid() ? {
            title: 'Último Mantenimiento',
            start: new Date(detailedData.fecha_ultimo_mantenimiento),
            end: new Date(detailedData.fecha_ultimo_mantenimiento),
            allDay: true,
        } : null,
        detailedData.fecha_actual_de_mantenimiento && moment(detailedData.fecha_actual_de_mantenimiento).isValid() ? {
            title: 'Próximo Mantenimiento',
            start: new Date(detailedData.fecha_actual_de_mantenimiento),
            end: new Date(detailedData.fecha_actual_de_mantenimiento),
            allDay: true,
        } : null,
        detailedData.fecha_de_elaboracion && moment(detailedData.fecha_de_elaboracion).isValid() ? {
            title: 'Fecha Elaboración',
            start: new Date(detailedData.fecha_de_elaboracion),
            end: new Date(detailedData.fecha_de_elaboracion),
        } : null,
        detailedData.fecha_de_ejecucion && moment(detailedData.fecha_de_ejecucion).isValid() ? {
            title: 'Fecha Ejecución',
            start: new Date(detailedData.fecha_de_ejecucion),
            end: new Date(detailedData.fecha_de_ejecucion),
        } : null,
    ].filter(Boolean) : []; // Filtra eventos nulos si las fechas no existen

    return (
        <div className="maintenance-page">
            <div className="page-header">
                <h2 className="page-title">Gestión de Mantenimiento</h2>
                <button className="action-btn save" onClick={handleOpenAddModal} disabled={loading}>
                    Crear Mantenimiento
                </button>
                <button className="refresh-btn" onClick={fetchMaintenanceData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && maintenanceData.length === 0 && <div className="loading-message">Cargando datos de mantenimiento...</div>}

            {!loading && maintenanceData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de mantenimiento disponibles.</div>
            )}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por ID o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {!loading && maintenanceData.length > 0 && (
                <div className="maintenance-table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Área</th>
                                <th>Tipo</th>
                                <th>Próximo Mantenimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceData
                            .filter(item =>
                                (item.id.toString().includes(searchTerm)) ||
                                (item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()))
                            ).map((item) => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} className={selectedItem?.id === item.id ? 'selected' : ''}>
                                    <td>{item.id}</td>
                                    <td>{item.usuario}</td>
                                    <td>{item.area}</td>
                                    <td>{item.tipo}</td>
                                    <td>{item.fecha_actual_de_mantenimiento ? new Date(item.fecha_actual_de_mantenimiento).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(selectedItem || isAdding) && (
                <div className="details-modal" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedItem(null); setIsAdding(false); } }}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                        {loadingDetails ? (
                            <div className="loading-message">Cargando detalles...</div>
                        ) : detailedData ? (
                            <>
                                <div className="details-header">
                                    <h3>{isEditing ? `Editando Mantenimiento #${detailedData.id}` : `Detalles del Mantenimiento #${detailedData.id}`}</h3>
                                    <div className="details-actions" onClick={(e) => e.stopPropagation()}>
                                        {isEditing ? (
                                            <>
                                                <button type="button" className="action-btn save" onClick={handleSave}>Guardar</button>
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
                                    <div className="details-list">
                                        <h4>Información del Equipo</h4>
                                        {isEditing ? (
                                            <div className="form-section">
                                                <label>
                                                    Seleccionar Equipo:
                                                    <select name="equipoId" value={selectedEquipoId} onChange={handleFormChange}>
                                                        <option value="">-- Seleccionar un equipo --</option>
                                                        {equipos.length > 0 && equipos.map(eq => (
                                                            <option key={eq.id} value={eq.id}>
                                                                {eq.usuario} ({eq.tipo} - {eq.marca})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <div className="form-grid-inner">
                                                    <label>Usuario: <input name="usuario" value={editFormData.usuario || ''} onChange={handleFormChange} placeholder="Usuario del equipo" /></label>
                                                    <label>Área: <input name="area" value={editFormData.area || ''} onChange={handleFormChange} placeholder="Área del equipo" /></label>
                                                    <label>Tipo: <input name="tipo" value={editFormData.tipo || ''} onChange={handleFormChange} placeholder="Tipo de equipo" /></label>
                                                    <label>Marca: <input name="marca" value={editFormData.marca || ''} onChange={handleFormChange} placeholder="Marca del equipo" /></label>
                                                </div>
                                                <hr />
                                                <h4>Detalles del Mantenimiento</h4>
                                                <label>Actividades Realizadas: <textarea name="actividades_realizadas" value={editFormData.actividades_realizadas || ''} onChange={handleFormChange} rows="4"></textarea></label>
                                                <label>Observaciones: <textarea name="observaciones" value={editFormData.observaciones || ''} onChange={handleFormChange} rows="3"></textarea></label>
                                                <hr />
                                                <h4>Fechas Clave</h4>
                                                <div className="form-grid-inner">
                                                    <label>Fecha de Elaboración: <input type="date" name="fecha_de_elaboracion" value={editFormData.fecha_de_elaboracion && moment(editFormData.fecha_de_elaboracion).isValid() ? moment(editFormData.fecha_de_elaboracion).format('YYYY-MM-DD') : ''} onChange={handleFormChange} /></label>
                                                    <label>Fecha de Ejecución: <input type="date" name="fecha_de_ejecucion" value={editFormData.fecha_de_ejecucion && moment(editFormData.fecha_de_ejecucion).isValid() ? moment(editFormData.fecha_de_ejecucion).format('YYYY-MM-DD') : ''} onChange={handleFormChange} /></label>
                                                    <label>Fecha Último Mantenimiento: <input type="date" name="fecha_ultimo_mantenimiento" value={editFormData.fecha_ultimo_mantenimiento && moment(editFormData.fecha_ultimo_mantenimiento).isValid() ? moment(editFormData.fecha_ultimo_mantenimiento).format('YYYY-MM-DD') : ''} onChange={handleFormChange} /></label>
                                                    <label>Fecha Próximo Mantenimiento: <input type="date" name="fecha_actual_de_mantenimiento" value={editFormData.fecha_actual_de_mantenimiento && moment(editFormData.fecha_actual_de_mantenimiento).isValid() ? moment(editFormData.fecha_actual_de_mantenimiento).format('YYYY-MM-DD') : ''} onChange={handleFormChange} /></label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="details-view">
                                                <div className="detail-item"><span>Usuario:</span><p>{detailedData.usuario}</p></div>
                                                <div className="detail-item"><span>Área:</span><p>{detailedData.area}</p></div>
                                                <div className="detail-item"><span>Tipo de Equipo:</span><p>{detailedData.tipo}</p></div>
                                                <div className="detail-item"><span>Marca:</span><p>{detailedData.marca || 'N/A'}</p></div>
                                                <hr />
                                                <h4>Detalles del Mantenimiento</h4>
                                                <div className="detail-item-full">
                                                    <span>Actividades Realizadas:</span>
                                                    <p>{detailedData.actividades_realizadas || 'No se registraron actividades.'}</p>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span>Observaciones:</span>
                                                    <p>{detailedData.observaciones || 'Sin observaciones.'}</p>
                                                </div>
                                                <hr />
                                                <h4>Fechas Clave</h4>
                                                <div className="detail-item"><span>Fecha de Elaboración:</span><p>{formatDate(detailedData.fecha_de_elaboracion)}</p></div>
                                                <div className="detail-item"><span>Fecha de Ejecución:</span><p>{formatDate(detailedData.fecha_de_ejecucion)}</p></div>
                                                <div className="detail-item"><span>Fecha Último Mantenimiento:</span><p>{formatDate(detailedData.fecha_ultimo_mantenimiento)}</p></div>
                                                <div className="detail-item"><span>Fecha Próximo Mantenimiento:</span><p>{formatDate(detailedData.fecha_actual_de_mantenimiento)}</p></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="details-meta">
                                        <div className="calendar-container">
                                            <Calendar
                                                localizer={localizer}
                                                events={calendarEvents}
                                                startAccessor="start"
                                                endAccessor="end"
                                                style={{ height: 300 }}
                                                toolbar={true}
                                                date={calendarDate}
                                                onNavigate={(date) => setCalendarDate(date)}
                                                views={['month']}
                                                messages={{next: "Siguiente", previous: "Anterior", today: "Hoy", month: "Mes"}}
                                            />
                                        </div>
                                        <div className="signature-container">
                                            <h4>Firmas</h4>
                                            {isEditing ? (
                                                <div className="signature-edit">
                                                    <div className="signature-options">
                                                        <label><input type="radio" name="signatureType" value="text" checked={signatureType === 'text'} onChange={() => setSignatureType('text')} /> Escribir nombre</label>
                                                        <label><input type="radio" name="signatureType" value="image" checked={signatureType === 'image'} onChange={() => setSignatureType('image')} /> Subir firma</label>
                                                    </div>
                                                    {signatureType === 'text' ? (
                                                        <>
                                                            <input name="firmas_tecnico" placeholder="Escriba el nombre del técnico" value={editFormData.firmas_tecnico || ''} onChange={handleFormChange} />
                                                            <input name="firmas_aprobo" placeholder="Escriba el nombre de quien aprueba" value={editFormData.firmas_aprobo || ''} onChange={handleFormChange} />
                                                            <input name="firmas_reviso" placeholder="Escriba el nombre de quien revisa" value={editFormData.firmas_reviso || ''} onChange={handleFormChange} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <label>Firma Técnico:</label>
                                                                <input type="file" accept="image/*" onChange={(e) => handleSignatureImageChange(e, 'firmas_tecnico')} />
                                                                {editFormData.firmas_tecnico && <img src={editFormData.firmas_tecnico} alt="Vista previa de la firma" className="signature-display" />}
                                                            </div>
                                                            <div>
                                                                <label>Firma Aprobó:</label>
                                                                <input type="file" accept="image/*" onChange={(e) => handleSignatureImageChange(e, 'firmas_aprobo')} />
                                                                {editFormData.firmas_aprobo && <img src={editFormData.firmas_aprobo} alt="Vista previa de la firma" className="signature-display" />}
                                                            </div>
                                                            <div>
                                                                <label>Firma Revisó:</label>
                                                                <input type="file" accept="image/*" onChange={(e) => handleSignatureImageChange(e, 'firmas_reviso')} />
                                                                {editFormData.firmas_reviso && <img src={editFormData.firmas_reviso} alt="Vista previa de la firma" className="signature-display" />}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="signature-item">
                                                        <span>Técnico:</span>
                                                        {detailedData.firmas_tecnico ? (
                                                            detailedData.firmas_tecnico.startsWith('data:image')
                                                                ? <img src={detailedData.firmas_tecnico} alt="Firma del técnico" className="signature-display" />
                                                                : <p className="signature-text">{detailedData.firmas_tecnico}</p>
                                                        ) : <p className="muted">Sin firma</p>}
                                                    </div>
                                                    <div className="signature-item">
                                                        <span>Aprobó:</span>
                                                        {detailedData.firmas_aprobo ? (
                                                            detailedData.firmas_aprobo.startsWith('data:image')
                                                                ? <img src={detailedData.firmas_aprobo} alt="Firma de quien aprueba" className="signature-display" />
                                                                : <p className="signature-text">{detailedData.firmas_aprobo}</p>
                                                        ) : <p className="muted">Sin firma</p>}
                                                    </div>
                                                    <div className="signature-item">
                                                        <span>Revisó:</span>
                                                        {detailedData.firmas_reviso ? (
                                                            detailedData.firmas_reviso.startsWith('data:image')
                                                                ? <img src={detailedData.firmas_reviso} alt="Firma de quien revisa" className="signature-display" />
                                                                : <p className="signature-text">{detailedData.firmas_reviso}</p>
                                                        ) : <p className="muted">Sin firma</p>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="error-message">No se pudieron cargar los detalles.</div>
                        )}
                        {isAdding && newMaintenanceData && (
                            <>
                                <div className="details-header">
                                    <h3>Crear Nuevo Mantenimiento</h3>
                                    <div className="details-actions">
                                        <button type="button" className="action-btn save" onClick={handleSaveNew}>Guardar</button>
                                        <button type="button" className="action-btn cancel" onClick={() => setIsAdding(false)}>Cancelar</button>
                                    </div>
                                </div>
                                <div className="details-grid">
                                    <div className="details-list">
                                        <form onSubmit={handleSaveNew}>
                                            <div className="form-section">
                                                <h4>Información del Equipo</h4>
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
                                                <div className="form-grid-inner">
                                                    <label>Usuario: <input name="usuario" value={newMaintenanceData.usuario} readOnly placeholder="Se autocompleta" /></label>
                                                    <label>Área: <input name="area" value={newMaintenanceData.area} readOnly placeholder="Se autocompleta" /></label>
                                                    <label>Tipo: <input name="tipo" value={newMaintenanceData.tipo} readOnly placeholder="Se autocompleta" /></label>
                                                    <label>Marca: <input name="marca" value={newMaintenanceData.marca} readOnly placeholder="Se autocompleta" /></label>
                                                    <label>Código: <input name="codigo" value={newMaintenanceData.codigo} readOnly placeholder="Se autocompleta" /></label>
                                                </div>
                                                <hr />
                                                <h4>Detalles del Mantenimiento</h4>
                                                <label>Actividades Realizadas: <textarea name="actividades_realizadas" value={newMaintenanceData.actividades_realizadas} onChange={handleNewFormChange} rows="4"></textarea></label>
                                                <label>Observaciones: <textarea name="observaciones" value={newMaintenanceData.observaciones} onChange={handleNewFormChange} rows="3"></textarea></label>
                                                <hr />
                                                <h4>Fechas Clave</h4>
                                                <div className="form-grid-inner">
                                                    <label>Fecha de Elaboración: <input type="date" name="fecha_de_elaboracion" value={moment(newMaintenanceData.fecha_de_elaboracion).format('YYYY-MM-DD')} onChange={handleNewFormChange} /></label>
                                                    <label>Fecha de Ejecución: <input type="date" name="fecha_de_ejecucion" value={newMaintenanceData.fecha_de_ejecucion ? moment(newMaintenanceData.fecha_de_ejecucion).format('YYYY-MM-DD') : ''} onChange={handleNewFormChange} /></label>
                                                    <label>Fecha Último Mantenimiento: <input type="date" name="fecha_ultimo_mantenimiento" value={newMaintenanceData.fecha_ultimo_mantenimiento ? moment(newMaintenanceData.fecha_ultimo_mantenimiento).format('YYYY-MM-DD') : ''} onChange={handleNewFormChange} /></label>
                                                    <label>Fecha Próximo Mantenimiento: <input type="date" name="fecha_actual_de_mantenimiento" value={newMaintenanceData.fecha_actual_de_mantenimiento ? moment(newMaintenanceData.fecha_actual_de_mantenimiento).format('YYYY-MM-DD') : ''} onChange={handleNewFormChange} /></label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="details-meta">
                                        <div className="signature-container">
                                            <h4>Firmas</h4>
                                            <div className="signature-edit">
                                                <div className="signature-options">
                                                    <label><input type="radio" name="newSignatureType" value="text" checked={signatureType === 'text'} onChange={() => setSignatureType('text')} /> Escribir nombre</label>
                                                    <label><input type="radio" name="newSignatureType" value="image" checked={signatureType === 'image'} onChange={() => setSignatureType('image')} /> Subir firma</label>
                                                </div>
                                                {signatureType === 'text' ? (
                                                    <>
                                                        <input name="firmas_tecnico" placeholder="Escriba el nombre del técnico" value={newMaintenanceData.firmas_tecnico || ''} onChange={handleNewFormChange} />
                                                        <input name="firmas_aprobo" placeholder="Escriba el nombre de quien aprueba" value={newMaintenanceData.firmas_aprobo || ''} onChange={handleNewFormChange} />
                                                        <input name="firmas_reviso" placeholder="Escriba el nombre de quien revisa" value={newMaintenanceData.firmas_reviso || ''} onChange={handleNewFormChange} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label>Firma Técnico:</label>
                                                            <input type="file" accept="image/*" onChange={(e) => handleNewSignatureImageChange(e, 'firmas_tecnico')} />
                                                            {newMaintenanceData.firmas_tecnico && <img src={newMaintenanceData.firmas_tecnico} alt="Vista previa de la firma" className="signature-display" />}
                                                        </div>
                                                        <div>
                                                            <label>Firma Aprobó:</label>
                                                            <input type="file" accept="image/*" onChange={(e) => handleNewSignatureImageChange(e, 'firmas_aprobo')} />
                                                            {newMaintenanceData.firmas_aprobo && <img src={newMaintenanceData.firmas_aprobo} alt="Vista previa de la firma" className="signature-display" />}
                                                        </div>
                                                        <div>
                                                            <label>Firma Revisó:</label>
                                                            <input type="file" accept="image/*" onChange={(e) => handleNewSignatureImageChange(e, 'firmas_reviso')} />
                                                            {newMaintenanceData.firmas_reviso && <img src={newMaintenanceData.firmas_reviso} alt="Vista previa de la firma" className="signature-display" />}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaintenancePage;