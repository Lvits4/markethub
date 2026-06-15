# MarketHub
Marketplace web para explorar tiendas, catálogo, carrito, favoritos y pedidos, con paneles para **vendedores** y **administración**. 

## Stack
| Parte      | Tecnologías principales |
| ---------- | ----------------------- |
| **Backend** | NestJS 11, TypeORM, PostgreSQL, JWT (Passport), Swagger, almacenamiento configurable (`s3-client-dtb`) |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, TanStack Query, React Router (HashRouter) |

## Requisitos previos
- **Node.js 20+** y npm
- **Docker** y Docker Compose (recomendado para PostgreSQL), o una instancia de **PostgreSQL** accesible

## Estructura del repositorio
```
markethub/
├── backend/     # API NestJS (prefijo global `/api`)
├── frontend/    # SPA React + Vite
└── README.md
```

Documentación adicional del cliente: [`frontend/README.md`](frontend/README.md).

## Puesta en marcha

### 1. Base de datos (PostgreSQL)

Desde la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
# Opcional: edita DB_* en .env si no usas los valores por defecto
docker compose up -d
```

Esto levanta Postgres 16 (puerto **5432**) con usuario, contraseña y base definidos en `.env` (por defecto `markethub` / `markethub_secret` / `markethub`). Usa el volumen Docker `pgdata`, cuyos datos se guardan en `backend/data/postgres/` dentro del proyecto (no en el almacén global de Docker).

Si ya tienes Postgres instalado, crea la base y el usuario equivalentes y ajusta `DB_*` en `backend/.env`.

### 2. Backend

```bash
cd backend
npm install
npm run start:dev
```

- API: **http://localhost:3000**
- Swagger: **http://localhost:3000/api/docs**

Los ficheros subidos en modo `STORAGE_MODE=offline` se guardan bajo `STORAGE_ROOT_PATH` (por defecto `./uploads`).

### 3. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Backend y frontend a la vez

Con **una sola terminal**, desde la **raíz del repositorio** (`markethub/`), tras haber hecho `npm install` en `backend/` y `frontend/` y configurar los `.env` como en los pasos anteriores:

```bash
npx concurrently -n api,web -c blue,green "npm run start:dev --prefix backend" "npm run dev --prefix frontend"
```

- **api**: NestJS en **http://localhost:3000** (Swagger en `/api/docs`).
- **web**: Vite en **http://localhost:5173**.

`npx` puede descargar `concurrently` la primera vez. Para detener ambos procesos suele bastar **Ctrl+C** en esa terminal.

## Variables de entorno
Copia de referencia: `backend/.env.example`.

### Frontend (`frontend/.env`)

| Variable | Descripción |
| -------- | ----------- |
| `VITE_API_BASE_URL` | URL base del API (p. ej. `http://localhost:3000/api`) |

Copia de referencia: `frontend/.env.example`.

## Scripts útiles

**Raíz del repositorio** (tras `npm install` en `backend/` y `frontend/`)

| Comando | Uso |
| ------- | --- |
| `npx concurrently -n api,web -c blue,green "npm run start:dev --prefix backend" "npm run dev --prefix frontend"` | Arrancar API y cliente en desarrollo en la misma terminal |

**Backend** (`backend/`)

| Comando | Uso |
| ------- | --- |
| `npm run start:dev` | Desarrollo con recarga |
| `npm run build` | Compilar |
| `npm run start:prod` | Ejecutar `dist/` (tras `build`) |
| `npm run lint` | ESLint |
| `npm test` | Tests Jest |

**Frontend** (`frontend/`)

| Comando | Uso |
| ------- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | ESLint |

## Roles y rutas (resumen)

- **Compradores**: catálogo, tiendas, producto, carrito, favoritos, pedidos (rutas protegidas donde aplique).
- **Vendedor / admin**: rutas bajo `/admin` y `/seller` según configuración de la app y el rol del usuario.

Los detalles de cada pantalla están en el código bajo `frontend/src/views/` y las rutas en `frontend/src/app/App.tsx`.

## Solución de problemas

- **El frontend no carga datos**: comprueba que el backend esté en marcha y que `VITE_API_BASE_URL` coincida con el origen real del API.
- **Error de conexión a la base** (`password authentication failed for user "markethub"`, reintentos de `TypeOrmModule`): suele ocurrir cuando la carpeta de datos se inicializó con credenciales distintas a las de `backend/.env` (Postgres solo aplica `POSTGRES_USER` / `POSTGRES_PASSWORD` la primera vez). Comprueba que Postgres esté activo (`docker compose ps` en `backend/`) y que `DB_*` en `.env` coincida con el contenedor. Si el error persiste en desarrollo, usa el bloque **Borrar todos los datos de Postgres** más abajo.
- **Borrar todos los datos de Postgres** (reset completo en desarrollo): los datos viven en `backend/data/postgres/`. `docker compose down -v` **no** los borra (solo quita el registro del volumen en Docker). Para vaciar la base de verdad:

  ```bash
  cd backend
  docker compose down
  docker run --rm -v "$(pwd)/data:/data" postgres:16-alpine sh -c "rm -rf /data/postgres && mkdir -p /data/postgres" #vacia los datos
  docker compose up -d
  npm run start:dev
  ```
- **CORS**: el backend tiene `enableCors()`; si despliegas en otros dominios, puede requerirse configuración explícita de orígenes.
