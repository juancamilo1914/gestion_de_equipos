const TABLA = 'recordatorios'

module.exports = function (dbInyectada){
    let db = dbInyectada
    if(!db){
        db = require('../../DB/mysql')
    }

    async function listar(){
        return db.todos(TABLA)
    }

    async function agregar(data){
        const record = {
            id: data.id,
            title: data.title,
            date: data.date,
            realizado: data.realizado ? data.realizado : 0,
        }

        return db.agregar(TABLA, record)
    }

    async function actualizar(id, data){
        const record = {
            id: id,
        }

        if(data.title !== undefined) record.title = data.title
        if(data.date !== undefined) record.date = data.date
        if(data.realizado !== undefined) record.realizado = data.realizado

        return db.agregar(TABLA, record)
    }

    async function eliminar(id){
        return db.eliminar(TABLA, { id })
    }

    return {
        listar,
        agregar,
        actualizar,
        eliminar,
    }
}
