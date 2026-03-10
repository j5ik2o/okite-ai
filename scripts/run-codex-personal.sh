#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

export CODEX_HOME=${REPO_ROOT}/.codex-personal

ensure_local_codex_config() {
  local config_path="${CODEX_HOME}/config.toml"
  local base_config="${REPO_ROOT}/.codex/config.toml"
  local project_header="[projects.\"${REPO_ROOT}\"]"

  mkdir -p "${CODEX_HOME}"
  if [[ -L "${config_path}" ]]; then
    rm "${config_path}"
  fi
  if [[ ! -f "${config_path}" ]]; then
    cp "${base_config}" "${config_path}"
  fi
  if ! grep -Fq "${project_header}" "${config_path}"; then
    {
      echo ""
      echo "${project_header}"
      echo 'trust_level = "trusted"'
    } >> "${config_path}"
  fi
}

ensure_local_codex_config
# --happy オプションを検出して Happy Coder モードで起動
use_happy=false
args=()
for arg in "$@"; do
  if [[ "$arg" == "--happy" ]]; then
    use_happy=true
  else
    args+=("$arg")
  fi
done

if $use_happy; then
  exec happy codex "${args[@]}"
else
  exec codex --dangerously-bypass-approvals-and-sandbox "${args[@]}"
fi
