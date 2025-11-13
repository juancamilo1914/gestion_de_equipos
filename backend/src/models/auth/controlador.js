const { supabaseClient, supabaseServiceClient } = require('../../config');

const TABLA_USUARIOS = 'usuarios';

async function register(data) {
    const { correo, password, ...profileData } = data;

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: correo,
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
    // Usamos el service role client para insertar en la tabla pública
    // Nota: La tabla 'usuarios' usa un ID numérico (int8), no el UUID de auth
    // Por ahora, omitimos el 'id' para que la BD lo genere automáticamente
    const clientToUse = supabaseServiceClient || supabaseClient;
    const { error: profileError } = await clientToUse
        .from(TABLA_USUARIOS)
        .insert({
            // id: authData.user.id, // Omitido porque es int8, no UUID
            correo: authData.user.email,
            nombre: profileData.usuario, // Mapeamos 'usuario' a 'nombre'
            activo: 1, // Valor por defecto
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