<div align="center">

# ⚙️ cicd-blueprints

**A production-grade CI/CD showcase built on Node.js + GitHub Actions**

Five real-world pipelines. One plug-and-play repo. Zero unnecessary complexity.

[![01 · PR Checks](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/01-pr-checks.yml/badge.svg)](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/01-pr-checks.yml)
[![02 · Build & Push](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/02-build-push.yml/badge.svg)](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/02-build-push.yml)
[![03 · Security](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/03-security.yml/badge.svg)](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/03-security.yml)
[![04 · Release](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/04-release.yml/badge.svg)](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/04-release.yml)
[![05 · Deploy](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/05-deploy.yml/badge.svg)](https://github.com/qa-ashutosh/cicd-blueprints/actions/workflows/05-deploy.yml)

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-GHCR-2496ED?logo=docker&logoColor=white)](https://ghcr.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025E8C?logo=dependabot)](https://github.com/qa-ashutosh/cicd-blueprints/blob/main/.github/dependabot.yml)

</div>

---

## What is this?

This repo demonstrates **how I design and build CI/CD pipelines** — not as a theoretical exercise, but as a working, runnable system you can fork and use today.

The subject is a lightweight **Express REST API** (the "app under test"). Every pipeline in this repo acts on that app — linting its code, testing it, scanning it for vulnerabilities, packaging it into Docker, and deploying it.

Each pipeline is **a separate workflow file** covering one concern. Copy the one you need.

---

## The 5 Pipelines

```
Every commit to a PR
  └── 01 · PR Checks ────── ESLint + Prettier + Jest (Node 18 & 20) + coverage report

Merge to main
  └── 02 · Build & Push ─── Docker multi-stage build → GHCR (sha + latest tags)
  └── 03 · Security ──────── CodeQL SAST + npm audit + Trivy image scan → Security tab

Push a version tag (v1.2.0)
  └── 04 · Release ────────── Auto changelog + GitHub Release notes

Manual trigger (Actions UI)
  └── 05 · Deploy ─────────── Docker Compose (default) | AWS ECS | GCP Cloud Run
```

| # | Pipeline | Trigger | Tech |
|---|----------|---------|------|
| 01 | **PR Checks** | `pull_request → main` | ESLint, Prettier, Jest, Supertest |
| 02 | **Build & Push** | `push → main` | Docker Buildx, GHCR, layer caching |
| 03 | **Security Scan** | `push + schedule` | CodeQL, npm audit, Trivy, SARIF |
| 04 | **Release** | `push tag v*` | Conventional commits, CHANGELOG, GH Release |
| 05 | **Deploy** | `workflow_dispatch` | Docker Compose / AWS ECS / GCP Cloud Run |

--- 

## Quick Start

> **First time forking?** See [SETUP.md](SETUP.md) — a 6-step guide to get all 5 pipelines live in under 10 minutes, including the one-liner to replace all `YOUR_USERNAME` placeholders.

### Run the app locally

```bash
git clone https://github.com/qa-ashutosh/cicd-blueprints.git
cd cicd-blueprints/app
npm install && npm run dev
# → http://localhost:3000
```

### Run with Docker

```bash
docker compose -f docker/docker-compose.yml up --build
# → http://localhost:3000
```

### Use the dev helper script

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh install      # install deps
./scripts/dev.sh test         # run tests
./scripts/dev.sh docker:up    # start with Docker
./scripts/dev.sh health       # hit /health endpoint
./scripts/dev.sh release v1.0.0  # tag and push a release
```

---

## API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/` | API info | — |
| `GET` | `/health` | Health check | — |
| `GET` | `/health/ready` | Readiness probe | — |
| `GET` | `/api/users` | List all users | — |
| `GET` | `/api/users/:id` | Get user by ID | — |
| `POST` | `/api/users` | Create user | `{ "name": "", "role": "" }` |
| `DELETE` | `/api/users/:id` | Delete user | — |

**Example:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "role": "engineer"}'

