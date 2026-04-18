# Troubleshooting

Common issues and their solutions.

---

## The bypass actor limitation

### Problem

You're on a **free personal GitHub account** with a **public repo**. Under branch protection rules → "Do not allow bypassing the above settings", the option **"Allow specified actors to bypass required pull requests"** is greyed out or missing entirely.

### Why it happens

GitHub's documentation confirms: _"Actors may only be added to bypass lists when the repository belongs to an organization."_

This is a hard platform limitation — it is not a configuration issue and cannot be worked around on personal accounts, even with GitHub Pro.

### Solution used in this project

The release pipeline (04) uses **tag-push** instead of a direct commit to `main`. When you push a `v*` tag, GitHub Actions runs the release workflow — this does not go through the PR or branch protection flow at all.

This is the standard pattern used by most major open-source projects (Node.js, Express, Jest, etc.).

```bash
git tag v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### If you move to a GitHub Organisation

Once you're in an org, you can add the `github-actions[bot]` as a bypass actor:

Settings → Branches → Edit rule → "Allow specified actors to bypass" → search `github-actions[bot]`

---

## Workflow not triggering on PR

**Symptom:** You open a PR but `01 · PR Checks` doesn't start.

**Check:** The workflow only runs on PRs targeting `main` or `develop`. If your base branch is something else, edit the `branches` list in `01-pr-checks.yml`.

**Check:** The `paths` filter. If your PR doesn't touch files under `app/` or the workflow file itself, it won't trigger. Remove the `paths` filter if you want it to always run.

---

## GHCR push failing with 403

**Symptom:** `02 · Build & Push` fails at the push step with a permission error.

**Fix:** The workflow needs `packages: write` permission. Verify this is present in the workflow file:

```yaml
permissions:
  contents: read
  packages: write
```

Also check: Settings → Actions → General → Workflow permissions → must be set to **"Read and write permissions"** (or the workflow-level permission above overrides it either way).

---

## CodeQL failing with "no source files found"

**Symptom:** `03 · Security` CodeQL job fails with no JavaScript files found.

**Fix:** CodeQL autobuild looks for source files from the repo root. Since the app lives in `app/`, you may need to add a manual build step. This is usually handled by `autobuild` correctly for plain Node.js, but if it fails, add:

```yaml
- name: Manual build
  run: echo "No build needed for Node.js"
```

---

## Docker build failing: "cannot find module"

**Symptom:** The production Docker image starts but crashes with `Cannot find module`.

**Fix:** The Dockerfile's `production` stage copies `src/` and `node_modules/` (prod-only). If you added a new file outside `src/`, add a `COPY` line for it in the Dockerfile's production stage.

---

## Release workflow: "nothing to push" on CHANGELOG commit

**Symptom:** The `04 · Release` workflow logs "No changes to commit" or "Push skipped".

**This is fine.** It means the CHANGELOG was already up to date, or there were no new commits since the last tag. The GitHub Release is still created successfully.

---

## Deploy workflow: health check failing post-deploy

**Symptom:** `05 · Deploy` succeeds at `docker compose up -d` but fails the curl health check.

**Fix:** The container needs a moment to start. The workflow waits 5 seconds. If your machine is slow, increase it:

```yaml
- name: Health check post-deploy
  run: |
    sleep 15   # increase from 5
    curl -f http://localhost:3000/health
```

---

## Tests passing locally but failing in CI

**Symptom:** `npm test` passes on your machine but fails in the `01 · PR Checks` workflow.

**Common causes:**

1. **Node version mismatch** — CI uses Node 18 and 20. Run `node --version` locally and make sure you're testing on the same version.
2. **Missing `NODE_ENV=test`** — the workflow sets this. Check if any of your code behaves differently based on `NODE_ENV`.
3. **File casing** — macOS is case-insensitive, Linux (CI) is not. `require('./Routes/health')` works on Mac but fails in CI.
