const express = require('express');

const respuesta = require('../../red/respuestas')
const controlador = require('./index');

const router = express.Router();

router.get('/', todos);
router.get('/historial/:equipo_id', historialPorEquipo);
router.get ('/:id', uno);
router.post('/', agregar);
router.put('/:id', modificar);
router.delete('/:id', eliminar);


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

async function historialPorEquipo(req, res, next) {
    try {
        const items = await controlador.historialPorEquipo(req.params.equipo_id);
        respuesta.succes(req, res, items, 200);
    } catch(err) {
        next(err);
    }
}

async function agregar(req, res, next) {
    try{
        const items = await controlador.agregar(req.body);
        const mensaje = 'item agregado satisfactoriamente';
        respuesta.succes(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

async function modificar(req, res, next) {
    try{
        const items = await controlador.modificar(req.params.id, req.body);
        const mensaje = 'item modificado satisfactoriamente';
        respuesta.succes(req, res, mensaje, 200);
    }catch(err){
        next(err);
    }
};

async function eliminar(req, res, next) {
    try{
        const items = await controlador.eliminar(req.params.id);
        respuesta.succes(req, res, 'item eliminado satisfactoriamente', 200);
    }catch(err){
        next(err);
    }
};

module.exports = router;