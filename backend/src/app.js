const express = require('express');
const config = require('./config');
const morgan = require ('morgan');
const cors = require('cors');


//importing routes
const clientes = require('./models/clientes/rutas');
const usuarios = require('./models/usuarios/rutas');
const auth = require('./models/auth/rutas');
const CopiasDeSeguridad = require('./models/CopiasDeSeguridad/rutas');
const impresoras = require('./models/impresoras/rutas');
const licenciamiento = require('./models/licenciamiento/rutas');
const mantenimiento = require('./models/mantenimiento/rutas');
const recordatorios = require('./models/recordatorios/rutas');
const equipos = require('./models/equipos/rutas');
const error = require('./red/errors');

const app = express();

//midlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: "http://localhost:5173" }));


//config
app.set('port', config.app.port);

//rutas frontend
// Nota: evitar mezclar import/require. Las rutas de usuarios ya se requieren arriba
// por lo que no es necesario re-importarlas con sintaxis ESM.

//rutes
app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use('/api/CopiasDeSeguridad', CopiasDeSeguridad);
app.use('/api/impresoras', impresoras);
app.use('/api/licenciamiento', licenciamiento);
app.use('/api/mantenimiento', mantenimiento);
app.use('/api/recordatorios', recordatorios);
app.use('/api/equipos', equipos);

app.use(error);


module.exports = app;