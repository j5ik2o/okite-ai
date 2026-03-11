# 集約設計パターン - Rust

## 目次

1. [不変集約の実装](#1-不変集約の実装)
2. [ID参照パターン](#2-id参照パターン)
3. [完全コンストラクタ / ファクトリ](#3-完全コンストラクタ--ファクトリ)
4. [防御的コピー](#4-防御的コピー)
5. [不変条件の検証](#5-不変条件の検証)
6. [ドメインイベント](#6-ドメインイベント)
7. [楽観的ロック](#7-楽観的ロック)

---

## 1. 不変集約の実装

struct + `..self` 構造体更新構文パターンを使用する。Rustでは所有権システムにより安全なミューテーションが可能だが、集約設計では不変パターンも有効。

```rust
// Good: struct + 構造体更新構文による不変な集約
#[derive(Clone)]
pub struct Order {
    id: OrderId,
    items: Vec<OrderItem>,
    status: OrderStatus,
}

impl Order {
    pub fn add_item(self, item: OrderItem) -> Order {
        let mut items = self.items;
        items.push(item);
        Order { items, ..self }
    }

    pub fn confirm(self) -> Order {
        Order {
            status: OrderStatus::Confirmed,
            ..self
        }
    }

    pub fn id(&self) -> &OrderId { &self.id }
    pub fn items(&self) -> &[OrderItem] { &self.items }
    pub fn status(&self) -> &OrderStatus { &self.status }
}
```

Rustでは所有権により安全なミューテーションも可能（`&mut self`パターン）：

```rust
// Rust特有: 所有権による安全なミューテーション
impl Order {
    pub fn add_item(&mut self, item: OrderItem) {
        self.items.push(item);
    }

    pub fn confirm(&mut self) {
        self.status = OrderStatus::Confirmed;
    }
}
```

> **注**: Rustの所有権システムは共有ミュータビリティを型レベルで防ぐため、
> 他の言語で不変性が推奨される理由（予期せぬ副作用の防止）が言語レベルで保証される。
> プロジェクトの方針に応じて不変パターン・可変パターンのいずれかを選択する。

## 2. ID参照パターン

```rust
// Good: IDによる間接参照
pub struct Order {
    id: OrderId,
    customer_id: CustomerId,  // IDのみ保持
}

// Bad: 直接参照
pub struct Order {
    id: OrderId,
    customer: Customer,  // 他の集約を直接参照
}
```

## 3. 完全コンストラクタ / ファクトリ

`new` や関連関数でファクトリを定義し、フィールドをprivateに保つことで完全初期化を保証する。

```rust
pub struct Order {
    id: OrderId,
    items: Vec<OrderItem>,
    status: OrderStatus,
    created_at: DateTime<Utc>,
}

impl Order {
    // ファクトリメソッド: 新規作成
    pub fn create(id: OrderId, items: Vec<OrderItem>) -> Result<Order, DomainError> {
        let order = Order {
            id,
            items,
            status: OrderStatus::Draft,
            created_at: Utc::now(),
        };
        order.validate()?;
        Ok(order)
    }

    // 再構築用（リポジトリから復元時）
    pub fn reconstruct(
        id: OrderId,
        items: Vec<OrderItem>,
        status: OrderStatus,
        created_at: DateTime<Utc>,
    ) -> Order {
        Order { id, items, status, created_at }
    }
}
```

## 4. 防御的コピー

Rustの所有権システムにより、防御的コピーの必要性は大幅に低減される。参照を返す場合はライフタイムで安全性が保証される。

```rust
impl Order {
    // スライス参照を返す（所有権は移動しない、変更不可）
    pub fn items(&self) -> &[OrderItem] {
        &self.items
    }

    // コピーが必要な場合は明示的にclone
    pub fn items_owned(&self) -> Vec<OrderItem> {
        self.items.clone()
    }
}
```

## 5. 不変条件の検証

Rustでは `Result` 型でエラーを返すパターンが標準的。ファクトリメソッドで検証し、不正な状態のインスタンスが生成されないことを保証する。

```rust
#[derive(Debug)]
pub enum OrderError {
    EmptyItems,
    InvalidQuantity,
}

pub struct Order {
    id: OrderId,
    items: Vec<OrderItem>,
}

impl Order {
    pub fn create(id: OrderId, items: Vec<OrderItem>) -> Result<Order, OrderError> {
        if items.is_empty() {
            return Err(OrderError::EmptyItems);
        }
        if !items.iter().all(|item| item.quantity() > 0) {
            return Err(OrderError::InvalidQuantity);
        }
        Ok(Order { id, items })
    }

    pub fn add_item(self, item: OrderItem) -> Result<Order, OrderError> {
        let mut items = self.items;
        items.push(item);
        // 再度バリデーション（不変条件の維持）
        Order::create(self.id, items)
    }
}
```

privateな `validate` メソッドで不変条件を集約する：

```rust
impl Order {
    fn validate(&self) -> Result<(), OrderError> {
        if self.items.is_empty() {
            return Err(OrderError::EmptyItems);
        }
        if !self.items.iter().all(|item| item.quantity() > 0) {
            return Err(OrderError::InvalidQuantity);
        }
        Ok(())
    }
}
```

Design by Contract（DbC）の例：

```rust
pub struct Car {
    id: CarId,
    tires: [Tire; 4],  // 型レベルで「4本」を保証
    engine: Engine,
}

impl Car {
    pub fn replace_tire(self, position: usize, new_tire: Tire) -> Result<Car, CarError> {
        // 事前条件
        if position >= 4 {
            return Err(CarError::InvalidTirePosition);
        }

        let mut tires = self.tires;
        tires[position] = new_tire;

        Ok(Car { tires, ..self })
        // 事後条件：配列サイズは型レベルで[Tire; 4]に固定されているため不要
    }
}
```

## 6. ドメインイベント

```rust
pub struct Order {
    id: OrderId,
    status: OrderStatus,
    domain_events: Vec<DomainEvent>,
    // ...other fields
}

impl Order {
    pub fn confirm(self) -> Order {
        let mut events = self.domain_events;
        events.push(DomainEvent::OrderConfirmed {
            order_id: self.id.clone(),
            confirmed_at: Utc::now(),
        });
        Order {
            status: OrderStatus::Confirmed,
            domain_events: events,
            ..self
        }
    }

    pub fn domain_events(&self) -> &[DomainEvent] {
        &self.domain_events
    }

    pub fn clear_events(self) -> Order {
        Order {
            domain_events: Vec::new(),
            ..self
        }
    }
}
```

## 7. 楽観的ロック

```rust
pub struct Order {
    id: OrderId,
    version: u64,  // 並行制御用（要件がある場合のみ）
    // ...other fields
}

impl Order {
    pub fn version(&self) -> u64 { self.version }

    // リポジトリ側でバージョンチェック
    // UPDATE orders SET ... WHERE id = $1 AND version = $2
}
```

---

## 集約ルート経由のアクセス

```rust
// Good: 集約ルート経由
order.update_item_quantity(item_id, new_quantity);

// Bad: 内部オブジェクトを直接操作
if let Some(item) = order.items_mut().iter_mut().find(|i| i.id() == item_id) {
    item.update_quantity(new_quantity);
}
```

## Rust特有の設計パターン

### 型レベルでの不変条件保証

Rustでは型システムを活用して不変条件をコンパイル時に保証できる：

```rust
// 型で状態を表現（Typestate Pattern）
pub struct DraftOrder { /* fields */ }
pub struct ConfirmedOrder { /* fields */ }

impl DraftOrder {
    pub fn confirm(self) -> ConfirmedOrder {
        ConfirmedOrder { /* ... */ }
    }
}

// ConfirmedOrderにはconfirm()がない → 二重確認が型レベルで不可能
```

### newtype パターンによるID

```rust
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct OrderId(String);

impl OrderId {
    pub fn new(value: impl Into<String>) -> Self {
        OrderId(value.into())
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct CustomerId(String);
// OrderIdとCustomerIdは異なる型 → 取り違えがコンパイルエラー
```
