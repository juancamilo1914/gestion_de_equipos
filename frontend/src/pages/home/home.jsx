import React, { useEffect, useState, useRef } from "react";
import './home.css';
import api from '../../api/axios';
import MaintenancePage from '../mantenimiento/MaintenancePage';
import LicenciamientoPage from '../licenciamiento/LicenciamientoPage';
import CopiasPage from '../copiasDeSeguridad/CopiasPage';
import UserSettingsModal from "../../components/UserSettingsModal";
import AppSettingsModal from '../../components/AppSettingsModal'; // Importamos el nuevo modal

function Home({ onBack, username }) {
    const [now, setNow] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserSettings, setShowUserSettings] = useState(false);
    const [showAppSettings, setShowAppSettings] = useState(false); // Estado para el nuevo modal
    const notificationsRef = useRef(null);

    const [currentView, setCurrentView] = useState('dashboard'); // Nuevo estado para controlar la vista actual
    useEffect(() =>{
        const t = setInterval(()=> setNow(new Date()), 1000);
        return () => clearInterval(t);
    },[]);

    // recordatorios desde backend
    const [reminders, setReminders] = useState([]);
    const [loadingReminders, setLoadingReminders] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formDateTime, setFormDateTime] = useState(''); // value for datetime-local
    const [editingId, setEditingId] = useState(null);

    async function fetchReminders(){
        try{
            setLoadingReminders(true);
            const resp = await api.get('/recordatorios');
            const data = resp?.data?.body || [];
            setReminders(Array.isArray(data) ? data : []);
        }catch(err){
            console.error('Error fetching reminders', err);
        }finally{
            setLoadingReminders(false);
        }
    }

    useEffect(()=>{
        fetchReminders();
    },[]);

    function isoToLocalInput(iso){
        if(!iso) return '';
        const d = new Date(iso);
        const tzOffset = d.getTimezoneOffset() * 60000; // ms
        const local = new Date(d - tzOffset).toISOString().slice(0,16);
        return local;
    }

    async function handleEdit(rem){
        setEditingId(rem.id);
        setFormTitle(rem.title || '');
        setFormDateTime(rem.date ? isoToLocalInput(rem.date) : '');
        setShowForm(true);
    }

    async function handleToggleRealizado(rem){
        try{
            const newVal = rem.realizado ? 0 : 1;
            await api.patch(`/recordatorios/${rem.id}/realizado`, { realizado: newVal });
            fetchReminders();
        }catch(err){
            console.error('Error toggling realizado', err);
        }
    }

    async function handleDelete(rem){
        if(!confirm('¿Eliminar recordatorio?')) return;
        try{
            await api.delete(`/recordatorios/${rem.id}`);
            fetchReminders();
        }catch(err){
            console.error('Error deleting reminder', err);
        }
    }

    async function handleClearAllNotifications() {
        if (!confirm('¿Marcar todos los recordatorios como realizados?')) return;
        try {
            const uncompletedReminders = reminders.filter(r => !r.realizado);
            const promises = uncompletedReminders.map(rem => 
                api.patch(`/recordatorios/${rem.id}/realizado`, { realizado: 1 })
            );
            await Promise.all(promises);
            fetchReminders(); // Volver a cargar para reflejar los cambios
        } catch (err) {
            console.error('Error al limpiar los recordatorios', err);
        }
    }

    // obtener el recordatorio más reciente cuya fecha sea <= ahora (si ninguno, el más próximo)
    function getLatestReminder(){
        if(!reminders || reminders.length === 0) return null;
        const nowISO = now.toISOString();
        const past = reminders.filter(r => r.date && r.date <= nowISO).sort((a,b)=> b.date.localeCompare(a.date));
        if(past.length) return past[0];
        // ninguno pasado: devolver el próximo
        const future = reminders.slice().filter(r => r.date).sort((a,b)=> a.date.localeCompare(b.date));
        return future[0] || null;
    }

    const latest = getLatestReminder();

    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const uncompletedReminders = reminders.filter(r => !r.realizado);

    const day = now.toLocaleDateString([], { day: '2-digit' });
    const month = now.toLocaleDateString([], { month: 'long' }).toUpperCase();
    const year = now.getFullYear();

    return (
        <div className={`home-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">GESTION DE<br/>EQUIPOS</div>
                    <nav className="side-nav"> 
                        <button className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentView('dashboard')}>DASHBOARD</button> {/* Agregado botón para volver al dashboard */}
                        <button className={currentView === 'mantenimiento' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentView('mantenimiento')}>MANTENIMIENTO</button>
                        <button className={currentView === 'licenciamiento' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentView('licenciamiento')}>LICENCIAMIENTO</button>
                        <button className={currentView === 'copias' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentView('copias')}>COPIAS DE SEGURIDAD</button>
                        <button className="nav-btn">IMPRESORAS</button>
                    </nav>
                </div>
                {/* Eliminada configuración duplicada: usar icono en topbar */}
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="logo-row">
                        <button className="hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">☰</button>
                        <div className="logo-pill">GE</div>
                        <div className="org">GESTION DE<br/>EQUIPOS</div>
                        <div className="topbar-time">{timeStr}</div>
                        <div className="logoNasakiwe"></div>
                    </div>
                    <div className="top-actions" >
                        <button className="icon-btn" onClick={() => setShowNotifications(s => !s)}>
                            🔔
                            {uncompletedReminders.length > 0 && <span className="notification-badge">{uncompletedReminders.length}</span>}
                        </button>
                        <button className="icon-btn" title="Ajustes de usuario" onClick={() => setShowUserSettings(true)}>👤</button>
                        <button className="icon-btn" title="Ajustes de la aplicación" onClick={() => setShowAppSettings(true)}>⚙️</button>
                        <button className="icon-btn" title="Cerrar sesión" onClick={() => onBack && onBack()}>🚪</button>
                    </div>
                </header>

                {/* Renderizado condicional del contenido principal */}
                {currentView === 'dashboard' && (
                    <>
                        <section className="hero">
                            <div className="hero-left card big-card"> {/* Este contenedor ahora será un flex-direction: column en CSS */}
                                <div className="hero-content-flex"> {/* Nuevo contenedor para el saludo y los recordatorios (flex-direction: row en CSS) */}
                                    <div className="hero-greeting">
                                        <h2>HOLA,<br/><span className="username">{username || '(USUARIO)'}</span></h2>
                                    </div>
                                    <div className="hero-reminders"> {/* Contenedor para la sección de recordatorios */}
                                        <h4>RECORDATORIOS</h4>
                                        <div className="reminders-list card-inner"> {/* Renombrado de 'reminders' a 'reminders-list' */}
                                            {latest ? (
                                                <div className="reminder-item">
                                                    <div className="reminder-title">{latest.title}</div>
                                                    <div className="reminder-date">{new Date(latest.date).toLocaleString([], { hour: 'numeric', minute: '2-digit', hour12: true, day: '2-digit', month: 'short' })}</div>
                                                </div>
                                            ) : (
                                                <div className="muted">No hay recordatorios</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="quick-actions-dashboard"> {/* Nuevo contenedor para acciones rápidas */}
                                    <h4>Acciones rápidas</h4>
                                    <div className="quick-actions">
                                        <button className="action-btn" onClick={() => setCurrentView('mantenimiento')}>Mantenimiento</button>
                                        <button className="action-btn" onClick={() => setCurrentView('licenciamiento')}>Licenciamiento</button>
                                        <button className="action-btn" onClick={() => setCurrentView('copias')}>Copias de Seguridad</button>
                                        <button className="action-btn" onClick={() => { setShowForm(s => !s); setEditingId(null); setFormTitle(''); setFormDateTime(''); }}>{showForm ? 'Cancelar' : 'Crear recordatorio'}</button>
                                    </div>

                                    {showForm && (
                                        <form className="create-form" onSubmit={async (e) => {
                                            e.preventDefault();
                                            try{
                                                const payloadDate = formDateTime ? new Date(formDateTime).toISOString() : new Date().toISOString();
                                                if(editingId){
                                                    await api.put(`/recordatorios/${editingId}`, { title: formTitle, date: payloadDate });
                                                } else {
                                                    await api.post('/recordatorios', { title: formTitle, date: payloadDate, realizado: 0 });
                                                }
                                                setShowForm(false);
                                                setFormTitle('');
                                                setFormDateTime('');
                                                setEditingId(null);
                                                fetchReminders();
                                            }catch(err){
                                                console.error('Error saving reminder', err);
                                                alert('Error al guardar recordatorio');
                                            }
                                        }}>
                                            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:10}}>
                                                <input required placeholder="Título" value={formTitle} onChange={e=>setFormTitle(e.target.value)} />
                                                <input type="datetime-local" value={formDateTime} onChange={e=>setFormDateTime(e.target.value)} />
                                                <div style={{display:'flex',gap:8}}>
                                                    <button className="action-btn" type="submit">Guardar</button>
                                                    <button className="action-btn" type="button" onClick={()=>{ setShowForm(false); setEditingId(null); setFormTitle(''); setFormDateTime(''); }}>Cancelar</button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
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
                    </>
                )}

                {currentView === 'mantenimiento' && <MaintenancePage />}
                {currentView === 'licenciamiento' && <LicenciamientoPage />} 
                {currentView === 'copias' && <CopiasPage />} 
                {currentView === 'impresoras' && <div className="page-placeholder card"><h2>Página de Impresoras (próximamente)</h2></div>}

            </main>

            {/* backdrop para modales y sidebar */}
            {(sidebarOpen || showNotifications || showUserSettings || showAppSettings) && <div className="backdrop" onClick={() => { setSidebarOpen(false); setShowNotifications(false); setShowUserSettings(false); setShowAppSettings(false); }} />}

            {showUserSettings && <UserSettingsModal onClose={() => setShowUserSettings(false)} />}
            {showAppSettings && <AppSettingsModal onClose={() => setShowAppSettings(false)} />}

            {/* Modal de Notificaciones */}
            {showNotifications && (
                <div className="notifications-modal" onClick={() => setShowNotifications(false)}>
                    <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="notifications-header">
                            <div className="notifications-header-title">
                                <span className="icon">🔔</span>
                                <h4>Notificaciones</h4>
                            </div>
                            <button className="link small" onClick={handleClearAllNotifications}>Limpiar todo</button>
                        </div>
                        <div className="notifications-list">
                            {uncompletedReminders.length > 0 ? (
                                uncompletedReminders.map(rem => (
                                    <div key={rem.id} className="notification-item">
                                        <div className="notification-content">
                                            <div className="notification-title">{rem.title}</div>
                                            <small className="muted">{rem.date ? new Date(rem.date).toLocaleString() : ''}</small>
                                        </div>
                                        <button 
                                            className="clear-notification-btn" 
                                            title="Marcar como realizado"
                                            onClick={(e) => { e.stopPropagation(); handleToggleRealizado(rem); }}
                                        >✓</button>
                                    </div>
                                ))
                            ) : <div className="muted" style={{padding: '1rem'}}>No hay notificaciones nuevas</div>}
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowNotifications(false)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
