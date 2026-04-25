# Saarthi Backend

A clean, modular **Node.js + Express** REST API boilerplate.

---

## Project Structure

```
backend/
├── config/
│   └── env.js              # Single source-of-truth for all env vars
├── controllers/
│   └── healthController.js # Thin request handler — delegates to service
├── middleware/
│   ├── errorHandler.js     # 404 catcher + global error formatter
│   └── logger.js           # Morgan HTTP request logger
├── routes/
│   ├── index.js            # Central route aggregator
│   └── healthRoutes.js     # Routes for /health
├── services/
│   └── healthService.js    # Business logic for health-check payload
├── .env                    # Environment variables (not committed)
├── .env.example            # Template to share with the team
├── .gitignore
├── package.json
└── server.js               # Entry point — wires everything together
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
# Copy the template and edit as needed
cp .env.example .env
```

Default values in `.env`:

| Variable      | Default              | Description                  |
|---------------|----------------------|------------------------------|
| `PORT`        | `5000`               | Port the server listens on   |
| `NODE_ENV`    | `development`        | Runtime environment          |
| `APP_NAME`    | `Saarthi-Backend`    | Application label            |
| `API_VERSION` | `v1`                 | API version prefix           |

### 3. Run the server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

---

## API Endpoints

### Base URL

```
http://localhost:5000/api/v1
```

### Health Check

| Method | Path      | Auth     | Description              |
|--------|-----------|----------|--------------------------|
| `GET`  | `/health` | Public   | Returns API health status |

**Sample response:**

```json
{
  "status":    "ok",
  "uptime":    42,
  "timestamp": "2026-04-25T13:35:06.667Z",
  "app":       "Saarthi-Backend",
  "env":       "development",
  "version":   "v1"
}
```

**Test with curl:**

```bash
curl http://localhost:5000/api/v1/health
```

**Test with PowerShell:**

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Method GET
```

---

## Middleware

| Middleware      | File                         | Purpose                                              |
|-----------------|------------------------------|------------------------------------------------------|
| JSON parser     | `server.js`                  | Parses `application/json` request bodies             |
| URL-encoded     | `server.js`                  | Parses form-encoded bodies                           |
| Request logger  | `middleware/logger.js`       | Morgan — `dev` format in development, `combined` in prod |
| 404 handler     | `middleware/errorHandler.js` | Catches unmatched routes                             |
| Error handler   | `middleware/errorHandler.js` | Formats all errors; hides stack traces in production |

---

## Adding a New Route

Follow the 4-layer pattern the project already uses:

1. **Service** → `services/userService.js` — business logic, DB calls
2. **Controller** → `controllers/userController.js` — calls service, sends response
3. **Router** → `routes/userRoutes.js` — maps HTTP verbs to controller methods
4. **Mount** → `routes/index.js` — `router.use('/users', require('./userRoutes'))`

---

## Scripts

| Command       | Description                                |
|---------------|--------------------------------------------|
| `npm start`   | Start with Node.js                         |
| `npm run dev` | Start with Nodemon (auto-restart on change)|
