import './App.css'
import React, { useState, useEffect } from 'react'
import Login from './pages/Login/Login.jsx'
import AdminHome from './pages/home/AdminHome.jsx'
import Home from './pages/home/home.jsx'

function decodeJwt(token){
  try{
    const parts = token.split('.');
    if(parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  }catch(e){
    return null;
  }
}

function App() {
  const [view, setView] = useState('login')
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      handleLogin(storedToken);
    }
  }, []);

  const handleLogin = (tokenValue) =>{
    if(!tokenValue) return setView('login');
    setToken(tokenValue);
    // tokenValue may be the raw jwt or an object; handle both
    let jwt = tokenValue;
    if(typeof tokenValue === 'object' && tokenValue.token) jwt = tokenValue.token;
    const payload = decodeJwt(jwt);
    // try common claim names: usuario, name, username
    const username = payload?.usuario || payload?.user || payload?.username || payload?.name || payload?.id || null;
    setUser(username);
    if (username === 'admin') {
      setView('adminHome'); // Redirigir a AdminHome si el usuario es 'admin'
    } else {
      setView('home'); // Redirigir a Home normal para otros usuarios
    }
  }

  return (
    <>
      <div className="app-container">
        {view === 'login' && (
          <Login onLogin={(token) => handleLogin(token)} />
        )}

        {view === 'adminHome' && (
          <AdminHome onBack={() => { setToken(null); setUser(null); setView('login'); }} username={user} token={token} />
        )}
        {view === 'home' && (
          <Home onBack={() => { setToken(null); setUser(null); setView('login'); }} username={user} token={token} />
        )}
      </div>
    </>
  )
}

export default App
