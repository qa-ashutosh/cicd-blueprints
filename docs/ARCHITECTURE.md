# Architecture

## Overview

This project is a **Node.js/Express REST API** used as the "app under test" for five production-grade CI/CD pipelines. The pipelines are intentionally separated by concern so each one is independently understandable and reusable.

```
cicd-blueprints/
├── app/                         ← Express API (the subject of all pipelines)
│   ├── src/
│   │   ├── index.js             ← App entry point
│   │   ├── routes/
│   │   │   ├── health.js        ← GET /health, GET /health/ready
│   │   │   └── users.js         ← CRUD /api/users
│   │   └── middleware/
│   │       ├── logger.js        ← Request logger
│   │       └── errorHandler.js  ← Centralised error responses
│   └── tests/
│       └── app.test.js          ← Jest + Supertest integration tests
│
├── .github/workflows/
│   ├── 01-pr-checks.yml         ← Lint + Test on every PR
│   ├── 02-build-push.yml        ← Docker → GHCR on merge to main
│   ├── 03-security.yml          ← CodeQL + npm audit + Trivy
│   ├── 04-release.yml           ← Tag-push → Release + CHANGELOG
│   └── 05-deploy.yml            ← Manual deploy (Docker / AWS / GCP)
│
├── docker/
│   ├── Dockerfile               ← Multi-stage (deps → test → production)
│   └── docker-compose.yml       ← Local run + deploy target
│
├── docs/                        ← This documentation
└── scripts/                     ← Helper shell scripts
```

---

## Application Design

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API info (name, version, status) |
| `GET` | `/health` | Health check (uptime, timestamp, env) |
| `GET` | `/health/ready` | Readiness probe (for Docker/k8s) |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get single user |
| `POST` | `/api/users` | Create user `{ name, role }` |
| `DELETE` | `/api/users/:id` | Delete user |

### Middleware Stack

```
Request
  └── express.json()          ← parse JSON body
  └── requestLogger           ← log method, path, status, duration
  └── routes                  ← business logic
  └── errorHandler            ← format all errors as JSON { error: { message, status } }
```

### Why In-Memory Store?

The app uses a plain array as its data store. This is intentional — the app's purpose is to be a **testable, deployable subject** for CI/CD demonstration, not a production database app. Swapping it for PostgreSQL/MongoDB is a one-file change.

---

## Docker Design

The Dockerfile uses **three stages**:

```dockerfile
FROM node:20-alpine AS deps        # install prod dependencies only
FROM node:20-alpine AS test        # run lint + tests (not shipped)
FROM node:20-alpine AS production  # minimal final image
```

Benefits:
- Final image contains zero dev dependencies or test files
- CI can target the `test` stage to validate before building production layer
- Non-root user (`appuser`) runs the process — no root in production
- Built-in `HEALTHCHECK` so Docker/compose knows when the container is ready

---

## Pipeline Design Decisions

### Why five separate workflow files?

Each workflow has a single responsibility. This makes them:
- Easier to read and understand individually
- Independently triggerable (PR, push, tag, schedule, manual)
- Independently reusable — copy just the one you need
- Independently cacheable and cancellable

### Why GHCR instead of DockerHub?

GitHub Container Registry is:
- Free for public repos
- Authenticated via `GITHUB_TOKEN` (no secrets to configure)
- Co-located with the code (same GitHub ecosystem)

### Why tag-push for releases (not branch protection bypass)?

Branch protection bypass actors are **organisation-only** on GitHub Free. Tag-push (`v*`) is a clean pattern that:
- Works on all free personal public repos
- Is used by thousands of real OSS projects (Node.js, Express, etc.)
- Does not require any bypass rules

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for the full explanation of this limitation.

### Why `workflow_dispatch` for deploy?

Manual triggers are intentional for deploys. Automatic deploys to production on every push is an anti-pattern outside of high-maturity teams with strong rollback procedures. The manual trigger also lets you choose the image tag and environment, making it suitable for both staging and production use.
