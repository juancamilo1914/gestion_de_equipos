const TABLA = 'equipos';

module.exports = function (dbInyectada) {
    let db = dbInyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id) {
        return db.uno(TABLA, id);
    }

    function agregar(body) {
        return db.agregar(TABLA, body);
    }

    function modificar(id, body) {
        return db.actualizar(TABLA, id, body);
    }

    function eliminar(id) {
        return db.eliminar(TABLA, { id: id });
    }

    return {
        todos,
        uno,
        agregar,
        modificar,
        eliminar,
    };
};
