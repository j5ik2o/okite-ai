#!/usr/bin/env bash

export CLAUDE_IDENTITY="personal"
export CLAUDE_CONFIG_DIR="${HOME}/.claude-${CLAUDE_IDENTITY}"

# 親プロセス（Claude Code セッション等）から継承した OAuth トークンを除去し、
# CLAUDE_CONFIG_DIR に対応する keychain エントリから認証情報を読ませる
unset CLAUDE_CODE_OAUTH_TOKEN

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
  exec happy --permission-mode bypassPermissions "${args[@]}"
else
  exec claude --dangerously-skip-permissions "${args[@]}"
fi
