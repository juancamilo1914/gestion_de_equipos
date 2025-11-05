import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import './AgregarEquipoPage.css'; // Reutilizar estilos
import AgregarEquipoPage from './AgregarEquipoPage';

function GestionEquiposPage() {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [showAgregarModal, setShowAgregarModal] = useState(false);

    useEffect(() => {
        fetchEquipos();
    }, []);

    async function fetchEquipos() {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/equipos');
            setEquipos(response.data.body || []);
        } catch (err) {
            console.error("Error fetching equipos:", err);
            setError("Error al cargar los equipos. Por favor, inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRowClick(equipo) {
        if (selectedEquipo && selectedEquipo.id === equipo.id) {
            setSelectedEquipo(null);
            setDetailedData(null);
            return;
        }
        setIsEditing(false);
        setEditFormData(null);
        setSelectedEquipo(equipo);
        setDetailedData(equipo);
    }

    const handleEdit = () => {
        setEditFormData({ ...detailedData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editFormData };
            await api.put('/equipos', payload);
            // Volvemos a pedir los datos para tener la versión más actualizada
            await fetchEquipos();
            setDetailedData(editFormData);
            setIsEditing(false);
            setError('');
        } catch (err) {
            console.error("Error saving equipo data:", err);
            setError("Error al guardar los cambios. Verifica la conexión con el backend.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${detailedData.nombre_de_usuario_asignado}"? Esto no eliminará los registros relacionados de mantenimiento, licenciamiento y copias de seguridad.`)) {
            try {
                await api.delete('/equipos', { data: { id: detailedData.id } });
                setSelectedEquipo(null);
                setDetailedData(null);
                fetchEquipos();
                setError('');
            } catch (err) {
                console.error("Error deleting equipo:", err);
                setError("Error al eliminar el equipo.");
            }
        }
    };

    return (
        <div className="agregar-equipo-page">
            <header className="page-header">
                <h1>Gestión de Equipos</h1>
                <p>Lista, edita y elimina equipos registrados.</p>
                <button className="action-btn" onClick={() => setShowAgregarModal(true)}>Agregar Equipo</button>
            </header>

            {error && <div className="form-message error">{error}</div>}

            {loading && equipos.length === 0 && <div className="loading-message">Cargando equipos...</div>}

            {!loading && equipos.length === 0 && !error && (
                <div className="no-data-message">No hay equipos registrados.</div>
            )}

            {!loading && equipos.length > 0 && (
                <div className="equipos-table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario Asignado</th>
                                <th>Área</th>
                                <th>Tipo</th>
                                <th>Marca</th>
                                <th>Código</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.map((equipo) => (
                                <tr key={equipo.id} onClick={() => handleRowClick(equipo)} className={selectedEquipo?.id === equipo.id ? 'selected' : ''}>
                                    <td>{equipo.id}</td>
                                    <td>{equipo.nombre_de_usuario_asignado}</td>
                                    <td>{equipo.Area}</td>
                                    <td>{equipo.tipo}</td>
                                    <td>{equipo.marca}</td>
                                    <td>{equipo.codigo_de_equipo || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedEquipo && (
                <div className="details-modal" onClick={() => setSelectedEquipo(null)}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-details-btn" onClick={() => setSelectedEquipo(null)}>×</button>
                        {detailedData ? (
                            <form onSubmit={handleSave}>
                                <div className="details-header">
                                    <h3>Detalles del Equipo #{detailedData.id}</h3>
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="details-grid">
                                    {isEditing ? (
                                        <>
                                            <label>Usuario Asignado <input name="nombre_de_usuario_asignado" value={editFormData.nombre_de_usuario_asignado || ''} onChange={handleFormChange} required /></label>
                                            <label>Área <select name="Area" value={editFormData.Area || ''} onChange={handleFormChange} required>
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
                                            </select></label>
                                            <label>Tipo <select name="tipo" value={editFormData.tipo || ''} onChange={handleFormChange} required>
                                                <option value="">Selecciona un tipo</option>
                                                <option value="Portátil">Portátil</option>
                                                <option value="Escritorio">Escritorio</option>
                                            </select></label>
                                            <label>Marca <select name="marca" value={editFormData.marca || ''} onChange={handleFormChange} required>
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
                                            </select></label>
                                            <label>Código de Equipo <input name="codigo_de_equipo" value={editFormData.codigo_de_equipo || ''} onChange={handleFormChange} /></label>
                                        </>
                                    ) : (
                                        <>
                                            <div className="detail-item"><span>Usuario Asignado:</span><p>{detailedData.nombre_de_usuario_asignado}</p></div>
                                            <div className="detail-item"><span>Área:</span><p>{detailedData.Area}</p></div>
                                            <div className="detail-item"><span>Tipo:</span><p>{detailedData.tipo}</p></div>
                                            <div className="detail-item"><span>Marca:</span><p>{detailedData.marca}</p></div>
                                            <div className="detail-item"><span>Código de Equipo:</span><p>{detailedData.codigo_de_equipo || 'N/A'}</p></div>
                                        </>
                                    )}
                                </div>
                            </form>
                        ) : <div className="loading-message">Cargando...</div>}
                    </div>
                </div>
            )}

            {/* Modal para Agregar Equipo */}
            {showAgregarModal && (
                <div className="modal-overlay" onClick={() => setShowAgregarModal(false)}>
                    <div className="floating-window" onClick={(e) => e.stopPropagation()}>
                        <div className="window-header">
                            <h3>Agregar Equipo</h3>
                            <button className="close-btn" onClick={() => setShowAgregarModal(false)}>×</button>
                        </div>
                        <div className="window-content">
                            <AgregarEquipoPage onEquipoAgregado={() => { setShowAgregarModal(false); fetchEquipos(); }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionEquiposPage;
