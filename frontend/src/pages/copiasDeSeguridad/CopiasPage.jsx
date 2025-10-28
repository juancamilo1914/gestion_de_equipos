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
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    async function handleRowClick(item) {
        if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null);
            setDetailedData(null);
            return;
        }
        setSelectedItem(item);
        setDetailedData(null);
        setLoadingDetails(true);
        try {
            const response = await api.get(`/CopiasDeSeguridad/${item.id}`); // Assuming a /:id endpoint exists
            setDetailedData(response.data.body);
        } catch (err) {
            console.error("Error fetching copias de seguridad details:", err);
            setError("Error al cargar los detalles de la copia de seguridad.");
            setDetailedData(null);
        } finally {
            setLoadingDetails(false);
        }
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
                                <th>Equipo ID</th>
                                <th>Usuario ID</th>
                                <th>Fecha</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {copiasData.map((item) => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} className={selectedItem?.id === item.id ? 'selected' : ''}>
                                    <td>{item.id}</td>
                                    <td>{item.equipoId}</td>
                                    <td>{item.usuarioId}</td>
                                    <td>{formatDate(item.fecha)}</td>
                                    <td>{item.observaciones || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedItem && detailedData && (
                <div className="details-panel card">
                    <h3>Detalles de la Copia de Seguridad #{detailedData.id}</h3>
                    <p><strong>Equipo ID:</strong> {detailedData.equipoId}</p>
                    <p><strong>Usuario ID:</strong> {detailedData.usuarioId}</p>
                    <p><strong>Fecha:</strong> {formatDate(detailedData.fecha)}</p>
                    <p><strong>Observaciones:</strong> {detailedData.observaciones || 'N/A'}</p>
                    <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                </div>
            )}
        </div>
    );
}

export default CopiasPage;