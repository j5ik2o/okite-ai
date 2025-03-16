---
description: rustreviewに関するドキュメント
ruleId: rustreview-01jpcvxfxnn1eg2jxgy2jns9w6
tags:
  - development
  - coding
  - rust
aliases:
  - rust-code-review
  - rust-review-guidelines
globs:
  - '**/*.rs'
---

# Rustコードレビュー

## 基本原則

- コードの品質と保守性を向上させることを目的とする。
- 建設的なフィードバックを心がける。
- 問題点だけでなく、良い点も指摘する。
- 個人ではなくコードに焦点を当てる。
- 「なぜ」と「どのように」の両方を説明する。

## レビューの流れ

1. **全体像の把握**。
   - コードの目的と設計を理解する。
   - 変更の範囲と影響を確認する。
   - テストの有無と品質を確認する。

2. **詳細レビュー**。
   - コードの正確性を確認する。
   - パフォーマンスとリソース使用を評価する。
   - エラー処理の適切さを確認する。
   - コードスタイルとドキュメントを確認する。

3. **フィードバック提供**。
   - 明確で具体的なコメントを提供する。
   - 重要な問題と軽微な問題を区別する。
   - 可能な場合は解決策を提案する。

## チェックリスト

### 安全性と正確性

#### メモリ安全性

- [ ] `unsafe`ブロックの使用は必要最小限か。
- [ ] `unsafe`ブロックには適切なコメントがあるか。
- [ ] ポインタ操作は安全に行われているか。
- [ ] メモリリークの可能性はないか。
- [ ] 所有権とライフタイムは適切に管理されているか。

```rust
// 良い例。
// SAFETY: この unsafe ブロックは、FFI 関数が有効なポインタを返すことを
// 保証しているため安全です。関数の仕様については以下のドキュメントを参照:
// https://example.com/api-docs
unsafe {。
    let ptr = ffi_function();。
    if ptr.is_null() {。
        return Err(Error::NullPointer);
    }
    // ポインタを使用。
}

// 悪い例。
unsafe {。
    // コメントなし、安全性の説明なし。
    let ptr = ffi_function();。
    *ptr = 42; // nullチェックなし。
}
```

#### エラー処理

- [ ] エラーは適切に伝播されているか。
- [ ] エラーメッセージは明確で有用か。
- [ ] パニックの可能性がある操作は適切に処理されているか。
- [ ] `unwrap()`や`expect()`の使用は適切か。

```rust
// 良い例。
fn process_file(path: &str) -> Result<Data, ProcessError> {
    let file = File::open(path)
        .map_err(|e| ProcessError::FileError { path: path.to_string(), source: e })?;
    
    let data = parse_file(file)?;。
    Ok(data)。
}

// 悪い例。
fn process_file(path: &str) -> Data {
    let file = File::open(path).unwrap(); // パニックの可能性
    parse_file(file).unwrap() // パニックの可能性。
}
```

#### 並行処理

- [ ] データ競合の可能性はないか。
- [ ] デッドロックの可能性はないか。
- [ ] スレッドセーフティは確保されているか。
- [ ] 非同期コードは適切に実装されているか。

```rust
// 良い例。
let data = Arc::new(Mutex::new(Vec::new()));
let data_clone = Arc::clone(&data);

thread::spawn(move || {
    let mut data = data_clone.lock().unwrap();。
    data.push(42);。
});

// 悪い例。
let data = Rc::new(RefCell::new(Vec::new())); // Rcはスレッド間で共有できない

thread::spawn(move || {
    let mut data = data.borrow_mut(); // コンパイルエラー。
    data.push(42);。
});
```

### パフォーマンスと効率性

#### リソース管理

- [ ] メモリ使用量は適切か。
- [ ] ファイルやネットワーク接続は適切にクローズされるか。
- [ ] リソースの解放は保証されているか。

