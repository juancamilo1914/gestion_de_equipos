
# 📘 Documentación del Proyecto: Gestión de Equipos

## 🧩 Descripción General
El proyecto **Gestión de Equipos** es una API desarrollada con **Node.js y Express** para la administración de equipos tecnológicos, usuarios, clientes y copias de seguridad.  
Permite registrar, actualizar, eliminar y consultar información de manera estructurada mediante peticiones HTTP.

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/juancamilo1914/gestion_de_equipos.git
cd gestion_de_equipos/backend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales de base de datos:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=gestion_equipos
PORT=3000
```

> Asegúrate de tener la base de datos creada antes de iniciar el servidor.

### 4. Iniciar el Servidor
```bash
npm start
```
El servidor se iniciará en `http://localhost:3000` (o el puerto definido en `.env`).

---

## 🗂️ Estructura del Proyecto
```
gestion_de_equipos/
├── backend/
│   ├── src/
│   │   ├── config.js          # Configuración general y conexión BD
│   │   ├── models/            # Modelos de datos (Usuarios, Clientes, Equipos...)
│   │   ├── routes/            # Definición de endpoints de la API
│   │   ├── controllers/       # Lógica de negocio de cada módulo
│   │   └── app.js             # Configuración del servidor Express
│   ├── package.json           # Dependencias y scripts
│   └── README.md
└── DOCUMENTATION.md
```

---

## 📦 Dependencias Principales
- **express** — Framework web principal  
- **cors** — Permite peticiones entre dominios  
- **mysql2** o **mongoose** — Conexión a la base de datos (dependiendo del motor usado)  
- **dotenv** — Manejo de variables de entorno  
- **nodemon** (dev) — Recarga automática en desarrollo

---

## 🧠 Modelos Principales

### 🧍 Usuario
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | INT | Identificador único |
| nombre | VARCHAR | Nombre completo del usuario |
| correo | VARCHAR | Email del usuario |
| contraseña | VARCHAR | Contraseña encriptada |
| rol | ENUM | Rol asignado (admin, técnico, etc.) |

### 🖥️ Equipo
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | INT | Identificador del equipo |
| codigo | VARCHAR | Código único del equipo |
| marca | VARCHAR | Marca o fabricante |
| tipo | VARCHAR | Tipo de equipo (PC, portátil, etc.) |
| area | VARCHAR | Área a la que pertenece |
| fechaElaboracion | DATE | Fecha de registro o elaboración |

### 💾 Copia de Seguridad
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | INT | Identificador |
| equipoId | INT | Relación con equipo |
| usuarioId | INT | Relación con usuario |
| fecha | DATETIME | Fecha de la copia |
| observaciones | TEXT | Comentarios o notas |

---

## 🌐 Endpoints Principales

### 🔐 Autenticación
```
POST /api/auth/login
POST /api/auth/register
```

### 👥 Usuarios
```
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

### 💻 Equipos
```
GET    /api/equipos
POST   /api/equipos
PUT    /api/equipos/:id
DELETE /api/equipos/:id
```

### 💾 Copias de Seguridad
```
GET    /api/CopiasDeSeguridad
POST   /api/CopiasDeSeguridad
DELETE /api/CopiasDeSeguridad/:id
```

---

## 🧪 Ejemplo de Petición
```bash
curl -X POST http://localhost:3000/api/equipos   -H "Content-Type: application/json"   -d '{"codigo":"EQ123","marca":"Dell","tipo":"Portátil","area":"TI"}'
```

---

## 🧰 Comandos Útiles
| Comando | Descripción |
|----------|-------------|
| `npm install` | Instala las dependencias |
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia el servidor en modo desarrollo (con nodemon) |

---

## 🧾 Recomendaciones
- Usa un archivo `.env` para las credenciales sensibles.  
- Realiza respaldos frecuentes de la base de datos.  
- Documenta nuevos endpoints con herramientas como **Swagger** o **Postman**.  
- Implementa logs de errores y validaciones en producción.

---

## 🧱 Próximas Mejoras
- Sistema de roles y permisos avanzado.  
- Exportar e importar datos desde Excel.  
- Dashboard web para gestión visual.  
- Integración con servicios de notificación.

---

## 👨‍💻 Autor
**Juan Camilo Valencia**  
📧 [GitHub](https://github.com/juancamilo1914)

---
© 2025 Gestión de Equipos — Proyecto educativo y administrativo.
