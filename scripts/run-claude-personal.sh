#!/usr/bin/env bash

export CLAUDE_IDENTITY="personal"
source "$HOME/.config/claude-code/env-personal"
claude --dangerously-skip-permissions "$@"
