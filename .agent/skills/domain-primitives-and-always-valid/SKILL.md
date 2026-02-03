---
name: domain-primitives-and-always-valid
description: >-
  Domain PrimitivesとAlways-Valid Domain Modelの設計原則に基づき、ドメインモデルの型安全性と不変条件を
  保証する設計・実装を支援する。プリミティブ型の濫用を防ぎ、構築時検証・不変性・自己完結性を備えた
  ドメイン固有の型を設計する。コードレビュー、新規実装、リファクタリング時に使用。
  対象言語: Rust, TypeScript, Java。他の言語（Kotlin, Scala, Go, Python等）にも応用可能。
  トリガー：「ドメインプリミティブを作りたい」「Always-Validなモデルを設計」「プリミティブ型をラップしたい」
  「構築時に検証したい」「無効な状態を型で防ぎたい」「Smart Constructorパターン」等のリクエストで起動。
---

# Domain Primitives & Always-Valid Domain Model

プリミティブ型を信頼せず、ドメイン固有の型で不変条件を強制する。

## 核心原則

### Domain Primitives（Secure by Design）

**プリミティブ型をそのまま使わず、ドメイン固有の最小単位の型でラップする。**

| 特性 | 説明 |
|------|------|
| 構築時検証 | 無効な値でインスタンスを作成できない |
| 不変（Immutable） | 一度作成されたら変更できない |
| 自己完結 | 他のエンティティへの参照を持たない |
| ドメイン操作の集約 | その型に関連する操作をカプセル化 |
| 引数の取り違え防止 | 同じプリミティブ型でも異なるドメイン型として区別 |

### Always-Valid Domain Model

**ドメインモデルは常に有効な状態にあることを型システムで保証する。**

```
オブジェクトが存在する = そのオブジェクトは有効である
```

## プリミティブ型の危険性

プリミティブ型をそのまま使うと、**本番環境で初めて発覚するバグ**を生む。

### 1. 無効な値がシステムを汚染する

```rust
// ❌ プリミティブ型：無効な値が素通りする
fn transfer(from: &str, to: &str, amount: i64) {
    // 負の金額で送金 → 受取人の残高が減り、送金者の残高が増える！
    db.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, from);
    db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, to);
}

transfer("alice", "bob", -10000);  // コンパイルOK、テストも通る、本番で大損害
```

### 2. 引数の取り違えがテストをすり抜ける

```rust
// ❌ 同じ型の引数が並ぶと、取り違えてもコンパイラが検出できない
fn create_user(first_name: &str, last_name: &str, email: &str);

// 姓名を逆に渡している。単体テストでは「動く」ので見逃される
create_user("Smith", "John", "john@example.com");
// → DB: first_name="Smith", last_name="John" 😱
```

### 3. セキュリティホールを生む

```rust
// ❌ 検証なしのStringはSQLインジェクションの温床
fn find_user(email: String) -> User {
    db.query(&format!("SELECT * FROM users WHERE email = '{}'", email))
}

find_user("'; DROP TABLE users; --".to_string());  // 💀
```

### 4. 異なる単位の混同

```rust
// ❌ 両方ともf64。単位の違いをコンパイラが検出できない
fn calculate_distance(meters: f64, feet: f64) -> f64;

// 火星探査機が墜落した原因（実話：Mars Climate Orbiter, 1999年）
let result = calculate_distance(altitude_in_feet, thrust_in_meters);
```

### なぜテストで発見できないのか

| 問題 | テストの限界 |
|------|------------|
| 負の金額 | 正常系テストでは正の値しか使わない |
| 引数の順序 | 両方とも文字列なので型エラーにならない |
| 境界値 | 全ての組み合わせをテストすることは不可能 |
| 単位の混同 | 両方とも数値なので計算は「正しく」動く |

**型で制約すれば、これらはすべてコンパイル時に検出できる。**

## アンチパターン検出

以下のパターンを見つけたらDomain Primitiveへの変換を検討：

