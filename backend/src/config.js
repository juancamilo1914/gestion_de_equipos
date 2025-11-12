require ('dotenv').config();

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
    },
}