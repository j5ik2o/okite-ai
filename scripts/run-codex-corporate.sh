#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

export CODEX_HOME=${REPO_ROOT}/.codex-corporate
codex --dangerously-bypass-approvals-and-sandbox "$@"
