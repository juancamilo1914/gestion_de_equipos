const respuesta = require('./respuestas');

function errors(err, req, res, next){
    console.error('[error', err);

    const mensaje = err.message || 'Error interno';
    const status = err.statusCode || 500;

    respuesta.error(req, res, mensaje, status);
}

module.exports = errors;