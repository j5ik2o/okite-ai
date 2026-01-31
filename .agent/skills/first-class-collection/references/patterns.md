# 言語別実装パターン

## Java

### 完全な実装例

```java
public final class Orders implements Iterable<Order> {
    private final List<Order> values;

    private Orders(List<Order> values) {
        this.values = List.copyOf(values);
    }

    public static Orders of(List<Order> orders) {
        return new Orders(orders);
    }

    public static Orders empty() {
        return new Orders(List.of());
    }

    // 集計
    public Money totalAmount() {
        return values.stream()
            .map(Order::amount)
            .reduce(Money.ZERO, Money::add);
    }

    public int count() {
        return values.size();
    }

    // フィルタリング（新しいインスタンスを返す）
    public Orders pending() {
        return new Orders(
            values.stream()
                .filter(Order::isPending)
                .toList()
        );
    }

    public Orders overdue() {
        return new Orders(
            values.stream()
                .filter(Order::isOverdue)
                .toList()
        );
    }

    // 検索
    public Optional<Order> findById(OrderId id) {
        return values.stream()
            .filter(o -> o.id().equals(id))
            .findFirst();
    }

    // 不変な追加
    public Orders add(Order order) {
        List<Order> newList = new ArrayList<>(values);
        newList.add(order);
        return new Orders(newList);
    }

    // 不変な削除
    public Orders remove(OrderId id) {
        return new Orders(
            values.stream()
                .filter(o -> !o.id().equals(id))
                .toList()
        );
    }

    // 状態判定
    public boolean isEmpty() {
        return values.isEmpty();
    }

    public boolean hasOverdue() {
        return values.stream().anyMatch(Order::isOverdue);
    }

    // イテレータ（for-each対応）
    @Override
    public Iterator<Order> iterator() {
        return values.iterator();
    }

    // Stream対応
    public Stream<Order> stream() {
        return values.stream();
    }

    // 等価性
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Orders orders)) return false;
        return values.equals(orders.values);
    }

    @Override
    public int hashCode() {
        return values.hashCode();
    }
}
```

### Recordを使った簡潔な実装（Java 17+）

```java
public record Orders(List<Order> values) {
    public Orders {
        values = List.copyOf(values);  // 不変コピー
    }

    public Money totalAmount() {
        return values.stream()
            .map(Order::amount)
            .reduce(Money.ZERO, Money::add);
    }
}
```

## Kotlin

```kotlin
@JvmInline
value class Orders private constructor(private val values: List<Order>) : Iterable<Order> {

    companion object {
        fun of(orders: List<Order>): Orders = Orders(orders.toList())
        fun empty(): Orders = Orders(emptyList())
    }

    fun totalAmount(): Money = values.map { it.amount }.fold(Money.ZERO, Money::plus)

    fun pending(): Orders = Orders(values.filter { it.isPending })

    fun add(order: Order): Orders = Orders(values + order)

    fun isEmpty(): Boolean = values.isEmpty()

    override fun iterator(): Iterator<Order> = values.iterator()
}
```

## Scala

```scala
final case class Orders private (values: Vector[Order]) extends Iterable[Order] {

  def totalAmount: Money =
    values.map(_.amount).foldLeft(Money.Zero)(_ + _)

  def pending: Orders =
    Orders(values.filter(_.isPending))

  def add(order: Order): Orders =
    Orders(values :+ order)

  def isEmpty: Boolean = values.isEmpty

  override def iterator: Iterator[Order] = values.iterator
}

object Orders {
  def apply(orders: Seq[Order]): Orders = new Orders(orders.toVector)
  val empty: Orders = Orders(Vector.empty)
}
```

## TypeScript

```typescript
export class Orders implements Iterable<Order> {
    private constructor(private readonly values: readonly Order[]) {}

    static of(orders: Order[]): Orders {
        return new Orders([...orders]);
    }

    static empty(): Orders {
        return new Orders([]);
    }

    totalAmount(): Money {
        return this.values.reduce(
            (sum, order) => sum.add(order.amount),
            Money.ZERO
        );
    }

    pending(): Orders {
        return new Orders(this.values.filter(o => o.isPending()));
    }

    add(order: Order): Orders {
        return new Orders([...this.values, order]);
    }

    isEmpty(): boolean {
        return this.values.length === 0;
    }

    *[Symbol.iterator](): Iterator<Order> {
        yield* this.values;
    }

    toArray(): readonly Order[] {
        return this.values;
    }
}
```

## Go

