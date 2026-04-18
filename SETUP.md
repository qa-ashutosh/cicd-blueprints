# ⚡ Quick Setup Reference

Everything you need to get all 5 pipelines live on a fresh fork.

---

## Step 1 — Fork & clone

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/cicd-blueprints.git
cd cicd-blueprints
```

---

## Step 2 — Replace placeholders (2 minutes)

```bash
# Find all files with YOUR_USERNAME / YOUR_NAME
grep -r "YOUR_USERNAME\|YOUR_NAME" . \
  --include="*.md" --include="*.yml" \
  -l

# Replace in-place (macOS)
LC_ALL=C find . \( -name "*.md" -o -name "*.yml" \) \
  ! -path "*/node_modules/*" \
  -exec sed -i '' 's/YOUR_USERNAME/your-actual-username/g; s/YOUR_NAME/Your Name/g' {} +

# Replace in-place (Linux)
find . \( -name "*.md" -o -name "*.yml" \) \
  ! -path "*/node_modules/*" \
  -exec sed -i 's/YOUR_USERNAME/your-actual-username/g; s/YOUR_NAME/Your Name/g' {} +
```

---

## Step 3 — Push to GitHub

```bash
git add .
git commit -m "chore: personalise for YOUR_USERNAME"
git push origin main
```

Pipelines **02 · Build & Push** and **03 · Security** fire automatically. ✅

---

## Step 4 — Open a test PR (triggers pipeline 01)

```bash
git checkout -b test/hello-cicd
echo "# test" >> app/tests/HELLO.md
git add . && git commit -m "test: trigger pr checks"
git push origin test/hello-cicd
# Open PR on GitHub → pipeline 01 fires
```

---

## Step 5 — Cut your first release (triggers pipeline 04)

```bash
# Using the helper script
chmod +x scripts/dev.sh
./scripts/dev.sh release v1.0.0

# Or manually
git tag v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

Pipeline **04 · Release** fires → GitHub Release created → CHANGELOG updated. ✅

---

## Step 6 — Manual deploy (pipeline 05)

1. Go to **Actions → 05 · Deploy → Run workflow**
2. Choose: `environment=staging`, `image_tag=latest`, `deploy_target=docker-compose`
3. Click **Run workflow** ✅

---

## Secrets & variables needed per pipeline

| Pipeline | Extra secrets | Extra vars | Where to add |
|----------|--------------|-----------|--------------|
| 01–04 | none | none | — |
| 05 Docker | none | none | — |
| 05 AWS ECS | `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` | `AWS_REGION` `ECS_CLUSTER` `ECS_SERVICE` `CONTAINER_NAME` | Settings → Secrets → Actions |
| 05 GCP Cloud Run | `GCP_SA_KEY` | `GCP_PROJECT_ID` `GCP_REGION` `CLOUDRUN_SERVICE` | Settings → Secrets → Actions |

---

## Optional: Add production deploy approval gate

1. Settings → Environments → **New environment** → name it `production`
2. Enable **Required reviewers** → add yourself
3. Now every deploy to `production` waits for your manual approval — free on public repos ✅

---

## Optional: Enable Dependabot

Settings → Code security → **Dependabot alerts** → Enable
Settings → Code security → **Dependabot security updates** → Enable
Settings → Code security → **Dependabot version updates** → Enable

Dependabot will open weekly PRs to keep Actions, npm, and Docker deps fresh.
Pipeline **01 · PR Checks** will validate each Dependabot PR automatically. ✅

---

## Local dev cheatsheet

```bash
chmod +x scripts/dev.sh

./scripts/dev.sh install       # npm install
./scripts/dev.sh start         # nodemon dev server → :3000
./scripts/dev.sh test          # jest --coverage
./scripts/dev.sh lint          # eslint
./scripts/dev.sh format        # prettier --write
./scripts/dev.sh docker:build  # build production image
./scripts/dev.sh docker:up     # docker compose up -d → :3000
./scripts/dev.sh docker:down   # docker compose down
./scripts/dev.sh health        # curl /health (pretty-printed)
./scripts/dev.sh release v1.x.x  # tag + push (with confirmation)
```

---

## Verify everything is wired up

```bash
# 1. App runs
cd app && npm install && npm run dev
curl http://localhost:3000/health

# 2. Tests pass
npm test

# 3. Lint clean
npm run lint

# 4. Docker builds
cd .. && ./scripts/dev.sh docker:build
./scripts/dev.sh docker:up
curl http://localhost:3000/health
./scripts/dev.sh docker:down
```

All green? You're ready to push. 🚀
