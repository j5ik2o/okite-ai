# Breach Encapsulation Naming - 言語別パターン

## 目次

1. [Java](#java)
2. [Kotlin](#kotlin)
3. [Scala](#scala)
4. [TypeScript](#typescript)
5. [Python](#python)
6. [Go](#go)
7. [Rust](#rust)
8. [フレームワーク連携](#フレームワーク連携)
9. [リファクタリング手順](#リファクタリング手順)

---

## Java

### 基本実装

```java
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderItem> items;
    private OrderStatus status;
    private Money totalAmount;

    // ========================================
    // カプセル化を破るアクセサ（永続化/シリアライズ用）
    // ========================================

    public OrderId breachEncapsulationOfId() {
        return id;
    }

    public CustomerId breachEncapsulationOfCustomerId() {
        return customerId;
    }

    public List<OrderItem> breachEncapsulationOfItems() {
        // 防御的コピーを返す
        return Collections.unmodifiableList(new ArrayList<>(items));
    }

    public OrderStatus breachEncapsulationOfStatus() {
        return status;
    }

    public Money breachEncapsulationOfTotalAmount() {
        return totalAmount;
    }

    // ========================================
    // ビジネスロジック（Tellパターン）
    // ========================================

    public void addItem(Product product, int quantity) {
        items.add(new OrderItem(product, quantity));
        recalculateTotal();
    }

    public void confirm() {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Only draft orders can be confirmed");
        }
        status = OrderStatus.CONFIRMED;
    }

    public boolean isConfirmed() {
        return status == OrderStatus.CONFIRMED;
    }

    public boolean containsProduct(ProductId productId) {
        return items.stream()
            .anyMatch(item -> item.hasProduct(productId));
    }
}
```

### Recordとの組み合わせ（Java 16+）

```java
// 値オブジェクトはRecordで簡潔に
public record Money(BigDecimal amount, Currency currency) {
    // Recordは自動的にアクセサを生成するが、
    // ドメインモデルで使う場合は振る舞いを追加

    public Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(amount.add(other.amount), currency);
    }

    public boolean isGreaterThan(Money other) {
        return amount.compareTo(other.amount) > 0;
    }
}

// エンティティは通常のクラスで
public class User {
    private final UserId id;
    private UserName name;

    // breach... パターンを使用
    public UserId breachEncapsulationOfId() { return id; }
    public UserName breachEncapsulationOfName() { return name; }
}
```

---

## Kotlin

### 基本実装

```kotlin
class Order private constructor(
    private val id: OrderId,
    private val customerId: CustomerId,
    private val items: MutableList<OrderItem>,
    private var status: OrderStatus,
    private var totalAmount: Money
) {
    // ========================================
    // カプセル化を破るアクセサ
    // ========================================

    fun breachEncapsulationOfId(): OrderId = id
    fun breachEncapsulationOfCustomerId(): CustomerId = customerId
    fun breachEncapsulationOfItems(): List<OrderItem> = items.toList()
    fun breachEncapsulationOfStatus(): OrderStatus = status
    fun breachEncapsulationOfTotalAmount(): Money = totalAmount

    // ========================================
    // ビジネスロジック
    // ========================================

    fun addItem(product: Product, quantity: Int) {
        items.add(OrderItem(product, quantity))
        recalculateTotal()
    }

    fun confirm() {
        check(status == OrderStatus.DRAFT) { "Only draft orders can be confirmed" }
        status = OrderStatus.CONFIRMED
    }

    val isConfirmed: Boolean
        get() = status == OrderStatus.CONFIRMED

    companion object {
        fun create(customerId: CustomerId): Order {
            return Order(
                id = OrderId.generate(),
                customerId = customerId,
                items = mutableListOf(),
                status = OrderStatus.DRAFT,
                totalAmount = Money.ZERO
            )
        }
    }
}
```

### data classとの使い分け

```kotlin
// ✅ 値オブジェクト: data classでOK（イミュータブル）
data class Money(val amount: BigDecimal, val currency: Currency) {
    operator fun plus(other: Money): Money {
        require(currency == other.currency) { "Currency mismatch" }
        return Money(amount + other.amount, currency)
    }
}

// ✅ エンティティ: 通常のクラスでbreach...を使用
class User(
    private val id: UserId,
    private var name: UserName
) {
    fun breachEncapsulationOfId(): UserId = id
    fun breachEncapsulationOfName(): UserName = name

    fun rename(newName: UserName) {
        this.name = newName
    }
}
```

---

## Scala

### 基本実装

```scala
final class Order private (
    private val id: OrderId,
    private val customerId: CustomerId,
    private var items: List[OrderItem],
    private var status: OrderStatus,
    private var totalAmount: Money
) {
  // ========================================
  // カプセル化を破るアクセサ
  // ========================================

  def breachEncapsulationOfId: OrderId = id
  def breachEncapsulationOfCustomerId: CustomerId = customerId
  def breachEncapsulationOfItems: List[OrderItem] = items
  def breachEncapsulationOfStatus: OrderStatus = status
  def breachEncapsulationOfTotalAmount: Money = totalAmount

  // ========================================
  // ビジネスロジック
  // ========================================

  def addItem(product: Product, quantity: Int): Unit = {
    items = items :+ OrderItem(product, quantity)
    recalculateTotal()
  }

  def confirm(): Either[DomainError, Unit] = {
    if (status != OrderStatus.Draft) {
      Left(InvalidStateError("Only draft orders can be confirmed"))
    } else {
      status = OrderStatus.Confirmed
      Right(())
    }
  }

  def isConfirmed: Boolean = status == OrderStatus.Confirmed
}

object Order {
  def create(customerId: CustomerId): Order = new Order(
    id = OrderId.generate(),
    customerId = customerId,
    items = List.empty,
    status = OrderStatus.Draft,
    totalAmount = Money.Zero
  )
}
```

### case classとの使い分け

```scala
// ✅ 値オブジェクト: case classでOK
final case class Money(amount: BigDecimal, currency: Currency) {
  def +(other: Money): Money = {
    require(currency == other.currency, "Currency mismatch")
    Money(amount + other.amount, currency)
  }

  def >(other: Money): Boolean = amount > other.amount
}

// ✅ エンティティ: 通常のクラスでbreach...を使用
final class User private (
    private val id: UserId,
    private var name: UserName
) {
  def breachEncapsulationOfId: UserId = id
  def breachEncapsulationOfName: UserName = name

  def rename(newName: UserName): Unit = {
    this.name = newName
  }
}
```

---

## TypeScript

### 基本実装

```typescript
class Order {
  private readonly id: OrderId;
  private readonly customerId: CustomerId;
  private items: OrderItem[];
  private status: OrderStatus;
  private totalAmount: Money;

  private constructor(
    id: OrderId,
    customerId: CustomerId,
    items: OrderItem[],
    status: OrderStatus,
    totalAmount: Money
  ) {
    this.id = id;
    this.customerId = customerId;
    this.items = items;
    this.status = status;
    this.totalAmount = totalAmount;
  }

  // ========================================
  // カプセル化を破るアクセサ
  // ========================================

  breachEncapsulationOfId(): OrderId {
    return this.id;
  }

  breachEncapsulationOfCustomerId(): CustomerId {
    return this.customerId;
  }

  breachEncapsulationOfItems(): readonly OrderItem[] {
    return [...this.items];
  }

  breachEncapsulationOfStatus(): OrderStatus {
    return this.status;
  }

  breachEncapsulationOfTotalAmount(): Money {
    return this.totalAmount;
  }

  // ========================================
  // ビジネスロジック
  // ========================================

  addItem(product: Product, quantity: number): void {
    this.items.push(new OrderItem(product, quantity));
    this.recalculateTotal();
  }

  confirm(): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error('Only draft orders can be confirmed');
    }
    this.status = OrderStatus.CONFIRMED;
  }

  isConfirmed(): boolean {
    return this.status === OrderStatus.CONFIRMED;
  }

  static create(customerId: CustomerId): Order {
    return new Order(
      OrderId.generate(),
      customerId,
      [],
      OrderStatus.DRAFT,
      Money.ZERO
    );
  }
}
```

### private readonly + #構文

```typescript
// ES2022 Private Fields を使用
class User {
  readonly #id: UserId;
  #name: UserName;

  constructor(id: UserId, name: UserName) {
    this.#id = id;
    this.#name = name;
  }

  breachEncapsulationOfId(): UserId {
    return this.#id;
  }

  breachEncapsulationOfName(): UserName {
    return this.#name;
  }

  rename(newName: UserName): void {
    this.#name = newName;
  }
}
```

---

## Python

### 基本実装

```python
from dataclasses import dataclass, field
from typing import List
from copy import copy

class Order:
    def __init__(
        self,
        id: OrderId,
        customer_id: CustomerId,
        items: List[OrderItem] | None = None,
        status: OrderStatus = OrderStatus.DRAFT,
        total_amount: Money = Money.ZERO
    ):
        self._id = id
        self._customer_id = customer_id
        self._items = items if items is not None else []
        self._status = status
        self._total_amount = total_amount

    # ========================================
    # カプセル化を破るアクセサ
    # ========================================

    def breach_encapsulation_of_id(self) -> OrderId:
        return self._id

    def breach_encapsulation_of_customer_id(self) -> CustomerId:
        return self._customer_id

    def breach_encapsulation_of_items(self) -> List[OrderItem]:
        return copy(self._items)

    def breach_encapsulation_of_status(self) -> OrderStatus:
        return self._status

    def breach_encapsulation_of_total_amount(self) -> Money:
        return self._total_amount

    # ========================================
    # ビジネスロジック
    # ========================================

    def add_item(self, product: Product, quantity: int) -> None:
        self._items.append(OrderItem(product, quantity))
        self._recalculate_total()

    def confirm(self) -> None:
        if self._status != OrderStatus.DRAFT:
            raise ValueError("Only draft orders can be confirmed")
        self._status = OrderStatus.CONFIRMED

    @property
    def is_confirmed(self) -> bool:
        return self._status == OrderStatus.CONFIRMED

    @classmethod
    def create(cls, customer_id: CustomerId) -> "Order":
        return cls(
            id=OrderId.generate(),
            customer_id=customer_id
        )
```

### dataclass(frozen=True) との使い分け

```python
from dataclasses import dataclass

# ✅ 値オブジェクト: frozen dataclass でOK
@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: Currency

    def __add__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

# ✅ エンティティ: 通常のクラスで breach_encapsulation_of を使用
class User:
    def __init__(self, id: UserId, name: UserName):
        self._id = id
        self._name = name

    def breach_encapsulation_of_id(self) -> UserId:
        return self._id

    def breach_encapsulation_of_name(self) -> UserName:
        return self._name

    def rename(self, new_name: UserName) -> None:
        self._name = new_name
```

---

## Go

### 基本実装

```go
package order

type Order struct {
	id          OrderID
	customerID  CustomerID
	items       []OrderItem
	status      OrderStatus
	totalAmount Money
}

// ========================================
// カプセル化を破るアクセサ
// ========================================

func (o *Order) BreachEncapsulationOfID() OrderID {
	return o.id
}

func (o *Order) BreachEncapsulationOfCustomerID() CustomerID {
	return o.customerID
}

func (o *Order) BreachEncapsulationOfItems() []OrderItem {
	// 防御的コピー
	items := make([]OrderItem, len(o.items))
	copy(items, o.items)
	return items
}

func (o *Order) BreachEncapsulationOfStatus() OrderStatus {
	return o.status
}

func (o *Order) BreachEncapsulationOfTotalAmount() Money {
	return o.totalAmount
}

// ========================================
// ビジネスロジック
// ========================================

func (o *Order) AddItem(product Product, quantity int) {
	o.items = append(o.items, NewOrderItem(product, quantity))
	o.recalculateTotal()
}

func (o *Order) Confirm() error {
	if o.status != OrderStatusDraft {
		return errors.New("only draft orders can be confirmed")
	}
	o.status = OrderStatusConfirmed
	return nil
}

func (o *Order) IsConfirmed() bool {
	return o.status == OrderStatusConfirmed
}

func NewOrder(customerID CustomerID) *Order {
	return &Order{
		id:          NewOrderID(),
		customerID:  customerID,
		items:       make([]OrderItem, 0),
		status:      OrderStatusDraft,
		totalAmount: ZeroMoney(),
	}
}
```

---

## Rust

### 基本実装

```rust
pub struct Order {
    id: OrderId,
    customer_id: CustomerId,
    items: Vec<OrderItem>,
    status: OrderStatus,
    total_amount: Money,
}

impl Order {
    // ========================================
    // カプセル化を破るアクセサ
    // ========================================

    pub fn breach_encapsulation_of_id(&self) -> &OrderId {
        &self.id
    }

    pub fn breach_encapsulation_of_customer_id(&self) -> &CustomerId {
        &self.customer_id
    }

    pub fn breach_encapsulation_of_items(&self) -> &[OrderItem] {
        &self.items
    }

    pub fn breach_encapsulation_of_status(&self) -> &OrderStatus {
        &self.status
    }

    pub fn breach_encapsulation_of_total_amount(&self) -> &Money {
        &self.total_amount
    }

    // ========================================
    // ビジネスロジック
    // ========================================

    pub fn add_item(&mut self, product: Product, quantity: u32) {
        self.items.push(OrderItem::new(product, quantity));
        self.recalculate_total();
    }

    pub fn confirm(&mut self) -> Result<(), DomainError> {
        if self.status != OrderStatus::Draft {
            return Err(DomainError::InvalidState(
                "Only draft orders can be confirmed".into()
            ));
        }
        self.status = OrderStatus::Confirmed;
        Ok(())
    }

    pub fn is_confirmed(&self) -> bool {
        self.status == OrderStatus::Confirmed
    }

    pub fn new(customer_id: CustomerId) -> Self {
        Self {
            id: OrderId::generate(),
            customer_id,
            items: Vec::new(),
            status: OrderStatus::Draft,
            total_amount: Money::zero(),
        }
    }
}
```

### Deref/AsRef との使い分け

```rust
// ✅ 値オブジェクト: 内部値へのアクセスには AsRef/Deref を使用可能
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserId(String);

impl UserId {
    pub fn new(value: String) -> Result<Self, ValidationError> {
        // バリデーション
        Ok(Self(value))
    }
}

impl AsRef<str> for UserId {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

// ✅ エンティティ: breach_encapsulation_of を使用
pub struct User {
    id: UserId,
    name: UserName,
}

impl User {
    pub fn breach_encapsulation_of_id(&self) -> &UserId {
        &self.id
    }

    pub fn breach_encapsulation_of_name(&self) -> &UserName {
        &self.name
    }

    pub fn rename(&mut self, new_name: UserName) {
        self.name = new_name;
    }
}
```

---

## フレームワーク連携

### JPA (Java)

```java
// リポジトリ実装
@Repository
public class JpaOrderRepository implements OrderRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public void save(Order order) {
        OrderEntity entity = toEntity(order);
        em.persist(entity);
    }

    private OrderEntity toEntity(Order order) {
        OrderEntity entity = new OrderEntity();
        entity.setId(order.breachEncapsulationOfId().value());
        entity.setCustomerId(order.breachEncapsulationOfCustomerId().value());
        entity.setStatus(order.breachEncapsulationOfStatus().name());
        entity.setTotalAmount(order.breachEncapsulationOfTotalAmount().amount());

        List<OrderItemEntity> itemEntities = order.breachEncapsulationOfItems()
            .stream()
            .map(this::toItemEntity)
            .collect(Collectors.toList());
        entity.setItems(itemEntities);

        return entity;
    }
}
```

### Jackson (JSON)

```java
// カスタムシリアライザ
public class OrderSerializer extends JsonSerializer<Order> {
    @Override
    public void serialize(Order order, JsonGenerator gen, SerializerProvider provider)
            throws IOException {
        gen.writeStartObject();
        gen.writeStringField("id", order.breachEncapsulationOfId().value());
        gen.writeStringField("customerId", order.breachEncapsulationOfCustomerId().value());
        gen.writeStringField("status", order.breachEncapsulationOfStatus().name());
        // items, totalAmount...
        gen.writeEndObject();
    }
}
```

### TypeORM (TypeScript)

```typescript
// リポジトリ実装
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>
  ) {}

  async save(order: Order): Promise<void> {
    const entity = this.toEntity(order);
    await this.repo.save(entity);
  }

  private toEntity(order: Order): OrderEntity {
    return {
      id: order.breachEncapsulationOfId().value,
      customerId: order.breachEncapsulationOfCustomerId().value,
      status: order.breachEncapsulationOfStatus(),
      totalAmount: order.breachEncapsulationOfTotalAmount().amount,
      items: order.breachEncapsulationOfItems().map(this.toItemEntity),
    };
  }
}
```

---

## リファクタリング手順

### Step 1: 既存のgetterを特定

ドメイン層のソースコードを検索し、通常のgetterパターンを特定する。

**検索パターン例**:

| 言語 | 検索パターン | 対象ディレクトリ |
|------|-------------|-----------------|
| Java | `public .* get[A-Z]` | `src/main/java/domain/` |
| TypeScript | `get[A-Z].*():` | `src/domain/` |
| Python | `def get_` | `src/domain/` |
| Kotlin | `fun get[A-Z]` または `val ` (公開プロパティ) | `src/main/kotlin/domain/` |
| Go | `func.*Get[A-Z]` | `internal/domain/` |
| Rust | `pub fn get_` | `src/domain/` |

### Step 2: 使用箇所を分類

| 使用箇所 | 対応 |
|----------|------|
| 永続化層 | `breachEncapsulationOf` に変更 |
| シリアライズ | `breachEncapsulationOf` に変更 |
| テスト | `breachEncapsulationOf` に変更 |
| ビジネスロジック | Tellパターンに変換 |

### Step 3: 段階的移行

```java
// Step 3a: 新しいメソッドを追加
public String breachEncapsulationOfName() {
    return name;
}

// Step 3b: 古いメソッドに@Deprecatedを付与
@Deprecated
public String getName() {
    return name;
}

// Step 3c: 使用箇所を順次移行
// Step 3d: 古いメソッドを削除
```

### Step 4: 静的解析ルールの追加

```yaml
# カスタムルール例（PMD/Checkstyle/ESLint）
- pattern: "\.get[A-Z].*\(\)"
  in: "src/domain/**"
  message: "Use breachEncapsulationOf instead of getter in domain model"
```
