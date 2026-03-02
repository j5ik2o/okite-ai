#!/usr/bin/env bash

export CLAUDE_IDENTITY="personal"
source "$HOME/.config/claude-code/env-personal"

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
