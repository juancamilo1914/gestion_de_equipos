import axios from 'axios';

const api = axios.create({
    // Evitar barra final para construir endpoints con claridad
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export default api;