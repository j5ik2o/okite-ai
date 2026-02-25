#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
OKITE_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

# 第1引数でプロジェクトルートを指定可能（未指定時はOKITE_ROOT）
TARGET_ROOT="${1:-${OKITE_ROOT}}"

COMMON_MD="${TARGET_ROOT}/COMMON.md"
RULES_DIR="${TARGET_ROOT}/.agent/rules"
OUTPUT_FILE="${TARGET_ROOT}/AGENTS.md"

echo "Generating AGENTS.md..."
echo "  COMMON_MD: ${COMMON_MD}"
echo "  RULES_DIR: ${RULES_DIR}"
echo "  OUTPUT: ${OUTPUT_FILE}"

# Check COMMON.md exists
if [ ! -f "${COMMON_MD}" ]; then
  echo "Error: COMMON.md not found at ${COMMON_MD}"
  exit 1
fi

# Create rules directory if not exists
mkdir -p "${RULES_DIR}"

# Start with COMMON.md
cp "${COMMON_MD}" "${OUTPUT_FILE}"

# Append rules
append_rules() {
  local dir="$1"
  local label="$2"
  if ls "${dir}"/*.md 1>/dev/null 2>&1; then
    # shellcheck disable=SC2129
    echo "" >> "${OUTPUT_FILE}"
    echo "# ${label}" >> "${OUTPUT_FILE}"
    echo "" >> "${OUTPUT_FILE}"

    for rule_file in "${dir}"/*.md; do
      [ -e "$rule_file" ] || continue
      rule_name=$(basename "$rule_file" .md)
      echo "  - Appending rule: ${rule_name}"
      # shellcheck disable=SC2129
      echo "" >> "${OUTPUT_FILE}"
      cat "$rule_file" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
    done
  else
    echo "  No rules found in ${dir}"
  fi
}

append_rules "${RULES_DIR}" "Rules"
append_rules "${RULES_DIR}/rust" "Rust Rules"

echo ""
echo "Generated: ${OUTPUT_FILE}"
