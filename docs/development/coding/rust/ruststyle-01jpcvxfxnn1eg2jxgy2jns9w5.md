---
description: ruststyleに関するドキュメント
ruleId: ruststyle-01jpcvxfxnn1eg2jxgy2jns9w5
tags:
  - development
  - coding
  - rust
aliases:
  - rust-style-guide
  - rust-coding-conventions
globs:
  - '**/*.rs'
---

# Rustコーディングスタイル

## 基本原則

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)に従う
- 可読性と保守性を最優先する。
- 明示的なコードを暗黙的なコードより優先する。
- 安全性を常に考慮する。

## 命名規則

### 基本ルール

- 型名は`UpperCamelCase`。
  - 構造体、列挙型、トレイト、型エイリアスなど。
  - 例: `AppConfig`, `HttpResponse`, `Iterator`。
- 変数、関数名は`snake_case`。
  - ローカル変数、関数、メソッド、モジュール、パッケージなど。
  - 例: `app_config`, `get_user`, `connect_database`。
- 定数は`SCREAMING_SNAKE_CASE`。
  - 静的変数、定数など。
  - 例: `MAX_CONNECTIONS`, `DEFAULT_TIMEOUT`。
- マクロは`snake_case!`。
  - 例: `println!`, `vec!`, `assert_eq!`。

### 特殊なケース

- lifetimeパラメータは短く意味のある名前を使用する。
  - 例: `'a`, `'db`, `'src`。
  - 単一の場合は`'a`、複数の場合は意味のある名前を使用。
- ジェネリック型パラメータは意味のある名前を使用する。
  - 単純な場合: `T`, `U`, `V`。
  - 複雑な場合: `Key`, `Value`, `Item`。
- 変数名の衝突を避けるためにアンダースコアを使用する。
  - 例: `_unused`, `_result`。

## コード構造

### モジュール構成

- 関連する機能を論理的なモジュールにグループ化する。
- `pub use`を使用してAPIを整理する。
- モジュール階層は3レベル以下に抑える。
- `mod.rs`の使用は避け、モジュール名と同じ名前のファイルを使用する。

```rust
// 良い例。
src/。
  lib.rs。
  config.rs。
  database/。
    mod.rs。
    connection.rs。
    query.rs。
  api/。
    mod.rs。
    routes.rs。
    handlers.rs。
```

### ファイル構造

- 1ファイルあたり300行を超えないようにする。
- 論理的な順序でコードを配置する:。
  1. モジュール宣言。
  2. インポート。
  3. 定数。
  4. 型定義。
  5. トレイト実装。
  6. 関数。
- 関連する要素をグループ化する。

## エラー処理

### エラー型

- カスタムエラー型には`thiserror`を使用する。
- エラー型は具体的で意味のある名前を付ける。
- エラーバリアントは具体的な問題を表現する。

```rust
#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {。
    #[error("failed to connect to database: {0}")]
    ConnectionFailed(#[from] std::io::Error),

    #[error("query failed: {0}")]
    QueryFailed(String),。

    #[error("transaction error: {0}")]
    TransactionError(String),。
}
```

### エラー伝播

- 結果が失敗する可能性のある関数は`Result`を返す。
- `?`演算子を使用してエラーを伝播する。
- エラーチェインは適切に情報を付加する。
- パニックは契約違反の場合のみ使用する。

```rust
fn process_data(path: &str) -> Result<Data, ProcessError> {
    let file = File::open(path)
        .map_err(|e| ProcessError::FileError(format!("Failed to open {}: {}", path, e)))?;
    
    let data = parse_file(file)?;。
    Ok(data)。
}
```

## 所有権とライフタイム

### 所有権

- 不必要な所有権の移動を避ける。
- 所有権の移動が必要な場合は明示的にする。
- `Clone`の使用は性能を考慮して判断する。
- 大きなデータ構造は参照で渡す。

```rust
// 良い例。
fn process(data: &[u8]) -> Result<(), Error> {
    // データの参照を使用。
}

// 避けるべき例。
fn process(data: Vec<u8>) -> Result<(), Error> {
    // 所有権を不必要に移動。
}
```

### ライフタイム

- 参照は可能な限り短いスコープに制限する。
- ライフタイムパラメータは明示的に必要な場合のみ指定する。
- 複雑なライフタイム関係は適切にドキュメント化する。

```rust
// 良い例。
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }。
}

// 避けるべき例 (不必要なライフタイム)。
fn get_str<'a>(s: &'a str) -> &'a str {
    s
}
```