```
❌ fn send_email(to: String, subject: String)  // StringはEmailではない
❌ fn create_user(age: i32)                    // i32は年齢の制約を持たない
❌ fn process_order(amount: f64, currency: String)  // 別々に渡すと不整合の可能性
❌ struct User { email: String }               // 検証なしで無効な値を保持できる
❌ if !is_valid_email(s) { return Err(...) }   // 検証後も同じString型
❌ fn schedule(room: String, start: String, end: String)  // 引数の取り違えが検出できない
```

### 引数取り違えの危険性

同じプリミティブ型の引数が複数並ぶと、**コンパイラがバグを検出できない**：

```rust
// ❌ 引数を取り違えてもコンパイルが通る
fn schedule(room: &str, start_time: &str, end_time: &str);
schedule("10:00", "11:00", "Room A");  // バグだがコンパイルOK

// ✅ 型で区別すればコンパイルエラーで検出
fn schedule(room: MeetingRoom, start: Time, end: Time);
schedule(Time::parse("10:00")?, Time::parse("11:00")?, MeetingRoom::new("Room A")?);
// コンパイルエラー: expected `MeetingRoom`, found `Time`
```

## 設計パターン

### 1. Smart Constructor

```rust
// ❌ 外部から直接構築可能
pub struct Email(pub String);

// ✅ Smart Constructorで検証を強制
mod email {
    pub struct Email(String);  // フィールドはprivate

    impl Email {
        pub fn new(value: &str) -> Result<Self, EmailError> {
            if !value.contains('@') || value.len() <= 3 {
                return Err(EmailError::InvalidFormat);
            }
            Ok(Self(value.to_string()))
        }

        // カプセル化を破る場合は命名で明示
        pub fn breach_encapsulation_of_value(&self) -> &str {
            &self.0
        }
    }
}
```

### 2. 複合値のカプセル化

```rust
// ❌ 関連する値を別々に渡す
fn calculate_price(amount: f64, currency: &str) -> f64;

// ✅ 複合値を単一の型でカプセル化
pub struct Money {
    amount: Decimal,
    currency: Currency,
}

impl Money {
    pub fn new(amount: Decimal, currency: Currency) -> Result<Self, MoneyError> {
        if amount < Decimal::ZERO {
            return Err(MoneyError::NegativeAmount);
        }
        Ok(Self { amount, currency })
    }

    pub fn add(&self, other: &Money) -> Result<Money, MoneyError> {
        if self.currency != other.currency {
            return Err(MoneyError::CurrencyMismatch);
        }
        Money::new(self.amount + other.amount, self.currency)
    }
}
```

### 3. 範囲制約型

```rust
// ❌ 任意のi32を受け入れる
fn set_age(age: i32);

// ✅ 有効な範囲のみを表現する型
pub struct Age(u8);

impl Age {
    pub fn new(value: u8) -> Result<Self, AgeError> {
        if value > 150 {
            return Err(AgeError::TooOld);
        }
        Ok(Self(value))
    }
}
```

### 4. NonEmpty型

```rust
// ❌ 空の可能性があるVec
fn process_items(items: Vec<Item>);

// ✅ 空でないことを型で保証
pub struct NonEmpty<T> {
    head: T,
    tail: Vec<T>,
}

impl<T> NonEmpty<T> {
    pub fn new(items: Vec<T>) -> Option<Self> {
        let mut iter = items.into_iter();
        iter.next().map(|head| NonEmpty {
            head,
            tail: iter.collect(),
        })
    }

    pub fn head(&self) -> &T {
        &self.head  // 常に安全にアクセス可能
    }
}
```

## 判断フロー

```
プリミティブ型を使おうとしている
    ↓
この値にドメイン固有の制約があるか？
    ├─ Yes → Domain Primitiveを作成
    │    ├─ フォーマット制約 → Smart Constructor + 正規表現/パーサー
    │    ├─ 範囲制約 → 境界チェック付きコンストラクタ
    │    ├─ 複合値 → 関連する値をまとめた型
    │    └─ 非空制約 → NonEmpty<T>
    └─ No → プリミティブ型のままでOK（稀）
```

## 言語別実装パターン

### Rust

```rust
// newtype + From/TryFrom
pub struct UserId(Uuid);

impl TryFrom<&str> for UserId {
    type Error = UserIdError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        Uuid::parse_str(value)
            .map(UserId)
            .map_err(|_| UserIdError::InvalidFormat)
    }
}
```

