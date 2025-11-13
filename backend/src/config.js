require ('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = {
    app: {
        port: process.env.PORT || 4000,
    },
    jwt:{
        secret: process.env.JWT_SECRET || 'notasecreta!'
    },
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    // Exportar el cliente de Supabase ya inicializado
    supabaseClient: createClient(
        process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY
    ),
    // Cliente con service role para operaciones administrativas
    supabaseServiceClient: process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
        process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY
    ) : null,
}
