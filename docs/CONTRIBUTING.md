# Contributing & Plug-and-Play Guide

This repo is designed to be forked and adapted. Here's how to make it your own.

---

## Fork and personalise

```bash
# 1. Fork on GitHub (click Fork top-right), then clone your fork
git clone https://github.com/YOUR_USERNAME/cicd-blueprints.git
cd cicd-blueprints

# 2. Replace all placeholder references
grep -r "YOUR_USERNAME" . --include="*.yml" --include="*.md" -l
# Edit each file and replace YOUR_USERNAME with your actual GitHub username
```

---

## Minimum setup to get all 5 pipelines working

| Pipeline | Secrets needed | Steps |
|----------|---------------|-------|
| 01 PR Checks | none | just open a PR |
| 02 Build & Push | none | `GITHUB_TOKEN` is automatic |
| 03 Security | none | CodeQL & Trivy use `GITHUB_TOKEN` |
| 04 Release | none | push a `v*` tag |
| 05 Deploy (Docker) | none | trigger manually from Actions UI |
| 05 Deploy (AWS) | see below | add 2 secrets + 4 vars |
| 05 Deploy (GCP) | see below | add 1 secret + 3 vars |

---

## Adapting the app

### Swap the in-memory store for a real database

Edit `app/src/routes/users.js`. Replace the `users` array with your DB client calls. The route handlers and tests don't need to change.

### Add a new route

1. Create `app/src/routes/your-route.js`
2. Register it in `app/src/index.js`: `app.use('/api/your-route', require('./routes/your-route'))`
3. Add tests in `app/tests/`

### Change the Node version

Update the matrix in `01-pr-checks.yml`:

```yaml
matrix:
  node-version: [18, 20, 22]   # add or remove versions here
```

And update the `FROM node:20-alpine` lines in `docker/Dockerfile`.

---

## Conventional commits (for clean release notes)

The release workflow parses commit messages to categorise release notes. Using conventional commit format is optional but produces much better output:

```
feat: add user search endpoint
fix: return 404 when user not found
chore: update dependencies
docs: add API examples to README
ci: speed up Docker layer caching
refactor: extract validation helper
test: add edge case for empty body
```

Anything not matching a prefix appears under "Other Changes".

---

## Branch strategy

Recommended simple flow for a personal portfolio project:

```
main          ← production-ready, protected (status checks required)
develop       ← integration branch
feature/*     ← individual features, merged to develop via PR
hotfix/*      ← urgent fixes, merged directly to main via PR
```

Releases are triggered by pushing `v*` tags from `main`.

---

## Adding a new CI/CD pipeline

1. Create `.github/workflows/06-your-pipeline.yml`
2. Give it a clear name prefix: `06 · Your Pipeline`
3. Add a corresponding section to `docs/WORKFLOWS.md`
4. Add a badge to `README.md`

---

## Reporting issues

Open a GitHub Issue with:
- Which workflow failed
- The Actions run URL
- The error output from the failed step
