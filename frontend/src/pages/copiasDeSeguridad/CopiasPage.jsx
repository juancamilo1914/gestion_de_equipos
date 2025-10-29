import React, { useEffect, useState } from "react";
import './copiasPage.css';
import api from '../../api/axios';
import moment from 'moment';

function CopiasPage() {
    const [copiasData, setCopiasData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailedData, setDetailedData] = useState(null);

    useEffect(() => {
        fetchCopiasData();
    }, []);

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
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('LL');
    };

    return (
        <div className="copias-page">
            <div className="page-header">
                <h2 className="page-title">Gestión de Copias de Seguridad</h2>
                <button className="refresh-btn" onClick={fetchCopiasData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && copiasData.length === 0 && <div className="loading-message">Cargando datos de copias de seguridad...</div>}

            {!loading && copiasData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de copias de seguridad disponibles.</div>
            )}

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
                            {copiasData.map((item) => (
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

            {selectedItem && (
                <div className="details-modal" onClick={() => setSelectedItem(null)}>
                    <div className="details-panel card" onClick={(e) => e.stopPropagation()}> {/* Eliminar el botón de cerrar */}
                        <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                        {detailedData ? (
                            <>
                                <div className="details-header">
                                    <h3>Detalles de la Copia de Seguridad #{detailedData.id}</h3>
                                </div>
                                <div className="details-grid">
                                    <div className="detail-item"><span>Usuario:</span><p>{detailedData.usuario || 'N/A'}</p></div>
                                    <div className="detail-item"><span>Área:</span><p>{detailedData.area}</p></div>
                                    <div className="detail-item"><span>Tipo de Equipo:</span><p>{detailedData.tipo}</p></div>
                                    <div className="detail-item"><span>Marca:</span><p>{detailedData.marca}</p></div>
                                    <div className="detail-item"><span>Fecha de Copia:</span><p>{formatDate(detailedData.fecha)}</p></div>
                                </div>
                            </>
                        ) : <div className="loading-message">Cargando...</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CopiasPage;