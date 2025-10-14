const express = require('express');
const config = require('./config');
const morgan = require ('morgan')


//importing routes
const clientes = require('./models/clientes/rutas');
const usuarios = require('./models/usuarios/rutas');
const auth = require('./models/auth/rutas');
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

app.use(error);


module.exports = app;