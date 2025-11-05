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

    async function agregar(body) {
        // Preparar datos para equipos, excluyendo campos que no pertenecen a esta tabla
        const equipoData = { ...body };
        delete equipoData.fecha_ultimo_mantenimiento; // Esta columna pertenece a mantenimiento

        // Agregar equipo a la tabla equipos
        const equipoInsertado = await db.agregar(TABLA, equipoData);
        const equipoId = equipoInsertado.insertId;

        // Sincronizar con mantenimiento: crear entrada inicial
        const mantenimiento = require('../mantenimiento');
        await mantenimiento.agregar({
            usuario: body.nombre_de_usuario_asignado,
            area: body.Area,
            tipo: body.tipo,
            marca: body.marca,
            fecha_ultimo_mantenimiento: body.fecha_ultimo_mantenimiento || '2023-01-01',
            fecha_actual_de_mantenimiento: null,
            firmas: null,
            actividades_realizadas: null,
            observaciones: null,
            fecha_de_elaboracion: null,
            fecha_de_ejecucion: null,
        });

        // Sincronizar con licenciamiento: crear entrada inicial
        const licenciamiento = require('../licenciamiento');
        await licenciamiento.agregar({
            usuario: body.nombre_de_usuario_asignado,
            area: body.Area,
            tipo: body.tipo,
            marca: body.marca,
            descripcion: null,
            software: null,
            version: null,
            fecha_de_adquisicion: null,
            fecha_de_vencimiento: null,
            costo: null,
            proveedor: null,
            observaciones: null,
        });

        // Sincronizar con CopiasDeSeguridad: crear entrada inicial
        const copiasDeSeguridad = require('../CopiasDeSeguridad');
        await copiasDeSeguridad.agregar({
            usuario: body.nombre_de_usuario_asignado,
            area: body.Area,
            tipo: body.tipo,
            marca: body.marca,
            tipo_de_copia: null,
            frecuencia: null,
            ultima_copia: null,
            proxima_copia: null,
            ubicacion: null,
            observaciones: null,
            fecha: null,
        });

        return equipoInsertado;
    }

    function modificar(body) {
        return db.actualizar(TABLA, body.id, body);
    }

    function eliminar(body) {
        return db.eliminar(TABLA, body);
    }

    return {
        todos,
        uno,
        agregar,
        modificar,
        eliminar,
    };
};
