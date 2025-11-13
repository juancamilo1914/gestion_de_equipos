import './App.css'
import React, { useState, useEffect } from 'react'
import Login from './pages/Login/Login.jsx'
import Home from './pages/home/home.jsx'
import RegistroPage from './pages/Login/RegistroPage.jsx'

function decodeJwt(token){
  try {
    const parts = token.split('.');
    if (parts.length !== 3) { // Un JWT válido tiene 3 partes
      console.error('El token no es un JWT válido.');
      return null;
    }
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch (e) {
    console.error('Error al decodificar el token:', e);
    return null;
  }
}

function App() {
  const [view, setView] = useState('login')
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Revisa si hay un token de sesión guardado
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      handleLogin(storedToken);
    }
  }, []);

  const handleLogin = (tokenValue) =>{
    const jwt = (typeof tokenValue === 'object' && tokenValue.token) ? tokenValue.token : tokenValue;

    if (!jwt) {
      return handleLogout(); // Si no hay token, limpiar todo y llevar al login
    }

    const payload = decodeJwt(jwt);
    if (!payload) {
      return handleLogout(); // Si el token es inválido, limpiar todo
    }

    localStorage.setItem('authToken', jwt);
    setToken(jwt);
    const username = payload?.usuario || payload?.user || payload?.username || payload?.name || payload?.id;
    setUser(username);
    setView('home');
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setView('login');
  };

  // Renderizado condicional basado en el estado 'view'
  const renderView = () => {
    switch (view) {
      case 'registro':
        return <RegistroPage onBack={() => setView('login')} />;
      case 'home':
        return <Home onBack={handleLogout} username={user} token={token} />;
      default: // 'login' y cualquier otro caso
        return <Login onLogin={handleLogin} onRegister={() => setView('registro')} />;
    }
  };

  return (
    <div>{renderView()}</div>
  )
}

export default App
