---
name: aggregate-design
description: |
  DDDの集約(Aggregate)設計ルールに基づいてコードレビューや設計支援を行う。集約の新規設計、既存集約のレビュー、
  リファクタリング時に使用する。トリガー：「集約を設計したい」「集約のレビュー」
  「Aggregateの実装」「集約の境界を決めたい」「DDDで実装したい」等の集約設計関連リクエストで起動。
---

# 集約設計ガイド

DDDにおける集約(Aggregate)設計の原則。

## 集約とは

**集約 = 整合性の境界**

- 集約はオブジェクトのグラフであり、そのグラフを一単位として扱う
- 集約内で**真の不変条件**（常に満たすべき制約）が維持される
- 集約ルート（ルートエンティティ）が集約全体の唯一のエントリーポイント

### 境界の例：Car集約

```
┌─────────────────────────────────────┐
│           Car集約                    │
│  ┌──────────────────────────────┐  │
│  │   Car (集約ルート)            │  │
│  │   - carId: CarId             │  │
│  │   - tires: List[Tire]        │  │
│  │   - engine: Engine           │  │
│  └──────────────────────────────┘  │
│         ↓ 所有               ↓ 所有  │
│  ┌──────────┐         ┌─────────┐ │
│  │  Tire    │ × 4     │ Engine  │ │
│  │ (VoかEnt)│         │ (VoかEnt)│ │
│  └──────────┘         └─────────┘ │
└─────────────────────────────────────┘
```

- TireとEngineはCar集約の境界内にある
- 外部からTireやEngineへ直接アクセスは不可
- Carを経由してのみ操作可能

## Design by Contract (DbC)

集約は**契約**に基づいて設計する。

| 契約 | 説明 | 責任 |
|------|------|------|
| **事前条件 (Precondition)** | メソッド呼び出し前に満たすべき条件 | 呼び出し側 |
| **事後条件 (Postcondition)** | メソッド実行後に満たされる条件 | 実装側 |
| **不変条件 (Invariant)** | 常に満たすべき条件 | 実装側 |

```scala
// Scalaでの DbC 例
class Car private (
  val id: CarId,
  val tires: List[Tire],
  val engine: Engine
) {
  // 不変条件（常に満たす）
  require(tires.size == 4, "タイヤは4本必要")
  require(engine != null, "エンジンは必須")

  def replaceTire(position: Int, newTire: Tire): Car = {
    // 事前条件
    require(position >= 0 && position < 4, "タイヤ位置は0-3")
    require(newTire != null, "新しいタイヤは必須")

    val updated = new Car(
      id,
      tires.updated(position, newTire),
      engine
    )
    // 事後条件（暗黙的：不変条件が満たされる）
    updated
  } ensuring { result =>
    result.tires.size == 4  // 事後条件
  }
}
```

## 基本原則

### 1. 不変性(Immutability)推奨

現代においては不変(Immutable)を推奨する。特に理由がなければ不変。

```typescript
// Good: 不変な集約
class Order {
  private constructor(
    readonly id: OrderId,
    readonly items: readonly OrderItem[],
    readonly status: OrderStatus
  ) {}

  addItem(item: OrderItem): Order {
    return new Order(this.id, [...this.items, item], this.status);
  }
}

// Bad: 可変な集約
class Order {
  private items: OrderItem[] = [];
  constructor(readonly id: OrderId) {}
  addItem(item: OrderItem): void { this.items.push(item); }
}
```

### 2. 強い整合性境界

集約は一つの強い整合性境界。集約内部の状態はすべてその集約の管理下に置く。

### 3. 他集約への間接参照

集約内部に別の集約の参照を保持しない。他の集約と関連を持つ場合はIDで間接参照する。

```typescript
// Good: IDによる間接参照
class Order {
  constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId  // IDのみ保持
  ) {}
}

// Bad: 直接参照
class Order {
  constructor(
    readonly id: OrderId,
    readonly customer: Customer  // 他の集約を直接参照
  ) {}
}
```

### 4. 完全コンストラクタ

基本コンストラクタですべての状態を初期化する。オーバーロードする場合も必ず基本コンストラクタを利用する補助コンストラクタとして設計する。

```typescript
class Order {
  private constructor(
    readonly id: OrderId,
    readonly items: readonly OrderItem[],
    readonly status: OrderStatus,
    readonly createdAt: Date
  ) {}

  // ファクトリメソッドは基本コンストラクタを利用
  static create(id: OrderId, items: OrderItem[]): Order {
    return new Order(id, items, OrderStatus.DRAFT, new Date());
  }
}
```

### 5. 防御的コピー

可変オブジェクトを保持する場合、外部に返す際は必ずコピーを返すか不変オブジェクトに変換する。

```typescript
class Order {
  private readonly _items: OrderItem[];

  constructor(items: OrderItem[]) {
    this._items = [...items];  // 入力をコピー
  }

  get items(): readonly OrderItem[] {
    return [...this._items];  // コピーを返す
  }
}
```

### 6. 不変条件の維持

どのような操作をされても不正な状態に陥ってはならない。不変な集約では基本コンストラクタで保護する。

```typescript
class Order {
  private constructor(
    readonly id: OrderId,
    readonly items: readonly OrderItem[]
  ) {
    if (items.length === 0) {
      throw new Error("注文には最低1つの商品が必要");
    }
    if (!items.every(item => item.quantity > 0)) {
      throw new Error("数量は正の数");
    }
  }
}
```

## 構造原則

### 7. 集約ルート経由のアクセス

