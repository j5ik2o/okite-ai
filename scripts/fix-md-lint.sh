#!/bin/bash

# カラーコードの定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ヘルプ関数
help() {
  echo "Usage: $0 [-v] [file ...]"
  echo "  -v: verbose output"
  echo "  file: markdown file(s) to process. If not specified, all markdown files in docs/ will be processed."
  exit 1
}

# ログ関数
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# URLをMarkdownリンク形式に変換する関数
convert_url_to_link() {
  local line="$1"
  echo "$line" | sed -E 's|([^<])(https?://[^ )"]+)|\\1<\\2>|g'
}

# リストのインデントを修正する関数
fix_list_indent() {
  local line="$1"
  if [[ "$line" =~ ^[[:space:]]*[-*+][[:space:]] ]]; then
    # 箇条書きリストのインデントを修正
    echo "$line" | sed -E 's/^[[:space:]]*[-*+]/- /'
  elif [[ "$line" =~ ^[[:space:]]*[0-9]+\.[[:space:]] ]]; then
    # 番号付きリストのインデントを修正
    echo "$line" | sed -E 's/^[[:space:]]*([0-9]+\.)[[:space:]]*/\1 /'
  else
    echo "$line"
  fi
}

# Markdownファイルを修正する関数
fix_markdown_file() {
  local file="$1"
  local verbose="$2"
  local temp_file=$(mktemp)
  local found_h1=false
  local consecutive_empty_lines=0
  local in_code_block=false
  local prev_line=""
  local next_line=""
  local in_list=false
  local prev_was_list=false
  local prev_was_heading=false

  if [ "$verbose" = true ]; then
    log_info "Processing $file..."
  fi

  # ファイルを1行ずつ処理
  while IFS= read -r line || [ -n "$line" ]; do
    # 次の行を先読み
    IFS= read -r next_line || true

    # コードブロックの開始/終了を検出
    if [[ "$line" =~ ^'```' ]]; then
      in_code_block=!$in_code_block
      # コードブロックの前後に空行を追加
      if [[ -n "$prev_line" && ! "$prev_line" =~ ^$ ]]; then
        echo "" >> "$temp_file"
      fi
      echo "$line" >> "$temp_file"
      if [[ -n "$next_line" && ! "$next_line" =~ ^$ ]]; then
        echo "" >> "$temp_file"
      fi
      continue
    fi

    # 空行の処理
    if [[ -z "$line" ]]; then
      ((consecutive_empty_lines++))
      if ((consecutive_empty_lines > 1)); then
        continue
      fi
      echo "$line" >> "$temp_file"
      prev_line="$line"
      continue
    else
      consecutive_empty_lines=0
    fi

    # ハードタブをスペースに変換
    line=$(echo "$line" | sed 's/\t/    /g')

    # 行末の余分な空白を削除
    line=$(echo "$line" | sed 's/[[:space:]]*$//')

    # 見出しの処理
    if [[ "$line" =~ ^#+ ]]; then
      # 見出しの前に空行を追加（ファイルの先頭以外）
      if [[ -n "$prev_line" && ! "$prev_line" =~ ^$ ]]; then
        echo "" >> "$temp_file"
      fi
      echo "$line" >> "$temp_file"
      # 見出しの後に空行を追加
      if [[ -n "$next_line" && ! "$next_line" =~ ^$ ]]; then
        echo "" >> "$temp_file"
      fi
      prev_was_heading=true
      continue
    fi

    # リストの処理
    if [[ "$line" =~ ^[[:space:]]*[-*+][[:space:]] || "$line" =~ ^[[:space:]]*[0-9]+\.[[:space:]] ]]; then
      # リストの前に空行を追加（前の行がリストでない場合）
      if [[ ! "$prev_was_list" && -n "$prev_line" && ! "$prev_line" =~ ^$ ]]; then
        echo "" >> "$temp_file"
      fi
      # リストのインデントを修正
      line=$(fix_list_indent "$line")
      echo "$line" >> "$temp_file"
      prev_was_list=true
    else
      # リストの後に空行を追加
      if [[ "$prev_was_list" && -n "$line" ]]; then
        echo "" >> "$temp_file"
      fi
      # URLをMarkdownリンク形式に変換（コードブロック外のみ）
      if [ "$in_code_block" = false ]; then
        line=$(convert_url_to_link "$line")
      fi
      echo "$line" >> "$temp_file"
      prev_was_list=false
    fi

    prev_line="$line"
  done < "$file"

  # 最後の行がリストだった場合、空行を追加
  if [[ "$prev_was_list" ]]; then
    echo "" >> "$temp_file"
  fi

  # 元のファイルを更新
  mv "$temp_file" "$file"
}

# メイン処理
main() {
  local verbose=false
  local files=()

  # コマンドライン引数の処理
  while getopts "vh" opt; do
    case $opt in
      v) verbose=true ;;
      h) help ;;
      *) help ;;
    esac
  done
  shift $((OPTIND-1))

  # 処理対象ファイルの設定
  if [ $# -eq 0 ]; then
    files=($(find docs/ -name "*.md"))
  else
    files=("$@")
  fi

  # 各ファイルを処理
  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      fix_markdown_file "$file" "$verbose"
    else
      log_error "File not found: $file"
    fi
  done
}

main "$@" 