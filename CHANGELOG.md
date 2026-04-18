# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> From **v1.0.0 onwards**, this file is updated automatically by the
> [04 · Release](.github/workflows/04-release.yml) pipeline every time a
> version tag is pushed. You never need to edit it manually.

---

## [Unreleased]

Changes that are merged to `main` but not yet tagged as a release.

---

## [1.0.0] — 2024-01-01

### ✨ Features

- `feat`: Express REST API with `/health`, `/health/ready`, and `/api/users` endpoints
- `feat`: Multi-stage Docker build targeting `node:20-alpine` production image
- `feat`: GitHub Actions workflow 01 — PR checks (lint, format, test matrix Node 18 & 20)
- `feat`: GitHub Actions workflow 02 — Docker build & push to GHCR on merge to main
- `feat`: GitHub Actions workflow 03 — Security scanning (CodeQL + npm audit + Trivy)
- `feat`: GitHub Actions workflow 04 — Tag-push release with auto CHANGELOG generation
- `feat`: GitHub Actions workflow 05 — Manual deploy (Docker Compose / AWS ECS / GCP Cloud Run)
- `feat`: Developer helper script `scripts/dev.sh` with install, test, lint, docker, release commands

### 🔧 Maintenance

- `ci`: Separate workflow files by concern for independent reuse
- `ci`: Concurrency cancel on PR workflows to save runner minutes
- `ci`: GHA layer caching for fast Docker builds
- `docs`: Full documentation suite — ARCHITECTURE, WORKFLOWS, LOCAL-SETUP, CONTRIBUTING, TROUBLESHOOTING
- `docs`: Portfolio-grade README with live badges and pipeline explainer

---

[Unreleased]: https://github.com/qa.ashutosh/cicd-blueprints/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qa.ashutosh/cicd-blueprints/releases/tag/v1.0.0
