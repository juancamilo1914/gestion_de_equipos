const TABLA = 'CopiasDeSeguridad';
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
        id: body.id,
        area: body.area,
        tipo: body.tipo,
        marca: body.marca,
        fecha: body.fecha,
    };

    if(body.usuario){
        authData.usuario = body.usuario
    }

    return db.agregar(TABLA, authData);
}

function modificar(body){
    // reutilizamos la misma estructura que en `agregar` para hacer un upsert.
    const authData = {
        id: body.id,
        area: body.area,
        tipo: body.tipo,
        marca: body.marca,
        fecha: body.fecha,
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