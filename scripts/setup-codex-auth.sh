#!/usr/bin/env bash
#
# Codex CLI の認証を identity ごとにセットアップする。
# 使い方:
#   ./scripts/setup-codex-auth.sh personal
#   ./scripts/setup-codex-auth.sh corporate
#   ./scripts/setup-codex-auth.sh          # 対話モード
#

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

prompt_identity() {
  echo "Select identity:" >&2
  echo "  1) personal" >&2
  echo "  2) corporate" >&2
  read -rp "Choice [1/2]: " choice
  case "$choice" in
    1) echo "personal" ;;
    2) echo "corporate" ;;
    *) echo "Error: Invalid choice" >&2; exit 1 ;;
  esac
}

IDENTITY="${1:-}"

if [[ -z "$IDENTITY" ]]; then
  IDENTITY=$(prompt_identity)
fi

case "$IDENTITY" in
  personal|corporate) ;;
  *) echo "Error: Unknown identity '${IDENTITY}'. Use 'personal' or 'corporate'." >&2; exit 1 ;;
esac

export CODEX_HOME="${REPO_ROOT}/.codex-${IDENTITY}"

if [[ ! -d "$CODEX_HOME" ]]; then
  echo "Error: ${CODEX_HOME} does not exist. Run configure.sh first." >&2
  exit 1
fi

echo "Logging in to Codex CLI (${IDENTITY})..."
echo "CODEX_HOME=${CODEX_HOME}"
codex login
