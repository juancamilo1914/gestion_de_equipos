const bcrypt = require('bcrypt');
const auth = require('../../auth');
const TABLA = 'auth';

module.exports = function (dbInyectada){

    let db = dbInyectada;
    
    if(!db){
        db = require('../../DB/mysql');
    }

    async function login(usuario, password){
        const response = await db.query(TABLA, {usuario: usuario});
        const data = response[0]; // Extraemos el primer elemento del array
        console.log('Datos recuperados de la tabla auth para el usuario:', usuario, data);

        // Verificamos que el usuario exista, que tenga una contraseña guardada y que la contraseña del formulario no venga vacía.
        if(!data || !data.password || !password){
            throw new Error('Usuario o contraseña inválidos');
        }

        const sonIguales = await bcrypt.compare(password, data.password);

        if(sonIguales !== true){
            throw new Error('Usuario o contraseña inválidos');
        }
        
        // Si todo es correcto, generamos y devolvemos el token
        return auth.asignarToken({...data});
    }

    async function agregar(data){
        console.log('data',data)

        const authData = {
        id: data.id,
    }

    if(data.usuario){
        authData.usuario = data.usuario
    }

    if(data.password){
        authData.password = await bcrypt.hash(data.password.toString(), 10); // Aumentado el cost factor
    }
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

        const newPasswordHashed = await bcrypt.hash(newPassword, 10); // Aumentado el cost factor

        return db.actualizar(TABLA, id, { password: newPasswordHashed });
    }

    async function forgotPassword(correo) {
        // TODO: Buscar el usuario por correo en la tabla 'usuarios'
        // TODO: Generar un token de reseteo único y con expiración
        // TODO: Guardar el token en la base de datos asociado al usuario
        // TODO: Enviar un email al usuario con un enlace para resetear la contraseña (ej: /reset-password?token=...)
        console.log(`Solicitud de recuperación para el correo: ${correo}`);
        return { message: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.' };
    }

    return {
        agregar,
        login,
        actualizar,
        forgotPassword,
    }
}