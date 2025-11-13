const { supabaseClient } = require('../../config');

const TABLA_USUARIOS = 'usuarios';

async function register(data) {
    const { email, password, ...profileData } = data;

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        console.error('Supabase Auth Error:', authError);
        // Lanzamos el error para que sea capturado por el manejador de errores
        throw new Error(authError.message || 'Error al registrar el usuario en Supabase Auth.');
    }

    if (!authData.user) {
        throw new Error('El registro no devolvió un usuario, pero no hubo error. Revisa la configuración de Supabase.');
    }

    // 2. Guardar información adicional en la tabla pública 'usuarios'
    // Usamos el ID del usuario de auth para vincular el perfil.
    const { error: profileError } = await supabaseClient
        .from(TABLA_USUARIOS)
        .insert({
            id: authData.user.id, // Llave foránea que apunta a auth.users.id
            email: authData.user.email,
            usuario: profileData.usuario,
            // ... puedes agregar otros campos del perfil aquí
        });

    if (profileError) {
        console.error('Supabase Profile Error:', profileError);
        // Opcional: Si falla la creación del perfil, se podría eliminar el usuario de auth para mantener la consistencia.
        // await supabaseClient.auth.admin.deleteUser(authData.user.id);
        throw new Error('El usuario fue autenticado, pero no se pudo crear su perfil.');
    }

    return { message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar la cuenta.' };
}

module.exports = {
    register,
};