---
description: Golangのコーディング規約と開発ガイドライン
ruleId: golang-01jpcvxfxgyqe2jprh9hgn6xq7
tags:
  - golang
  - coding
  - guidelines
aliases:
  - golang-rules
  - go-guidelines
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
  - '**/*.go'
  - '**/*.rs'
  - '**/*.scala'
---

# Golangの掟

## 基本原則

- [Effective Go](https://golang.org/doc/effective_go)に従う
- Go標準のフォーマッター（`go fmt`）を必ず使用する。
- `golangci-lint`を使用してコード品質を維持する。

## モジュール構成

Golangのコーディング規約は以下のモジュールに分かれています：。

- [Golangdocの掟](golang/golangdoc-01jpcvxfxqe37ka9pn3xb4m9yr.md) - コードドキュメントの書き方
- [Golangコーディングスタイル](golang/golangstyle-01jpcvxfxpsvpepv85myk6s6bg.md) - 命名規則、パッケージ構成、エラー処理など
- [Golangツール活用](golang/golangtools-01jpcvxfxpsvpepv85myk6s6bf.md) - 開発ツールの使用方法
- [Golang プロジェクトにおける Makefile の活用](golang/golangmake-01jpcvxfxqe37ka9pn3xb4m9yq.md) - ビルドプロセスの自動化と標準化
- [Golangコードレビュー](golang/golangreview-01jpcvxfxpsvpepv85myk6s6bh.md) - レビュー時のチェックポイント
- [Golang参考文献](golang/golangrefs-01jpcvxfxpsvpepv85myk6s6bj.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- パッケージ名は小文字で、単一の単語を使用する。
- エラーは常に即座に処理する。
- ゴルーチンのリークを防ぐため、適切なキャンセル処理を実装する。
- テーブル駆動テストを活用する。

### 必須ツール

- `go fmt` - コードフォーマッティング。
- `go vet` - 静的解析。
- `golangci-lint` - 高度な静的解析。
- `goimports` - インポートの整理とフォーマット。
