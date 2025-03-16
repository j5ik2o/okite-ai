---
description: Rustのコーディング規約と開発ガイドライン
ruleId: rust-01jpcvxfxf9jafj03jk1zks31y
tags:
  - rust
  - coding
  - guidelines
aliases:
  - rust-rules
  - rust-guidelines
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
  - '**/*.go'
  - '**/*.rs'
  - '**/*.scala'
---

# Rustの掟

## 基本原則

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)に従う
- `rustfmt`を必ず使用してコードをフォーマットする。
- `clippy`を使用してコード品質を維持する。

## モジュール構成

Rustのコーディング規約は以下のモジュールに分かれています：。

- [Rustdocの掟](rust/rustdoc-01jpcvxfxpsvpepv85myk6s6be.md) - コードドキュメントの書き方
- [Rustコーディングスタイル](rust/ruststyle-01jpcvxfxnn1eg2jxgy2jns9w5.md) - 命名規則、コード構造、エラー処理など
- [Rustツール活用](rust/rusttools-01jpcvxfxnn1eg2jxgy2jns9w4.md) - 開発ツールの使用方法
- [Rustコードレビュー](rust/rustreview-01jpcvxfxnn1eg2jxgy2jns9w6.md) - レビュー時のチェックポイント
- [Rust参考文献](rust/rustrefs-01jpcvxfxnn1eg2jxgy2jns9w7.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- 型名は`UpperCamelCase`、変数・関数名は`snake_case`を使用する。
- 不必要な所有権の移動を避ける。
- エラーは適切に伝播し、明確なメッセージを提供する。
- `unsafe`コードは必要最小限に抑え、十分にドキュメント化する。
- テストは網羅的に書き、エッジケースも考慮する。

### 必須ツール

- `rustfmt` - コードフォーマッティング。
- `clippy` - 静的解析。
- `cargo-audit` - 依存関係のセキュリティチェック。
- `rust-analyzer` - 言語サーバー。