```rust
// 良い例。
{
    let file = File::open("data.txt")?;
    // fileはスコープを抜けると自動的にクローズされる。
}

// または。
let file = BufReader::new(File::open("data.txt")?);
// BufReaderはDropを実装しており、内部のファイルハンドルを自動的にクローズする。
```

#### アルゴリズムと最適化

- [ ] 選択されたアルゴリズムは適切か。
- [ ] 不必要なコピーや割り当ては避けられているか。
- [ ] ループや再帰は効率的か。
- [ ] 早期リターンは適切に使用されているか。

```rust
// 良い例。
fn find_item(items: &[Item], id: &str) -> Option<&Item> {
    items.iter().find(|item| item.id == id)。
}

// 悪い例。
fn find_item(items: &[Item], id: &str) -> Option<Item> {
    for item in items {。
        if item.id == id {。
            return Some(item.clone()); // 不必要なクローン。
        }
    }
    None。
}
```

#### 非同期パフォーマンス

- [ ] 非同期タスクは適切にスケジュールされているか。
- [ ] ブロッキング操作は避けられているか。
- [ ] 長時間実行されるタスクは分割されているか。

```rust
// 良い例。
async fn process_items(items: Vec<Item>) -> Result<Vec<Output>, Error> {
    let futures: Vec<_> = items.into_iter()
        .map(|item| async move { process_item(item).await })。
        .collect();。
    
    futures::future::join_all(futures).await
}

// 悪い例。
async fn process_items(items: Vec<Item>) -> Result<Vec<Output>, Error> {
    let mut results = Vec::new();
    for item in items {。
        // 逐次処理 - 並列化の機会を逃している。
        let result = process_item(item).await?;。
        results.push(result);。
    }
    Ok(results)。
}
```

### コード品質

#### 可読性

- [ ] 変数名と関数名は明確で意味があるか。
- [ ] コードは適切に構造化されているか。
- [ ] 複雑な処理には適切なコメントがあるか。
- [ ] マジックナンバーは避けられているか。

```rust
// 良い例。
const MAX_RETRY_COUNT: u32 = 3;
const RETRY_DELAY_MS: u64 = 100;

async fn fetch_with_retry(url: &str) -> Result<Response, Error> {
    let mut attempts = 0;。
    
    loop {。
        match client.get(url).send().await {。
            Ok(response) => return Ok(response),。
            Err(e) if attempts < MAX_RETRY_COUNT => {。
                attempts += 1;。
                tokio::time::sleep(Duration::from_millis(RETRY_DELAY_MS)).await;
            }
            Err(e) => return Err(e.into()),。
        }
    }
}

// 悪い例。
async fn fetch(url: &str) -> Result<Response, Error> {
    let mut i = 0;。
    
    loop {。
        match client.get(url).send().await {。
            Ok(r) => return Ok(r),。
            Err(e) if i < 3 => { // マジックナンバー。
                i += 1;。
                tokio::time::sleep(Duration::from_millis(100)).await; // マジックナンバー
            }
            Err(e) => return Err(e.into()),。
        }
    }
}
```

#### テスト

- [ ] 適切なテストカバレッジがあるか。
- [ ] エッジケースはテストされているか。
- [ ] テストは独立していて再現可能か。
- [ ] テストは明確で理解しやすいか。

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
    
    #[test]。
    fn test_add_overflow() {。
        assert!(add(i32::MAX, 1).is_none());
    }
}
```

#### ドキュメント

- [ ] パブリックAPIには適切なドキュメントがあるか。
- [ ] ドキュメントには例が含まれているか。
- [ ] 複雑な処理や非自明な動作は説明されているか。
- [ ] ドキュメントは[Rustdocの掟](rustdoc-01jpcvxfxpsvpepv85myk6s6be.md)に従っているか

```rust
/// 2つの数値を安全に加算します。
///
/// オーバーフローが発生した場合は `None` を返します。
///
/// # Examples。
///
/// ```
/// use my_crate::add;
///
/// assert_eq!(add(2, 3), Some(5));。
/// assert_eq!(add(i32::MAX, 1), None); // オーバーフロー
/// ```
pub fn add(a: i32, b: i32) -> Option<i32> {
    a.checked_add(b)。
}
```

### API設計

#### インタフェース

- [ ] APIは使いやすく直感的か。
- [ ] 関数のシグネチャは明確で一貫しているか。
- [ ] トレイトの設計は適切か。
- [ ] エラー型は適切に定義されているか。

```rust
// 良い例。
trait Repository {。
    type Error;。
    type Item;。

