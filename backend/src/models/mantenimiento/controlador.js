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
            codigo: r.codigo, // Agregado para la lista principal
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
            codigo: row.codigo, // Agregado para los detalles
            fecha_ultimo_mantenimiento: row.fecha_ultimo_mantenimiento,
            fecha_actual_de_mantenimiento: row.fecha_actual_de_mantenimiento,
            firmas_tecnico: row.firmas_tecnico,
            firmas_aprobo: row.firmas_aprobo,
            firmas_reviso: row.firmas_reviso,
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
        equipo_id: body.equipo_id,
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        // 'codigo' no existe en la tabla mantenimiento, lo eliminamos.
        fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento,
        fecha_actual_de_mantenimiento: body.fecha_actual_de_mantenimiento,
        firmas_tecnico: body.firmas_tecnico,
        firmas_aprobo: body.firmas_aprobo,
        firmas_reviso: body.firmas_reviso,
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
        // Construimos el objeto explícitamente para evitar campos no deseados.
        usuario: body.usuario,
        area: body.area,
        tipo: body.tipo,
        // 'codigo' no existe en la tabla mantenimiento, lo eliminamos.
        fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento,
        fecha_actual_de_mantenimiento: body.fecha_actual_de_mantenimiento,
        firmas_tecnico: body.firmas_tecnico,
        firmas_aprobo: body.firmas_aprobo,
        firmas_reviso: body.firmas_reviso,
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

function historialPorEquipo(equipo_id) {
    // Usamos la función query para obtener todos los registros que coincidan con el equipo_id
    return db.query(TABLA, { equipo_id: equipo_id });
}


return {
    todos,
    uno,
    agregar,
    modificar,
    eliminar,
    historialPorEquipo,
}
}