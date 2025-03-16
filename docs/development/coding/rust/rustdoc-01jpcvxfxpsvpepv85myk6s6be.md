---
description: rustdocに関するドキュメント
ruleId: rustdoc-01jpcvxfxpsvpepv85myk6s6be
tags:
  - development
  - coding
  - rust
aliases:
  - rust-documentation
  - rustdoc-guidelines
globs:
  - '**/*.rs'
---

# Rustdocの掟

## 基本原則

- [ドキュメントコメントの掟](../doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md)に準拠すること
  - ドキュメントコメントは英語で記述する。
  - 記述がないものは新規に追加する。
  - 既存のものでもガイドラインに従っていないものは是正する。
  - コードを見れば分かることは書かない（Why/Why notを中心に記載）

## ドキュメント規約

Rustの公式ドキュメントに基づき、以下の規約に従うこと：。

- パブリックAPIには必ずドキュメントコメントを付ける。
- ドキュメントテストが失敗しないようにする。
- コードブロックは実際に動作するものを記述する。
- パニックが発生する条件は必ず記載する。
- 安全性に関する制約は明確に記述する。

参考：[The Rust Documentation Book](https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html)

## ドキュメントスタイル

### クレートレベルドキュメント

```rust
//! A library for safely handling database connections.
//!
//! This crate provides a connection pool implementation。
//! with automatic resource cleanup and error handling.
//! 
//! # Examples。
//! 
//! ```
//! use my_db::Pool;
//! 
//! let pool = Pool::new(5)?;
//! let conn = pool.get()?;。
//! ```

```

### 構造体とトレイト

```rust
/// A connection pool for managing database connections.
///
/// The pool maintains a set of active connections and。
/// automatically creates new ones as needed, up to a。
/// specified maximum.
///
/// # Examples。
///
/// ```
/// let pool = Pool::new(5)?;
/// ```
pub struct Pool {。
    max_size: usize,
    connections: Vec<Connection>,
}

/// Represents operations that can be performed on a database.
///
/// Implementors must ensure that all operations are atomic。
/// and maintain ACID properties.
pub trait Database {。
    /// The type of error that can occur during database operations.
    type Error;。

    /// Executes a query and returns the results.
    ///
    /// # Arguments。
    ///
    /// * `query` - The SQL query to execute。
    /// * `params` - Query parameters to bind。
    ///
    /// # Examples。
    ///
    /// ```
    /// let results = db.query("SELECT * FROM users WHERE id = ?", &[1])?;。
    /// ```
    fn query(&self, query: &str, params: &[&dyn ToSql]) -> Result<Rows, Self::Error>;
}
```

### エラー型

```rust
/// Errors that can occur during database operations.
///
/// # Examples。
///
/// ```
/// match result {。
///     Err(DbError::ConnectionFailed(e)) => log::error!("Connection failed: {}", e),
///     Err(DbError::QueryFailed(e)) => log::error!("Query failed: {}", e),
///     Ok(data) => process_data(data),。
/// }。
/// ```
#[derive(Debug, thiserror::Error)]
pub enum DbError {。
    /// Failed to establish database connection.
    #[error("failed to connect to database: {0}")]
    ConnectionFailed(#[from] std::io::Error),

    /// Query execution failed.
    #[error("query failed: {0}")]
    QueryFailed(String),。
}
```

## 特殊な記法

### リンクとリファレンス

```rust
/// See [`Pool::new`] for creating a new connection pool.
/// 
/// For more details about connection management,。
/// see [the connection module](crate::connection).
///
/// The implementation follows the [PostgreSQL protocol].
///
/// [PostgreSQL protocol]: https://www.postgresql.org/docs/current/protocol.html
```

### インラインコード

```rust
/// The default timeout is [`DEFAULT_TIMEOUT`].
///
/// Use `Pool::with_timeout()` to customize the timeout duration.
/// 
/// This function returns [`Result<Pool, DbError>`](Result).
```

### 箇条書きとコードブロック

```rust
/// Creates a new database connection.
///
/// # Arguments。
///
/// * `host` - Database host address。
/// * `port` - Database port number。
/// * `credentials` - Authentication credentials。
///
/// # Security。
///
/// The following security measures are implemented:
///
/// - TLS encryption for all connections。
/// - Automatic credential rotation。
/// - Connection timeouts。
///
/// # Examples。
///
/// Basic usage:
/// ```
/// let conn = Connection::new("localhost", 5432, credentials)?;
/// ```
///
/// With custom timeout:
/// ```
/// let conn = Connection::with_timeout("localhost", 5432, credentials, Duration::from_secs(30))?;
/// ```
```

## テストとドキュメントの統合

### ドキュメントテスト

```rust
/// Adds two numbers together.
///
/// # Examples。
///
/// ```
/// use my_crate::add;
///
/// assert_eq!(add(2, 2), 4);。
/// ```
///
/// # Panics。
///
/// ```should_panic
/// # use my_crate::add;
/// // This will panic due to integer overflow。
/// add(i32::MAX, 1);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a.checked_add(b).expect("integer overflow")。
}
```

### 非表示テスト

```rust
/// Complex number implementation.
///
/// # Examples。
///
/// ```
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let c = Complex::new(1.0, 2.0);
/// # Ok(())。
/// # }。
/// ```
```

## レビュー時の注意点

- ドキュメントが最新の実装を反映しているか。
- 全てのパブリック要素にドキュメントが付いているか。
- 説明が明確で具体的か。
- Examples が実際に動作するか。
- 英語の文法や表現が適切か。
- 安全性に関する注意点が明確に記載されているか。

## 関連情報

- [The Rust Documentation Book](https://doc.rust-lang.org/rustdoc/what-is-rustdoc.html)
- [How to Write Documentation](https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html)
- [Documentation Tests](https://doc.rust-lang.org/rustdoc/documentation-tests.html)
