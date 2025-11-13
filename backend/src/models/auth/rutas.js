const express = require('express');

const respuestas = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.post('/register', register);

async function register(req, res, next) {
    try {
        // Extraemos correo y password para Supabase Auth
        // y el resto de los datos para la tabla de perfiles.
        const { correo, password, usuario } = req.body;

        if (!correo || !password || !usuario) {
            return respuestas.error(req, res, 'Faltan datos requeridos (correo, password, usuario).', 400);
        }

        const result = await controlador.register({
            correo,
            password,
            usuario,
        });
        
        respuestas.success(req, res, result, 201);
    } catch (err) {
        next(err);
    }
}

module.exports = router;