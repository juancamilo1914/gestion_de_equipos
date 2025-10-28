import React, { useEffect, useState, useCallback } from "react";
import './maintenancePage.css';
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

    useEffect(() => {
        fetchMaintenanceData();
    }, []);

    async function fetchMaintenanceData() {
        try {
            setLoading(true);
            setError(null);
            // Asumiendo que el endpoint para obtener todos los mantenimientos es /api/mantenimiento
            const response = await api.get('/mantenimiento');
            // Ajusta 'response.data.body' si la estructura de tu API es diferente
            setMaintenanceData(response.data.body || []);
        } catch (err) {
            console.error("Error fetching maintenance data:", err);
            setError("Error al cargar los datos de mantenimiento. Por favor, inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
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
        setSignatureImage(firmas.tecnico?.startsWith('data:image') ? firmas.tecnico : null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData(null);
        setSignatureImage(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // 1. Preparamos los datos para enviar
            const dataToSave = { ...editFormData, firmas: { ...(editFormData.firmas || {}) } };
            if (signatureType === 'image' && signatureImage) {
                dataToSave.firmas.tecnico = signatureImage;
            }
            
            // 2. Guardamos una copia del objeto de firmas antes de convertirlo a string
            const firmasObject = { ...dataToSave.firmas };
            
            // 3. Convertimos el objeto de firmas a un string JSON para el backend
            if (dataToSave.firmas) {
                dataToSave.firmas = JSON.stringify(dataToSave.firmas);
            }

            // 4. Enviamos la petición PUT
            await api.put(`/mantenimiento/${detailedData.id}`, dataToSave);

            // 5. Actualizamos el estado local para reflejar los cambios inmediatamente
            setDetailedData({ ...dataToSave, firmas: firmasObject }); // Usamos el objeto de firmas, no el string
            setIsEditing(false);
            fetchMaintenanceData(); // Actualiza la tabla principal en segundo plano
        } catch (err) {
            console.error("Error saving maintenance data:", err);
            setError("Error al guardar los cambios.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el mantenimiento #${detailedData.id}?`)) {
            try {
                await api.delete(`/mantenimiento/${detailedData.id}`);
                await fetchMaintenanceData();
            } catch (err) {
                console.error("Error deleting maintenance data:", err);
                setError("Error al eliminar el registro.");
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
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
        detailedData.fecha_ultimo_mantenimiento && {
            title: 'Último Mantenimiento',
            start: new Date(detailedData.fecha_ultimo_mantenimiento),
            end: new Date(detailedData.fecha_ultimo_mantenimiento),
            allDay: true,
        },
        detailedData.fecha_actual_de_mantenimiento && {
            title: 'Próximo Mantenimiento',
            start: new Date(detailedData.fecha_actual_de_mantenimiento),
            end: new Date(detailedData.fecha_actual_de_mantenimiento),
            allDay: true,
        },
        detailedData.fecha_de_elaboracion && {
            title: 'Fecha Elaboración',
            start: new Date(detailedData.fecha_de_elaboracion),
            end: new Date(detailedData.fecha_de_elaboracion),
        },
        detailedData.fecha_de_ejecucion && {
            title: 'Fecha Ejecución',
            start: new Date(detailedData.fecha_de_ejecucion),
            end: new Date(detailedData.fecha_de_ejecucion),
        },
    ].filter(Boolean) : []; // Filtra eventos nulos si las fechas no existen

    return (
        <>
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
            </div>

            {selectedItem && (
                <div className="details-modal" onClick={() => setSelectedItem(null)}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                        {loadingDetails ? (
                            <div className="loading-message">Cargando detalles...</div>
                        ) : detailedData ? (
                            <form onSubmit={handleSave}>
                                <div className="details-header">
                                    <h3>Detalles del Mantenimiento #{detailedData.id}</h3>
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
                                    <div className="details-list">
                                        {isEditing ? (
                                            <>
                                                <label>Usuario: <input name="usuario" value={editFormData.usuario || ''} onChange={handleFormChange} /></label>
                                                <label>Área: <input name="area" value={editFormData.area || ''} onChange={handleFormChange} /></label>
                                                <label>Tipo: <input name="tipo" value={editFormData.tipo || ''} onChange={handleFormChange} /></label>
                                                <label>Marca: <input name="marca" value={editFormData.marca || ''} onChange={handleFormChange} /></label>
                                                <label>Actividades: <textarea name="actividades_realizadas" value={editFormData.actividades_realizadas || ''} onChange={handleFormChange} rows="3"></textarea></label>
                                                <label>Observaciones: <textarea name="observaciones" value={editFormData.observaciones || ''} onChange={handleFormChange} rows="3"></textarea></label>
                                            </>
                                        ) : (
                                            <>
                                                <p><strong>Usuario:</strong> {detailedData.usuario}</p>
                                                <p><strong>Área:</strong> {detailedData.area}</p>
                                                <p><strong>Tipo:</strong> {detailedData.tipo}</p>
                                                <p><strong>Marca:</strong> {detailedData.marca || 'N/A'}</p>
                                                <p><strong>Actividades Realizadas:</strong> {detailedData.actividades_realizadas || 'N/A'}</p>
                                                <p><strong>Observaciones:</strong> {detailedData.observaciones || 'N/A'}</p>
                                                <p><strong>Fecha de Elaboración:</strong> {formatDate(detailedData.fecha_de_elaboracion)}</p>
                                                <p><strong>Fecha de Ejecución:</strong> {formatDate(detailedData.fecha_de_ejecucion)}</p>
                                            </>
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
                                                        <input name="firma_tecnico_texto" placeholder="Nombre del técnico" value={editFormData.firmas?.tecnico || ''} onChange={handleFormChange} />
                                                    ) : (
                                                        <>
                                                            <input type="file" accept="image/*" onChange={handleSignatureImageChange} />
                                                            {signatureImage && <img src={signatureImage} alt="Vista previa de la firma" className="signature-preview" />}
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
                            </form>
                        ) : (
                            <div className="error-message">No se pudieron cargar los detalles.</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default MaintenancePage;