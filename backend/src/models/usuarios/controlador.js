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
    activo: body.activo
}

const respuesta = await db.agregar(TABLA, usuario);

    var insertID = 0;
    if(body.id == 0){
        insertID = respuesta.insertId;
    }else{
        insertID = body.id;
}

var respuesta2 = '';

if(body.usuario || body.password){
        respuesta2 = await auth.agregar({
        id: insertID,
        usuario: body.usuario,
        password: body.password
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