const express = require('express');

const respuestas = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

async function register(req, res, next) {
    try {
        // Extraemos correo y password para Supabase Auth
        // y el resto de los datos para la tabla de perfiles.
        const { email: correo, password, usuario, nombre, role } = req.body;

        if (!correo || !password || !usuario || !nombre || !role) {
            return respuestas.error(req, res, 'Faltan datos requeridos (email, password, usuario, nombre, role).', 400);
        }

        const result = await controlador.register({
            correo,
            password,
            usuario,
            nombre,
            role,
        });

        respuestas.success(req, res, result, 201);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return respuestas.error(req, res, 'Usuario y contraseña son requeridos.', 400);
        }

        const token = await controlador.login({
            usuario,
            password,
        });

        respuestas.success(req, res, token, 200);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