## ジェネリクスとトレイト

### トレイト設計

- トレイトは単一責任の原則に従う。
- トレイトメソッドは明確な目的を持つ。
- デフォルト実装は適切に提供する。
- トレイト境界は必要最小限に保つ。

```rust
// 良い例。
trait Repository {。
    type Error;。
    type Item;。

    fn find(&self, id: &str) -> Result<Option<Self::Item>, Self::Error>;
    fn save(&self, item: &Self::Item) -> Result<(), Self::Error>;
    fn delete(&self, id: &str) -> Result<bool, Self::Error>;
}
```

### ジェネリクス

- ジェネリック型パラメータは意味のある名前を使用する。
- `impl Trait`と明示的なジェネリクスを適切に使い分ける。
- 戻り値の型には`impl Trait`を優先する。
- 引数の型には明示的なジェネリクスを優先する。

```rust
// 良い例 (戻り値)。
fn sorted_vec(v: &[i32]) -> impl Iterator<Item = &i32> {
    v.iter().sorted()。
}

// 良い例 (引数)。
fn process<T: AsRef<str>>(input: T) {
    let s = input.as_ref();。
    // 処理。
}
```

## 非同期処理

### async/await

- `async`/`await`を適切に使用する。
- 非同期関数は戻り値の型を明確にする。
- 長時間実行される処理はキャンセル可能にする。
- エラー伝播には`?`演算子を活用する。

```rust
async fn fetch_data(url: &str) -> Result<Data, FetchError> {
    let response = reqwest::get(url).await?;
    let data = response.json::<Data>().await?;
    Ok(data)。
}
```

### ランタイム

- `tokio`のランタイムを一貫して使用する。
- 非同期コンテキストでのブロッキング処理を避ける。
- 必要に応じて`spawn_blocking`を使用する。
- 適切なタスク管理する。

```rust
// 良い例。
async fn process_file(path: &str) -> Result<(), Error> {
    let content = tokio::fs::read_to_string(path).await?;
    // 非同期処理。
    Ok(())。
}

// ブロッキング処理の適切な扱い。
async fn process_complex_data(data: &[u8]) -> Result<Output, Error> {
    let result = tokio::task::spawn_blocking(move || {
        // CPUバウンドな処理。
        compute_complex_result(data)。
    }).await??;。
    
    Ok(result)。
}
```

## テスト

### ユニットテスト

- ユニットテストは同じファイル内に書く。
- テスト関数は明確な命名する。
- 各テストは単一の機能をテストする。
- テストヘルパー関数を適切に活用する。

```rust
#[cfg(test)]
mod tests {。
    use super::*;

    #[test]。
    fn test_add_positive_numbers() {。
        assert_eq!(add(2, 3), 5);。
    }

    #[test]。
    fn test_add_negative_numbers() {。
        assert_eq!(add(-2, -3), -5);。
    }
}
```

### 結合テスト

- 結合テストは`tests`ディレクトリに配置する。
- テストケースは境界値を考慮する。
- モックとスタブを適切に使用する。
- プロパティベーステストを検討する。

```rust
// tests/integration_test.rs。
use my_crate::Database;

#[test]
fn test_database_connection() {。
    let db = Database::new("test_connection_string");
    assert!(db.connect().is_ok());。
}
```

## フォーマットとスタイル

### コードフォーマット

- `rustfmt`を必ず使用する。
- デフォルト設定を尊重する。
- 特別な理由がない限りカスタム設定は避ける。
- CIでフォーマットチェックを実施する。

### コメント

- コードの「なぜ」を説明するコメントを書く。
- 複雑なアルゴリズムには説明を追加する。
- TODOコメントには理由と参照を含める。
- ドキュメントコメントは[Rustdocの掟](rustdoc-01jpcvxfxpsvpepv85myk6s6be.md)に従う

```rust
// 良いコメント例。
// Pangolinアルゴリズムを使用して効率的にソート。
// 参考: https://example.com/pangolin-algorithm
fn pangolin_sort<T: Ord>(slice: &mut [T]) {
    // 実装。
}

// TODO: パフォーマンス最適化が必要 (#123)
fn slow_function() {。
    // 実装。
}
```

## 関連情報

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Rust Style Guide](https://github.com/rust-dev-tools/fmt-rfcs/blob/master/guide/guide.md)
- [Rust Design Patterns](https://rust-unofficial.github.io/patterns/)
