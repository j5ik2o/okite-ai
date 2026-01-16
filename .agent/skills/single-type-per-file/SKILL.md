---
name: single-type-per-file
description: >-
  コード生成時に「1公開型 = 1ファイル」の原則を強制する。
  公開型（public class, interface, trait, protocol, enum, type、JS/TSではexportされたオブジェクト）
  ごとに個別ファイルを作成し、1ファイルに複数の公開型を詰め込むことを禁止する。
  トリガー：新規ファイル作成、クラス/構造体/インターフェース追加、コード生成リクエスト時に自動適用。
---

# Single Type Per File

コード生成時に「1公開型 = 1ファイル」を強制する汎用原則。言語を問わず適用する。

## 原則

**1つの公開型につき1つのファイルを作成する。**

## 公開型の定義

以下を公開型として扱う:

| 言語 | 公開型                                               |
|------|---------------------------------------------------|
| Java/Kotlin/Scala | `public`な `class`, `trait`, `object`, `enum`      |
| Rust | `pub struct`, `pub trait`, `pub enum`             |
| Go | 大文字始まりの `type`                                    |
| Python | モジュールレベルの `class`                                 |
| TypeScript/JavaScript | `export`された `class`, `interface`, `type`, オブジェクト  |
| Swift | `public class`, `public protocol`, `public enum`  |
| C# | `public class`, `public interface`, `public enum` |

## ルール

### MUST（必須）

- 1つの公開型につき1つのファイルを作成
- ファイル名は公開型の名前を反映（例: `UserRepository` → `user_repository.py`）
- 既存ファイルに新しい公開型を追加しない

### ALLOWED（許可）

- 公開型に必要な**プライベート実装型**は同居可
- 公開型の**内部ネスト型**は同居可
- **sealed interface/trait**とその閉じた実装群は同居可

### MUST NOT（禁止）

- 1ファイルに複数の公開クラス/構造体/インターフェース
- 「関連しているから」という理由での型の集約
- 言語idiomを理由にした原則の無視

## 例

### 正しい例

```
src/
├── user.py           # class User
├── user_repository.py    # class UserRepository
├── order.py          # class Order
└── order_status.py   # enum OrderStatus
```

### 誤った例

```
src/
├── models.py         # class User, class Order, enum OrderStatus ← 禁止
└── repositories.py   # class UserRepository, class OrderRepository ← 禁止
```

### sealed interface/trait の例外

Scalaのsealed trait、Kotlinのsealed class、Rustのenumなど、閉じた実装群は同居可:

```rust
// payment_method.rs - 許可される例外
pub enum PaymentMethod {
    CreditCard(CreditCard),
    BankTransfer(BankTransfer),
}

struct CreditCard { /* ... */ }  // プライベート実装
struct BankTransfer { /* ... */ } // プライベート実装
```

```kotlin
// PaymentMethod.kt - 許可される例外
sealed class PaymentMethod {
    data class CreditCard(val number: String) : PaymentMethod()
    data class BankTransfer(val accountId: String) : PaymentMethod()
}
```

```scala
// PaymentMethod.scala - 許可される例外
sealed trait PaymentMethod
final case class CreditCard(number: String) extends PaymentMethod
final case class BankTransfer(accountId: String) extends PaymentMethod
```

## 判断基準

新しい型を追加する際のチェックリスト:

1. この型は公開型か？ → Yes なら新規ファイル作成
2. 既存の公開型の内部実装か？ → Yes なら同居可
3. sealed interface/traitの閉じた実装か？ → Yes なら同居可
4. 上記以外 → 新規ファイル作成

## 言語idiomとの関係

Go の `errors.go`、Rust の `mod.rs` など言語固有の慣習があっても、**本原則を優先する**。

理由:
- ナビゲーション性の向上（ファイル名 = 型名）
- 責任の明確化（ファイル肥大化 = 設計の問題）
- Git履歴の追跡容易性
