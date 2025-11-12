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
    // 1. Preparamos los datos para la tabla 'usuarios'
    const usuario = {
        // No incluimos el id para que la BD lo genere automáticamente en un nuevo registro.
        nombre: body.nombre,
        correo: body.correo,
        activo: body.activo || 1,
    }

    // 2. Insertamos el nuevo usuario y obtenemos la respuesta de la BD
    const respuestaUsuario = await db.agregar(TABLA, usuario);

    // 3. Obtenemos el ID del usuario recién creado
    let insertID;
    // Si es un registro nuevo (body.id no existe o es 0), usamos el ID de la inserción.
    // Si es una actualización, usamos el ID que viene en el body.
    if (body.id) {
        insertID = body.id;
    } else {
        insertID = respuestaUsuario.insertId;
    }

    // 4. Si se proporcionó un usuario y contraseña, los guardamos en la tabla 'auth'
    if (body.usuario && body.password) {
        await auth.agregar({
            id: insertID,
            usuario: body.usuario,
            password: body.password // Usamos 'password' para ser consistentes con el frontend
        });
    }
    
    return respuestaUsuario;
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