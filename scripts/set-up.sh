#!/usr/bin/env bash

OKITE_SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
OKITE_ROOT=$(cd "${OKITE_SCRIPT_DIR}/.." && pwd)
ROOT_DIR=$(cd "${OKITE_ROOT}/../.." && pwd)

echo "OKITE_ROOT=${OKITE_ROOT}"
echo "ROOT_DIR=${ROOT_DIR}"

mkdir -p "${ROOT_DIR}/.agent"

# .agent
ln -sf "${OKITE_ROOT}/.agent/CC-SDD.md" "${ROOT_DIR}/.agent/"
ln -sf "${OKITE_ROOT}/.agent/skills" "${ROOT_DIR}/.agent/"

# .claude
mkdir -p "${ROOT_DIR}/.claude"
ln -sf "${ROOT_DIR}/.agent/skills" "${ROOT_DIR}/.claude/"
mkdir -p "${ROOT_DIR}/.claude/commands"
ln -sf "${OKITE_ROOT}/.claude/commands/create-skill.md" "${ROOT_DIR}/.claude/commands/"
ln -sf "${OKITE_ROOT}/.claude/commands/kiro" "${ROOT_DIR}/.claude/commands/"
mkdir -p "${ROOT_DIR}/.claude/agents"
ln -sf "${OKITE_ROOT}/.claude/agents/kiro" "${ROOT_DIR}/.claude/agents/"

# .codex
mkdir -p "${ROOT_DIR}/.codex"
ln -sf "${ROOT_DIR}/.agent/skills" "${ROOT_DIR}/.codex/"
mkdir -p "${ROOT_DIR}/.codex/prompts"
for f in "${OKITE_ROOT}/.codex/prompts"/kiro-*.md; do
  ln -sf "$f" "${ROOT_DIR}/.codex/prompts/"
done
