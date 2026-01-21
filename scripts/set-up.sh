#!/usr/bin/env bash

set -e

OKITE_SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
OKITE_ROOT=$(cd "${OKITE_SCRIPT_DIR}/.." && pwd)
ROOT_DIR=$(cd "${OKITE_ROOT}/../.." && pwd)
OKITE_ROOT_REL=${OKITE_ROOT#${ROOT_DIR}/}

echo "======================================"
echo "okite-ai setup"
echo "======================================"
echo "OKITE_ROOT=${OKITE_ROOT}"
echo "ROOT_DIR=${ROOT_DIR}"
echo ""

# .agent
echo "[1/4] Setting up .agent directory..."
mkdir -p "${ROOT_DIR}/.agent"
ln -sf "../${OKITE_ROOT_REL}/.agent/CC-SDD.md" "${ROOT_DIR}/.agent/"
echo "  - Linked CC-SDD.md"
ln -sf "../${OKITE_ROOT_REL}/.agent/skills" "${ROOT_DIR}/.agent/"
echo "  - Linked skills/"
echo "  Done."
echo ""

# .claude
echo "[2/4] Setting up .claude directory..."
mkdir -p "${ROOT_DIR}/.claude"
ln -sf "../.agent/skills" "${ROOT_DIR}/.claude/"
echo "  - Linked skills/"
mkdir -p "${ROOT_DIR}/.claude/commands"
ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/create-skill.md" "${ROOT_DIR}/.claude/commands/"
echo "  - Linked commands/create-skill.md"
ln -sf "../../${OKITE_ROOT_REL}/.claude/commands/kiro" "${ROOT_DIR}/.claude/commands/"
echo "  - Linked commands/kiro/"
mkdir -p "${ROOT_DIR}/.claude/agents"
ln -sf "../../${OKITE_ROOT_REL}/.claude/agents/kiro" "${ROOT_DIR}/.claude/agents/"
echo "  - Linked agents/kiro/"
echo "  Done."
echo ""

# .codex
echo "[3/4] Setting up .codex directory..."
mkdir -p "${ROOT_DIR}/.codex"
ln -sf "../.agent/skills" "${ROOT_DIR}/.codex/"
echo "  - Linked skills/"
mkdir -p "${ROOT_DIR}/.codex/prompts"
for f in "${OKITE_ROOT}/.codex/prompts"/kiro-*.md; do
  base_name=$(basename "$f")
  ln -sf "../../${OKITE_ROOT_REL}/.codex/prompts/${base_name}" "${ROOT_DIR}/.codex/prompts/"
  echo "  - Linked prompts/${base_name}"
done
echo "  Done."
echo ""

# .kiro
echo "[4/4] Setting up .kiro directory..."
mkdir -p "${ROOT_DIR}/.kiro"
ln -sf "../${OKITE_ROOT_REL}/.kiro/settings" "${ROOT_DIR}/.kiro/"
echo "  - Linked settings/"
echo "  Done."
echo ""

echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
