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

# フロントマターをチェックする関数
check_frontmatter() {
    local file=$1
    local has_frontmatter=false
    local has_description=false
    local has_tags=false
    local has_aliases=false

    # ファイルの先頭から---までの行を取得
    while IFS= read -r line; do
        if [ "$line" = "---" ]; then
            if [ "$has_frontmatter" = true ]; then
                break
            fi
            has_frontmatter=true
            continue
        fi
        if [ "$has_frontmatter" = true ]; then
            if [[ "$line" =~ ^description: ]]; then
                has_description=true
            fi
            if [[ "$line" =~ ^tags: ]]; then
                has_tags=true
            fi
            if [[ "$line" =~ ^aliases: ]]; then
                has_aliases=true
            fi
        fi
    done < "$file"

    if [ "$has_frontmatter" = false ]; then
        log_error "No frontmatter found in $file"
    else
        if [ "$has_description" = false ]; then
            log_error "No description field in frontmatter in $file"
        fi
        if [ "$has_tags" = false ]; then
            log_error "No tags field in frontmatter in $file"
        fi
        if [ "$has_aliases" = false ]; then
            log_error "No aliases field in frontmatter in $file"
        fi
    fi
}

# 見出しの階層構造をチェックする関数
check_heading_structure() {
    local file=$1
    local prev_level=0
    local in_frontmatter=false
    local line_number=0
    local in_code_block=false

    while IFS= read -r line; do
        ((line_number++))
        
        # フロントマターのスキップ
        if [ "$line" = "---" ]; then
            if [ "$in_frontmatter" = true ]; then
                in_frontmatter=false
            else
                in_frontmatter=true
            fi
            continue
        fi
        if [ "$in_frontmatter" = true ]; then
            continue
        fi

        # コードブロックの検出
        if [[ "$line" =~ ^(\`\`\`) ]]; then
            if [ "$in_code_block" = true ]; then
                in_code_block=false
            else
                in_code_block=true
            fi
            continue
        fi
        
        # コードブロック内の場合はスキップ
        if [ "$in_code_block" = true ]; then
            continue
        fi

        # 見出しレベルのチェック
        if [[ "$line" =~ ^#+ ]]; then
            local level=${#BASH_REMATCH}
            if [ $level -gt $((prev_level + 1)) ] && [ $prev_level -ne 0 ]; then
                log_error "Invalid heading structure at line $line_number in $file (jumped from level $prev_level to $level)"
            fi
            prev_level=$level
        fi

        # 見出し後の空行チェックは markdownlint の MD022 ルールで対応するため削除
    done < "$file"
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
        check_frontmatter "$file"
        check_heading_structure "$file"
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