# 集約設計パターン - TypeScript

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

Props型 + `...this.props` スプレッド構文パターンを使用する。
フィールド追加時の修正漏れを防ぎ、更新意図が明確になる。

```typescript
// Good: Props型 + スプレッド構文による不変な集約
type OrderProps = {
  readonly id: OrderId;
  readonly items: readonly OrderItem[];
  readonly status: OrderStatus;
};

class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(id: OrderId, items: OrderItem[]): Order {
    return new Order({ id, items, status: OrderStatus.DRAFT });
  }

  addItem(item: OrderItem): Order {
    return new Order({
      ...this.props,
      items: [...this.props.items, item],
    });
  }

  confirm(): Order {
    return new Order({
      ...this.props,
      status: OrderStatus.CONFIRMED,
    });
  }

  get id(): OrderId { return this.props.id; }
  get items(): readonly OrderItem[] { return this.props.items; }
  get status(): OrderStatus { return this.props.status; }
}
```

```typescript
// Bad: フィールド全列挙（フィールド追加時に全メソッドの修正が必要）
class Order {
  addItem(item: OrderItem): Order {
    return new Order(this.id, [...this.items, item], this.status);
  }
}
```

```typescript
// Bad: 可変な集約
class Order {
  private items: OrderItem[] = [];
  constructor(readonly id: OrderId) {}
  addItem(item: OrderItem): void { this.items.push(item); }
}
```

## 2. ID参照パターン

他の集約とは直接参照ではなくIDで関連を持つ。

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

## 3. 完全コンストラクタ / ファクトリ

基本コンストラクタですべての状態を初期化する。ファクトリメソッドは基本コンストラクタを利用する。

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

Props型パターンと組み合わせる場合：

```typescript
type OrderProps = {
  readonly id: OrderId;
  readonly items: readonly OrderItem[];
  readonly status: OrderStatus;
  readonly createdAt: Date;
};

class Order {
  private constructor(private readonly props: OrderProps) {
    // 不変条件の検証（セクション5参照）
  }

  static create(id: OrderId, items: OrderItem[]): Order {
    return new Order({
      id,
      items,
      status: OrderStatus.DRAFT,
      createdAt: new Date(),
    });
  }

  // 再構築用（リポジトリから復元時）
  static reconstruct(props: OrderProps): Order {
    return new Order(props);
  }
}
```

## 4. 防御的コピー

可変オブジェクトを保持する場合、外部に返す際はコピーを返すか不変オブジェクトに変換する。

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

Props型パターンでは `readonly` 修飾子により防御的コピーが不要になる場合が多い：

```typescript
type OrderProps = {
  readonly id: OrderId;
  readonly items: readonly OrderItem[];  // readonlyで保護
};

class Order {
  private constructor(private readonly props: OrderProps) {}

  get items(): readonly OrderItem[] {
    return this.props.items;  // readonlyなのでそのまま返せる
  }
}
```

## 5. 不変条件の検証

不変な集約ではコンストラクタで不変条件を検証する。すべての生成・更新はコンストラクタを経由するため、不正な状態が存在し得ない。

```typescript
type OrderProps = {
  readonly id: OrderId;
  readonly items: readonly OrderItem[];
};

class Order {
  private constructor(private readonly props: OrderProps) {
    // 不変条件：コンストラクタで一元的に検証
    if (props.items.length === 0) {
      throw new Error("注文には最低1つの商品が必要");
    }
    if (!props.items.every(item => item.quantity > 0)) {
      throw new Error("数量は正の数");
    }
  }

  addItem(item: OrderItem): Order {
    // 新しいインスタンス生成時にコンストラクタで不変条件が検証される
    return new Order({
      ...this.props,
      items: [...this.props.items, item],
    });
  }
}
```

## 6. ドメインイベント

集約の状態変更時にドメインイベントを発行する。Props型パターンでイベントも不変に管理する。

```typescript
type OrderProps = {
  readonly id: OrderId;
  readonly status: OrderStatus;
  readonly domainEvents: readonly DomainEvent[];
  // ...other fields
};

class Order {
  private constructor(private readonly props: OrderProps) {}

  get domainEvents(): readonly DomainEvent[] {
    return this.props.domainEvents;
  }

  confirm(): Order {
    return new Order({
      ...this.props,
      status: OrderStatus.CONFIRMED,
      domainEvents: [
        ...this.props.domainEvents,
        new OrderConfirmed(this.props.id, new Date()),
      ],
    });
  }

  clearEvents(): Order {
    return new Order({ ...this.props, domainEvents: [] });
  }
}
```

## 7. 楽観的ロック

並行更新の衝突検出が必要な場合にのみバージョン番号を持たせる。

```typescript
type OrderProps = {
  readonly id: OrderId;
  readonly version: number;  // 並行制御用
  // ...other fields
};

class Order {
  private constructor(private readonly props: OrderProps) {}

  get version(): number { return this.props.version; }

  // リポジトリ側でバージョンチェック
  // UPDATE orders SET ... WHERE id = ? AND version = ?
}
```

---

## 集約ルート経由のアクセス

```typescript
// Good: 集約ルート経由
order.updateItemQuantity(itemId, newQuantity);

// Bad: 内部オブジェクトを直接操作
order.items.find(item => item.id === itemId)?.updateQuantity(newQuantity);
```
