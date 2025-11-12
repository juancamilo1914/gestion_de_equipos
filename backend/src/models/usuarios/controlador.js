const TABLA = 'usuarios';
const usuarios = require('.');
const auth = require('../auth');
module.exports = function (dbInyectada){

let db = dbInyectada;

if(!db){
    db = require('../../DB/mysql');
}

function todos(){
    return db.todos(TABLA);
}

function uno(id){
    return db.uno(TABLA, id);
}

async function agregar(body){
    const usuario = {
    id: body.id,
    nombre: body.nombre,
    correo: body.correo, // Añadido campo correo
    activo: body.activo || 1 // Por defecto, activo
}

const respuesta = await db.agregar(TABLA, usuario);

    var insertID = 0;
    if(body.id == 0){
        insertID = respuesta.insertId;
    }else{
        insertID = body.id;
}

var respuesta2 = '';

if(body.usuario || body.contraseña){ // Ajustado a 'contraseña' como viene del frontend
        respuesta2 = await auth.agregar({
        id: insertID,
        usuario: body.usuario,
        password: body.contraseña // Ajustado a 'contraseña'
    })
}

return respuesta2;
}

    function eliminar(body){
    return db.eliminar(TABLA, body);
    }

    async function changePassword(id, oldPassword, newPassword) {
        return auth.actualizar(id, oldPassword, newPassword);
    }


return {
    todos,
    uno,
    agregar,
    eliminar,
    changePassword,
}
}