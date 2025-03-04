#!/bin/bash

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトルートディレクトリを取得
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# エラーカウンター
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
    echo "  Markdownファイル内のリンクの有効性をチェックします。"
    echo "  - 存在しないファイルへのリンク"
    echo "  - 相対パスと絶対パスの両方をチェック"
    echo "  - /docs/から始まる絶対パスのサポート"
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

# Markdownファイルからリンクを抽出してチェックする関数
check_links() {
    local file="$1"
    local dir="$(dirname "$file")"
    
    # ファイル内のMarkdownリンクを抽出
    local links=$(grep -o '\[.*\]([^)]*)' "$file" | sed 's/\[.*\](\(.*\))/\1/')
    
    while IFS= read -r link; do
        # リンクが空の場合はスキップ
        [ -z "$link" ] && continue
        
        # リンクからアンカー部分を除去
        link="${link%#*}"
        
        # 外部リンク（http(s)で始まる）はスキップ
        [[ "$link" =~ ^https?:// ]] && continue
        
        # .mdで終わらないリンクはスキップ（外部リンクなど）
        [[ "$link" != *.md ]] && continue
        
        # リンクの種類を判定して適切なパスを構築
        local target_path
        if [[ "$link" == /docs/* ]]; then
            # 絶対パス（/docs/から始まる）の場合
            target_path="$PROJECT_ROOT${link}"
        else
            # 相対パスの場合
            target_path="$dir/$link"
        fi
        
        # リンクの存在チェック
        if [ -f "$target_path" ]; then
            if [ "$VERBOSE" = true ]; then
                echo -e "${GREEN}✓${NC} $file: $link"
            fi
        else
            echo -e "${RED}✗${NC} $file: リンク '$link' は存在しないファイルを参照しています"
            ((errors++))
        fi
    done <<< "$links"
    
    # フロントマターのチェック
    if ! grep -q "^---$" "$file" || ! grep -q "^description:" "$file"; then
        echo -e "${YELLOW}!${NC} $file: フロントマターが不完全です（descriptionが必要）"
        ((warnings++))
    fi
}

echo "Markdownリンクをチェックしています..."
echo

# docs配下の全Markdownファイルをチェック
find "$PROJECT_ROOT/docs" -name "*.md" -type f | while read -r file; do
    check_links "$file"
done

echo
echo "チェック完了"
echo -e "エラー: ${RED}$errors${NC}"
echo -e "警告: ${YELLOW}$warnings${NC}"

# エラーがある場合は非ゼロの終了コードを返す
[ "$errors" -gt 0 ] && exit 1
exit 0 