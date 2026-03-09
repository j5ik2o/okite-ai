# 集約設計パターン - Python

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

`dataclass(frozen=True)` + `replace()` パターンを使用する。`frozen=True` でインスタンスの変更を禁止し、`replace()` で変更フィールドのみを指定した新しいインスタンスを生成する。フィールド追加時の修正漏れを防ぎ、更新意図が明確になる。

```python
from __future__ import annotations
from dataclasses import dataclass, replace

# Good: frozen dataclass + replace() による不変な集約
@dataclass(frozen=True)
class Order:
    id: OrderId
    items: tuple[OrderItem, ...]
    status: OrderStatus

    def add_item(self, item: OrderItem) -> Order:
        return replace(self, items=(*self.items, item))

    def confirm(self) -> Order:
        return replace(self, status=OrderStatus.CONFIRMED)
```

```python
# Bad: 可変な集約
class Order:
    def __init__(self, id: OrderId) -> None:
        self.id = id
        self.items: list[OrderItem] = []

    def add_item(self, item: OrderItem) -> None:
        self.items.append(item)  # 破壊的変更
```

> **注**: `frozen=True` を使用する場合、コレクションには `list` ではなく `tuple` を使用する。
> `list` は可変なため、`frozen=True` でもリストの中身を変更できてしまう。

## 2. ID参照パターン

他の集約とは直接参照ではなくIDで関連を持つ。

```python
# Good: IDによる間接参照
@dataclass(frozen=True)
class Order:
    id: OrderId
    customer_id: CustomerId  # IDのみ保持

# Bad: 直接参照
@dataclass(frozen=True)
class Order:
    id: OrderId
    customer: Customer  # 他の集約を直接参照
```

## 3. 完全コンストラクタ / ファクトリ

`__init__` ですべての状態を初期化する。ファクトリメソッドはクラスメソッドとして定義し、`__init__` を利用する。外部からの直接インスタンス化を制限する場合は `__post_init__` でフラグを検証する。

```python
from datetime import datetime, timezone

@dataclass(frozen=True)
class Order:
    id: OrderId
    items: tuple[OrderItem, ...]
    status: OrderStatus
    created_at: datetime

    @classmethod
    def create(cls, id: OrderId, items: tuple[OrderItem, ...]) -> Order:
        return cls(
            id=id,
            items=items,
            status=OrderStatus.DRAFT,
            created_at=datetime.now(timezone.utc),
        )

    @classmethod
    def reconstruct(
        cls,
        id: OrderId,
        items: tuple[OrderItem, ...],
        status: OrderStatus,
        created_at: datetime,
    ) -> Order:
        """リポジトリから復元時に使用"""
        return cls(id=id, items=items, status=status, created_at=created_at)
```

## 4. 防御的コピー

`frozen=True` + `tuple` の組み合わせにより、防御的コピーは通常不要。`tuple` は不変なのでそのまま返しても安全。

```python
@dataclass(frozen=True)
class Order:
    id: OrderId
    items: tuple[OrderItem, ...]  # tupleは不変

    def get_items(self) -> tuple[OrderItem, ...]:
        return self.items  # そのまま返しても安全
```

可変コレクションを扱う場合はタプルに変換する：

```python
@dataclass(frozen=True)
class Order:
    id: OrderId
    items: tuple[OrderItem, ...]

    @classmethod
    def from_list(cls, id: OrderId, items: list[OrderItem]) -> Order:
        return cls(id=id, items=tuple(items))  # 不変タプルに変換
```

## 5. 不変条件の検証

`__post_init__` で不変条件を検証する。`frozen=True` でも `__post_init__` は呼び出されるため、すべての生成・更新（`replace()` 含む）で不変条件が検証される。

```python
@dataclass(frozen=True)
class Order:
    id: OrderId
    items: tuple[OrderItem, ...]
    status: OrderStatus

    def __post_init__(self) -> None:
        # 不変条件：__post_init__で一元的に検証
        if len(self.items) == 0:
            raise ValueError("注文には最低1つの商品が必要")
        if not all(item.quantity > 0 for item in self.items):
            raise ValueError("数量は正の数")

    def add_item(self, item: OrderItem) -> Order:
        # replace()で新インスタンスが生成され、__post_init__で不変条件が再検証される
        return replace(self, items=(*self.items, item))
```

Design by Contract（DbC）の完全な例：

```python
@dataclass(frozen=True)
class Car:
    id: CarId
    tires: tuple[Tire, Tire, Tire, Tire]  # 型レベルで4本を表現
    engine: Engine

    def __post_init__(self) -> None:
        # 不変条件（常に満たす）
        if len(self.tires) != 4:
            raise ValueError("タイヤは4本必要")

    def replace_tire(self, position: int, new_tire: Tire) -> Car:
        # 事前条件
        if not (0 <= position < 4):
            raise ValueError("タイヤ位置は0-3")

        tires = list(self.tires)
        tires[position] = new_tire
        result = replace(self, tires=tuple(tires))

        # 事後条件
        assert len(result.tires) == 4
        return result
```

## 6. ドメインイベント

集約の状態変更時にドメインイベントを発行する。`replace()` でイベントも不変に管理する。

```python
@dataclass(frozen=True)
class Order:
    id: OrderId
    status: OrderStatus
    domain_events: tuple[DomainEvent, ...]
    # ...other fields

    def confirm(self) -> Order:
        return replace(
            self,
            status=OrderStatus.CONFIRMED,
            domain_events=(
                *self.domain_events,
                OrderConfirmed(order_id=self.id, confirmed_at=datetime.now(timezone.utc)),
            ),
        )

    def clear_events(self) -> Order:
        return replace(self, domain_events=())
```

## 7. 楽観的ロック

並行更新の衝突検出が必要な場合にのみバージョン番号を持たせる。

```python
@dataclass(frozen=True)
class Order:
    id: OrderId
    version: int  # 並行制御用（要件がある場合のみ）
    # ...other fields

    # リポジトリ側でバージョンチェック
    # UPDATE orders SET ... WHERE id = %s AND version = %s
```

---

## 集約ルート経由のアクセス

```python
# Good: 集約ルート経由
order.update_item_quantity(item_id, new_quantity)

# Bad: 内部オブジェクトを直接操作
item = next(i for i in order.items if i.id == item_id)
item.update_quantity(new_quantity)  # 内部オブジェクトを直接操作
```

## Python特有の設計パターン

### NewType によるID

```python
from typing import NewType

OrderId = NewType("OrderId", str)
CustomerId = NewType("CustomerId", str)

# 型チェッカー（mypy等）がOrderIdとCustomerIdの取り違えを検出
order_id = OrderId("order-123")
customer_id = CustomerId("customer-456")
```

より強い型安全性が必要な場合は値オブジェクトとして定義する：

```python
@dataclass(frozen=True)
class OrderId:
    value: str

@dataclass(frozen=True)
class CustomerId:
    value: str

# 実行時にも型の取り違えが防止される
```
