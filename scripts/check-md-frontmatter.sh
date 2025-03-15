#!/bin/bash

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトルートディレクトリを取得
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# エラー/警告カウンター
errors=0
warnings=0

# ヘルプメッセージ
show_help() {
    echo "使用方法: $0 [オプション]"
    echo
    echo "オプション:"
    echo "  -h, --help    このヘルプメッセージを表示"
    echo "  -v, --verbose 詳細な出力を表示"
    echo
    echo "説明:"
    echo "  Markdownファイルのフロントマターをチェックします。"
    echo "  必須フィールド: description, ruleId, tags, globs"
    echo "  - descriptionの存在"
    echo "  - ruleIdの形式(ULID)"
    echo "  - tagsの存在(最低1つ以上)"
    echo "  - globsの存在"
}

# オプションの解析
VERBOSE=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) show_help; exit 0 ;;
        -v|--verbose) VERBOSE=true ;;
        *) echo "未知のオプション: $1"; show_help; exit 1 ;;
    esac
    shift
done

# ULIDの形式をチェックする関数
is_valid_ulid() {
    local ulid="$1"
    # ULIDは26文字の英数字（大文字のみ）
    [[ "$ulid" =~ ^[0-9A-Z]{26}$ ]]
}

# フロントマターをチェックする関数
check_frontmatter() {
    local file="$1"
    local has_issues=false
    local error_msgs=()
    local warning_msgs=()
    
    # フロントマターの存在確認
    if ! grep -q "^---$" "$file"; then
        error_msgs+=("フロントマターがありません")
        has_issues=true
    fi
    
    # 必須フィールドの確認
    if ! grep -q "^description:" "$file"; then
        error_msgs+=("description フィールドがありません")
        has_issues=true
    fi
    
    if ! grep -q "^ruleId:" "$file"; then
        error_msgs+=("ruleId フィールドがありません")
        has_issues=true
    else
        # ruleIdの値を取得して形式チェック
        local ruleid=$(grep "^ruleId:" "$file" | sed 's/^ruleId: *\(.*\)$/\1/')
        
        # 接頭辞付きのULIDの場合（例: META-RULES-01JPBN8MMS2GDBH8HBK78E6F24）
        if [[ "$ruleid" =~ ^[A-Z]+-[A-Z]+-[0-9A-Z]{26}$ ]]; then
            local ulid_part=${ruleid##*-}
            if ! is_valid_ulid "$ulid_part"; then
                warning_msgs+=("ruleId の ULID 部分が有効な形式ではありません")
                ((warnings++))
            fi
        # 純粋なULIDの場合
        elif ! is_valid_ulid "$ruleid"; then
            warning_msgs+=("ruleId が有効な ULID 形式ではありません")
            ((warnings++))
        fi
    fi
    
    if ! grep -q "^tags:" "$file"; then
        error_msgs+=("tags フィールドがありません")
        has_issues=true
    else
        # tagsの値を取得して最低1つ以上あるかチェック
        local tags=$(grep "^tags:" "$file" | sed 's/^tags: *\[\(.*\)\]$/\1/')
        if [[ -z "$tags" ]]; then
            warning_msgs+=("tags が空です。最低1つのタグが必要です")
            ((warnings++))
        fi
    fi
    
    if ! grep -q "^globs:" "$file"; then
        error_msgs+=("globs フィールドがありません")
        has_issues=true
    fi
    
    # エラー/警告メッセージの表示
    if [ "$has_issues" = true ] || [ ${#warning_msgs[@]} -gt 0 ]; then
        echo "ファイル: $file"
        
        for msg in "${error_msgs[@]}"; do
            echo -e "  ${RED}エラー:${NC} $msg"
            ((errors++))
        done
        
        for msg in "${warning_msgs[@]}"; do
            echo -e "  ${YELLOW}警告:${NC} $msg"
        done
        
        echo ""
    elif [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}✓${NC} $file: フロントマターは有効です"
    fi
}

echo "Markdownファイルのフロントマターをチェックしています..."
echo

# docs配下の全Markdownファイルをチェック
find "$PROJECT_ROOT/docs" -name "*.md" -type f | while read -r file; do
    check_frontmatter "$file"
done

# .cursor/rules配下の全mdcファイルをチェック（存在する場合）
if [ -d "$PROJECT_ROOT/.cursor/rules" ]; then
    find "$PROJECT_ROOT/.cursor/rules" -name "*.mdc" -type f | while read -r file; do
        check_frontmatter "$file"
    done
fi

echo
echo "チェック完了"
echo -e "エラー: ${RED}$errors${NC}"
echo -e "警告: ${YELLOW}$warnings${NC}"

# エラーがある場合は非ゼロの終了コードを返す
[ "$errors" -gt 0 ] && exit 1
exit 0 