集約内部のエンティティや値オブジェクトへの直接アクセスは、必ず集約ルートを経由する。

```typescript
// Good: 集約ルート経由
order.updateItemQuantity(itemId, newQuantity);

// Bad: 内部オブジェクトを直接操作
order.items.find(item => item.id === itemId)?.updateQuantity(newQuantity);
```

### 8. 1トランザクション = 1集約

単一のトランザクションで複数の集約を更新しない。集約間の整合性は結果整合性で担保する。

### 9. 集約を小さく保つ

大きすぎる集約は並行性の問題(ロック競合)を引き起こす。真に一貫性が必要な範囲のみを含める。

## 連携原則

### 10. ドメインイベントによる連携

集約の状態変更時にドメインイベントを発行し、他の集約や外部システムはそれを購読して反応する。

```typescript
class Order {
  private readonly _events: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return [...this._events];
  }

  confirm(): Order {
    const confirmed = new Order(/* ...props, status: OrderStatus.CONFIRMED */);
    confirmed._events.push(new OrderConfirmed(this.id, new Date()));
    return confirmed;
  }
}
```

### 11. 楽観的ロック（要件がある場合のみ）

並行更新の衝突検出が必要な場合にのみ、バージョン番号を持たせる。要件がなければ不要。

```typescript
// 楽観的ロックが必要な場合のみ
class Order {
  constructor(
    readonly id: OrderId,
    readonly version: number,  // 並行制御用（要件がある場合のみ）
    // ...
  ) {}
}
```

### 12. 永続化の無知

集約はドメインロジックに集中し、どう保存されるかは関知しない(リポジトリの責務)。

---

## Evans Rules（エリック・エヴァンス）

DDDの原典からの集約ルール。

### Evans Rule 1: ルートエンティティの責任

> 集約ルートだけがリポジトリから直接取得できる。

- 外部オブジェクトは集約内部への参照を持てない
- 集約ルートは内部エンティティの識別子を渡すことができるが、それは一時的な利用に限る
- 集約ルートは集約全体の不変条件を維持する責任を持つ

### Evans Rule 2: 内部オブジェクトへのアクセス制限

> 境界内のエンティティはローカルな識別子を持つ。それは集約内でのみ一意であればよい。

- 外部から直接アクセス不可
- 内部エンティティの識別子はグローバルに一意である必要はない

---

## Vernon's 4 Rules（ヴォーン・ヴァーノン）

「実践ドメイン駆動設計」からの設計ルール。

### Rule 1: 真の不変条件を整合性境界に

> **Design aggregates based on true invariants** (整合性境界の中で真の不変条件を担保)

```
良い例：Order集約
- 注文合計 = 各明細の小計の合計（真の不変条件）
- この計算は即座に正しくなければならない

悪い例：結果整合性で十分な場合
- 在庫数の更新は別の集約で結果整合性
```

### Rule 2: 小さな集約

> **Keep aggregates small**（集約は小さく）

大きな集約の問題：
- ロック競合が増加
- 並行性が低下
- トランザクション失敗率が上昇

```
❌ Bad: 大きな集約
Product集約
├── productId
├── name
├── backlogItems: List[BacklogItem]  ← 数百件になる可能性
└── ...

✅ Good: 分割した集約
Product集約              BacklogItem集約
├── productId           ├── backlogItemId
├── name                ├── productId（IDで参照）
└── ...                 └── ...
```

### Rule 3: 他の集約はIDで参照

> **Reference other aggregates by ID only**（他の集約はIDで参照）

前述の「他集約への間接参照」と同じ原則。

### Rule 4: 結果整合性

> **Use eventual consistency outside the boundary**（境界外は結果整合性）

- 集約間の整合性はドメインイベント + 結果整合性で担保
- 単一トランザクションで複数集約を更新しない

---

## レビューチェックリスト

既存の集約をレビューする際に使用する。

### Design by Contract

- [ ] 事前条件が明確に定義されているか（require）
- [ ] 事後条件が満たされているか（ensuring）
- [ ] 不変条件がコンストラクタ・各操作後に維持されているか

### 基本原則

- [ ] 集約は不変(Immutable)か、または不変にできない明確な理由があるか
- [ ] 他の集約への直接参照を保持していないか（IDのみか）
- [ ] 完全コンストラクタを提供しているか
- [ ] 補助コンストラクタは基本コンストラクタを利用しているか
- [ ] 可変オブジェクトを返す場合、防御的コピーをしているか
- [ ] 不変条件がコンストラクタで検証されているか

### Evans Rules

- [ ] 集約ルートのみがリポジトリから直接取得されるか
- [ ] 外部から集約内部への直接参照がないか
- [ ] 内部エンティティの識別子は一時的な利用に限られているか

### Vernon's Rules

- [ ] 真の不変条件のみが集約境界内にあるか（過剰な含有がないか）
- [ ] 集約は十分に小さいか（数百件のコレクションを含んでいないか）
- [ ] 他の集約はIDのみで参照しているか
- [ ] 集約間の整合性は結果整合性で担保されているか

### 構造原則

- [ ] 外部からのアクセスは集約ルート経由のみか
- [ ] 内部エンティティを直接操作できる穴がないか
- [ ] 集約のサイズは適切か（大きすぎないか）

### 連携原則

- [ ] 状態変更時にドメインイベントを発行しているか
- [ ] 楽観的ロックの要件がある場合、バージョン番号を実装しているか
- [ ] 楽観的ロックの要件がないのに、不要なバージョン番号を持っていないか
- [ ] 永続化ロジックが集約内に漏れていないか
