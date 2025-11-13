import React, { useState } from 'react';
import axios from 'axios';

const RegistroPage = ({ onBack }) => {
    const [formData, setFormData] = useState({
        usuario: '',
        email: '', // Campo de email añadido
        password: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validar que los campos no estén vacíos
        if (!formData.usuario || !formData.email || !formData.password) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            // La URL debe apuntar a tu backend desplegado en Render
            const response = await axios.post('https://gestion-de-equipos-6eya.onrender.com/api/auth/register', {
                usuario: formData.usuario,
                email: formData.email,       // Se envía el email al backend
                password: formData.password,
            });

            setMessage(response.data.body.message || '¡Registro exitoso! Por favor, revisa tu correo para confirmar.');
            // Opcional: limpiar el formulario tras el éxito
            setFormData({ usuario: '', email: '', password: '' });
            // Opcional: redirigir al login después de unos segundos
            setTimeout(() => onBack(), 5000);

        } catch (err) {
            console.error('Error en el registro:', err);
            // Muestra el mensaje de error del servidor si está disponible, si no, un mensaje genérico.
            const errorMessage = err.response?.data?.body || err.message || 'Ocurrió un error inesperado.';
            setError(errorMessage);
        }
    };

    return (
        <div>
            <h2>Registro de Usuario</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="usuario" placeholder="Nombre de usuario" value={formData.usuario} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                <button type="submit">Registrarse</button>
                <button type="button" onClick={onBack}>Volver al Login</button>
            </form>
        </div>
    );
};

export default RegistroPage;