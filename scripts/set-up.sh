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

# ======================================
# ヘルパー関数
# ======================================

# .agent/skills -> target_dir/skills へのシンボリックリンクを作成
link_agent_skills_to() {
  local target_dir="$1"
  remove_okite_symlink_path "${target_dir}/skills"
  mkdir -p "${target_dir}/skills"
  delete_okite_links_in_dir "${target_dir}/skills"
  for f in "${ROOT_DIR}/.agent/skills"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_skill_ignored "$base_name"; then
      echo "  - Skipped skills/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../.agent/skills/${base_name}" "${target_dir}/skills/"
    echo "  - Linked skills/${base_name}"
  done
}

# .agent/rules -> target_dir/rules へのシンボリックリンクを作成
link_agent_rules_to() {
  local target_dir="$1"
  remove_okite_symlink_path "${target_dir}/rules"
  mkdir -p "${target_dir}/rules"
  delete_okite_links_in_dir "${target_dir}/rules"
  for f in "${ROOT_DIR}/.agent/rules"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_rule_ignored "$base_name"; then
      echo "  - Skipped rules/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../.agent/rules/${base_name}" "${target_dir}/rules/"
    echo "  - Linked rules/${base_name}"
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

# ======================================
# セットアップ関数
# ======================================

setup_agent() {
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: .agent already exists, skipping"
    return
  fi
  mkdir -p "${ROOT_DIR}/.agent"
  ln -sf "../${OKITE_ROOT_REL}/.agent/CC-SDD.md" "${ROOT_DIR}/.agent/"
  echo "  - Linked CC-SDD.md"
  mkdir -p "${ROOT_DIR}/.agent/skills"
  delete_okite_links_in_dir "${ROOT_DIR}/.agent/skills"
  for f in "${OKITE_ROOT}/.agent/skills"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_skill_ignored "$base_name"; then
      echo "  - Skipped skills/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../${OKITE_ROOT_REL}/.agent/skills/${base_name}" "${ROOT_DIR}/.agent/skills/"
    echo "  - Linked skills/${base_name}"
  done
  mkdir -p "${ROOT_DIR}/.agent/rules"
  delete_okite_links_in_dir "${ROOT_DIR}/.agent/rules"
  for f in "${OKITE_ROOT}/.agent/rules"/*; do
    [ -e "$f" ] || continue
    local base_name
    base_name=$(basename "$f")
    if is_rule_ignored "$base_name"; then
      echo "  - Skipped rules/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../${OKITE_ROOT_REL}/.agent/rules/${base_name}" "${ROOT_DIR}/.agent/rules/"
    echo "  - Linked rules/${base_name}"
  done
}

setup_claude() {
  link_agent_skills_to "${ROOT_DIR}/.claude"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: commands already exist, skipping"
  else
    mkdir -p "${ROOT_DIR}/.claude/commands"
    ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/create-skill.md" "${ROOT_DIR}/.claude/commands/"
    echo "  - Linked commands/create-skill.md"
    ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/kiro" "${ROOT_DIR}/.claude/commands/"
    echo "  - Linked commands/kiro/"
    echo "  - Linked agents/kiro/"
    link_if_missing "../${OKITE_ROOT_REL}/.claude/settings.json" "${ROOT_DIR}/.claude/settings.json" "settings.json"
  fi
  link_agent_rules_to "${ROOT_DIR}/.claude"
}

setup_codex() {
  link_agent_skills_to "${ROOT_DIR}/.codex"
  if [[ "$SELF_MODE" == "true" ]]; then
    echo "  - Self mode: prompts already exist, skipping"
  else
    mkdir -p "${ROOT_DIR}/.codex/prompts"
    for f in "${OKITE_ROOT}/.codex/prompts"/kiro-*.md; do
      local base_name
      base_name=$(basename "$f")
      ln -sf "../../${OKITE_ROOT_REL}/.codex/prompts/${base_name}" "${ROOT_DIR}/.codex/prompts/"
      echo "  - Linked prompts/${base_name}"
    done
    link_if_missing "../${OKITE_ROOT_REL}/.codex/config.toml" "${ROOT_DIR}/.codex/config.toml" "config.toml"
  fi
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
  "setup_agent:.agent"
  "setup_mcp:.mcp.json"
  "setup_claude:.claude"
  "setup_codex:.codex"
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
bash "${OKITE_SCRIPT_DIR}/generate-agents-md.sh"

echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
