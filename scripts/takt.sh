#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

export TAKT_CODEX_CLI_PATH=$(which codex)
export CODEX_HOME=${REPO_ROOT}/.codex

cd "${REPO_ROOT}"

# --model GLM-5 が引数ペアとして存在すれば GLM 環境をセットアップ
prev=""
for arg in "$@"; do
  if [[ "$prev" == "--model" && "$arg" == "GLM-5" ]]; then
    if [[ ! -f "$HOME/.config/glm/env" ]]; then
      echo "エラー: $HOME/.config/glm/env が見つかりません。" >&2
      exit 1
    fi
    # shellcheck disable=SC1091
    . "$HOME/.config/glm/env"
    export ANTHROPIC_AUTH_TOKEN="${GLM_API_KEY}"
    export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
    export API_TIMEOUT_MS="3000000"
    break
  fi
  prev="$arg"
done

exec takt "$@"
