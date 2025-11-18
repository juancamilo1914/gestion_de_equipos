const express = require('express');

const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.post('/', agregar);
router.put('/:id', modificar);
router.delete('/:id', eliminar);

async function todos(req, res, next) {
    try {
        const items = await controlador.todos();
        respuesta.succes(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

async function uno(req, res, next) {
    try {
        const items = await controlador.uno(req.params.id);
        respuesta.succes(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

async function agregar(req, res, next) {
    try {
        const items = await controlador.agregar(req.body);
        // Devolvemos el resultado de la inserción para que el frontend pueda usar el ID
        respuesta.succes(req, res, items, 201);
    } catch (err) {
        next(err);
    }
};

async function modificar(req, res, next) {
    try {
        const items = await controlador.modificar(req.params.id, req.body);
        respuesta.succes(req, res, 'Item modificado satisfactoriamente', 200);
    } catch (err) {
        next(err);
    }
};

async function eliminar(req, res, next) {
    try {
        await controlador.eliminar(req.params.id);
        respuesta.succes(req, res, 'Item eliminado satisfactoriamente', 200);
    } catch (err) {
        next(err);
    }
};

module.exports = router;
