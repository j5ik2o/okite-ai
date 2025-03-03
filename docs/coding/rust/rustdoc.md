# Rustdocの掟

{extends doc_comment}

- 以下のドキュメントに従うこと
  - https://doc.rust-lang.org/rustdoc/what-is-rustdoc.html
  - https://doc.rust-jp.rs/rust-by-example-ja/meta/doc.html
  - https://doc.rust-jp.rs/book-ja/ch14-02-publishing-to-crates-io.html#%E5%BD%B9%E3%81%AB%E7%AB%8B%E3%81%A4%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%86%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%B3%E3%83%A1%E3%83%B3%E3%83%88%E3%82%92%E8%A1%8C%E3%81%86

以下、説明は日本だが、rustdoc自体は英語で記述すること

## 基本構造

```rust
/// 簡潔な説明文（1行）
///
/// 必要に応じて詳細な説明を追加（複数行可）
///
/// # セクション名
/// - 項目 - 説明
```


## セクションの種類と順序

以下の順序でセクションを記述します（該当する場合のみ）：

1. `# Type Parameters` - ジェネリック型パラメータの説明
2. `# Arguments` - 関数やメソッドの引数の説明
3. `# Returns` - 戻り値の説明
4. `# Errors` - 返される可能性のあるエラーの説明
5. `# Panics` - パニックが発生する条件
6. `# Safety` - unsafe 関数の安全性に関する条件
7. `# Implementation Notes` - 実装に関する注意点
8. `# Performance Notes` - パフォーマンスに関する注意点
9. `# Examples` - 使用例

## 書式ルール

- 各セクション内の項目は必ず `-` を使用して箇条書きにする
- 項目名と説明の間は ` - `（スペース、ハイフン、スペース）で区切る
- 型パラメータ、引数、戻り値などは必ずバッククォート（\`）で囲む

## 例

### 基本的な関数

```rust
/// Execute the Prop.
///
/// # Arguments
/// - `max_size` - The maximum size of the generated value.
/// - `test_cases` - The number of test cases.
/// - `rng` - The random number generator.
///
/// # Returns
/// - `PropResult` - The result of the Prop.
```

### ジェネリック関数

```rust
/// Generates a Gen that produces values according to specified weights.
///
/// # Type Parameters
/// - `B` - The type of value to be generated.
///
/// # Arguments
/// - `values` - An iterator of tuples where the first element is the weight (u32) and
///             the second element is the value to be generated.
///
/// # Returns
/// - `Gen<B>` - A generator that produces values with probabilities determined by their weights.
///
/// # Panics
/// - Panics if all weights are 0.
/// - Panics if no values are provided.
///
/// # Examples
/// ```
/// use prop_check_rs::gen::Gens;
/// let weighted_gen = Gens::frequency_values([
///     (2, "common"),    // 2/3 probability
///     (1, "rare"),      // 1/3 probability
/// ]);
/// ```
```

### 実装ノートを含む例

```rust
/// Generates a Gen that produces a vector of values using chunk-based processing for better performance.
///
/// # Arguments
/// - `n` - The number of values to generate.
/// - `chunk_size` - The size of chunks for batch processing.
/// - `gen` - The Gen used to generate each value.
///
/// # Returns
/// - `Gen<Vec<B>>` - A generator that produces a vector containing n values.
///
/// # Panics
/// - Panics if chunk_size is 0.
///
/// # Performance Notes
/// - Processes values in chunks to reduce memory allocation overhead.
/// - Automatically adjusts chunk size based on total number of elements.
/// - More efficient than `list_of_n` for large datasets.
```