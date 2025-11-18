import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './ImpresorasPage.css';

function ImpresorasPage() {
    const [impresoras, setImpresoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para el modal de edición/creación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        area: '',
        modelo: '',
        direccion_IP: '',
        novedad: ''
    });

    useEffect(() => {
        fetchImpresoras();
    }, []);

    const fetchImpresoras = async () => {
        try {
            setLoading(true);
            const response = await api.get('/impresoras');
            setImpresoras(response.data.body || []);
            setError(null);
        } catch (err) {
            console.error("Error al obtener las impresoras:", err);
            setError('No se pudieron cargar los datos de las impresoras.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (impresora = null) => {
        setError(null);
        setSuccess(null);
        if (impresora) {
            setEditingId(impresora.id);
            setFormData({
                area: impresora.area || '',
                modelo: impresora.modelo || '',
                direccion_IP: impresora.direccion_IP || '',
                novedad: impresora.novedad || ''
            });
        } else {
            setEditingId(null);
            setFormData({ area: '', modelo: '', direccion_IP: '', novedad: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const apiCall = editingId
            ? api.put(`/impresoras/${editingId}`, formData)
            : api.post('/impresoras', formData);

        try {
            await apiCall;
            setSuccess(editingId ? 'Impresora actualizada con éxito.' : 'Impresora agregada con éxito.');
            handleCloseModal();
            fetchImpresoras();
        } catch (err) {
            console.error("Error al guardar la impresora:", err);
            setError('No se pudo guardar la impresora.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta impresora?')) {
            try {
                await api.delete(`/impresoras/${id}`);
                setSuccess('Impresora eliminada con éxito.');
                fetchImpresoras();
            } catch (err) {
                console.error("Error al eliminar la impresora:", err);
                setError('No se pudo eliminar la impresora.');
            }
        }
    };

    const filteredImpresoras = impresoras.filter(imp =>
        (imp.area?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (imp.modelo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (imp.direccion_IP?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="impresoras-page">
            <header className="page-header">
                <h1>Gestión de Impresoras</h1>
                <button className="action-btn save" onClick={() => handleOpenModal()}>Agregar Impresora</button>
            </header>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por área, modelo o IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {loading ? (
                <div className="loading-message">Cargando impresoras...</div>
            ) : (
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
                            {filteredImpresoras.map((imp) => (
                                <tr key={imp.id}>
                                    <td>{imp.area}</td>
                                    <td>{imp.modelo}</td>
                                    <td>{imp.direccion_IP}</td>
                                    <td>{imp.novedad}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn-sm edit" onClick={() => handleOpenModal(imp)}>Editar</button>
                                        <button className="action-btn-sm delete" onClick={() => handleDelete(imp.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredImpresoras.length === 0 && <p className="no-data-message">No se encontraron impresoras.</p>}
                </div>
            )}

            {isModalOpen && (
                <div className="details-modal">
                    <div className="details-panel card">
                        <form onSubmit={handleSubmit}>
                            <div className="details-header">
                                <h3>{editingId ? 'Editar Impresora' : 'Agregar Nueva Impresora'}</h3>
                                <button type="button" className="close-details-btn" onClick={handleCloseModal}>×</button>
                            </div>
                            <div className="details-grid">
                                <label>Área <input name="area" value={formData.area} onChange={handleChange} required /></label>
                                <label>Modelo <input name="modelo" value={formData.modelo} onChange={handleChange} required /></label>
                                <label>Dirección IP <input name="direccion_IP" value={formData.direccion_IP} onChange={handleChange} /></label>
                                <label className="full-width">Novedad <textarea name="novedad" value={formData.novedad} onChange={handleChange} rows="3"></textarea></label>
                            </div>
                            <div className="details-actions">
                                <button type="submit" className="action-btn save" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button type="button" className="action-btn cancel" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImpresorasPage;