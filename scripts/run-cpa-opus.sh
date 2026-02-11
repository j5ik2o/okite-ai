#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

export ANTHROPIC_BASE_URL='http://127.0.0.1:8317'
export ANTHROPIC_AUTH_TOKEN='dummy-c3d4ee78f2909bc57fcc903fcb115e6fa23c8b6406b6492a8ce05bf78f48920e'
export ANTHROPIC_MODEL='claude-opus-4-6'
claude --dangerously-skip-permissions "$@"
