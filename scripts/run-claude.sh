#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

claude --dangerously-skip-permissions "$@"
