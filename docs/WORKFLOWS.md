# Workflows

Five pipelines, each with a single responsibility.

---

## 01 · PR Checks

**File:** `.github/workflows/01-pr-checks.yml`
**Trigger:** Every pull request targeting `main` or `develop`

### What it does

```
PR opened / updated
  └── lint-and-format          (ESLint + Prettier check)
        └── test               (Jest on Node 18 & 20, with coverage)
              └── pr-summary   (posts result table as PR comment)
```

### Key features

- `cancel-in-progress: true` — if you push a new commit while checks are running, the old run is cancelled. No wasted minutes.
- Matrix strategy on `node-version: [18, 20]` — validates compatibility across two LTS versions.
- Coverage report uploaded as artifact (available for 7 days).
- Auto-comment on PR with pass/fail summary.

### Secrets required

None — uses only `GITHUB_TOKEN` (auto-provided).

---

## 02 · Build & Push

**File:** `.github/workflows/02-build-push.yml`
**Trigger:** Push to `main` (i.e., after a PR is merged)

### What it does

```
Push to main
  └── Docker Buildx setup
        └── Login to GHCR (via GITHUB_TOKEN)
              └── Extract tags (sha-, branch, latest)
                    └── Build multi-stage image (production target)
                          └── Push to ghcr.io/YOUR_USERNAME/cicd-blueprints
```

### Tags produced

| Tag | Example | When |
|-----|---------|------|
| `sha-<commit>` | `sha-a1b2c3d` | Every push |
| `main` | `main` | Every push to main |
| `latest` | `latest` | Every push to main |

### Pulling the image

```bash
docker pull ghcr.io/YOUR_USERNAME/cicd-blueprints:latest
```

### Secrets required

None — `GITHUB_TOKEN` is auto-provided.

---

## 03 · Security Scan

**File:** `.github/workflows/03-security.yml`
**Trigger:** Push to `main` + every Monday 08:00 UTC + manual

### Three parallel jobs

```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  npm-audit  │  │   codeql     │  │   trivy     │
│             │  │              │  │             │
│ npm audit   │  │ CodeQL SAST  │  │ Docker image│
│ high+       │  │ JS security  │  │ CRITICAL +  │
│             │  │ queries      │  │ HIGH CVEs   │
│ → artifact  │  │ → Security   │  │ → Security  │
│   (JSON)    │  │   tab        │  │   tab SARIF │
└─────────────┘  └──────────────┘  └─────────────┘
```

### Where to see results

- **npm audit:** Actions → run → artifact `npm-audit-report`
- **CodeQL + Trivy:** Repository → Security → Code scanning alerts

### Secrets required

None. CodeQL requires Code scanning to be enabled (free for public repos): Settings → Code security → Code scanning.

---

## 04 · Release

**File:** `.github/workflows/04-release.yml`
**Trigger:** Push of a version tag matching `v*.*.*`

### What it does

```
git tag v1.2.0 && git push --tags
  └── Checkout full history
        └── Run tests (safety gate)
              └── Generate release notes from commits
                    └── Update CHANGELOG.md → commit to main
                          └── Create GitHub Release
```

### Conventional commit categories

| Prefix | Section in Release Notes |
|--------|--------------------------|
| `feat:` | ✨ Features |
| `fix:` | 🐛 Bug Fixes |
| `chore:` `ci:` `docs:` `refactor:` `test:` | 🔧 Maintenance |
| anything else | 📦 Other Changes |

### How to cut a release

```bash
git checkout main && git pull
git tag v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### Secrets required

None — `GITHUB_TOKEN` with `contents: write`.

---

## 05 · Deploy

**File:** `.github/workflows/05-deploy.yml`
**Trigger:** `workflow_dispatch` (manual)

### Inputs

| Input | Options | Default |
|-------|---------|---------|
| `environment` | `staging`, `production` | `staging` |
| `image_tag` | any GHCR tag | `latest` |
| `deploy_target` | `docker-compose`, `aws-ecs`, `gcp-cloudrun` | `docker-compose` |

### Plug-in secrets per target

| Target | Required Secrets | Required Vars |
|--------|-----------------|---------------|
| docker-compose | none | none |
| aws-ecs | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | `AWS_REGION`, `ECS_CLUSTER`, `ECS_SERVICE`, `CONTAINER_NAME` |
| gcp-cloudrun | `GCP_SA_KEY` | `GCP_PROJECT_ID`, `GCP_REGION`, `CLOUDRUN_SERVICE` |

### Production gate

Add required reviewers to the `production` GitHub Environment:
**Settings → Environments → production → Required reviewers**

This is free on public repos and gives you a manual approval step before every production deploy.
