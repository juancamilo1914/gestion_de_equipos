import axios from 'axios';

const api = axios.create({
    // Evitar barra final para construir endpoints con claridad
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido, limpiar localStorage y redirigir al login
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.reload(); // Recargar la página para volver al login
        }
        return Promise.reject(error);
    }
);

export default api;
