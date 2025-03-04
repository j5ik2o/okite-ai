#!/bin/bash

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ヘルプメッセージ
show_help() {
    echo "Usage: $0 [-v] [-h]"
    echo "Check markdown files using markdownlint"
    echo ""
    echo "Options:"
    echo "  -v    Verbose output"
    echo "  -h    Show this help message"
}

# オプション解析
VERBOSE=false
while getopts "vh" opt; do
    case $opt in
        v)
            VERBOSE=true
            ;;
        h)
            show_help
            exit 0
            ;;
        \?)
            show_help
            exit 1
            ;;
    esac
done

# メインの処理
main() {
    local docs_dir="docs"
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}Info:${NC} Checking markdown files in $docs_dir"
    fi

    # markdownlintを実行
    if ! markdownlint "$docs_dir/**/*.md"; then
        echo -e "${RED}Error:${NC} Markdown linting failed"
        exit 1
    fi

    echo -e "${GREEN}Success:${NC} All markdown files passed linting"
}

main 