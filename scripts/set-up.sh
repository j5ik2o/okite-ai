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
    python3 - <<'PY' "$path"
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
  done < "$file"
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
    "${OKITE_ROOT_ABS}"|"${OKITE_ROOT_ABS}/"*)
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

# .agent
echo "[1/7] Setting up .agent directory..."
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: .agent already exists, skipping"
else
  mkdir -p "${ROOT_DIR}/.agent"
  ln -sf "../${OKITE_ROOT_REL}/.agent/CC-SDD.md" "${ROOT_DIR}/.agent/"
  echo "  - Linked CC-SDD.md"
  mkdir -p "${ROOT_DIR}/.agent/skills"
  delete_okite_links_in_dir "${ROOT_DIR}/.agent/skills"
  for f in "${OKITE_ROOT}/.agent/skills"/*; do
    [ -e "$f" ] || continue
    base_name=$(basename "$f")
    if is_skill_ignored "$base_name"; then
      echo "  - Skipped skills/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../${OKITE_ROOT_REL}/.agent/skills/${base_name}" "${ROOT_DIR}/.agent/skills/"
    echo "  - Linked skills/${base_name}"
  done
  # okite-ai/.agent/rules -> .agent/rules
  mkdir -p "${ROOT_DIR}/.agent/rules"
  delete_okite_links_in_dir "${ROOT_DIR}/.agent/rules"
  for f in "${OKITE_ROOT}/.agent/rules"/*; do
    [ -e "$f" ] || continue
    base_name=$(basename "$f")
    if is_rule_ignored "$base_name"; then
      echo "  - Skipped rules/${base_name} (ignored)"
      continue
    fi
    ln -sf "../../${OKITE_ROOT_REL}/.agent/rules/${base_name}" "${ROOT_DIR}/.agent/rules/"
    echo "  - Linked rules/${base_name}"
  done
fi
echo "  Done."
echo ""

# .claude
echo "[2/7] Setting up .claude directory..."
# 既存のシンボリックリンクを削除してディレクトリを作成
remove_okite_symlink_path "${ROOT_DIR}/.claude/skills"
mkdir -p "${ROOT_DIR}/.claude/skills"
delete_okite_links_in_dir "${ROOT_DIR}/.claude/skills"
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_skill_ignored "$base_name"; then
    echo "  - Skipped skills/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.claude/skills/"
  echo "  - Linked skills/${base_name}"
done
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: commands already exist, skipping"
else
  mkdir -p "${ROOT_DIR}/.claude/commands"
  ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/create-skill.md" "${ROOT_DIR}/.claude/commands/"
  echo "  - Linked commands/create-skill.md"
  ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/kiro" "${ROOT_DIR}/.claude/commands/"
  echo "  - Linked commands/kiro/"
  echo "  - Linked agents/kiro/"
  ln -sf "../${OKITE_ROOT_REL}/.claude/settings.json" "${ROOT_DIR}/.claude/"
  echo "  - Linked settings.json"
fi
# .agent/rules -> .claude/rules
remove_okite_symlink_path "${ROOT_DIR}/.claude/rules"
mkdir -p "${ROOT_DIR}/.claude/rules"
delete_okite_links_in_dir "${ROOT_DIR}/.claude/rules"
for f in "${ROOT_DIR}/.agent/rules"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_rule_ignored "$base_name"; then
    echo "  - Skipped rules/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/rules/${base_name}" "${ROOT_DIR}/.claude/rules/"
  echo "  - Linked rules/${base_name}"
done
echo "  Done."
echo ""

# .codex
echo "[3/7] Setting up .codex directory..."
remove_okite_symlink_path "${ROOT_DIR}/.codex/skills"
mkdir -p "${ROOT_DIR}/.codex/skills"
delete_okite_links_in_dir "${ROOT_DIR}/.codex/skills"
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_skill_ignored "$base_name"; then
    echo "  - Skipped skills/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.codex/skills/"
  echo "  - Linked skills/${base_name}"
done
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: prompts already exist, skipping"
else
  mkdir -p "${ROOT_DIR}/.codex/prompts"
  for f in "${OKITE_ROOT}/.codex/prompts"/kiro-*.md; do
    base_name=$(basename "$f")
    ln -sf "../../${OKITE_ROOT_REL}/.codex/prompts/${base_name}" "${ROOT_DIR}/.codex/prompts/"
    echo "  - Linked prompts/${base_name}"
  done
  ln -sf "../${OKITE_ROOT_REL}/.codex/config.toml" "${ROOT_DIR}/.codex/"
  echo "  - Linked config.toml"
fi
echo "  Done."
echo ""

# .gemini
echo "[4/7] Setting up .gemini directory..."
remove_okite_symlink_path "${ROOT_DIR}/.gemini/skills"
mkdir -p "${ROOT_DIR}/.gemini/skills"
delete_okite_links_in_dir "${ROOT_DIR}/.gemini/skills"
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_skill_ignored "$base_name"; then
    echo "  - Skipped skills/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.gemini/skills/"
  echo "  - Linked skills/${base_name}"
done
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: settings already exist, skipping"
else
  ln -sf "../${OKITE_ROOT_REL}/.gemini/settings.json" "${ROOT_DIR}/.gemini/"
  echo "  - Linked settings.json"
fi
echo "  Done."
echo ""

# .cursor
echo "[5/7] Setting up .cursor directory..."
remove_okite_symlink_path "${ROOT_DIR}/.cursor/skills"
mkdir -p "${ROOT_DIR}/.cursor/skills"
delete_okite_links_in_dir "${ROOT_DIR}/.cursor/skills"
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_skill_ignored "$base_name"; then
    echo "  - Skipped skills/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.cursor/skills/"
  echo "  - Linked skills/${base_name}"
done
# .agent/rules -> .cursor/rules
remove_okite_symlink_path "${ROOT_DIR}/.cursor/rules"
mkdir -p "${ROOT_DIR}/.cursor/rules"
delete_okite_links_in_dir "${ROOT_DIR}/.cursor/rules"
for f in "${ROOT_DIR}/.agent/rules"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_rule_ignored "$base_name"; then
    echo "  - Skipped rules/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/rules/${base_name}" "${ROOT_DIR}/.cursor/rules/"
  echo "  - Linked rules/${base_name}"
done
echo "  Done."
echo ""

# .opencode
echo "[6/7] Setting up .opencode directory..."
remove_okite_symlink_path "${ROOT_DIR}/.opencode/skills"
mkdir -p "${ROOT_DIR}/.opencode/skills"
delete_okite_links_in_dir "${ROOT_DIR}/.opencode/skills"
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  if is_skill_ignored "$base_name"; then
    echo "  - Skipped skills/${base_name} (ignored)"
    continue
  fi
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.opencode/skills/"
  echo "  - Linked skills/${base_name}"
done
echo "  Done."
echo ""

# .kiro
echo "[7/7] Setting up .kiro directory..."
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: .kiro already exists, skipping"
else
  mkdir -p "${ROOT_DIR}/.kiro"
  ln -sf "../${OKITE_ROOT_REL}/.kiro/settings" "${ROOT_DIR}/.kiro/"
  echo "  - Linked settings/"
fi
echo "  Done."
echo ""

echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
