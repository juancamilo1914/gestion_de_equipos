const mysql = require('mysql');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}

let conexion;

function conMysql(){
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err) => {
        if(err){
            console.log('[db err]', err);
            setTimeout(conMysql, 200);
        } else {
            console.log('DB conectada!!!');
        }
    });

    conexion.on('error', err => {
        console.log('[DB err]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conMysql();
        }else{
            throw err;
        }
    })
}
conMysql();

function todos(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function uno(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id =${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function agregar(tabla, data){
    // Se modifica la consulta para que sea un INSERT simple.
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function eliminar(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, id, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function query(tabla, consulta){
    return new Promise( (resolve, reject) => {
        const keys = Object.keys(consulta);
        const values = Object.values(consulta);
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        conexion.query(`SELECT * FROM ${tabla} WHERE ${whereClause}`, values, (error, result) => {
            return error ? reject(error) : resolve(result[0] || null);
        })
    });
}

function actualizar(tabla, id, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, id], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    query,
    actualizar,
    conexion,
}
