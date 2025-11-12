import axios from 'axios';

const api = axios.create({
    // Evitar barra final para construir endpoints con claridad
    baseURL: import.meta.env.VITE_API_URL || 'https://gestion-de-equipos-6eya.onrender.com/api'
});

export default api;