# Rustの掟

## 基本原則

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)に従う
- `rustfmt`を必ず使用してコードをフォーマットする
- `clippy`を使用してコード品質を維持する

## コーディングスタイル

### 命名規則

- 型名は`UpperCamelCase`
- 変数、関数名は`snake_case`
- 定数は`SCREAMING_SNAKE_CASE`
- マクロは`snake_case!`
- lifetimeパラメータは短く意味のある名前を使用する（例：`'a`, `'db`）

### エラー処理

- カスタムエラー型には`thiserror`を使用する
- 結果が失敗する可能性のある関数は`Result`を返す
- パニックは契約違反の場合のみ使用する
- エラーチェインは適切に情報を付加する

### 所有権とライフタイム

- 不必要な所有権の移動を避ける
- 参照は可能な限り短いスコープに制限する
- ライフタイムパラメータは明示的に必要な場合のみ指定する
- `Clone`の使用は性能を考慮して判断する

### ジェネリクスとトレイト

- トレイトは単一責任の原則に従う
- ジェネリック型パラメータは意味のある名前を使用する
- トレイト境界は必要最小限に保つ
- `impl Trait`と明示的なジェネリクスを適切に使い分ける

### 非同期処理

- `async`/`await`を適切に使用する
- `tokio`のランタイムを一貫して使用する
- 非同期コンテキストでのブロッキング処理を避ける
- エラー伝播には`?`演算子を活用する

### テスト

- ユニットテストは同じファイル内に書く
- 結合テストは`tests`ディレクトリに配置する
- テストヘルパー関数を適切に活用する
- プロパティベーステストを検討する

## ツール活用

### 必須ツール

- `rustfmt` - コードフォーマッティング
- `clippy` - 静的解析
- `cargo-audit` - 依存関係のセキュリティチェック
- `cargo-outdated` - 依存関係の更新チェック

### オプショナルツール

- `rust-analyzer` - 言語サーバー
- `cargo-expand` - マクロ展開の確認
- `cargo-watch` - 自動ビルド/テスト
- `cargo-flamegraph` - パフォーマンスプロファイリング

## レビュー時の注意点

- 不適切な`unsafe`ブロックの使用がないか
- メモリ安全性が保証されているか
- エラー処理が適切か
- パフォーマンスへの影響が考慮されているか
- 依存関係が適切か

## 参考文献

- [Rust Book](https://doc.rust-jp.rs/book-ja/)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Rust Design Patterns](https://rust-unofficial.github.io/patterns/)
- [Asynchronous Programming in Rust](https://rust-lang.github.io/async-book/)
