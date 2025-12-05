# GuateServiciosSeguros - Backend

API REST para la plataforma de servicios y técnicos confiables en Guatemala, construida con Node.js, Express y PostgreSQL.

## Descripción

Backend que gestiona:
- **Autenticación de usuarios** (registro, login con JWT)
- **Perfiles de técnicos** (listado, filtrado, detalles)
- **Servicios** (ofrecidos por técnicos)
- **Reseñas y calificaciones**
- **Seguridad** (helmet, rate limiting, SQL injection prevention, CORS)

## Stack Tecnológico

- **Runtime**: Node.js 18+ (Alpine)
- **Framework**: Express 5
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT (jsonwebtoken)
- **Seguridad**: helmet, express-rate-limit, express-validator, bcryptjs
- **ORM/Query**: pg (node-postgres) con parameterized queries

## Requisitos Previos

- Node.js 18+
- pnpm (o npm)
- Docker & Docker Compose (opcional, para ejecutar localmente con DB)
- PostgreSQL 13+ (o Neon account)

## Setup Local

### 1. Clonar el repositorio

```bash
git clone git@github.com:giobok10/GuateServiciosSeguros-backend.git
cd GuateServiciosSeguros-backend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y rellena los valores reales:

```bash
cp .env.example .env
```

**Variables requeridas:**
- `DATABASE_URL`: Connection string de PostgreSQL (ej: `postgresql://user:pass@host:port/dbname?sslmode=require`)
- `JWT_SECRET`: Cadena aleatoria larga para firmar tokens (ej: `openssl rand -hex 64`)
- `FRONTEND_URL`: URL del frontend para CORS (default: `http://localhost:5173`)
- `PORT`: Puerto del servidor (default: `3000`)
- `JWT_EXPIRES_IN`: Expiración del token (default: `1h`)

### 4. Inicializar la base de datos

Si usas Docker Compose con Neon:

```bash
docker compose up -d
```

Si usas una DB local, ejecuta el schema:

```bash
psql -U <user> -d <dbname> -f db/schema.sql
```

### 5. Poblar datos de demostración (opcional)

```bash
pnpm run seed
```

### 6. Iniciar el servidor

```bash
pnpm start
```

O para desarrollo con auto-reload:

```bash
pnpm run dev
```

Servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `pnpm start` — Inicia el servidor en producción
- `pnpm run dev` — Inicia en desarrollo (requiere `nodemon`)
- `pnpm run seed` — Carga datos de demostración en la DB
- `pnpm run clean-db` — Borra todos los datos (trunca tablas)
- `pnpm run db-checks` — Verifica el estado de la base de datos

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` — Registrar nuevo usuario
- `POST /api/v1/auth/login` — Login e obtener JWT

### Técnicos
- `GET /api/v1/technicians` — Listar técnicos (filtrable por categoría/búsqueda)
- `GET /api/v1/technicians/:id` — Detalles de un técnico (servicios, reseñas)
- `GET /api/v1/technicians/me` — Perfil del técnico autenticado (protegido)

### Reseñas
- `POST /api/v1/reviews` — Crear una reseña (protegido)

### Servicios
- `POST /api/v1/technicians/:id/services` — Añadir un servicio (protegido)

### Health
- `GET /healthz` — Estado del servidor

Ver `src/routes/*` para la documentación completa de cada endpoint.

## Seguridad

- ✅ **JWT Authentication**: tokens con expiración configurable
- ✅ **Rate Limiting**: 200 requests/15min por IP
- ✅ **Helmet**: headers de seguridad HTTP
- ✅ **CORS**: origen del frontend configurado
- ✅ **Parameterized Queries**: protección contra SQL injection
- ✅ **Password Hashing**: bcryptjs (salt rounds: 10)
- ✅ **Input Validation**: express-validator en rutas protegidas

## Estructura del Proyecto

```
.
├── src/
│   ├── controllers/       # Lógica de negocio
│   ├── routes/            # Definición de endpoints
│   ├── middlewares/       # Auth, validación
│   ├── db/                # Conexión a DB
│   └── index.js           # Entry point
├── db/
│   └── schema.sql         # Schema de base de datos
├── scripts/
│   ├── seed.js            # Poblar datos demo
│   ├── clean.js           # Truncar tablas
│   ├── checks.js          # Verificar estado DB
│   └── backfill_technicians.js  # Crear perfiles por defecto
├── docker-compose.yml     # Orquestación Docker
├── Dockerfile             # Build de imagen
├── .env.example           # Plantilla de variables
└── package.json           # Dependencias
```

### Docker

```bash
docker build -t guate-backend:latest .
docker run -d \
  -p 3001:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e FRONTEND_URL="https://tu-frontend.com" \
  guate-backend:latest
```

## Desarrollo

### Agregar un nuevo endpoint

1. Crea o edita un archivo en `src/controllers/`
2. Crea o edita un archivo en `src/routes/`
3. Importa la ruta en `src/index.js`
4. Prueba con curl o Postman

### Variables de entorno para desarrollo

```bash
DATABASE_URL=postgresql://localhost/guate_dev
JWT_SECRET=dev_secret_12345
FRONTEND_URL=http://localhost:5173
PORT=3000
```

## Testing

Consulta `TESTS.md` en la raíz del proyecto para un plan de pruebas completo (smoke, API, DB, seguridad).
 
## Licencia

MIT

## Contacto

Proyecto GuateServicios — [GitHub](https://github.com/giobok10)
