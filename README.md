# gestion_de_equipos

Este proyecto es una API para gestionar equipos, usuarios y copias de seguridad en una organización.

## 1. Clonar el repositorio

Primero, descarga el proyecto desde GitHub:

```bash
git clone https://github.com/tu-usuario/gestion_de_equipos.git
cd gestion_de_equipos/backend
```

## 2. Instalar dependencias

Instala las librerías necesarias con:

```bash
npm install
```

## 3. Configuración

Revisa el archivo `src/config.js` para ajustar el puerto y otros parámetros si lo necesitas.

## 4. Ejecutar el servidor

Inicia la API con:

```bash
npm start
```
o
```bash
node src/index.js
```

## 5. Estructura del proyecto

- **app.js**: Configura la aplicación, los middlewares y las rutas.
- **models/**: Carpeta con los modelos y rutas de cada entidad (usuarios, clientes, copias de seguridad).
- **red/errors.js**: Manejo de errores globales.

## 6. ¿Cómo funciona cada parte?

### app.js

- Usa **Express** para crear el servidor.
- Usa **Morgan** para mostrar las peticiones en consola.
- Usa **express.json** y **express.urlencoded** para leer datos enviados por los clientes.
- Conecta las rutas principales:
  - `/api/clientes`: Para gestionar clientes.
  - `/api/usuarios`: Para gestionar usuarios.
  - `/api/auth`: Para autenticación y seguridad.
  - `/api/CopiasDeSeguridad`: Para gestionar copias de seguridad de los equipos.

### Ejemplo de flujo

1. Un usuario se registra o inicia sesión usando `/api/usuarios` o `/api/auth`.
2. Se pueden agregar clientes con `/api/clientes`.
3. Se pueden registrar copias de seguridad de equipos con `/api/CopiasDeSeguridad`.

### Variables principales

- **config.app.port**: Define el puerto donde corre el servidor.
- **clientes, usuarios, auth, CopiasDeSeguridad**: Son las rutas que conectan con los modelos y la base de datos.
- **error**: Middleware que captura y muestra los errores.

## 7. Ejemplo de uso

Para agregar una copia de seguridad, puedes hacer una petición POST como esta:

```bash
curl -X POST http://localhost:3000/api/CopiasDeSeguridad \
-H "Content-Type: application/json" \
-d '{"codigoEquipo":"EQ123","usuario":"<id_usuario>","area":"TI","tipo":"Portátil","marca":"Dell","fechaElaboracion":"2025-10-14"}'
```

## 8. ¿Cómo están conectadas las partes?

- **app.js** importa las rutas y las conecta con Express.
- Cada ruta importa su modelo y define cómo interactuar con la base de datos.
- Los modelos definen la estructura de los datos (por ejemplo, qué información tiene un usuario o una copia de seguridad).
- El middleware de errores captura cualquier problema y lo muestra de forma clara.
