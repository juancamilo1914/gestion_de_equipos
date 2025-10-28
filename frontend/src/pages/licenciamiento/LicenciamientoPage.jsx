import React, { useEffect, useState } from "react";
import './licenciamientoPage.css';
import api from '../../api/axios';

function LicenciamientoPage() {
    const [licenciamientoData, setLicenciamientoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchLicenciamientoData();
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

    return (
        <div className="licenciamiento-page">
            <div className="page-header">
                <h2 className="page-title">Gestión de Licenciamiento</h2>
                <button className="refresh-btn" onClick={fetchLicenciamientoData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && licenciamientoData.length === 0 && <div className="loading-message">Cargando datos de licenciamiento...</div>}

            {!loading && licenciamientoData.length === 0 && !error && (
                <div className="no-data-message">No hay datos de licenciamiento disponibles.</div>
            )}

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
                            {licenciamientoData.map((item) => (
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

            {selectedItem && detailedData && (
                <div className="details-panel card">
                    <h3>Detalles del Licenciamiento #{detailedData.id}</h3>
                    <p><strong>Usuario:</strong> {detailedData.usuario}</p>
                    <p><strong>Área:</strong> {detailedData.area}</p>
                    <p><strong>Tipo:</strong> {detailedData.tipo}</p>
                    <p><strong>Descripción:</strong> {detailedData.descripcion}</p>
                    <p><strong>Sistema Operativo:</strong> {detailedData.sistema_operativo || 'N/A'}</p>
                    <p><strong>Software de Oficina:</strong> {detailedData.software_de_oficina || 'N/A'}</p>
                    <p><strong>Otro Software:</strong> {detailedData.otro_software || 'N/A'}</p>
                    <button className="close-details-btn" onClick={() => setSelectedItem(null)}>×</button>
                </div>
            )}
        </div>
    );
}

export default LicenciamientoPage;