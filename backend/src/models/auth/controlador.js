const { supabaseClient, supabaseServiceClient } = require('../../config');
const db = require('../../DB/supabase');
const auth = require('../../auth');

const TABLA_USUARIOS = 'usuarios';
const TABLA_AUTH = 'auth';

async function register(data) {
    const { correo, password, usuario, nombre, role } = data;

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
            nombre: nombre,
            activo: 1, // Valor por defecto
        });

    if (profileError) {
        console.error('Supabase Profile Error:', profileError);
        console.error('Profile Error Details:', JSON.stringify(profileError, null, 2));
        // Opcional: Si falla la creación del perfil, se podría eliminar el usuario de auth para mantener la consistencia.
        // await supabaseClient.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Error al crear perfil: ${profileError.message || profileError.details || JSON.stringify(profileError)}`);    }

    // 3. Obtener el ID del usuario recién creado para guardar en tabla auth
    // Necesitamos consultar la tabla usuarios para obtener el ID generado
    const { data: userData, error: userQueryError } = await clientToUse
        .from(TABLA_USUARIOS)
        .select('id')
        .eq('correo', authData.user.email)
        .single();

    if (userQueryError || !userData) {
        console.error('Error al obtener ID del usuario:', userQueryError);
        throw new Error('Usuario creado pero no se pudo obtener su ID para guardar credenciales.');
    }

    // 4. Guardar usuario y password en la tabla 'auth' directamente
    try {
        await db.agregar(TABLA_AUTH, {
            id: userData.id,
            usuario: usuario,
            password: password
        });
    } catch (authError) {
        console.error('Error al guardar credenciales en tabla auth:', authError);
        // Opcional: Si falla, podríamos eliminar el usuario creado
        throw new Error('Usuario creado pero no se pudieron guardar las credenciales de acceso.');
    }

    return { message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar la cuenta.' };
}

async function login(data) {
    const { usuario, password } = data;

    if (!usuario || !password) {
        throw new Error('Usuario y contraseña son requeridos.');
    }

    // Buscar en la tabla 'auth' por usuario y password
    const authRecords = await db.query(TABLA_AUTH, { usuario, password });

    if (!authRecords || authRecords.length === 0) {
        throw new Error('Usuario o contraseña incorrectos.');
    }

    const userAuth = authRecords[0];
    const userId = userAuth.id;

    // Obtener datos adicionales del usuario de la tabla 'usuarios'
    const userData = await db.uno(TABLA_USUARIOS, userId);

    if (!userData) {
        throw new Error('Usuario no encontrado.');
    }

    // Generar token JWT
    const token = auth.asignarToken({
        id: userId,
        usuario: usuario,
        nombre: userData.nombre,
        correo: userData.correo
    });

    return token;
}

module.exports = {
    register,
    login,
};
