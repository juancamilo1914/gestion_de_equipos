import React, { useEffect, useState, useCallback } from "react";
import "./maintenancePage.css";
import api from '../../api/axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    const [editFormData, setEditFormData] = useState(null);
    const [signatureType, setSignatureType] = useState('text');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [signatureImage, setSignatureImage] = useState(null);
    const [equipos, setEquipos] = useState([]); // Nuevo estado para almacenar los equipos
    const [selectedEquipoId, setSelectedEquipoId] = useState(''); // Estado para el equipo seleccionado en el dropdown

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
        setSignatureImage(null);
        setSelectedItem(item);
        setEditFormData(null);
        setLoadingDetails(true);
        try {
            // Usamos el endpoint para obtener un solo registro
            const response = await api.get(`/mantenimiento/${item.id}`);
            const data = response.data.body;
            // Aseguramos que 'firmas' sea un objeto, incluso si es null o un string JSON
            try {
                if (typeof data.firmas === 'string') {
                    data.firmas = JSON.parse(data.firmas);
                } else if (data.firmas === null || typeof data.firmas !== 'object') {
                    data.firmas = {};
                }
            } catch (e) {
                console.error("Error parsing firmas:", e);
                data.firmas = {}; // Fallback a objeto vacío
            }
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

    const handleEdit = () => {
        // Aseguramos que firmas sea un objeto antes de copiar
        const firmas = detailedData.firmas || {};
        setEditFormData({ ...detailedData, firmas: { ...firmas } });
        setSignatureType(firmas.tecnico?.startsWith('data:image') ? 'image' : 'text');
        setSelectedEquipoId(equipos.find(eq => eq.usuario === detailedData.usuario && eq.area === detailedData.area && eq.tipo === detailedData.tipo && eq.marca === detailedData.marca)?.id || '');
        setSignatureImage(firmas.tecnico?.startsWith('data:image') ? firmas.tecnico : null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData(null);
        setSignatureImage(null);
        setSelectedEquipoId(''); // Limpiar selección de equipo
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // 1. Preparamos los datos para enviar, creando una copia para no modificar el estado directamente.
            const dataToSave = { ...editFormData };

            // 2. Si el tipo de firma es 'imagen' y hay una imagen cargada, la asignamos.
            if (signatureType === 'image' && signatureImage) {
                // Aseguramos que el objeto de firmas exista antes de asignarle la propiedad.
                dataToSave.firmas = { ...dataToSave.firmas, tecnico: signatureImage };
            }

            // 3. El backend espera que el campo 'firmas' sea un string JSON.
            // Lo convertimos solo para el envío, no en el estado local.
            const payload = new FormData();
            Object.keys(dataToSave).forEach(key => {
                if (key !== 'firmas') {
                    payload.append(key, dataToSave[key]);
                }
            });
            payload.append('firmas', JSON.stringify(dataToSave.firmas || {})); // Aseguramos que firmas sea un JSON

            // Si hay una imagen de firma subida, agregarla al FormData
            if (signatureType === 'image' && signatureImage && signatureImage.startsWith('data:image')) {
                // Convertir base64 a blob para subir como archivo
                const response = await fetch(signatureImage);
                const blob = await response.blob();
                payload.append('firma', blob, 'firma.png'); // Nombre del archivo
            }

            // 4. Enviamos la petición PUT al backend con los datos procesados (usando FormData para archivos).
            await api.put(`/mantenimiento/${detailedData.id}`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 5. Actualizamos el estado local para reflejar los cambios inmediatamente.
            // Para asegurar que vemos los datos correctos (ej. firmas parseadas si el backend las devuelve)
            // es mejor volver a pedir los datos del item.
            const response = await api.get(`/mantenimiento/${detailedData.id}`);
            const updatedData = response.data.body;
            if (typeof updatedData.firmas === 'string') {
                updatedData.firmas = JSON.parse(updatedData.firmas || '{}');
            }
            setDetailedData(updatedData);
            setIsEditing(false); // Salimos del modo edición.
            fetchMaintenanceData(); // Actualizamos la lista principal en segundo plano.
        } catch (err) {
            console.error("Error saving maintenance data:", err);
            setError("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
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
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                setEditFormData(prev => ({
                    ...prev,
                    usuario: selectedEquipo.usuario,
                    area: selectedEquipo.area,
                    tipo: selectedEquipo.tipo,
                    marca: selectedEquipo.marca,
                }));
            } else {
                // Si no se selecciona ningún equipo, limpiar los campos relacionados
                setEditFormData(prev => ({ ...prev, usuario: '', area: '', tipo: '', marca: '' }));
            }
        } else
        if (name === "firma_tecnico_texto") {
            setEditFormData(prev => ({ ...prev, firmas: { ...prev.firmas, tecnico: value } }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSignatureImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSignatureImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('LL');
    };

    const handleDownloadPdf = async () => {
        if (!detailedData) return;
    
        const doc = new jsPDF();
        const margin = 14;
    
        // Título
        doc.setFontSize(20);
        doc.text(`Reporte de Mantenimiento #${detailedData.id}`, margin, 22);
    
        // Contenido principal en una tabla para mejor alineación
        const mainData = [
            ['Usuario', detailedData.usuario || 'N/A'],
            ['Área', detailedData.area || 'N/A'],
            ['Tipo de Equipo', detailedData.tipo || 'N/A'],
            ['Marca', detailedData.marca || 'N/A'],
            ['Fecha Elaboración', formatDate(detailedData.fecha_de_elaboracion)],
            ['Fecha Ejecución', formatDate(detailedData.fecha_de_ejecucion)],
            ['Último Mantenimiento', formatDate(detailedData.fecha_ultimo_mantenimiento)],
            ['Próximo Mantenimiento', formatDate(detailedData.fecha_actual_de_mantenimiento)],
        ];
    
        doc.autoTable({
            startY: 30,
            head: [['Campo', 'Valor']],
            body: mainData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
        });
    
        // Actividades y Observaciones
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 10,
            head: [['Actividades Realizadas']],
            body: [[detailedData.actividades_realizadas || 'Sin actividades registradas.']],
        });
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 5,
            head: [['Observaciones']],
            body: [[detailedData.observaciones || 'Sin observaciones.']],
        });
    
        // Firma (si es texto)
        const finalY = doc.previousAutoTable.finalY;
        const firmaTecnico = detailedData.firmas?.tecnico;

        if (firmaTecnico) {
            doc.setFontSize(10);
            doc.text('Firma del Técnico:', margin, finalY + 15);

            if (firmaTecnico.startsWith('data:image')) {
                // Si es una imagen Base64, la añadimos
                doc.addImage(firmaTecnico, 'PNG', margin, finalY + 18, 60, 20);
            } else {
                // Si es texto, lo escribimos
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(12);
                doc.text(firmaTecnico, margin, finalY + 25);
            }
        }
    
        doc.save(`Reporte_Mantenimiento_${detailedData.id}.pdf`);
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
                <button className="refresh-btn" onClick={fetchMaintenanceData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && maintenanceData.length === 0 && <div className="loading-message">Cargando datos de mantenimiento...</div>}

            {!loading && maintenanceData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de mantenimiento disponibles.</div>
            )}

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
                            {maintenanceData.map((item) => (
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

            {selectedItem && (
                <div className="details-modal" onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                        {loadingDetails ? (
                            <div className="loading-message">Cargando detalles...</div>
                        ) : detailedData ? (
                            <>
                                <div className="details-header">
                                    <h3>Detalles del Mantenimiento #{detailedData.id}</h3>
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
                                            <h4>Firma del Técnico</h4>
                                            {isEditing ? (
                                                <div className="signature-edit">
                                                    <div className="signature-options">
                                                        <label><input type="radio" name="signatureType" value="text" checked={signatureType === 'text'} onChange={() => setSignatureType('text')} /> Escribir nombre</label>
                                                        <label><input type="radio" name="signatureType" value="image" checked={signatureType === 'image'} onChange={() => setSignatureType('image')} /> Subir firma</label>
                                                    </div>
                                                    {signatureType === 'text' ? (
                                                        <input name="firma_tecnico_texto" placeholder="Escriba el nombre del técnico" value={editFormData.firmas?.tecnico?.startsWith('data:image') ? '' : editFormData.firmas?.tecnico || ''} onChange={handleFormChange} />
                                                    ) : (
                                                        <>
                                                            <input type="file" accept="image/*" onChange={handleSignatureImageChange} />
                                                            {signatureImage && <img src={signatureImage} alt="Vista previa de la firma" className="signature-display" />}
                                                        </>
                                                    )}
                                                    {/* Aquí podrías añadir campos para otras firmas, como la del usuario */}
                                                </div>
                                            ) : (
                                                detailedData.firmas?.tecnico ? (
                                                    detailedData.firmas.tecnico.startsWith('data:image')
                                                        ? <img src={detailedData.firmas.tecnico} alt="Firma del técnico" className="signature-display" />
                                                        : <p className="signature-text">{detailedData.firmas.tecnico}</p>
                                                ) : <p className="muted">Sin firma</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="error-message">No se pudieron cargar los detalles.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaintenancePage;