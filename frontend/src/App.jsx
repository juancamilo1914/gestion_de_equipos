import './App.css'
import React, { useState, useEffect } from 'react'
import Login from './pages/Login/Login.jsx'
import OlvidasteLaContraseña from './pages/Login/olvidasteLaContraseña.jsx'
import RegistroPage from './pages/Login/RegistroPage.jsx'
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
    // Verificar si hay un token guardado en localStorage al cargar la app
    const savedToken = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      // Verificar si el token es válido (no expirado)
      const payload = decodeJwt(savedToken);
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setUser(savedUsername);
        setView('home');
      } else {
        // Token expirado, limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
      }
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
    setView('home');
  }

  return (
    <>
      <div>
        {view === 'login' && (
          <Login onForgot={() => setView('forgot')} onLogin={(token) => handleLogin(token)} onRegistro={() => setView('registro')} />
        )}

        {view === 'forgot' && (
          <OlvidasteLaContraseña onBack={() => setView('login')} />
        )}

        {view === 'home' && (
          <Home onBack={() => { setToken(null); setUser(null); setView('login'); }} username={user} token={token} />
        )}

        {view === 'registro' && (
          <RegistroPage onBack={() => setView('login')} />
        )}
      </div>
    </>
  )
}

export default App
