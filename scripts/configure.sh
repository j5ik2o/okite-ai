#!/usr/bin/env bash

set -e

# --self フラグ: okite-ai自体をセットアップする場合に使用
SELF_MODE=false
if [[ "$1" == "--self" ]]; then
  SELF_MODE=true
fi

OKITE_SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
OKITE_ROOT=$(cd "${OKITE_SCRIPT_DIR}/.." && pwd)

if [[ "$SELF_MODE" == "true" ]]; then
  ROOT_DIR="${OKITE_ROOT}"
  OKITE_ROOT_REL="."
else
  ROOT_DIR=$(cd "${OKITE_ROOT}/../.." && pwd)
  OKITE_ROOT_REL=${OKITE_ROOT#${ROOT_DIR}/}
fi

# Link source directories and prefix (1-hop symlinks)
if [[ "$SELF_MODE" == "true" ]]; then
  SKILLS_SOURCE="${ROOT_DIR}/skills"
  RULES_SOURCE="${ROOT_DIR}/.agents/rules"
  COMMANDS_SOURCE="${ROOT_DIR}/.agents/commands"
  SKILLS_LINK_PREFIX="../../skills"
  RULES_LINK_PREFIX="../../.agents/rules"
  COMMANDS_LINK_PREFIX="../../.agents/commands"
else
  SKILLS_SOURCE="${OKITE_ROOT}/skills"
  RULES_SOURCE="${OKITE_ROOT}/.agents/rules"
  COMMANDS_SOURCE="${OKITE_ROOT}/.agents/commands"
  SKILLS_LINK_PREFIX="../../${OKITE_ROOT_REL}/skills"
  RULES_LINK_PREFIX="../../${OKITE_ROOT_REL}/.agents/rules"
  COMMANDS_LINK_PREFIX="../../${OKITE_ROOT_REL}/.agents/commands"
fi

OKITE_IGNORE_FILE="${ROOT_DIR}/.okite_ignore"
IGNORE_SKILLS=()
IGNORE_RULES=()

resolve_path() {
  local path="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$path" <<'PY'
import os
import sys
print(os.path.realpath(sys.argv[1]))
PY
  else
    realpath "$path"
  fi
}

trim_whitespace() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

load_okite_ignore() {
  local file="$1"
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(trim_whitespace "$line")"
    [[ -z "$line" ]] && continue
    case "$line" in
    skills/*)
      IGNORE_SKILLS+=("${line#skills/}")
      ;;
    rules/*)
      IGNORE_RULES+=("${line#rules/}")
      ;;
    *)
      IGNORE_SKILLS+=("$line")
      IGNORE_RULES+=("$line")
      ;;
    esac
  done <"$file"
}

matches_ignore() {
  local name="$1"
  shift
  local pattern
  for pattern in "$@"; do
    [[ -z "$pattern" ]] && continue
    if [[ "$name" == $pattern ]]; then
      return 0
    fi
  done
  return 1
}

is_skill_ignored() {
  matches_ignore "$1" "${IGNORE_SKILLS[@]}"
}

is_rule_ignored() {
  matches_ignore "$1" "${IGNORE_RULES[@]}"
}

link_target_abs() {
  local link="$1"
  local target
  target=$(readlink "$link") || return 1
  if [[ "$target" != /* ]]; then
    target="$(dirname "$link")/$target"
  fi
  resolve_path "$target"
}

is_okite_managed_link() {
  local link="$1"
  local target_abs
  target_abs=$(link_target_abs "$link") || return 1
  case "$target_abs" in
  "${OKITE_ROOT_ABS}" | "${OKITE_ROOT_ABS}/"*)
    return 0
    ;;
  *)
    return 1
    ;;
  esac
}

remove_okite_symlink_path() {
  local path="$1"
  if [[ -L "$path" ]] && is_okite_managed_link "$path"; then
    rm "$path"
  fi
}

delete_okite_links_in_dir() {
  local dir="$1"
  local link
  while IFS= read -r -d '' link; do
    if is_okite_managed_link "$link"; then
      rm "$link"
    fi
  done < <(find "$dir" -maxdepth 1 -type l -print0)
}

prepare_link_destination() {
  local path="$1"
  if [[ -L "$path" || -e "$path" ]]; then
    rm -rf "$path"
  fi
}

# ======================================
# ヘルパー関数
# ======================================

# skills -> target_dir/skills へのシンボリックリンクを作成（1-hop）
link_agent_skills_to() {
  local target_dir="$1"
  remove_okite_symlink_path "${target_dir}/skills"
  mkdir -p "${target_dir}/skills"
  delete_okite_links_in_dir "${target_dir}/skills"
  for f in "${SKILLS_SOURCE}"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_skill_ignored "$base_name"; then
      echo "  - Skipped skills/${base_name} (ignored)"
      continue
    fi
    local link_path
    link_path="${target_dir}/skills/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "${SKILLS_LINK_PREFIX}/${base_name}" "$link_path"
    echo "  - Linked skills/${base_name}"
  done
}

# rules -> target_dir/rules へのシンボリックリンクを作成（1-hop）
link_agent_rules_to() {
  local target_dir="$1"
  remove_okite_symlink_path "${target_dir}/rules"
  mkdir -p "${target_dir}/rules"
  delete_okite_links_in_dir "${target_dir}/rules"
  for f in "${RULES_SOURCE}"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_rule_ignored "$base_name"; then
      echo "  - Skipped rules/${base_name} (ignored)"
      continue
    fi
    local link_path
    link_path="${target_dir}/rules/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "${RULES_LINK_PREFIX}/${base_name}" "$link_path"
    echo "  - Linked rules/${base_name}"
  done
}

# commands -> target_dir/dest_subdir へのシンボリックリンクを作成（1-hop）
# Usage: link_agent_commands_to <target_dir> <dest_subdir>
#   例: link_agent_commands_to ".claude" "commands"  -> .claude/commands/
#   例: link_agent_commands_to ".codex"  "prompts"   -> .codex/prompts/
link_agent_commands_to() {
  local target_dir="$1"
  local dest_subdir="$2"
  mkdir -p "${target_dir}/${dest_subdir}"
  delete_okite_links_in_dir "${target_dir}/${dest_subdir}"
  for f in "${COMMANDS_SOURCE}"/*.md; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    local link_path
    link_path="${target_dir}/${dest_subdir}/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "${COMMANDS_LINK_PREFIX}/${base_name}" "$link_path"
    echo "  - Linked ${dest_subdir}/${base_name}"
  done
}

link_if_missing() {
  local src="$1"
  local dest="$2"
  local label="$3"
  if [[ -L "$dest" || -e "$dest" ]]; then
    echo "  - Skipped ${label} (already exists)"
    return
  fi
  ln -s "$src" "$dest"
  echo "  - Linked ${label}"
}

link_if_source_exists_and_missing() {
  local src="$1"
  local dest="$2"
  local label="$3"
  if [[ ! -e "$src" ]]; then
    echo "  - Skipped ${label} (template missing)"
    return
  fi
  link_if_missing "$src" "$dest" "$label"
}

link_named_directory() {
  local src="$1"
  local dest="$2"
  local label="$3"
  prepare_link_destination "$dest"
  ln -s "$src" "$dest"
  echo "  - Linked ${label}"
}

link_matching_files() {
  local source_dir="$1"
  local pattern="$2"
  local dest_dir="$3"
  local label_prefix="$4"
  local f
  for f in "${source_dir}"/${pattern}; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    local link_path
    link_path="${dest_dir}/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "../../${OKITE_ROOT_REL}/${source_dir#${OKITE_ROOT}/}/${base_name}" "$link_path"
    echo "  - Linked ${label_prefix}/${base_name}"
  done
}

# ======================================
# セットアップ関数
# ======================================

setup_agent() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: .agents already exists, skipping"
    return
  fi
  mkdir -p "${ROOT_DIR}/.agents"
  prepare_link_destination "${ROOT_DIR}/.agents/CC-SDD.md"
  ln -s "../${OKITE_ROOT_REL}/.agents/CC-SDD.md" "${ROOT_DIR}/.agents/CC-SDD.md"
  echo "  - Linked CC-SDD.md"
  mkdir -p "${ROOT_DIR}/.agents/skills"
  delete_okite_links_in_dir "${ROOT_DIR}/.agents/skills"
  for f in "${OKITE_ROOT}/skills"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_skill_ignored "$base_name"; then
      echo "  - Skipped skills/${base_name} (ignored)"
      continue
    fi
    local link_path
    link_path="${ROOT_DIR}/.agents/skills/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "../../${OKITE_ROOT_REL}/skills/${base_name}" "$link_path"
    echo "  - Linked skills/${base_name}"
  done
  mkdir -p "${ROOT_DIR}/.agents/commands"
  delete_okite_links_in_dir "${ROOT_DIR}/.agents/commands"
  for f in "${OKITE_ROOT}/.agents/commands"/*.md; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    local link_path
    link_path="${ROOT_DIR}/.agents/commands/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "../../${OKITE_ROOT_REL}/.agents/commands/${base_name}" "$link_path"
    echo "  - Linked commands/${base_name}"
  done
  mkdir -p "${ROOT_DIR}/.agents/rules"
  delete_okite_links_in_dir "${ROOT_DIR}/.agents/rules"
  for f in "${OKITE_ROOT}/.agents/rules"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_rule_ignored "$base_name"; then
      echo "  - Skipped rules/${base_name} (ignored)"
      continue
    fi
    local link_path
    link_path="${ROOT_DIR}/.agents/rules/${base_name}"
    prepare_link_destination "$link_path"
    ln -s "../../${OKITE_ROOT_REL}/.agents/rules/${base_name}" "$link_path"
    echo "  - Linked rules/${base_name}"
  done
}

setup_claude() {
  link_agent_skills_to "${ROOT_DIR}/.claude"
  link_agent_commands_to "${ROOT_DIR}/.claude" "commands"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: commands already exist, skipping"
  else
    mkdir -p "${ROOT_DIR}/.claude/commands"
    prepare_link_destination "${ROOT_DIR}/.claude/commands/create-skill.md"
    ln -s "../../${OKITE_ROOT_REL}/.claude/commands/create-skill.md" "${ROOT_DIR}/.claude/commands/create-skill.md"
    echo "  - Linked commands/create-skill.md"
    link_named_directory "../../${OKITE_ROOT_REL}/.claude/commands/kiro" "${ROOT_DIR}/.claude/commands/kiro" "commands/kiro/"
    link_named_directory "../../${OKITE_ROOT_REL}/.claude/commands/opsx" "${ROOT_DIR}/.claude/commands/opsx" "commands/opsx/"
    link_if_missing "../${OKITE_ROOT_REL}/.claude/settings.json" "${ROOT_DIR}/.claude/settings.json" "settings.json"
  fi
  link_agent_rules_to "${ROOT_DIR}/.claude"
}

setup_codex() {
  link_agent_skills_to "${ROOT_DIR}/.codex"
  link_agent_commands_to "${ROOT_DIR}/.codex" "prompts"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: prompts already exist, skipping"
  else
    mkdir -p "${ROOT_DIR}/.codex/prompts"
    link_matching_files "${OKITE_ROOT}/.codex/prompts" "kiro-*.md" "${ROOT_DIR}/.codex/prompts" "prompts"
    link_matching_files "${OKITE_ROOT}/.codex/prompts" "opsx-*.md" "${ROOT_DIR}/.codex/prompts" "prompts"
    prepare_link_destination "${ROOT_DIR}/.codex/config.toml"
    cp "${OKITE_ROOT}/.codex/config.toml" "${ROOT_DIR}/.codex/config.toml"
    echo "  - Copied config.toml"
    mkdir -p "${ROOT_DIR}/.codex/skills"
    prepare_link_destination "${ROOT_DIR}/.codex/skills/.system"
    ln -s "../../${OKITE_ROOT_REL}/.codex/skills/.system" "${ROOT_DIR}/.codex/skills/.system"
    echo "  - Linked skills/.system"
    prepare_link_destination "${ROOT_DIR}/.codex/.personality_migration"
    ln -s "../${OKITE_ROOT_REL}/.codex/.personality_migration" "${ROOT_DIR}/.codex/.personality_migration"
    echo "  - Linked .personality_migration"
    prepare_link_destination "${ROOT_DIR}/.codex/AGENTS.md"
    ln -s "../AGENTS.md" "${ROOT_DIR}/.codex/AGENTS.md"
    echo "  - Linked AGENTS.md"
  fi
}

setup_codex_identities() {
  local identity
  for identity in personal corporate; do
    local id_dir="${ROOT_DIR}/.codex-${identity}"
    local config_source
    mkdir -p "${id_dir}"
    prepare_link_destination "${id_dir}/config.toml"
    if [[ "$SELF_MODE" == "true" ]]; then
      config_source="${ROOT_DIR}/.codex/config.toml"
    else
      config_source="${OKITE_ROOT}/.codex/config.toml"
    fi
    cp "${config_source}" "${id_dir}/config.toml"
    echo "  - Copied .codex-${identity}/config.toml"
    # skills/prompts はディレクトリごとリンク（.codex/ と同じ実体を共有）
    prepare_link_destination "${id_dir}/skills"
    ln -s "../.codex/skills" "${id_dir}/skills"
    echo "  - Linked .codex-${identity}/skills"
    prepare_link_destination "${id_dir}/prompts"
    ln -s "../.codex/prompts" "${id_dir}/prompts"
    echo "  - Linked .codex-${identity}/prompts"
  done
  echo "  - NOTE: Run 'CODEX_HOME=.codex-personal codex login' and 'CODEX_HOME=.codex-corporate codex login' to set up authentication"
}

setup_gemini() {
  link_agent_skills_to "${ROOT_DIR}/.gemini"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: settings already exist, skipping"
  else
    link_if_missing "../${OKITE_ROOT_REL}/.gemini/settings.json" "${ROOT_DIR}/.gemini/settings.json" "settings.json"
  fi
}

setup_mcp() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: mcp config already exists, skipping"
    return
  fi
  link_if_missing "${OKITE_ROOT_REL}/.mcp.json" "${ROOT_DIR}/.mcp.json" ".mcp.json"
}

setup_cursor() {
  link_agent_skills_to "${ROOT_DIR}/.cursor"
  link_agent_rules_to "${ROOT_DIR}/.cursor"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: settings already exist, skipping"
  else
    link_if_source_exists_and_missing "../${OKITE_ROOT_REL}/.cursor/settings.json" "${ROOT_DIR}/.cursor/settings.json" "settings.json"
  fi
}

setup_opencode() {
  link_agent_skills_to "${ROOT_DIR}/.opencode"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: settings already exist, skipping"
  else
    link_if_source_exists_and_missing "../${OKITE_ROOT_REL}/.opencode/settings.json" "${ROOT_DIR}/.opencode/settings.json" "settings.json"
  fi
}

setup_kiro() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: .kiro already exists, skipping"
    return
  fi
  mkdir -p "${ROOT_DIR}/.kiro"
  ln -sf "../${OKITE_ROOT_REL}/.kiro/settings" "${ROOT_DIR}/.kiro/"
  echo "  - Linked settings/"
}

setup_common_md() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: COMMON.md setup skipping"
    return
  fi
  if [[ ! -f "${ROOT_DIR}/COMMON.md" ]]; then
    echo "- 日本語でやりとりしてください" >"${ROOT_DIR}/COMMON.md"
    echo "  - Created COMMON.md"
  else
    echo "  - COMMON.md already exists, skipping"
  fi
  ln -sf "COMMON.md" "${ROOT_DIR}/CLAUDE.md"
  echo "  - Linked CLAUDE.md -> COMMON.md"
  ln -sf "COMMON.md" "${ROOT_DIR}/GEMINI.md"
  echo "  - Linked GEMINI.md -> COMMON.md"
}

setup_scripts() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: scripts already exist, skipping"
    return
  fi
  mkdir -p "${ROOT_DIR}/scripts"
  delete_okite_links_in_dir "${ROOT_DIR}/scripts"
  for f in "${OKITE_ROOT}/scripts"/run-*.sh; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    ln -sf "../${OKITE_ROOT_REL}/scripts/${base_name}" "${ROOT_DIR}/scripts/"
    echo "  - Linked ${base_name}"
  done
  ln -sf "../${OKITE_ROOT_REL}/scripts/generate-agents-md.sh" "${ROOT_DIR}/scripts/"
  echo "  - Linked generate-agents-md.sh"
}

# ======================================
# メイン処理
# ======================================

if [[ -f "$OKITE_IGNORE_FILE" ]]; then
  load_okite_ignore "$OKITE_IGNORE_FILE"
fi

OKITE_ROOT_ABS=$(resolve_path "$OKITE_ROOT")

echo "======================================"
echo "okite-ai setup"
echo "======================================"
echo "OKITE_ROOT=${OKITE_ROOT}"
echo "ROOT_DIR=${ROOT_DIR}"
if [[ -f "$OKITE_IGNORE_FILE" ]]; then
  echo "OKITE_IGNORE=${OKITE_IGNORE_FILE}"
fi
echo ""

STEPS=(
  "setup_common_md:COMMON.md"
  "setup_agent:.agents"
  "setup_mcp:.mcp.json"
  "setup_claude:.claude"
  "setup_codex:.codex"
  "setup_codex_identities:.codex-personal/.codex-corporate"
  "setup_gemini:.gemini"
  "setup_cursor:.cursor"
  "setup_opencode:.opencode"
  "setup_kiro:.kiro"
  "setup_scripts:scripts"
)
TOTAL=${#STEPS[@]}

for i in "${!STEPS[@]}"; do
  func="${STEPS[$i]%%:*}"
  label="${STEPS[$i]##*:}"
  echo "[$((i + 1))/${TOTAL}] Setting up ${label} directory..."
  "$func"
  echo "  Done."
  echo ""
done

echo "======================================"
echo "Generating AGENTS.md..."
echo "======================================"
bash "${OKITE_SCRIPT_DIR}/generate-agents-md.sh" "${ROOT_DIR}"

echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
