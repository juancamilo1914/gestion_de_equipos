import React, { useEffect, useState } from "react";
import './copiasPage.css';
import api from '../../api/axios';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/LOGO_INSTITUCIONAL.jpg';

// Configuración para el calendario en español
moment.locale('es', {
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
    weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
    week: {
        dow: 1, // Lunes es el primer día de la semana.
    },
});
const localizer = momentLocalizer(moment);

function CopiasPage() {
    const [copiasData, setCopiasData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCopiaData, setNewCopiaData] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [selectedEquipoId, setSelectedEquipoId] = useState('');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCopiasData();
        fetchEquipos();
    }, []);

    async function fetchEquipos() {
        try {
            const response = await api.get('/equipos');
            setEquipos(response.data.body || []);
        } catch (err) {
            console.error("Error fetching equipos:", err);
            // No es un error fatal para la vista principal, solo para la creación/edición.
        }
    }

    async function fetchCopiasData() {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/CopiasDeSeguridad'); // Endpoint from DOCUMENTATION.md
            setCopiasData(response.data.body || []);
        } catch (err) {
            console.error("Error fetching copias de seguridad data:", err);
            setError("Error al cargar los datos de copias de seguridad. Por favor, inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }

    function handleRowClick(item) {
        if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null);
            setDetailedData(null);
            return;
        }
        setSelectedItem(item);
        // No es necesario hacer otra llamada a la API, ya tenemos los datos.
        setDetailedData(item);
        if (item.fecha) {
            setCalendarDate(new Date(item.fecha));
        } else {
            setCalendarDate(new Date());
        }
    }

    const handleOpenAddModal = () => {
        setNewCopiaData({
            usuario: '',
            area: '',
            tipo: '',
            marca: '',
            codigo: '',
            fecha: moment().format('YYYY-MM-DD'), // Fecha de hoy por defecto
        });
        setSelectedEquipoId('');
        setSelectedItem(null);
        setDetailedData(null);
        setIsAdding(true);
    };

    const handleNewFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "equipoId") {
            setSelectedEquipoId(value);
            const selectedEquipo = equipos.find(eq => eq.id === parseInt(value));
            if (selectedEquipo) {
                setNewCopiaData(prev => ({
                    ...prev,
                    usuario: selectedEquipo.usuario,
                    area: selectedEquipo.area,
                    tipo: selectedEquipo.tipo,
                    marca: selectedEquipo.marca,
                    codigo: selectedEquipo.codigo,
                }));
            } else {
                setNewCopiaData(prev => ({ ...prev, usuario: '', area: '', tipo: '', marca: '', codigo: '' }));
            }
        } else {
            setNewCopiaData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        if (!selectedEquipoId) {
            setError("Por favor, selecciona un equipo para asociar la copia de seguridad.");
            return;
        }
        const selectedEquipo = equipos.find(eq => eq.id === parseInt(selectedEquipoId));
        if (!selectedEquipo || !selectedEquipo.codigo) {
            setError("El equipo seleccionado no tiene un código de inventario válido.");
            return;
        }
        const dataToSend = {
            ...newCopiaData,
            equipo_id: parseInt(selectedEquipoId, 10)
        };
        await api.post('/CopiasDeSeguridad', dataToSend);
        setIsAdding(false);
        fetchCopiasData();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('LL');
    };

    const calendarEvents = detailedData ? [
        detailedData.fecha && moment(detailedData.fecha).isValid() ? {
            title: `Copia #${detailedData.id}`,
            start: new Date(detailedData.fecha),
            end: new Date(detailedData.fecha),
            allDay: true,
        } : null,
    ].filter(Boolean) : [];

    const handleDownloadPdf = () => {
        if (!detailedData) return;

        const doc = new jsPDF();
        const margin = 14;

        // Encabezado
        doc.addImage(logo, 'JPEG', margin, 10, 40, 20);
        doc.setFontSize(20);
        doc.text('Reporte de Copia de Seguridad', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Código: FT-COPIA-001`, doc.internal.pageSize.getWidth() - margin, 15, { align: 'right' });
        doc.text(`Versión: 1.0`, doc.internal.pageSize.getWidth() - margin, 20, { align: 'right' });
        doc.text(`Fecha: ${moment().format('DD/MM/YYYY')}`, doc.internal.pageSize.getWidth() - margin, 25, { align: 'right' });

        // Información del Equipo y Copia
        autoTable(doc, {
            startY: 40,
            head: [['Detalles del Respaldo']],
            body: [
                [{ content: `Código de Inventario: ${detailedData.id || 'N/A'}` }],
                [`Usuario Asignado: ${detailedData.usuario || 'N/A'}`],
                [`Área: ${detailedData.area || 'N/A'}`],
                [`Tipo de Equipo: ${detailedData.tipo || 'N/A'}`],
                [`Marca: ${detailedData.marca || 'N/A'}`],
                [{ content: `Fecha de la Copia: ${formatDate(detailedData.fecha)}`, styles: { fontStyle: 'bold' } }],
            ],
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] }, // Un color verde para diferenciar
        });

        doc.save(`Reporte_Copia_Seguridad_${detailedData.id}.pdf`);
    };

    return (
        <div className="copias-page">
            <div className="page-header">
                <h2 className="page-title">Gestión de Copias de Seguridad</h2>
                <button className="action-btn save" onClick={handleOpenAddModal} disabled={loading}>
                    Agregar Copia
                </button>
                <button className="refresh-btn" onClick={fetchCopiasData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && copiasData.length === 0 && <div className="loading-message">Cargando datos de copias de seguridad...</div>}

            {!loading && copiasData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de copias de seguridad disponibles.</div>
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

            {!loading && copiasData.length > 0 && (
                <div className="copias-table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Área</th>
                                <th>Tipo</th>
                                <th>Marca</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {copiasData
                            .filter(item =>
                                (item.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()))
                            ).map((item) => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} className={selectedItem?.id === item.id ? 'selected' : ''}>
                                    <td>{item.id}</td>
                                    <td>{item.usuario || 'N/A'}</td>
                                    <td>{item.area}</td>
                                    <td>{item.tipo}</td>
                                    <td>{item.marca}</td>
                                    <td>{formatDate(item.fecha)}</td>
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
                        {detailedData ? (
                            <>
                                <div className="details-header">
                                    <h3>Detalles de la Copia de Seguridad #{detailedData.id}</h3>
                                    <div className="details-actions">
                                        <button type="button" className="action-btn download" onClick={handleDownloadPdf}>Descargar PDF</button>
                                    </div>
                                </div>
                                <div className="details-content-grid">
                                    <div className="details-list">
                                        <div className="detail-item"><span>Usuario:</span><p>{detailedData.usuario || 'N/A'}</p></div>
                                        <div className="detail-item"><span>Área:</span><p>{detailedData.area}</p></div>
                                        <div className="detail-item"><span>Tipo de Equipo:</span><p>{detailedData.tipo}</p></div>
                                        <div className="detail-item"><span>Marca:</span><p>{detailedData.marca}</p></div>
                                        <div className="detail-item"><span>Fecha de Copia:</span><p>{formatDate(detailedData.fecha)}</p></div>
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
                                    </div>
                                </div>
                            </>
                        ) : <div className="loading-message">Cargando...</div>}

                        {isAdding && newCopiaData && (
                            <>
                                <div className="details-header">
                                    <h3>Agregar Nueva Copia de Seguridad</h3>
                                    <div className="details-actions">
                                        <button type="button" className="action-btn save" onClick={handleSaveNew}>Guardar</button>
                                        <button type="button" className="action-btn cancel" onClick={() => setIsAdding(false)}>Cancelar</button>
                                    </div>
                                </div>
                                <form onSubmit={handleSaveNew}>
                                    <div className="details-grid">
                                        <label className="full-width">
                                            Seleccionar Equipo Existente:
                                            <select name="equipoId" value={selectedEquipoId} onChange={handleNewFormChange} required>
                                                <option value="">-- Seleccionar un equipo --</option>
                                                {equipos.map(eq => (
                                                    <option key={eq.id} value={eq.id}>
                                                        {eq.usuario} ({eq.tipo} - {eq.codigo})
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <hr className="full-width"/>
                                        <label>Usuario <input name="usuario" value={newCopiaData.usuario} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Área <input name="area" value={newCopiaData.area} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Tipo <input name="tipo" value={newCopiaData.tipo} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Marca <input name="marca" value={newCopiaData.marca} readOnly placeholder="Se autocompleta" /></label>
                                        <label>Código Inventario <input name="codigo" value={newCopiaData.codigo} readOnly placeholder="Se autocompleta" /></label>
                                        <label>
                                            Fecha de la Copia
                                            <input type="date" name="fecha" value={newCopiaData.fecha} onChange={handleNewFormChange} required />
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

export default CopiasPage;