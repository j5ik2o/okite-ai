---
description: 掟プロジェクトにおけるドキュメンテーションコメントの作成規約と原則
ruleId: doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8
tags: [development, coding, documentation]
aliases: [doc-comment-rules]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
---

# ドキュメントコメントの掟

## 基本原則

- ドキュメントコメントは英語で記述する。
  - 記述がないものは新規に追加する。
  - 既存のものでもガイドラインに従っていないものは是正する。
  - コードを見れば分かることは書かない（Why/Why notを中心に記載）

## 記述内容

### 必須項目

1. 機能の目的と概要。
   - 何のために存在するのか。
   - どのような問題を解決するのか。
1. パラメータ。
   - 型情報。
   - 制約条件。
   - 有効な値の範囲。
1. 戻り値。
   - 型情報。
   - 返却される値の意味。
   - エラーケース。

### オプション項目

1. 使用例。
   ```rust
   /// # Example。
   /// ```
   /// let result = add(1, 2);。
   /// assert_eq!(result, 3);。
   /// ```
   ```
1. パフォーマンス特性。
   - 計算量。
   - メモリ使用量。
   - スレッドセーフティ。
1. 制限事項。
   - 既知の制限。
   - 非対応のケース。
   - 将来の拡張予定。

## 形式

### 関数のドキュメント

```rust
/// Adds two numbers and returns their sum.
///
/// # Arguments。
/// * `a` - The first number。
/// * `b` - The second number。
///
/// # Returns。
/// The sum of `a` and `b`。
///
/// # Example。
/// ```
/// let sum = add(1, 2);。
/// assert_eq!(sum, 3);。
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b。
}
```

### 構造体のドキュメント

```rust
/// Represents a user in the system.
///
/// # Fields。
/// * `id` - Unique identifier。
/// * `name` - User's display name。
/// * `email` - User's email address。
///
/// # Thread Safety。
/// This struct is Send and Sync。
#[derive(Debug, Clone)]
pub struct User {。
    pub id: String,
    pub name: String,
    pub email: String,
}
```

## レビュー基準

1. 完全性。
   - 必須項目が漏れなく記載されているか。
   - 説明が十分に詳細か。

2. 正確性。
   - コードの実装と一致しているか。
   - 誤解を招く表現がないか。

3. 可読性。
   - 文法的に正しいか。
   - 簡潔で分かりやすいか。

4. 一貫性。
   - プロジェクト全体で統一された形式か。
   - 用語の使用が一貫しているか。