#!/usr/bin/env bash

export CLAUDE_IDENTITY="corporate"
source "$HOME/.config/claude-code/env-corporate"
claude --dangerously-skip-permissions "$@"
