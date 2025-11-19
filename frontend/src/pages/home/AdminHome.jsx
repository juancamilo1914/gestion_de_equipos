import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import './AdminHome.css';
import './home.css'; 

// Importar las páginas que se van a renderizar
import MaintenancePage from '../mantenimiento/maintenancePage';
import LicenciamientoPage from '../licenciamiento/LicenciamientoPage';
import CopiasPage from '../copiasDeSeguridad/CopiasPage';
import ImpresorasPage from '../impresoras/ImpresorasPage';
import AgregarEquipoPage from './AgregarEquipoPage';

// El componente AdminHome ahora funcionará como un contenedor principal para todas las vistas de admin.
function AdminHome({ onBack, username }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        usuario: '',
        password: '',
    });

    // Estados para el layout del dashboard (copiados de Home.jsx)
    const [now, setNow] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentAdminView, setCurrentAdminView] = useState('dashboard'); // 'dashboard', 'userManagement', 'mantenimiento', etc.
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]); // Placeholder para futuras notificaciones

    const notificationsRef = useRef(null); // Aunque no se usen notificaciones aquí, se mantiene para consistencia si se desea añadir

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/usuarios');
            setUsers(response.data.body || []);
            setError('');
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            setError('No se pudieron cargar los usuarios. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModalForCreate = () => {
        setEditingUser(null);
        setFormData({ nombre: '', correo: '', usuario: '', password: '' });
        setIsModalOpen(true);
        setError('');
        setSuccess('');
    };

    const openModalForEdit = (user) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            correo: user.correo,
            usuario: user.usuario, // Necesitaríamos el nombre de usuario aquí
            password: '', // La contraseña no se edita directamente
        });
        setIsModalOpen(true);
        setError('');
        setSuccess('');
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        
        // Validación simple
        if (!formData.nombre || !formData.usuario || !formData.correo) {
            setError('Nombre, correo y usuario son obligatorios.');
            return;
        }
        if (!editingUser && !formData.password) {
            setError('La contraseña es obligatoria para nuevos usuarios.');
            return;
        }

        try {
            let response;
            if (editingUser) {
                response = await api.put(`/usuarios/${editingUser.id}`, formData);
                setSuccess(`Usuario "${formData.nombre}" actualizado con éxito.`);
            } else {
                // Lógica para crear (POST /usuarios)
                response = await api.post('/usuarios', formData);
                setSuccess(`Usuario "${formData.nombre}" creado con éxito.`);
            }
            
            setIsModalOpen(false);
            fetchUsers(); // Recargar la lista de usuarios

        } catch (err) {
            console.error("Error al guardar el usuario:", err);
            setError(err.response?.data?.body || 'No se pudo guardar el usuario.');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            try {
                await api.delete(`/usuarios/${userId}`);
                setSuccess(`Usuario "${userName}" eliminado con éxito.`);
                fetchUsers(); // Recargar la lista
            } catch (err) {
                console.error("Error al eliminar el usuario:", err);
                setError(err.response?.data?.body || 'No se pudo eliminar el usuario.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        if (onBack) {
            onBack();
        }
    };

    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const day = now.toLocaleDateString([], { day: '2-digit' });
    const month = now.toLocaleDateString([], { month: 'long' }).toUpperCase();
    const year = now.getFullYear();

    return (
        <div className={`home-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">ADMIN<br/>DASHBOARD</div>
                    <nav className="side-nav">
                        {/* Botones de navegación del Admin */}
                        <button className={currentAdminView === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('dashboard')}>DASHBOARD ADMIN</button>
                        <button className={currentAdminView === 'userManagement' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('userManagement')}>GESTIÓN USUARIOS</button>
                        {/* Botones de navegación a otras secciones */}
                        <button className={currentAdminView === 'mantenimiento' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('mantenimiento')}>MANTENIMIENTO</button>
                        <button className={currentAdminView === 'licenciamiento' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('licenciamiento')}>LICENCIAMIENTO</button>
                        <button className={currentAdminView === 'copias' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('copias')}>COPIAS DE SEGURIDAD</button>
                        <button className={currentAdminView === 'impresoras' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('impresoras')}>IMPRESORAS</button>
                        <button className={currentAdminView === 'agregarEquipo' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentAdminView('agregarEquipo')}>AGREGAR EQUIPO</button>
                        {/* Aquí podrías añadir más botones para otras secciones de administración si las hubiera */}
                    </nav>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="logo-row">
                        <button className="hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">☰</button>
                        <div className="logo-pill">AD</div>
                        <div className="org">ADMIN<br/>DASHBOARD</div>
                        <div className="topbar-time">{timeStr}</div>
                        <div className="logoNasakiwe"></div> {/* Mantener si es parte del branding */}
                    </div>
                    <div className="top-actions">
                        {/* Puedes añadir botones de ajustes o notificaciones aquí si son relevantes para el admin */}
                        <button className="icon-btn" onClick={() => setShowNotifications(s => !s)}>
                            🔔
                            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                        </button>
                        <button className="icon-btn" title="Cerrar sesión" onClick={handleLogout}>🚪</button>
                    </div>
                </header>

                {/* Contenido principal del dashboard de administración */}
                {currentAdminView === 'dashboard' && (
                    <section className="hero">
                        <div className="hero-left card big-card">
                            <div className="hero-content-flex">
                                <div className="hero-greeting">
                                    <h2>HOLA,<br/><span className="username">{username || '(USUARIO)'}</span></h2>
                                    <p>Bienvenido al panel de administración. Aquí puedes gestionar los usuarios del sistema.</p>
                                </div>
                            </div>
                            <div className="quick-actions-dashboard">
                                <h4>Acciones rápidas</h4>
                                <div className="quick-actions">
                                    <button className="action-btn" onClick={() => setCurrentAdminView('userManagement')}>
                                        <span className="icon">👥</span> Gestionar Usuarios
                                    </button>
                                    <button className="action-btn" onClick={() => setCurrentAdminView('mantenimiento')}>
                                        <span className="icon">🛠️</span> Ir a Mantenimiento
                                    </button>
                                    <button className="action-btn" onClick={() => setCurrentAdminView('licenciamiento')}>
                                        <span className="icon">📜</span> Ir a Licenciamiento
                                    </button>
                                    <button className="action-btn" onClick={() => setCurrentAdminView('agregarEquipo')}>
                                        <span className="icon">💻</span> Agregar Equipo
                                    </button>
                                </div>
                            </div>
                        </div>
                        <aside className="hero-right">
                            <div className="date-card card">
                                <div className="month">{month}</div>
                                <div className="day">{day}</div>
                                <div className="year">{year}</div>
                            </div>
                        </aside>
                    </section>
                )}

                {currentAdminView === 'userManagement' && (
                    <div className="admin-dashboard-content"> {/* Nuevo contenedor para la gestión de usuarios */}
                        <header className="page-header">
                            <div>
                                <h1>Gestión de Usuarios</h1>
                                <p>Crea, edita y elimina usuarios del sistema.</p>
                            </div>
                        </header>

                        <div className="toolbar">
                            <button className="btn primary" onClick={openModalForCreate}>
                                <span className="icon">+</span> Crear Nuevo Usuario
                            </button>
                        </div>

                        {error && <div className="form-message error" style={{ margin: '1rem 0' }}>{error}</div>}
                        {success && <div className="form-message success" style={{ margin: '1rem 0' }}>{success}</div>}

                        <div className="users-list card">
                            {loading ? (
                                <p>Cargando usuarios...</p>
                            ) : (
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Correo Electrónico</th>
                                                <th>Usuario</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.nombre}</td>
                                                    <td>{user.correo}</td>
                                                    <td>{user.usuario}</td>
                                                    <td className="actions-cell">
                                                        <button className="action-btn-sm edit" onClick={() => openModalForEdit(user)}>Editar</button>
                                                        <button className="action-btn-sm delete" onClick={() => handleDeleteUser(user.id, user.nombre)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!loading && users.length === 0 && <p>No hay usuarios registrados.</p>}
                        </div>
                    </div>
                )}

                {/* Renderizado condicional de las otras páginas */}
                {currentAdminView === 'mantenimiento' && <MaintenancePage />}
                {currentAdminView === 'licenciamiento' && <LicenciamientoPage />} 
                {currentAdminView === 'copias' && <CopiasPage />} 
                {currentAdminView === 'impresoras' && <ImpresorasPage />}
                {currentAdminView === 'agregarEquipo' && <AgregarEquipoPage onEquipoAgregado={() => setCurrentAdminView('dashboard')} />}

                {/* Modal para Crear/Editar Usuario (se mantiene fuera del condicional principal para que siempre esté disponible si currentAdminView es 'userManagement') */}
                {isModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal-content card">
                            <h2>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                            <form onSubmit={handleModalSubmit}>
                                {error && <div className="form-message error">{error}</div>}
                                <div className="form-grid">
                                    <label>
                                        Nombre Completo
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                                    </label>
                                    <label>
                                        Correo Electrónico
                                        <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
                                    </label>
                                    <label>
                                        Nombre de Usuario
                                        <input type="text" name="usuario" value={formData.usuario} onChange={handleInputChange} required />
                                    </label>
                                    <label>
                                        Contraseña {editingUser ? '(Dejar en blanco para no cambiar)' : ''}
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingUser} />
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="action-btn save">
                                        {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                    </button>
                                    <button type="button" className="action-btn cancel" onClick={() => setIsModalOpen(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Notificaciones para Admin */}
                {showNotifications && (
                    <div className="notifications-modal" onClick={() => setShowNotifications(false)}>
                        <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="notifications-header">
                                <div className="notifications-header-title">
                                    <span className="icon">🔔</span>
                                    <h4>Notificaciones</h4>
                                </div>
                                {/* <button className="link small">Limpiar todo</button> */}
                            </div>
                            <div className="notifications-list">
                                {notifications.length > 0 ? (
                                    <p>Aquí irían las notificaciones.</p>
                                ) : <div className="muted" style={{padding: '1rem'}}>No hay notificaciones nuevas.</div>}
                            </div>
                        </div>
                    </div>
                )}

            </main>
            {/* Backdrop para el sidebar y modales */}
            {(sidebarOpen || isModalOpen || showNotifications) && <div className="backdrop" onClick={() => { setSidebarOpen(false); setIsModalOpen(false); setShowNotifications(false); }} />}
        </div>
    );
}

export default AdminHome;