# Response 201
{ "data": { "id": 3, "name": "Alice", "role": "engineer" } }
```

---

## Pipeline Deep-Dives

### 01 · PR Checks — Fast Feedback Loop

Every pull request to `main` or `develop` triggers:

1. **ESLint** — catches bugs and enforces code style
2. **Prettier** — enforces consistent formatting
3. **Jest tests** — run on **both Node 18 and Node 20** in parallel via matrix strategy
4. **Coverage report** — uploaded as an Actions artifact (retained 7 days)
5. **PR comment bot** — posts a pass/fail summary table directly on the PR

Concurrent runs are cancelled automatically if you push a new commit to an open PR.

### 02 · Build & Push — Immutable Image Tags

On every merge to `main`, a Docker image is built and pushed to GitHub Container Registry with three tags:

- `latest` — always points to the most recent main build
- `main` — branch tag
- `sha-a1b2c3d` — **immutable commit SHA tag** — safe for rollback at any point

Uses **GitHub Actions layer caching** so unchanged layers never rebuild. First build ~60s, subsequent ~10s.

No DockerHub account needed. Authentication via `GITHUB_TOKEN` — automatic.

### 03 · Security — Three Scanners in Parallel

Runs on every push to `main` and on a **weekly schedule** (Mondays 08:00 UTC):

- **npm audit** — checks all dependencies against the npm advisory database
- **CodeQL** — static analysis of JavaScript source using GitHub's security ruleset
- **Trivy** — scans the built Docker image for CVEs in OS packages and npm deps

All results are uploaded to the **GitHub Security tab** (Code Scanning Alerts) as SARIF. No external service needed.

### 04 · Release — Tag-Push, No Bypass Needed

> **Why tag-push?** GitHub's "bypass actor" option for branch protection is org-only — unavailable on free personal repos. Tag-push is the standard OSS solution: push `v1.2.0`, the release pipeline fires, no PR rules are involved.

The release pipeline:
1. Runs tests one final time before releasing
2. Generates categorised release notes from conventional commit messages
3. Prepends the notes to `CHANGELOG.md` and commits it back to `main`
4. Creates a GitHub Release with the generated notes

```bash
git tag v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 05 · Deploy — Plug and Play

Three deploy strategies selectable from the GitHub Actions UI:

- **`docker-compose`** — pulls the image from GHCR and runs it via compose. Works on any machine with Docker. Zero extra setup.
- **`aws-ecs`** — registers a new ECS task definition revision and updates the service. Add 2 secrets + 4 variables and it's live.
- **`gcp-cloudrun`** — deploys to Cloud Run in one step. Add 1 secret + 3 variables.

---

## How to fork and use this

```bash
# 1. Fork this repo on GitHub

# 2. Clone your fork
git clone https://github.com/qa-ashutosh/cicd-blueprints.git

# 3. Replace qa-ashutosh in workflow and doc files
grep -r "qa-ashutosh" . --include="*.yml" --include="*.md" -l

# 4. Push to main — pipelines 02 and 03 will fire automatically

# 5. Open a PR — pipeline 01 will fire automatically

# 6. Push a tag to create your first release
git tag v1.0.0 -m "Initial release"
git push origin v1.0.0
```

All 5 pipelines work with zero additional secrets on a free personal public GitHub repo.

---

## Project Structure

```
cicd-blueprints/
├── .github/
│   └── workflows/
│       ├── 01-pr-checks.yml      ← Lint + Test on every PR
│       ├── 02-build-push.yml     ← Docker → GHCR on merge to main
│       ├── 03-security.yml       ← CodeQL + npm audit + Trivy
│       ├── 04-release.yml        ← Tag-push release + auto CHANGELOG
│       └── 05-deploy.yml         ← Manual deploy (Docker/AWS/GCP)
├── app/
│   ├── src/
│   │   ├── index.js              ← Express entry point
│   │   ├── routes/               ← health.js, users.js
│   │   └── middleware/           ← logger.js, errorHandler.js
│   ├── tests/
│   │   └── app.test.js           ← Jest + Supertest integration tests
│   ├── .eslintrc.js
│   ├── .prettierrc
│   └── package.json
├── docker/
│   ├── Dockerfile                ← Multi-stage (deps → test → production)
│   └── docker-compose.yml
├── docs/
│   ├── ARCHITECTURE.md           ← Design decisions + app internals
│   ├── WORKFLOWS.md              ← Each pipeline explained in detail
│   ├── LOCAL-SETUP.md            ← Run locally in < 5 minutes
│   ├── CONTRIBUTING.md           ← How to fork, adapt, and extend
│   └── TROUBLESHOOTING.md        ← Common issues (inc. bypass actor gotcha)
├── scripts/
│   └── dev.sh                    ← Local dev helper CLI
├── .env.example
├── .gitignore
├── CHANGELOG.md                  ← Auto-updated by pipeline 04
└── README.md
```

---

## Documentation

| Doc | Contents |
|-----|----------|
| [SETUP.md](SETUP.md) | **Start here** — 6-step fork & go guide with replace-all commands |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | App design, Docker stages, pipeline decisions |
| [WORKFLOWS.md](docs/WORKFLOWS.md) | Step-by-step guide to each workflow |
| [LOCAL-SETUP.md](docs/LOCAL-SETUP.md) | Run locally with Node or Docker |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Fork, adapt, extend this repo |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Fixes for common issues |
| [CHANGELOG.md](CHANGELOG.md) | Release history (auto-updated) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |
| Containerisation | Docker (multi-stage, Alpine) |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions |
| SAST | CodeQL |
| Image scanning | Trivy (Aqua Security) |
| Dep auditing | npm audit |

---

## License

MIT — see [LICENSE](LICENSE). Fork it, adapt it, use it in your own projects.

---

<div align="center">

Built with precision by **Ashutosh Parihar** · [GitHub](https://github.com/qa-ashutosh) · [LinkedIn](https://linkedin.com/in/ashutosh-parihar)

</div>
