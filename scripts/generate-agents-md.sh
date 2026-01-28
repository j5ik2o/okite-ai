#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
OKITE_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

COMMON_MD="${OKITE_ROOT}/COMMON.md"
RULES_DIR="${OKITE_ROOT}/.agent/rules"
OUTPUT_FILE="${OKITE_ROOT}/AGENTS.md"

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
if ls "${RULES_DIR}"/*.md 1>/dev/null 2>&1; then
  echo "" >> "${OUTPUT_FILE}"
  echo "# Rules" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"

  for rule_file in "${RULES_DIR}"/*.md; do
    [ -e "$rule_file" ] || continue
    rule_name=$(basename "$rule_file" .md)
    echo "  - Appending rule: ${rule_name}"
    echo "" >> "${OUTPUT_FILE}"
    cat "$rule_file" >> "${OUTPUT_FILE}"
    echo "" >> "${OUTPUT_FILE}"
  done
else
  echo "  No rules found in ${RULES_DIR}"
fi

echo ""
echo "Generated: ${OUTPUT_FILE}"
