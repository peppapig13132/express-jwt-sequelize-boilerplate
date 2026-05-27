# Express.js Backend Boilerplate

![Node.js](https://img.shields.io/badge/node.js-20.12.2-blue)
![npm](https://img.shields.io/badge/npm-10.6.0-blue)
![Express.js](https://img.shields.io/badge/express.js-4.19.2-blue)
![Sequelize](https://img.shields.io/badge/sequelize-6.37.3-blue)

## Features

- [x] TypeScript configured
- [x] JWT based authentication and middleware
- [x] Access + refresh tokens with rotation and revocation
- [x] User signup, login, logout, and protected routes
- [x] Zod request validation, Helmet, CORS, and auth rate limiting
- [x] [Sequelize ORM](https://sequelize.org/) for database interaction


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the server in development mode.
Open http://localhost:8000 to in your browser, you will see `Express.js server is running!`.

### `npm run start:dev`

Runs the server in development mode with hotload. Hotload configured by [`nodemon`](https://nodemon.io/)

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm test`

Runs the Vitest suite (schema, token, and auth API integration tests) using an in-memory SQLite database — no PostgreSQL required.

### `npm run test:watch`

Runs tests in watch mode during development.

### `npm run serve:dev`, `npm run serve:prod`

After build the project, Runs the development/production server. Entry file is `dist/index.js`.


### Project Structure

```
root
|
|- dist/
|
|- node_modules/
|
|- src/
|  |- config/
|  |  |- database.ts
|  |
|  |- controller/
|  |  |- auth.controller.ts
|  |
|  |- interfaces/
|  |  |- interfaces.ts
|  |
|  |- middleware/
|  |  |- auth.middleware.ts
|  |
|  |- model/
|  |  |- user.model.ts
|  |
|  |- routes/
|  |  |- auth.route.ts
|  |  |- index.ts
|  |
|  |- types/
|  |
|  |- index.ts
|
|- static/
|
|- .env
|- .env.example
|- .gitignore
|- nodemon.json
|- package-lock.json
|- package.json
|- README.md
|- tsconfig.json
```


## Frontend

If you use SPA for your frontend, copy compiled result into `static` folder.


## Database

`DB_SYNC` controls schema sync at startup:

| Value | Behavior |
|-------|----------|
| `false` | No sync (default, use migrations in production) |
| `true` | `sequelize.sync()` — creates missing tables only |
| `alter` | `sequelize.sync({ alter: true })` — dev helper to adjust columns |

Never use `force: true` in this template; it drops all tables.

## Auth API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login → `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke one refresh token |
| POST | `/api/auth/logout-all` | Revoke all sessions (Bearer access token) |
| GET | `/api/protected` | Example protected route |

Copy `.env.example` to `.env.development` and set `SECRETKEY` (min 32 characters).

## Docker (Windows)

Requires [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/).

### Quick start

```bash
# 1. Build and start in the background
docker compose up --build -d

# 2. Confirm containers are running
docker compose ps

# 3. Check the API responds
curl http://localhost:8000
```

Expected response from step 3:

```text
Express.js server is running!
```

Open in a browser: **http://localhost:8000**

### Useful commands

| Command | Purpose |
|---------|---------|
| `docker compose up --build` | Build images and run (foreground, shows logs) |
| `docker compose up --build -d` | Build and run in background |
| `docker compose ps` | Show container status and ports |
| `docker compose logs app` | View API logs (errors, “Server running…”) |
| `docker compose logs -f app` | Follow API logs live |
| `docker compose down` | Stop and remove containers |
| `npm run docker:dev` | Same as `docker compose up --build` |
| `npm run docker:dev:down` | Same as `docker compose down` |

Default ports:

- API: **http://localhost:8000**
- PostgreSQL: `localhost:5432` (user `postgres`, password `postgres`, db `express_boilerplate`)

### Troubleshooting

**`curl: (52) Empty reply from server`**

The port is open but the Node app is not serving HTTP. Usually the app crashed on startup.

```bash
docker compose logs app --tail 50
```

Look for `Server running on port 8000` or TypeScript / database errors. After fixing code, restart:

```bash
docker compose restart app
```

**Container not listed or not `Up`**

```bash
docker compose up -d
docker compose ps
```

**Lock file out of sync (`npm ci` failed during build)**

```bash
npm install
docker compose build --no-cache
docker compose up -d
```

Optional: copy `.env.docker.example` to `.env.docker` to override compose variables:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build -d
```

### Development details

- Hot reload via nodemon (`Dockerfile.dev`)
- Source is mounted into the container; `node_modules` stays inside the container (required for native modules like `bcrypt` on Windows)
- Env vars are set in `docker-compose.yml` (no `.env.development` file required inside Docker)

### Production

```bash
cp .env.docker.example .env.docker
# Edit .env.docker — set a strong SECRETKEY and DB_PASSWORD
npm run docker:prod
```

Production uses the multi-stage `Dockerfile`, sets `DB_SYNC=false` by default, and runs the compiled app.

Stop production stack:

```bash
npm run docker:prod:down
```

