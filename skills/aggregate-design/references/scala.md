# 集約設計パターン - Scala

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

case class + `copy()` パターンを使用する。Scalaではcase classがデフォルトで不変であり、`copy()` で変更フィールドのみを指定できる。

```scala
// Good: case class + copy() による不変な集約
final case class Order private (
  id: OrderId,
  items: List[OrderItem],
  status: OrderStatus
) {
  def addItem(item: OrderItem): Order =
    copy(items = items :+ item)

  def confirm(): Order =
    copy(status = OrderStatus.Confirmed)
}

object Order {
  def create(id: OrderId, items: List[OrderItem]): Order =
    Order(id, items, OrderStatus.Draft)
}
```

```scala
// Bad: 可変な集約
class Order(val id: OrderId) {
  private var _items: ListBuffer[OrderItem] = ListBuffer.empty
  def addItem(item: OrderItem): Unit = _items += item
}
```

## 2. ID参照パターン

```scala
// Good: IDによる間接参照
final case class Order(
  id: OrderId,
  customerId: CustomerId  // IDのみ保持
)

// Bad: 直接参照
final case class Order(
  id: OrderId,
  customer: Customer  // 他の集約を直接参照
)
```

## 3. 完全コンストラクタ / ファクトリ

コンパニオンオブジェクトにファクトリメソッドを定義し、privateコンストラクタで完全初期化を保証する。

```scala
final case class Order private (
  id: OrderId,
  items: List[OrderItem],
  status: OrderStatus,
  createdAt: Instant
)

object Order {
  // ファクトリメソッド: 新規作成
  def create(id: OrderId, items: List[OrderItem]): Order =
    Order(id, items, OrderStatus.Draft, Instant.now())

  // 再構築用（リポジトリから復元時）
  def reconstruct(
    id: OrderId,
    items: List[OrderItem],
    status: OrderStatus,
    createdAt: Instant
  ): Order = Order(id, items, status, createdAt)
}
```

## 4. 防御的コピー

Scalaの不変コレクション（`List`, `Vector` 等）はデフォルトで不変のため、防御的コピーは通常不要。

```scala
// Scalaの不変コレクションは防御的コピー不要
final case class Order(
  id: OrderId,
  items: List[OrderItem]  // Listはデフォルトで不変
) {
  // そのまま返しても安全
  def getItems: List[OrderItem] = items
}
```

Java連携等で可変コレクションを扱う場合は変換する：

```scala
import scala.jdk.CollectionConverters._

// Java連携時は不変コレクションに変換
def fromJava(javaItems: java.util.List[OrderItem]): Order =
  Order(id, javaItems.asScala.toList)  // 不変Listに変換
```

## 5. 不変条件の検証

`require` で事前条件・不変条件を検証する。`ensuring` で事後条件を表現する。

```scala
final case class Order private (
  id: OrderId,
  items: List[OrderItem],
  status: OrderStatus
) {
  // 不変条件
  require(items.nonEmpty, "注文には最低1つの商品が必要")
  require(items.forall(_.quantity > 0), "数量は正の数")

  def addItem(item: OrderItem): Order =
    copy(items = items :+ item)
    // copy()経由で新インスタンスが生成され、requireが再評価される
}
```

Design by Contract（DbC）の完全な例：

```scala
final case class Car private (
  id: CarId,
  tires: List[Tire],
  engine: Engine
) {
  // 不変条件（常に満たす）
  require(tires.size == 4, "タイヤは4本必要")

  def replaceTire(position: Int, newTire: Tire): Car = {
    // 事前条件
    require(position >= 0 && position < 4, "タイヤ位置は0-3")

    copy(tires = tires.updated(position, newTire))
  } ensuring { result =>
    result.tires.size == 4  // 事後条件
  }
}
```

## 6. ドメインイベント

```scala
final case class Order private (
  id: OrderId,
  status: OrderStatus,
  domainEvents: List[DomainEvent]
  // ...other fields
) {
  def confirm(): Order =
    copy(
      status = OrderStatus.Confirmed,
      domainEvents = domainEvents :+ OrderConfirmed(id, Instant.now())
    )

  def clearEvents(): Order =
    copy(domainEvents = List.empty)
}
```

## 7. 楽観的ロック

```scala
final case class Order private (
  id: OrderId,
  version: Long,  // 並行制御用（要件がある場合のみ）
  // ...other fields
)

// リポジトリ側でバージョンチェック
// UPDATE orders SET ... WHERE id = ? AND version = ?
```

---

## 集約ルート経由のアクセス

```scala
// Good: 集約ルート経由
order.updateItemQuantity(itemId, newQuantity)

// Bad: 内部オブジェクトを直接操作
order.items.find(_.id == itemId).map(_.updateQuantity(newQuantity))
```
