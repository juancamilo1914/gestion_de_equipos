const express = require('express');
const config = require('./config');
const morgan = require ('morgan')


//importing routes
const clientes = require('./models/clientes/rutas');
const usuarios = require('./models/usuarios/rutas');
const auth = require('./models/auth/rutas');
const CopiasDeSeguridad = require('./models/CopiasDeSeguridad/rutas');
const impresoras = require('./models/impresoras/rutas');
const licenciamiento = require('./models/licenciamiento/rutas');
const mantenimiento = require('./models/mantenimiento/rutas');
const error = require('./red/errors');

const app = express();

//midlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//config
app.set('port', config.app.port);


//rutes
app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use('/api/CopiasDeSeguridad', CopiasDeSeguridad);
app.use('/api/impresoras', impresoras);
app.use('/api/licenciamiento', licenciamiento);
app.use('/api/mantenimiento', mantenimiento);

app.use(error);


module.exports = app;