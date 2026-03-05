#!/usr/bin/env bash
#
# ~/.codex-{personal,corporate}/auth.json へのシンボリックリンクを
# プロジェクトローカルの .codex-{personal,corporate}/ に作成する。
#
# 使い方:
#   ./scripts/link-codex-auth.sh personal
#   ./scripts/link-codex-auth.sh corporate
#   ./scripts/link-codex-auth.sh          # 両方
#

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

link_auth() {
  local identity="$1"
  local local_dir="${REPO_ROOT}/.codex-${identity}"
  local home_auth="${HOME}/.codex-${identity}/auth.json"
  local link_path="${local_dir}/auth.json"

  if [[ ! -d "$local_dir" ]]; then
    echo "Error: ${local_dir} does not exist. Run configure.sh first." >&2
    return 1
  fi

  if [[ ! -f "$home_auth" ]]; then
    echo "Warning: ${home_auth} does not exist. Skipping ${identity}." >&2
    return 1
  fi

  if [[ -L "$link_path" ]]; then
    echo "  - ${identity}: already linked ($(readlink "$link_path"))"
    return 0
  fi

  if [[ -e "$link_path" ]]; then
    echo "  - ${identity}: auth.json already exists (not a symlink). Skipping." >&2
    return 1
  fi

  ln -s "$home_auth" "$link_path"
  echo "  - ${identity}: linked auth.json -> ${home_auth}"
}

IDENTITY="${1:-}"

case "$IDENTITY" in
  personal|corporate)
    link_auth "$IDENTITY"
    ;;
  "")
    echo "Linking codex auth.json..."
    link_auth "personal" || true
    link_auth "corporate" || true
    ;;
  *)
    echo "Error: Unknown identity '${IDENTITY}'. Use 'personal', 'corporate', or no argument for both." >&2
    exit 1
    ;;
esac
