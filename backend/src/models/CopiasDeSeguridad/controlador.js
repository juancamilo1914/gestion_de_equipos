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
        
    };

    if(body.usuario){
        authData.usuario = body.usuario
    }

    return db.agregar(TABLA, authData);
}

function eliminar(body){
    return db.eliminar(TABLA, body);
}


return {
    todos,
    agregar,
    eliminar,
}
}