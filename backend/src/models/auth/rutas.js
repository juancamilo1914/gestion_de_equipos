const express = require('express');

const respuesta = require('../../red/respuestas')
const controlador = require('./index');


const router = express.Router();

// El endpoint de login recibe credenciales en el body, por eso debe ser POST
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);

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
        // La lógica de agregar usuario está en el controlador de usuarios, que a su vez llama al de auth.
        const userController = require('../usuarios');
        const result = await userController.agregar(req.body);
        respuesta.succes(req, res, result, 201);
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const result = await controlador.forgotPassword(req.body.correo);
        respuesta.succes(req, res, result, 200);
    } catch (err) {
        next(err);
    }
}

module.exports = router;