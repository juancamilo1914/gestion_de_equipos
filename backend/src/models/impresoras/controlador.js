const TABLA = 'impresoras';
module.exports = function (dbInyectada){

    let db = dbInyectada;

if(!db){
    db = require('../../DB/mysql');
}

function todos(){
    return db.todos(TABLA);
}

function agregar(body){
    const authData = {
        area: body.area,
        modelo: body.modelo,
        direccion_IP: body.direccion_IP,
        novedad: body.novedad
    };

    if(body.usuario){
        authData.usuario = body.usuario
    }

    return db.agregar(TABLA, authData);
}

function modificar(body){
    // reutilizamos la misma estructura que en `agregar` para hacer un upsert.
    const authData = {
        area: body.area,
        modelo: body.modelo,
        direccion_IP: body.direccion_IP,
        novedad: body.novedad
    };

    if(body.usuario){
        authData.usuario = body.usuario
    }

    return db.agregar(TABLA, authData);
}

function eliminar(id){
    return db.eliminar(TABLA, id);
}


return {
    todos,
    agregar,
    modificar,
    eliminar,
}
}