### TypeScript

```typescript
// Branded Types
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type Email = Brand<string, 'Email'>;

function parseEmail(s: string): Email | null {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    return s as Email;
  }
  return null;
}
```

### Java

```java
public final class Email {
    private final String value;

    private Email(String value) {
        this.value = value;
    }

    public static Email parse(String s) {
        if (s == null || !s.contains("@") || s.length() <= 3) {
            throw new IllegalArgumentException("Invalid email: " + s);
        }
        return new Email(s);
    }

    public String breachEncapsulationOfValue() {
        return value;
    }
}
```

## レビュー観点

コードレビュー時の確認ポイント：

1. **プリミティブ型の露出**: `String`, `int`, `f64`などがドメインの概念を表現していないか
2. **構築時検証**: コンストラクタ/ファクトリで不変条件を検証しているか
3. **不変性**: フィールドは`private`かつ`final`/`readonly`/不変か
4. **カプセル化**: 内部状態へのアクセスは制限されているか（`breachEncapsulationOf`命名）
5. **ドメイン操作**: 関連する操作は型に集約されているか

## 適用指針

### 推奨

- ID型（UserId, OrderId, ProductId等）
- 連絡先情報（Email, PhoneNumber, Address等）
- 金融情報（Money, Currency, Percentage等）
- 測定値（Temperature, Distance, Weight等）
- 非空コレクション（NonEmpty<T>）

### 過剰適用を避ける

- 一時的なローカル変数
- プライベートな内部実装の詳細
- 外部ライブラリとの境界（ただし変換層で型を適用）

### プリミティブ型への変換が許容される場面

**ドメイン境界を越える際は、プリミティブ型への変換が必要かつ正当である。**

```
ドメイン層（ドメイン固有型を使用）
    │
    │  ← ここで変換（breachEncapsulationOf）
    ↓
境界層（JSON, DB, 外部API）← プリミティブ型が必要
```

| 場面 | 理由 | 例 |
|------|------|-----|
| JSON/XMLシリアライズ | 標準フォーマットはプリミティブ型のみ | `{"quantity": 5}` |
| データベース永続化 | RDBのカラム型はプリミティブ | `INSERT INTO orders (quantity) VALUES (5)` |
| 外部API連携 | 外部システムはドメイン型を知らない | REST APIのリクエスト/レスポンス |
| ログ出力 | 人間が読める形式が必要 | `log::info!("注文数: {}", qty.value())` |

```rust
// ✅ 永続化層での正当な使用例
impl OrderRepository {
    fn save(&self, order: &Order) {
        // ドメイン型 → プリミティブ型への変換は境界層で許容
        let quantity_value = order.quantity().breach_encapsulation_of_value();
        db.execute("INSERT INTO orders (quantity) VALUES (?)", quantity_value);
    }

    fn find(&self, id: OrderId) -> Option<Order> {
        let row = db.query_one("SELECT quantity FROM orders WHERE id = ?", id.value())?;
        // プリミティブ型 → ドメイン型への変換（検証付き）
        let quantity = OrderQuantity::new(row.get("quantity")).ok()?;
        Some(Order::new(id, quantity))
    }
}
```

**原則**: ドメイン層内ではドメイン固有型を徹底し、境界を越える瞬間だけ変換する。

## 関連スキルとの使い分け

| スキル | フォーカス | 使うタイミング |
|--------|----------|---------------|
| **本スキル** | 型の設計と構築時検証 | 新しいドメイン型を設計するとき |
| parse-dont-validate | 検証結果の型への変換 | validate→parse変換をレビューするとき |
| domain-building-blocks | DDD戦術パターン全般 | エンティティ/集約/サービスの設計時 |

## 参考文献

- Dan Bergh Johnsson et al. "Secure by Design" - Domain Primitivesの原典
- Alexis King "Parse, don't validate" - Always-Valid原則の理論的背景
- Scott Wlaschin "Domain Modeling Made Functional" - 型駆動設計の実践
- Einar Landre "Prefer Domain-Specific Types to Primitive Types" in "97 Things Every Programmer Should Know" - コンパイラにバグを見つけさせる
