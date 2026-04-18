#!/usr/bin/env bash
# scripts/dev.sh — quick local dev helper
# Usage: ./scripts/dev.sh [command]

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../app" && pwd)"
DOCKER_DIR="$(cd "$(dirname "$0")/../docker" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[cicd-blueprints]${NC} $*"; }
warn()    { echo -e "${YELLOW}[cicd-blueprints]${NC} $*"; }
err()     { echo -e "${RED}[cicd-blueprints]${NC} $*" >&2; }

usage() {
  echo ""
  echo "Usage: ./scripts/dev.sh <command>"
  echo ""
  echo "Commands:"
  echo "  install       Install npm dependencies"
  echo "  start         Start dev server (nodemon)"
  echo "  test          Run tests with coverage"
  echo "  lint          Run ESLint"
  echo "  format        Run Prettier"
  echo "  docker:build  Build Docker image locally"
  echo "  docker:up     Start via Docker Compose"
  echo "  docker:down   Stop Docker Compose"
  echo "  release <v>   Create and push a release tag (e.g. ./scripts/dev.sh release v1.0.0)"
  echo "  health        Hit the local /health endpoint"
  echo ""
}

CMD="${1:-help}"

case "$CMD" in
  install)
    info "Installing dependencies..."
    cd "$APP_DIR" && npm install
    ;;
  start)
    info "Starting dev server..."
    cd "$APP_DIR" && npm run dev
    ;;
  test)
    info "Running tests..."
    cd "$APP_DIR" && npm test
    ;;
  lint)
    info "Running lint..."
    cd "$APP_DIR" && npm run lint
    ;;
  format)
    info "Running Prettier..."
    cd "$APP_DIR" && npm run format
    ;;
  docker:build)
    info "Building Docker image..."
    docker build \
      --file "$DOCKER_DIR/Dockerfile" \
      --target production \
      --tag cicd-blueprints:local \
      "$APP_DIR"
    info "Image built: cicd-blueprints:local"
    ;;
  docker:up)
    info "Starting with Docker Compose..."
    docker compose -f "$DOCKER_DIR/docker-compose.yml" up --build -d
    info "API running at http://localhost:3000"
    ;;
  docker:down)
    info "Stopping Docker Compose..."
    docker compose -f "$DOCKER_DIR/docker-compose.yml" down
    ;;
  release)
    TAG="${2:-}"
    if [ -z "$TAG" ]; then
      err "Usage: ./scripts/dev.sh release v1.0.0"
      exit 1
    fi
    if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      err "Tag must match vX.Y.Z format (e.g. v1.0.0)"
      exit 1
    fi
    warn "Creating and pushing tag $TAG — this will trigger the release pipeline!"
    read -r -p "Are you sure? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      git tag "$TAG" -m "Release $TAG"
      git push origin "$TAG"
      info "Tag $TAG pushed. Check Actions tab for release pipeline."
    else
      info "Aborted."
    fi
    ;;
  health)
    info "Checking http://localhost:3000/health ..."
    curl -s http://localhost:3000/health | python3 -m json.tool || err "Server not running?"
    ;;
  help|--help|-h|*)
    usage
    ;;
esac
