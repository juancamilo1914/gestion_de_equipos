const TABLA = 'equipos';

module.exports = function (dbInyectada) {
    let db = dbInyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    function todos() {
        // Mapeamos los nombres de las columnas de la BD a los que espera el frontend
        return db.todos(TABLA).then(equipos => {
            return equipos.map(equipo => ({
                id: equipo.id,
                usuario: equipo.nombre_de_usuario_asignado,
                area: equipo.Area,
                tipo: equipo.tipo,
                marca: equipo.marca,
                codigo: equipo.codigo_de_equipo
            }));
        });
    }

    function uno(id) {
        // Hacemos lo mismo para un solo registro
        return db.uno(TABLA, id).then(equipos => {
            const equipo = equipos[0];
            if (!equipo) return null;
            return {
                id: equipo.id,
                usuario: equipo.nombre_de_usuario_asignado,
                area: equipo.Area,
                tipo: equipo.tipo,
                marca: equipo.marca,
                codigo: equipo.codigo_de_equipo
            };
        });
    }

    function agregar(body) {
        // Mapeamos los datos del frontend a los nombres de columna de la BD
        const equipo = {
            nombre_de_usuario_asignado: body.usuario,
            Area: body.area,
            tipo: body.tipo,
            marca: body.marca,
            codigo_de_equipo: body.codigo,
        };
        return db.agregar(TABLA, equipo);
    }

    function modificar(id, body) {
        // La función de modificar también necesita mapear los campos
        const equipo = {
            nombre_de_usuario_asignado: body.usuario,
            Area: body.area,
            tipo: body.tipo,
            marca: body.marca,
            codigo_de_equipo: body.codigo,
        };
        return db.actualizar(TABLA, id, equipo);
    }

    function eliminar(id) {
        return db.eliminar(TABLA, id);
    }

    return { todos, uno, agregar, modificar, eliminar };
}