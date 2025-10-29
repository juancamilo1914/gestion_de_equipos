const TABLA = 'mantenimiento';
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
            fecha_ultimo_mantenimiento: r.fecha_ultimo_mantenimiento,
            fecha_actual_de_mantenimiento: r.fecha_actual_de_mantenimiento,
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
            fecha_ultimo_mantenimiento: row.fecha_ultimo_mantenimiento,
            fecha_actual_de_mantenimiento: row.fecha_actual_de_mantenimiento,
            firmas: row.firmas,
            marca: row.marca,
            actividades_realizadas: row.actividades_realizadas,
            observaciones: row.observaciones,
            fecha_de_elaboracion: row.fecha_de_elaboracion,
            fecha_de_ejecucion: row.fecha_de_ejecucion,
        };
    });
}


function agregar(body){
    const authData = {
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento,
        fecha_actual_de_mantenimiento: body.fecha_actual_de_mantenimiento,
        firmas: body.firmas,
        marca: body.marca,
        actividades_realizadas: body.actividades_realizadas,
        observaciones: body.observaciones,
        fecha_de_elaboracion: body.fecha_de_elaboracion,
        fecha_de_ejecucion: body.fecha_de_ejecucion,
    };

    return db.agregar(TABLA, authData);
}

function modificar(id, body){
    const authData = {
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento,
        fecha_actual_de_mantenimiento: body.fecha_actual_de_mantenimiento,
        firmas: body.firmas,
        marca: body.marca,
        actividades_realizadas: body.actividades_realizadas,
        observaciones: body.observaciones,
        fecha_de_elaboracion: body.fecha_de_elaboracion,
        fecha_de_ejecucion: body.fecha_de_ejecucion,
    };

    // Usamos UPDATE para modificar el registro existente
    return db.actualizar(TABLA, id, authData);
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