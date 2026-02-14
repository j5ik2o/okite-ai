#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

export ANTHROPIC_BASE_URL="${CLI_PROXY_API_BASE_URL:-http://127.0.0.1:8317}"
export ANTHROPIC_AUTH_TOKEN="${CLI_PROXY_API_KEY:?CLI_PROXY_API_KEY is not set}"
export ANTHROPIC_MODEL='gpt-5.3-codex-spark'
claude --dangerously-skip-permissions "$@"
