# Local Setup

Get the app running locally in under 5 minutes.

## Prerequisites

| Tool | Min version | Check |
|------|-------------|-------|
| Node.js | 18 | `node --version` |
| npm | 9 | `npm --version` |
| Docker | 24 | `docker --version` |
| Docker Compose | v2 | `docker compose version` |

---

## Option A — Node directly (fastest for development)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/cicd-blueprints.git
cd cicd-blueprints/app

# 2. Install dependencies
npm install

# 3. Start dev server (auto-restarts on file changes)
npm run dev

# API is now running at http://localhost:3000
```

### Run the test suite

```bash
npm test                  # run once with coverage
npm run test:watch        # watch mode during development
```

### Lint & format

```bash
npm run lint              # check for lint errors
npm run lint:fix          # auto-fix lint errors
npm run format            # auto-format with Prettier
npm run format:check      # check format without changing files
```

---

## Option B — Docker Compose (closest to production)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/cicd-blueprints.git
cd cicd-blueprints

# 2. Build and start
docker compose -f docker/docker-compose.yml up --build

# API is now running at http://localhost:3000
```

### Stop and clean up

```bash
docker compose -f docker/docker-compose.yml down
```

---

## Verify the API

Once running (either option), test these endpoints:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/

# List users
curl http://localhost:3000/api/users

# Get a single user
curl http://localhost:3000/api/users/1

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Dev User", "role": "engineer"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/1
```

Expected health response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

---

## Environment variables

Copy `.env.example` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