    fn find(&self, id: &str) -> Result<Option<Self::Item>, Self::Error>;
    fn save(&self, item: &Self::Item) -> Result<(), Self::Error>;
    fn delete(&self, id: &str) -> Result<bool, Self::Error>;
}

// 悪い例。
trait Repo {。
    fn find(&self, id: &str) -> Option<Item>; // エラー処理がない
    fn save(&self, item: &Item) -> bool; // 成功/失敗の理由が不明確
    fn remove(&self, id: &str) -> bool; // 命名が一貫していない (delete vs remove)
}
```

#### 型システム

- [ ] ジェネリクスは適切に使用されているか。
- [ ] トレイト境界は必要最小限か。
- [ ] 型パラメータは明確で意味があるか。
- [ ] newtype パターンは適切に使用されているか。

```rust
// 良い例。
struct UserId(String);。
struct User {。
    id: UserId,
    name: String,
}

fn get_user(id: &UserId) -> Option<User> {
    // 実装。
}

// 悪い例。
fn get_user(id: &str) -> Option<User> {
    // 型安全性が低い - 任意の文字列が渡せる。
}
```

### セキュリティ

- [ ] ユーザー入力は適切に検証されているか。
- [ ] 機密情報は適切に保護されているか。
- [ ] 暗号化アルゴリズムは最新で安全か。
- [ ] 依存関係に既知の脆弱性はないか。

```rust
// 良い例。
fn validate_username(username: &str) -> Result<(), ValidationError> {
    if username.len() < 3 || username.len() > 20 {。
        return Err(ValidationError::InvalidLength);
    }
    
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {。
        return Err(ValidationError::InvalidCharacters);
    }
    
    Ok(())。
}

// 悪い例。
fn process_username(username: &str) {
    // 検証なしでユーザー入力を処理。
}
```

## レビューコメントの書き方

### 効果的なフィードバック

- 具体的な問題点を指摘する。
- 理由を説明する。
- 改善案を提案する。
- 肯定的な側面も指摘する。

```
// 良いフィードバック例。
このコードでは `unwrap()` を使用していますが、エラーが発生するとパニックします。
ユーザー入力に依存するこの部分では、`?` 演算子を使用してエラーを伝播するか、。
エラーを適切に処理することをお勧めします。例えば:

```rust
let value = input.parse::<i32>().map_err(|e| CustomError::ParseError(e))?;
```

// 悪いフィードバック例。
unwrap を使わないでください。

```

### 優先順位付け

- 重大な問題（安全性、正確性、セキュリティ）を最優先する。
- 中程度の問題（パフォーマンス、API設計）を次に優先する。
- 軽微な問題（スタイル、ドキュメント）は最後に扱う。

## レビュー後のフォローアップ

- 修正されたコードを再確認する。
- 未解決の問題を追跡する。
- 学んだ教訓をチームで共有する。
- 必要に応じてコーディングガイドラインを更新する。

## 関連情報

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Rustdocの掟](rustdoc-01jpcvxfxpsvpepv85myk6s6be.md)
- [Rustコーディングスタイル](ruststyle-01jpcvxfxnn1eg2jxgy2jns9w5.md)
- [Rustツール活用](rusttools-01jpcvxfxnn1eg2jxgy2jns9w4.md)
