const express = require('express');

const seguridad = require('./seguridad');
const respuesta = require('../../red/respuestas')
const controlador = require('./index');


const router = express.Router();

router.get('/', todos);
router.get ('/:id', uno);
router.post('/', agregar);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);
router.post('/change-password', seguridad(), changePassword);


async function todos (req, res, next){
    try{
        const items = await controlador.todos();
        respuesta.succes(req, res, items, 200);
    }
    catch(err){
        next(err);
    }
};

async function uno(req, res, next) {
    try{
        const items = await controlador.uno(req.params.id);
        respuesta.succes(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

async function agregar(req, res, next) {
    try{
        const items = await controlador.agregar(req.body);
        const mensaje = 'Usuario registrado satisfactoriamente';
        respuesta.succes(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

async function actualizar(req, res, next) {
    try{
        const items = await controlador.actualizar(req.params.id, req.body);
        respuesta.succes(req, res, 'Usuario actualizado satisfactoriamente', 200);
    }catch(err){
        next(err);
    }
};

async function eliminar(req, res, next) {
    try{
        const items = await controlador.eliminar(req.params.id);
        respuesta.succes(req, res, 'Usuario eliminado satisfactoriamente', 200);
    }catch(err){
        next(err);
    }
};

async function changePassword(req, res, next) {
    try {
        // The user id should be in the token
        const { id } = req.user;
        const { oldPassword, newPassword } = req.body;
        await controlador.changePassword(id, oldPassword, newPassword);
        respuesta.succes(req, res, 'Contraseña actualizada con éxito', 200);
    } catch (err) {
        next(err);
    }
}

module.exports = router;