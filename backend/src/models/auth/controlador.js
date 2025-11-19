const bcrypt = require('bcrypt');
const auth = require('../../auth');
const TABLA = 'auth';

module.exports = function (dbInyectada){

    let db = dbInyectada;
    
    if(!db){
        db = require('../../DB/mysql');
    }

    async function login(usuario, password){
        const data = await db.query(TABLA, {usuario: usuario});

        if(!data || !data.password){
            throw new Error('Usuario o contraseña inválidos');
        }

        return bcrypt.compare(password, data.password)
            .then(resultado => {
                if(resultado === true){
                    // generar token
                    return auth.asignarToken({...data});
                }else{
                    throw new Error('Usuario o contraseña inválidos');
                }
            })
    }

    async function agregar(data){
        // Asegurarse de que usuario y contraseña sean proporcionados para la autenticación
        if (!data.usuario || !data.password) {
            throw new Error('Usuario y contraseña son requeridos para la autenticación.');
        }

        const authData = {
            id: data.id,
            usuario: data.usuario,
            // Siempre hashear la contraseña, ya que se ha validado que existe
            password: await bcrypt.hash(data.password.toString(), 5),
        };
        
        // El campo 'contraseña' siempre se enviará al DB con un valor hasheado
        return db.agregar(TABLA, authData);
    }

    async function actualizar(id, oldPassword, newPassword) {
        const data = await db.query(TABLA, { id: id });
        if (!data) {
            throw new Error('Auth data not found');
        }

        const passwordCorrecto = await bcrypt.compare(oldPassword, data.password);

        if (!passwordCorrecto) {
            throw new Error('Contraseña actual incorrecta');
        }

        const newPasswordHashed = await bcrypt.hash(newPassword, 5);

        return db.actualizar(TABLA, id, { password: newPasswordHashed });
    }

    async function eliminar(id) {
        return db.eliminar(TABLA, { id: id });
    }

    return {
        agregar,
        login,
        actualizar,
        eliminar,
    }
}