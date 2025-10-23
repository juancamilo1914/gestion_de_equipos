import React, { useEffect, useState } from "react";
import './home.css';
import api from '../../api/axios';

function Home({ onBack, username }) {
    const [now, setNow] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const day = now.toLocaleDateString([], { day: '2-digit' });
    const month = now.toLocaleDateString([], { month: 'long' }).toUpperCase();
    const year = now.getFullYear();

    return (
        <div className={`home-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">GESTION DE<br/>EQUIPOS</div>
                    <nav className="side-nav">
                        <button className="nav-btn">MANTENIMIENTO</button>
                        <button className="nav-btn">LICENCIAMIENTO</button>
                        <button className="nav-btn">COPIAS DE SEGURIDAD</button>
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
                        <div className="org">Corporación<br/>NASA KIWE</div>
                    </div>
                    <div className="top-actions">
                        <button className="icon-btn">🔔</button>
                        <button className="icon-btn">👤</button>
                        <button className="icon-btn">⚙️</button>
                    </div>
                </header>

                <section className="hero">
                    <div className="hero-left card big-card">
                        <div className="hero-time">{timeStr}</div>
                        <h2>HOLA,<br/><span className="username">{username || '(USUARIO)'}</span></h2>
                        <h4>RECORDATORIOS</h4>
                        <div className="reminders card-inner">
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

                    <aside className="hero-right">
                        <div className="date-card card">
                            <div className="month">{month}</div>
                            <div className="day">{day}</div>
                            <div className="year">{year}</div>
                        </div>
                    </aside>
                </section>

                <section className="stats-section">
                    <div className="stats-cards">
                        <div className="stat card">
                            <h4>Equipos</h4>
                            <div className="stat-value">128</div>
                            <div className="muted">Activos en el último mes</div>
                        </div>
                        <div className="stat card">
                            <h4>Recordatorios</h4>
                            <div className="stat-value">{reminders.length}</div>
                            <div className="muted">Activos / programados</div>
                        </div>
                        <div className="stat card">
                            <h4>Licencias</h4>
                            <div className="stat-value">58</div>
                            <div className="muted">Por renovar</div>
                        </div>
                    </div>

                    <div className="lower-grid">
                        <div className="card actions-card">
                            <h4>Acciones rápidas</h4>
                            <div className="quick-actions">
                                <button className="action-btn">Agregar equipo</button>
                                <button className="action-btn" onClick={() => { setShowForm(s => !s); setEditingId(null); setFormTitle(''); setFormDateTime(''); }}>{showForm ? 'Cancelar' : 'Crear recordatorio'}</button>
                                <button className="action-btn">Ver copias de seguridad</button>
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

                        <div className="card activity-card">
                            <h4>Actividad reciente</h4>
                            <div className="recent-list">
                                {loadingReminders ? (
                                    <div className="muted">Cargando...</div>
                                ) : (
                                    reminders.slice().sort((a,b)=> b.date?.localeCompare(a.date)).map(rem => (
                                        <div key={rem.id} className="recent-item">
                                            <div style={{display:'flex',flexDirection:'column'}}>
                                                <span style={{textDecoration: rem.realizado ? 'line-through' : 'none'}}>{rem.title}</span>
                                                <small className="muted">{rem.date ? new Date(rem.date).toLocaleString([], { hour: 'numeric', minute: '2-digit', hour12: true, day: '2-digit', month: 'short' }) : ''}</small>
                                            </div>
                                            <div style={{display:'flex',gap:8}}>
                                                <button className="action-btn" style={{padding:'6px 10px'}} onClick={()=>handleEdit(rem)}>Editar</button>
                                                <button className="action-btn" style={{padding:'6px 10px',background: rem.realizado ? '#f59e0b' : '#10b981'}} onClick={()=>handleToggleRealizado(rem)}>{rem.realizado ? 'Reabrir' : 'Realizado'}</button>
                                                <button className="action-btn" style={{padding:'6px 10px',background:'#ef4444'}} onClick={()=>handleDelete(rem)}>Eliminar</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{marginTop:12}}>
                            <button className="action-btn logout" onClick={() => onBack && onBack()} style={{background:'#ef4444'}}>Cerrar sesión</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* backdrop para pantalla pequeña */}
            {sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}

export default Home;
