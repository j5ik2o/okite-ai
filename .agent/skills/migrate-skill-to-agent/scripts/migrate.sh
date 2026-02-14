#!/usr/bin/env bash
set -euo pipefail

# Usage: migrate.sh <skill-name> [project-root]
# Moves a skill from .claude/skills/<name> to .agent/skills/<name>
# and creates symlinks from .claude/skills/ and .codex/skills/

SKILL_NAME="${1:?Usage: migrate.sh <skill-name> [project-root]}"
PROJECT_ROOT="${2:-.}"

AGENT_DIR="${PROJECT_ROOT}/.agent/skills/${SKILL_NAME}"
CLAUDE_DIR="${PROJECT_ROOT}/.claude/skills/${SKILL_NAME}"
CODEX_DIR="${PROJECT_ROOT}/.codex/skills/${SKILL_NAME}"
RELATIVE_LINK="../../.agent/skills/${SKILL_NAME}"

# Validation
if [ ! -d "${CLAUDE_DIR}" ]; then
  echo "ERROR: ${CLAUDE_DIR} does not exist" >&2
  exit 1
fi

if [ -L "${CLAUDE_DIR}" ]; then
  echo "ERROR: ${CLAUDE_DIR} is already a symlink" >&2
  exit 1
fi

if [ -d "${AGENT_DIR}" ]; then
  echo "ERROR: ${AGENT_DIR} already exists" >&2
  exit 1
fi

# Ensure parent directories exist
mkdir -p "${PROJECT_ROOT}/.agent/skills"
mkdir -p "${PROJECT_ROOT}/.codex/skills"

# Move to .agent/skills/
mv "${CLAUDE_DIR}" "${AGENT_DIR}"
echo "Moved: ${CLAUDE_DIR} -> ${AGENT_DIR}"

# Create .claude/skills/ symlink
ln -s "${RELATIVE_LINK}" "${CLAUDE_DIR}"
echo "Linked: ${CLAUDE_DIR} -> ${RELATIVE_LINK}"

# Create .codex/skills/ symlink (remove if exists)
if [ -L "${CODEX_DIR}" ]; then
  rm "${CODEX_DIR}"
fi
ln -s "${RELATIVE_LINK}" "${CODEX_DIR}"
echo "Linked: ${CODEX_DIR} -> ${RELATIVE_LINK}"

echo ""
echo "Done: ${SKILL_NAME} migrated to .agent/skills/"
