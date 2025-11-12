const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const error = require('../red/errors');

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Anon Key must be provided in config or .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function handleSupabaseError(supabaseResponse) {
    if (supabaseResponse.error) {
        console.error('Supabase Error:', supabaseResponse.error);
        throw error(supabaseResponse.error.message, 500);
    }
    return supabaseResponse.data;
}

async function todos(tabla) {
    const response = await supabase.from(tabla).select('*');
    return handleSupabaseError(response);
}

async function uno(tabla, id) {
    const response = await supabase.from(tabla).select('*').eq('id', id).single();
    return handleSupabaseError(response);
}

async function query(tabla, consulta) {
    const response = await supabase.from(tabla).select('*').match(consulta);
    return handleSupabaseError(response);
}

async function agregar(tabla, data) {
    // upsert se encarga de insertar si no existe, o actualizar si ya existe (basado en la primary key)
    const response = await supabase.from(tabla).upsert(data).select().single();
    
    // La respuesta de upsert en Supabase es el objeto insertado/actualizado.
    // Para mantener una estructura similar a la respuesta de MySQL (con insertId),
    // podrías devolver algo como esto si es un nuevo registro.
    // Sin embargo, el controlador `usuarios` ya maneja la obtención del ID.
    // Devolver el dato es más útil con Supabase.
    const dataResponse = await handleSupabaseError(response);
    
    // Para simular la respuesta de MySQL que espera el controlador de usuarios
    if (data.id) { // Es una actualización
        return { changedRows: 1 };
    } else { // Es una inserción
        return { insertId: dataResponse.id };
    }
}

async function eliminar(tabla, id) {
    const response = await supabase.from(tabla).delete().eq('id', id);
    return handleSupabaseError(response);
}

async function actualizar(tabla, id, data) {
    const response = await supabase.from(tabla).update(data).eq('id', id);
    return handleSupabaseError(response);
}


module.exports = {
    todos,
    uno,
    query,
    agregar,
    eliminar,
    actualizar,
};