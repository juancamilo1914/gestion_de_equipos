import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './ImpresorasPage.css';

function ImpresorasPage() {
    const [impresoras, setImpresoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchImpresoras = async () => {
            try {
                setLoading(true);
                const response = await api.get('/impresoras');
                // El backend envuelve la respuesta en un objeto `body`
                setImpresoras(response.data.body || []);
                setError('');
            } catch (err) {
                console.error("Error al obtener las impresoras:", err);
                setError('No se pudieron cargar los datos de las impresoras. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchImpresoras();
    }, []);

    if (loading) {
        return <div className="page-placeholder">Cargando impresoras...</div>;
    }

    if (error) {
        return <div className="page-placeholder error">{error}</div>;
    }

    return (
        <div className="impresoras-page-container">
            <header className="page-header">
                <h1>Gestión de Impresoras</h1>
                <button className="action-btn">Agregar Impresora</button>
            </header>
            <div className="table-container card">
                <table>
                    <thead>
                        <tr>
                            <th>Área</th>
                            <th>Modelo</th>
                            <th>Dirección IP</th>
                            <th>Novedad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {impresoras.map((imp) => (
                            <tr key={imp.id}>
                                <td>{imp.area}</td>
                                <td>{imp.modelo}</td>
                                <td>{imp.direccion_IP}</td>
                                <td>{imp.novedad}</td>
                                <td>
                                    <button className="btn-icon" title="Editar">✏️</button>
                                    <button className="btn-icon" title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ImpresorasPage;