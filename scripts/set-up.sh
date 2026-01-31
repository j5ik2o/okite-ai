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

echo "======================================"
echo "okite-ai setup"
echo "======================================"
echo "OKITE_ROOT=${OKITE_ROOT}"
echo "ROOT_DIR=${ROOT_DIR}"
echo ""

# .agent
echo "[1/6] Setting up .agent directory..."
if [[ "$SELF_MODE" == "true" ]]; then
  echo "  - Self mode: .agent already exists, skipping"
else
  mkdir -p "${ROOT_DIR}/.agent"
  ln -sf "../${OKITE_ROOT_REL}/.agent/CC-SDD.md" "${ROOT_DIR}/.agent/"
  echo "  - Linked CC-SDD.md"
  mkdir -p "${ROOT_DIR}/.agent/skills"
  find "${ROOT_DIR}/.agent/skills" -maxdepth 1 -type l -delete
  for f in "${OKITE_ROOT}/.agent/skills"/*; do
    [ -e "$f" ] || continue
    base_name=$(basename "$f")
    ln -sf "../../${OKITE_ROOT_REL}/.agent/skills/${base_name}" "${ROOT_DIR}/.agent/skills/"
    echo "  - Linked skills/${base_name}"
  done
  # okite-ai/.agent/rules -> .agent/rules
  mkdir -p "${ROOT_DIR}/.agent/rules"
  find "${ROOT_DIR}/.agent/rules" -maxdepth 1 -type l -delete
  for f in "${OKITE_ROOT}/.agent/rules"/*; do
    [ -e "$f" ] || continue
    base_name=$(basename "$f")
    ln -sf "../../${OKITE_ROOT_REL}/.agent/rules/${base_name}" "${ROOT_DIR}/.agent/rules/"
    echo "  - Linked rules/${base_name}"
  done
fi
echo "  Done."
echo ""

# .claude
echo "[2/6] Setting up .claude directory..."
# 既存のシンボリックリンクを削除してディレクトリを作成
if [[ -L "${ROOT_DIR}/.claude/skills" ]]; then
  rm "${ROOT_DIR}/.claude/skills"
fi
mkdir -p "${ROOT_DIR}/.claude/skills"
find "${ROOT_DIR}/.claude/skills" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
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
fi
# .agent/rules -> .claude/rules
if [[ -L "${ROOT_DIR}/.claude/rules" ]]; then
  rm "${ROOT_DIR}/.claude/rules"
fi
mkdir -p "${ROOT_DIR}/.claude/rules"
find "${ROOT_DIR}/.claude/rules" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/rules"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  ln -sf "../../.agent/rules/${base_name}" "${ROOT_DIR}/.claude/rules/"
  echo "  - Linked rules/${base_name}"
done
echo "  Done."
echo ""

# .codex
echo "[3/6] Setting up .codex directory..."
if [[ -L "${ROOT_DIR}/.codex/skills" ]]; then
  rm "${ROOT_DIR}/.codex/skills"
fi
mkdir -p "${ROOT_DIR}/.codex/skills"
find "${ROOT_DIR}/.codex/skills" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
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
fi
echo "  Done."
echo ""

# .gemini
echo "[4/6] Setting up .gemini directory..."
if [[ -L "${ROOT_DIR}/.gemini/skills" ]]; then
  rm "${ROOT_DIR}/.gemini/skills"
fi
mkdir -p "${ROOT_DIR}/.gemini/skills"
find "${ROOT_DIR}/.gemini/skills" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.gemini/skills/"
  echo "  - Linked skills/${base_name}"
done
echo "  Done."
echo ""

# .cursor
echo "[5/6] Setting up .cursor directory..."
if [[ -L "${ROOT_DIR}/.cursor/skills" ]]; then
  rm "${ROOT_DIR}/.cursor/skills"
fi
mkdir -p "${ROOT_DIR}/.cursor/skills"
find "${ROOT_DIR}/.cursor/skills" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/skills"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  ln -sf "../../.agent/skills/${base_name}" "${ROOT_DIR}/.cursor/skills/"
  echo "  - Linked skills/${base_name}"
done
# .agent/rules -> .cursor/rules
if [[ -L "${ROOT_DIR}/.cursor/rules" ]]; then
  rm "${ROOT_DIR}/.cursor/rules"
fi
mkdir -p "${ROOT_DIR}/.cursor/rules"
find "${ROOT_DIR}/.cursor/rules" -maxdepth 1 -type l -delete
for f in "${ROOT_DIR}/.agent/rules"/*; do
  [ -e "$f" ] || continue
  base_name=$(basename "$f")
  ln -sf "../../.agent/rules/${base_name}" "${ROOT_DIR}/.cursor/rules/"
  echo "  - Linked rules/${base_name}"
done
echo "  Done."
echo ""

# .kiro
echo "[6/6] Setting up .kiro directory..."
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
