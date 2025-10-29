const TABLA = 'licenciamiento';
module.exports = function (dbInyectada){
    let db = dbInyectada;

if(!db){
    db = require('../../DB/mysql');
}

function todos(){
    // db.todos devuelve un array de filas. Mapeamos para exponer solo los campos solicitados.
    return db.todos(TABLA).then(rows => {
        return rows.map(r => ({
            id: r.id,
            usuario: r.usuario,
            area: r.area,
            tipo: r.tipo,
            descripcion: r.descripcion,
        }));
    });
}

function uno(id){
    // db.uno devuelve un array con la(s) fila(s) que coinciden. Normalmente será un array con un elemento.
    return db.uno(TABLA, id).then(result => {
        // Aceptar tanto que result sea un array o un objeto según implementación
        const row = Array.isArray(result) ? result[0] : result;
        if(!row){
            return null;
        }
        return {
            id: row.id,
            usuario: row.usuario,
            area: row.area,
            tipo: row.tipo,
            descripcion: row.descripcion,
            sistema_operativo: row.sistema_operativo,
            software_de_oficina: row.software_de_oficina,
            otro_software: row.otro_software,
        };
    });
}


function agregar(body){
    const authData = {
        id: body.id,
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        descripcion: body.descripcion,
        sistema_operativo: body.sistema_operativo,
        software_de_oficina: body.software_de_oficina,
        otro_software: body.otro_software,
    };

    return db.agregar(TABLA, authData);
}

function modificar(body){
    const authData = {
        id: body.id,
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        descripcion: body.descripcion,
        sistema_operativo: body.sistema_operativo,
        software_de_oficina: body.software_de_oficina,
        otro_software: body.otro_software,
    };

    if(body.usuario){
        authData.usuario = body.usuario
    }

    // Usamos la misma operación que agregar (INSERT ... ON DUPLICATE KEY UPDATE)
    return db.agregar(TABLA, authData);
}

function eliminar(id){
    return db.eliminar(TABLA, id);
}


return {
    todos,
    uno,
    agregar,
    modificar,
    eliminar,
}
}