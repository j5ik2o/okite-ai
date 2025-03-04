# Rustの掟

## 基本原則

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)に従う
- `rustfmt`を必ず使用してコードをフォーマットする
- `clippy`を使用してコード品質を維持する

## モジュール構成

Rustのコーディング規約は以下のモジュールに分かれています：

- [ドキュメンテーションルール](rust/rustdoc.md) - コードドキュメントの書き方
- [コーディングスタイル](rust/ruststyle.md) - 命名規則、コード構造、エラー処理など
- [ツール活用](rust/rusttools.md) - 開発ツールの使用方法
- [コードレビュー](rust/rustreview.md) - レビュー時のチェックポイント
- [参考文献](rust/rustrefs.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- 型名は`UpperCamelCase`、変数・関数名は`snake_case`を使用する
- 不必要な所有権の移動を避ける
- エラーは適切に伝播し、明確なメッセージを提供する
- `unsafe`コードは必要最小限に抑え、十分にドキュメント化する
- テストは網羅的に書き、エッジケースも考慮する

### 必須ツール

- `rustfmt` - コードフォーマッティング
- `clippy` - 静的解析
- `cargo-audit` - 依存関係のセキュリティチェック
- `rust-analyzer` - 言語サーバー
