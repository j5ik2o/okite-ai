---
name: aggregate-design
description: |
  DDDの集約(Aggregate)設計ルールに基づいてコードレビューや設計支援を行う。集約の新規設計、既存集約のレビュー、
  リファクタリング時に使用する。トリガー：「集約を設計したい」「集約のレビュー」
  「Aggregateの実装」「集約の境界を決めたい」「DDDで実装したい」等の集約設計関連リクエストで起動。
---

# 集約設計ガイド

DDDにおける集約(Aggregate)設計の原則。

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

## レビューチェックリスト

既存の集約をレビューする際に使用する。

### 基本原則

- [ ] 集約は不変(Immutable)か、または不変にできない明確な理由があるか
- [ ] 他の集約への直接参照を保持していないか（IDのみか）
- [ ] 完全コンストラクタを提供しているか
- [ ] 補助コンストラクタは基本コンストラクタを利用しているか
- [ ] 可変オブジェクトを返す場合、防御的コピーをしているか
- [ ] 不変条件がコンストラクタで検証されているか

### 構造原則

- [ ] 外部からのアクセスは集約ルート経由のみか
- [ ] 内部エンティティを直接操作できる穴がないか
- [ ] 集約のサイズは適切か（大きすぎないか）

### 連携原則

- [ ] 状態変更時にドメインイベントを発行しているか
- [ ] 楽観的ロックの要件がある場合、バージョン番号を実装しているか
- [ ] 楽観的ロックの要件がないのに、不要なバージョン番号を持っていないか
- [ ] 永続化ロジックが集約内に漏れていないか
