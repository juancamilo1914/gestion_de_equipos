const jwt = require('jsonwebtoken');
const config = require('../config');
const error = require('../middleware/errors');

const secret = config.jwt.secret;

function asignarToken(data){
    return jwt.sign(data, secret)
}

function verificarToken(token){
    return jwt.verify(token, secret)
}

const chequearToken = {
    confirmarToken: function(req){
        const decodificado = decodificarCabecera(req);
    }
}

function obtenerToken(autorizacion){
    if(!autorizacion){
        throw new error('No viene token', 401);
    }

    if(autorizacion.indexOf('Bearer') === -1){
        throw new error('Formato invalido', 401)
    }

    let token = autorizacion.replace('Bearer ', '')
    return token;
}

function decodificarCabecera(req){
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado;

    return decodificado;
}

module.exports = {
    asignarToken,
    chequearToken
}