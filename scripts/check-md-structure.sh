#!/bin/bash

# set -e を削除してスクリプトが途中で終了しないようにする
# set -e

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

# デバッグメッセージを出力する関数
log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "Debug: $1"
    fi
}

# 禁止されたファイル・ディレクトリパターンをチェックする関数
check_forbidden_patterns() {
    local docs_dir=$1
    local result=0

    log_info "禁止パターンのチェック中..."

    # index.md, mods.md, README.mdファイルのチェック
    for forbidden_file in "index.md" "mods.md" "README.md"; do
        while IFS= read -r -d '' file; do
            log_error "Found forbidden ${forbidden_file} file: $file"
            result=1
        done < <(find "$docs_dir" -type f -name "$forbidden_file" -not -path "*/.cursor/*" -print0 2>/dev/null || echo "")
    done

    # ${モジュール名}/${モジュール名}.mdパターンのチェック
    while IFS= read -r -d '' file; do
        local dir_name=$(basename "$(dirname "$file")")
        local file_name=$(basename "$file" .md)
        if [[ "$dir_name" == "$file_name" ]]; then
            log_error "Found forbidden pattern directory/same-name.md: $file"
            result=1
        fi
    done < <(find "$docs_dir" -type f -name "*.md" -not -path "*/.cursor/*" -print0 2>/dev/null || echo "")

    return $result
}

# ファイル命名規則をチェックする関数
check_file_naming() {
    local docs_dir=$1
    local result=0

    log_info "ファイル命名規則のチェック中..."

    # ${ruleId}.md パターンのチェック
    # ULIDフォーマットは01ARZ3NDEKTSV4RRFFQ69G5FAVなので長さ26の英数字
    while IFS= read -r -d '' file; do
        local base_name=$(basename "$file" .md)
        # ルールIDかどうかをチェック（フォーマットはメタルールで定義）
        if ! [[ "$base_name" =~ ^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]{26}$ ]]; then
            log_warning "File might not follow the naming convention \${ruleId}.md: $file"
        fi
    done < <(find "$docs_dir" -type f -name "*.md" -not -path "*/.cursor/*" -print0 2>/dev/null || echo "")

    return $result
}

# ディレクトリ構造のチェック処理
check_directory_structure() {
    local docs_dir=$1
    
    log_info "ディレクトリ構造のチェック中..."

    # docsディレクトリが存在するか確認
    if [ ! -d "$docs_dir" ]; then
        log_error "Docs directory '$docs_dir' does not exist"
        return 1
    fi

    log_debug "Checking for module directories in $docs_dir"
    
    # モジュールディレクトリの存在と親モジュールの確認
    # モジュールディレクトリがある場合、同名の親モジュールファイルが存在すべき
    local module_dirs=()
    
    # find コマンドの結果を直接変数に格納
    local dirs=$(find "$docs_dir" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
    
    # 結果が空でないか確認
    if [ -z "$dirs" ]; then
        log_debug "No module directories found in $docs_dir"
    else
        log_debug "Found directories: $dirs"
        
        # 各ディレクトリを処理
        while IFS= read -r dir; do
            # 特殊ディレクトリをスキップ
            if [[ "$dir" == *"/.cursor"* ]] || [[ "$dir" == *"/.git"* ]]; then
                log_debug "Skipping special directory: $dir"
                continue
            fi
            
            local dir_name=$(basename "$dir")
            log_debug "Processing directory: $dir_name"
            module_dirs+=("$dir_name")
            
            # 親モジュールファイル（同名のmdファイル）が存在するか確認
            local parent_module="$docs_dir/$dir_name.md"
            if [ ! -f "$parent_module" ]; then
                log_warning "Module directory $dir_name exists but parent module file $parent_module not found"
            else
                log_debug "Found parent module file: $parent_module"
            fi
        done <<< "$dirs"
    fi

    # モジュールディレクトリのネスト確認（フラクタル構造のチェック）
    log_debug "Checking nested module structure for ${#module_dirs[@]} directories"
    for dir in "${module_dirs[@]}"; do
        log_info "Checking module directory: $dir"
        
        # サブディレクトリの検索
        local subdirs=$(find "$docs_dir/$dir" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
        
        if [ -z "$subdirs" ]; then
            log_debug "No subdirectories found in $dir"
        else
            log_debug "Found subdirectories in $dir: $subdirs"
            
            while IFS= read -r subdir; do
                # 特殊ディレクトリをスキップ
                if [[ "$subdir" == *"/.cursor"* ]] || [[ "$subdir" == *"/.git"* ]]; then
                    log_debug "Skipping special subdirectory: $subdir"
                    continue
                fi
                
                local subdir_name=$(basename "$subdir")
                log_debug "Processing subdirectory: $subdir_name in $dir"
                
                # サブモジュールのディレクトリがある場合、その親モジュールファイルが存在すべき
                local submodule_file="$docs_dir/$dir/$subdir_name.md"
                if [ ! -f "$submodule_file" ]; then
                    log_warning "Submodule directory $subdir_name exists in $dir but parent submodule file $submodule_file not found"
                else
                    log_debug "Found submodule file: $submodule_file"
                fi
            done <<< "$subdirs"
        fi
    done
    
    log_info "ディレクトリ構造チェック完了"
}

# メインの処理
main() {
    local docs_dir="docs"
    
    log_info "ドキュメント構造チェック開始: $docs_dir"
    
    # 禁止されたパターンのチェック
    check_forbidden_patterns "$docs_dir"
    log_debug "禁止パターンチェック完了"
    
    # ファイル命名規則のチェック
    check_file_naming "$docs_dir"
    log_debug "ファイル命名規則チェック完了"
    
    # ディレクトリ構造のチェック
    check_directory_structure "$docs_dir"
    log_debug "ディレクトリ構造チェック完了"

    # 全Markdownファイルのチェック
    log_info "全Markdownファイルの確認中..."
    while IFS= read -r -d '' file; do
        log_info "Checking file: $file"
    done < <(find "$docs_dir" -type f -name "*.md" -not -path "*/.cursor/*" -print0 2>/dev/null || echo "")
    log_debug "全Markdownファイルチェック完了"

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

# トラップを設定してエラーをキャッチ
trap 'echo "Error occurred at line $LINENO"; exit 1' ERR

# メイン処理を実行
main 