const express = require('express');

const respuesta = require('../../red/respuestas')
const controlador = require('./index');
const usuarios = require('../usuarios');


const router = express.Router();

// El endpoint de login recibe credenciales en el body, por eso debe ser POST
router.post('/login', login);
router.post('/register', register);

async function login (req, res, next){
    try{
        const token = await controlador.login(req.body.usuario, req.body.password);
        respuesta.succes(req, res, token, 200);
    }catch(err){
        next(err);
    }
}

async function register(req, res, next) {
    try {
        const { nombre, correo, usuario, contraseña } = req.body;
        // Crear usuario en la tabla usuarios
        const usuarioData = {
            id: 0, // Para insertar nuevo
            nombre,
            correo,
            activo: 1 // Asumiendo que los usuarios nuevos están activos
        };
        const insertID = await usuarios.agregar(usuarioData);

        // Crear credenciales en la tabla auth
        const authData = {
            id: insertID, // Usar el ID del usuario insertado
            usuario: usuario, // Usar el nombre de usuario proporcionado
            password: contraseña
        };
        await controlador.agregar(authData);

        respuesta.succes(req, res, 'Usuario registrado exitosamente', 201);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
