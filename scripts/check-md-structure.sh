#!/bin/bash

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーカウンター
error_count=0
warning_count=0

# ヘルプメッセージ
show_help() {
    echo "Usage: $0 [-v] [-h]"
    echo "Check markdown files structure according to meta rules"
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

# エラーメッセージを出力する関数
log_error() {
    echo -e "${RED}Error:${NC} $1"
    ((error_count++))
}

# 警告メッセージを出力する関数
log_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
    ((warning_count++))
}

# 情報メッセージを出力する関数（verboseモードの場合のみ）
log_info() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}Info:${NC} $1"
    fi
}

# メインの処理
main() {
    local docs_dir="docs"
    
    # index.mdファイルのチェック
    while IFS= read -r -d '' file; do
        if [[ "$(basename "$file")" == "index.md" ]]; then
            log_error "Found forbidden index.md file: $file"
        fi
    done < <(find "$docs_dir" -type f -name "index.md" -not -path "*/.cursor/*" -print0)

    # hoge/hoge.mdパターンのチェック
    while IFS= read -r -d '' file; do
        local dir_name=$(dirname "$file")
        local base_name=$(basename "$file" .md)
        if [ "$(basename "$dir_name")" = "$base_name" ]; then
            log_error "Found forbidden pattern directory/same-name.md: $file"
        fi
    done < <(find "$docs_dir" -type f -name "*.md" -not -path "*/.cursor/*" -print0)

    # 全Markdownファイルのチェック
    while IFS= read -r -d '' file; do
        log_info "Checking $file"
    done < <(find "$docs_dir" -type f -name "*.md" -not -path "*/.cursor/*" -print0)

    # 結果の表示
    echo ""
    if [ $error_count -eq 0 ] && [ $warning_count -eq 0 ]; then
        echo -e "${GREEN}All checks passed successfully!${NC}"
        exit 0
    else
        echo -e "Found ${RED}$error_count errors${NC} and ${YELLOW}$warning_count warnings${NC}"
        if [ $error_count -gt 0 ]; then
            exit 1
        else
            exit 0
        fi
    fi
}

main 