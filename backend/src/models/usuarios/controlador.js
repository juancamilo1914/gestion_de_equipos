const TABLA = 'usuarios';
const auth = require('../auth');

module.exports = function (dbInyectada) {

    let db = dbInyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function todos() {
        return new Promise((resolve, reject) => {
            db.conexion.query(`SELECT u.id, u.nombre, u.correo, a.usuario FROM usuarios u JOIN auth a ON u.id = a.id`, (error, result) => {
                return error ? reject(error) : resolve(result);
            });
        });
    }

    function uno(id) {
        return new Promise((resolve, reject) => {
            db.conexion.query(`SELECT u.id, u.nombre, u.correo, a.usuario FROM usuarios u JOIN auth a ON u.id = a.id WHERE u.id = ?`, [id], (error, result) => {
                return error ? reject(error) : resolve(result[0] || null);
            });
        });
    }

    async function agregar(body) {
        const usuario = {
            id: body.id,
            nombre: body.nombre,
            correo: body.correo,
            // No guardamos la contraseña en la tabla de usuarios
        }

        const respuesta = await db.agregar(TABLA, usuario);

        await auth.agregar({
            id: respuesta.insertId, // Usamos el ID del usuario recién creado
            usuario: body.usuario,
            password: body.password,
        });

        return respuesta;
    }

    async function actualizar(id, body) {
        const usuarioData = {
            nombre: body.nombre,
            correo: body.correo,
        };

        await db.actualizar(TABLA, id, usuarioData);

        if (body.usuario || body.password) {
            const authData = {};
            if (body.usuario) authData.usuario = body.usuario;
            if (body.password) authData.password = await require('bcrypt').hash(body.password.toString(), 5);
            await db.actualizar('auth', id, authData);
        }

        return { message: 'Usuario actualizado correctamente' };
    }

    async function changePassword(id, oldPassword, newPassword) {
        // Implementar lógica para cambiar contraseña
        // Verificar oldPassword, hashear newPassword, actualizar en auth
        const authRecord = await db.uno('auth', id);
        if (!authRecord) throw new Error('Usuario no encontrado');

        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(oldPassword, authRecord.password);
        if (!isValid) throw new Error('Contraseña antigua incorrecta');

        const hashedNewPassword = await bcrypt.hash(newPassword, 5);
        await db.actualizar('auth', id, { password: hashedNewPassword });

        return { message: 'Contraseña cambiada correctamente' };
    }

    async function eliminar(id) {
        await db.eliminar(TABLA, { id: id });
        await db.eliminar('auth', { id: id });
        return { message: 'Usuario eliminado correctamente' };
    }

    return { todos, uno, agregar, actualizar, eliminar, changePassword };
} 
