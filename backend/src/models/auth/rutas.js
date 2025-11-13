const express = require('express');

const respuestas = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.post('/register', register);

async function register(req, res, next) {
    try {
        // Extraemos email y password para Supabase Auth
        // y el resto de los datos para la tabla de perfiles.
        const { email, password, usuario } = req.body;

        if (!email || !password || !usuario) {
            return respuestas.error(req, res, 'Faltan datos requeridos (email, password, usuario).', 400);
        }

        const result = await controlador.register({
            email,
            password,
            usuario,
        });
        
        respuestas.success(req, res, result, 201);
    } catch (err) {
        next(err);
    }
}

module.exports = router;