```go
type Orders struct {
    values []Order
}

func NewOrders(orders []Order) Orders {
    copied := make([]Order, len(orders))
    copy(copied, orders)
    return Orders{values: copied}
}

func (o Orders) TotalAmount() Money {
    total := ZeroMoney()
    for _, order := range o.values {
        total = total.Add(order.Amount())
    }
    return total
}

func (o Orders) Pending() Orders {
    var pending []Order
    for _, order := range o.values {
        if order.IsPending() {
            pending = append(pending, order)
        }
    }
    return NewOrders(pending)
}

func (o Orders) Add(order Order) Orders {
    newValues := make([]Order, len(o.values)+1)
    copy(newValues, o.values)
    newValues[len(o.values)] = order
    return Orders{values: newValues}
}

func (o Orders) IsEmpty() bool {
    return len(o.values) == 0
}

func (o Orders) Len() int {
    return len(o.values)
}
```

## Rust

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Orders(Vec<Order>);

impl Orders {
    pub fn new(orders: Vec<Order>) -> Self {
        Self(orders)
    }

    pub fn empty() -> Self {
        Self(Vec::new())
    }

    pub fn total_amount(&self) -> Money {
        self.0.iter().map(|o| o.amount()).sum()
    }

    pub fn pending(&self) -> Self {
        Self(self.0.iter().filter(|o| o.is_pending()).cloned().collect())
    }

    pub fn add(&self, order: Order) -> Self {
        let mut new_values = self.0.clone();
        new_values.push(order);
        Self(new_values)
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn iter(&self) -> impl Iterator<Item = &Order> {
        self.0.iter()
    }
}

impl IntoIterator for Orders {
    type Item = Order;
    type IntoIter = std::vec::IntoIter<Order>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}
```

## Python

```python
from dataclasses import dataclass
from typing import Iterator, Callable

@dataclass(frozen=True)
class Orders:
    _values: tuple[Order, ...]

    @classmethod
    def of(cls, orders: list[Order]) -> "Orders":
        return cls(tuple(orders))

    @classmethod
    def empty(cls) -> "Orders":
        return cls(())

    def total_amount(self) -> Money:
        return sum((o.amount for o in self._values), Money.ZERO)

    def pending(self) -> "Orders":
        return Orders(tuple(o for o in self._values if o.is_pending))

    def add(self, order: Order) -> "Orders":
        return Orders(self._values + (order,))

    def is_empty(self) -> bool:
        return len(self._values) == 0

    def __len__(self) -> int:
        return len(self._values)

    def __iter__(self) -> Iterator[Order]:
        return iter(self._values)
```

## テストパターン

### 基本テスト

```java
class OrdersTest {

    @Test
    void 空のコレクションを作成できる() {
        Orders orders = Orders.empty();
        assertThat(orders.isEmpty()).isTrue();
        assertThat(orders.count()).isEqualTo(0);
    }

    @Test
    void 合計金額を計算できる() {
        Orders orders = Orders.of(List.of(
            createOrder(Money.of(100)),
            createOrder(Money.of(200)),
            createOrder(Money.of(300))
        ));
        assertThat(orders.totalAmount()).isEqualTo(Money.of(600));
    }

    @Test
    void ステータスでフィルタできる() {
        Orders orders = Orders.of(List.of(
            createOrder(PENDING),
            createOrder(COMPLETED),
            createOrder(PENDING)
        ));
        Orders pending = orders.pending();
        assertThat(pending.count()).isEqualTo(2);
    }

    @Test
    void 追加しても元のコレクションは変わらない() {
        Orders original = Orders.of(List.of(createOrder()));
        Orders added = original.add(createOrder());

        assertThat(original.count()).isEqualTo(1);
        assertThat(added.count()).isEqualTo(2);
    }
}
```

## リファクタリング手順

### Step 1: クラス作成

```java
// 最小限のラッパーから始める
public final class Orders {
    private final List<Order> values;

    public Orders(List<Order> values) {
        this.values = List.copyOf(values);
    }

    public List<Order> values() {
        return values;
    }
}
```

### Step 2: 既存コードの置換

```java
// 変更前
List<Order> orders = orderRepository.findAll();

// 変更後
Orders orders = new Orders(orderRepository.findAll());
List<Order> list = orders.values();  // 一時的にvalues()で取得
```

### Step 3: ロジックの移動

```java
// 外部にあるロジックを見つける
Money total = orders.values().stream()
    .map(Order::amount)
    .reduce(Money.ZERO, Money::add);

// Ordersクラスに移動
Money total = orders.totalAmount();
```

### Step 4: values()の削除

すべての外部ロジックを移動したら、`values()`を削除またはprivate化。
