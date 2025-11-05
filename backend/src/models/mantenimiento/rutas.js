const express = require('express');
const multer = require('multer');

const respuesta = require('../../red/respuestas')
const controlador = require('./index');

const router = express.Router();

// Configurar multer para subir archivos
const storage = multer.memoryStorage(); // Almacenar en memoria para convertir a base64
const upload = multer({ storage: storage });

router.get('/', todos);
router.get ('/:id', uno);
router.post('/', agregar);
router.put('/:id', modificar); // Agregar middleware para subir archivo en PUT
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
        let body = req.body;

        // Si hay un archivo subido, convertirlo a base64 y agregarlo a firmas
        if (req.file) {
            const base64 = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;
            const dataURL = `data:${mimeType};base64,${base64}`;

            // Parsear firmas si es string, o inicializar como objeto
            let firmas = {};
            if (body.firmas) {
                try {
                    firmas = typeof body.firmas === 'string' ? JSON.parse(body.firmas) : body.firmas;
                } catch (e) {
                    console.error('Error parsing firmas:', e);
                }
            }

            // Agregar la firma al objeto firmas
            firmas.tecnico = dataURL;
            body.firmas = JSON.stringify(firmas);
        }

        const items = await controlador.modificar(req.params.id, body);
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