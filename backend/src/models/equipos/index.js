const db = require('../../DB/supabase');
const ctrl = require('./controlador');

module.exports = ctrl(db);
