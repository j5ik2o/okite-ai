# Law of Demeter - 言語別パターン

## 目次

1. [Java/Kotlin](#javakotlin)
2. [TypeScript](#typescript)
3. [Python](#python)
4. [Ruby](#ruby)
5. [Go](#go)
6. [Rust](#rust)
7. [Scala](#scala)
8. [リファクタリング手順](#リファクタリング手順)

---

## Java/Kotlin

### 委譲メソッドの導入

```java
// ❌ 違反: 配送先住所を取得するために3段の連鎖
public String getShippingLabel(Order order) {
    return order.getCustomer().getAddress().format();
}

// ✅ 修正: 目的に応じた委譲メソッド
public String getShippingLabel(Order order) {
    return order.formatShippingAddress();
}

// Order
public String formatShippingAddress() {
    return customer.formatShippingAddress();
}

// Customer
public String formatShippingAddress() {
    return address.format();
}
```

### 条件判定の移動

```kotlin
// ❌ 違反: 遠いオブジェクトの状態で分岐
fun canShipToCustomer(order: Order): Boolean {
    return order.getCustomer().getAddress().getCountry()
        .isInShippableRegion()
}

// ✅ 修正: 各オブジェクトに判定を持たせる
fun canShipToCustomer(order: Order): Boolean {
    return order.isShippable()
}

// Order
fun isShippable(): Boolean = customer.isInShippableRegion()

// Customer
fun isInShippableRegion(): Boolean = address.isInShippableRegion()

// Address
fun isInShippableRegion(): Boolean = country.isShippable()
```

### 引数で渡す

```java
// ❌ 違反: サービスが内部構造を掘り下げる
public void sendReceipt(Order order) {
    EmailSender sender = order.getCustomer()
        .getNotificationPreferences()
        .getEmailSender();
    sender.send(order.toReceipt());
}

// ✅ 修正: 必要なものを引数で受け取る
public void sendReceipt(Order order, EmailSender sender) {
    sender.send(order.toReceipt());
}
```

---

## TypeScript

### 委譲メソッドの導入

```typescript
// ❌ 違反
function getDisplayName(comment: Comment): string {
  return comment.getAuthor().getProfile().getDisplayName();
}

// ✅ 修正
function getDisplayName(comment: Comment): string {
  return comment.getAuthorDisplayName();
}

// Comment
class Comment {
  getAuthorDisplayName(): string {
    return this.author.getDisplayName();
  }
}

// Author
class Author {
  getDisplayName(): string {
    return this.profile.displayName;
  }
}
```

### イベント/コールバックで分離

```typescript
// ❌ 違反: UIコンポーネントがモデルの内部を探索
function renderOrderSummary(order: Order) {
  const discount = order.getCustomer().getMembership().getDiscountRate();
  return applyDiscount(order.getTotal(), discount);
}

// ✅ 修正: 計算責任をモデルに移動
function renderOrderSummary(order: Order) {
  return order.calculateDiscountedTotal();
}

// Order
class Order {
  calculateDiscountedTotal(): number {
    const rate = this.customer.getDiscountRate();
    return this.total * (1 - rate);
  }
}
```

### オプショナルチェーンの注意

```typescript
// ❌ 注意: オプショナルチェーンはNPEを防ぐが、LoD違反は残る
const city = user?.address?.city;

// ✅ 修正: 委譲メソッドを提供
const city = user?.getCity();

// User
class User {
  getCity(): string | undefined {
    return this.address?.city;
  }
}
```

---

## Python

### 委譲メソッドの導入

```python
# ❌ 違反
def get_manager_email(employee):
    return employee.get_department().get_manager().get_email()

# ✅ 修正
def get_manager_email(employee):
    return employee.get_manager_email()

# Employee
class Employee:
    def get_manager_email(self) -> str:
        return self._department.get_manager_email()

# Department
class Department:
    def get_manager_email(self) -> str:
        return self._manager.email
```

### プロパティでの委譲

```python
# ❌ 違反
tax_rate = order.customer.address.country.tax_rate

# ✅ 修正
tax_rate = order.applicable_tax_rate

# Order
class Order:
    @property
    def applicable_tax_rate(self) -> float:
        return self._customer.tax_rate

# Customer
class Customer:
    @property
    def tax_rate(self) -> float:
        return self._address.tax_rate

# Address
class Address:
    @property
    def tax_rate(self) -> float:
        return self._country.tax_rate
```

---

## Ruby

### 委譲メソッドの導入

```ruby
# ❌ 違反
def shipping_cost(order)
  order.customer.address.country.shipping_rate * order.weight
end

# ✅ 修正
def shipping_cost(order)
  order.calculate_shipping_cost
end

# Order
class Order
  def calculate_shipping_cost
    customer.shipping_rate * weight
  end
end

# Customer
class Customer
  def shipping_rate
    address.shipping_rate
  end
end
```

### delegate メソッドの活用

```ruby
# ✅ Rails の delegate を活用
class Order < ApplicationRecord
  belongs_to :customer
  delegate :shipping_rate, to: :customer, prefix: true
end

# order.customer_shipping_rate で呼び出せる
```

---

## Go

### メソッドによる委譲

```go
// ❌ 違反
func GetShippingCity(order *Order) string {
    return order.Customer.Address.City
}

// ✅ 修正
func GetShippingCity(order *Order) string {
    return order.ShippingCity()
}

// Order
func (o *Order) ShippingCity() string {
    return o.customer.ShippingCity()
}

// Customer
func (c *Customer) ShippingCity() string {
    return c.address.City
}
```

### インターフェースで依存を制限

```go
// ❌ 違反: 具象型の内部構造に依存
func NotifyCustomer(order *Order) error {
    email := order.Customer.ContactInfo.Email
    return sendEmail(email, "Order shipped")
}

// ✅ 修正: 必要な振る舞いだけをインターフェースで定義
type Notifiable interface {
    NotificationEmail() string
}

func NotifyCustomer(target Notifiable) error {
    return sendEmail(target.NotificationEmail(), "Order shipped")
}

func (o *Order) NotificationEmail() string {
    return o.customer.NotificationEmail()
}
```

---

## Rust

### メソッドによる委譲

```rust
// ❌ 違反
fn get_shipping_city(order: &Order) -> &str {
    &order.customer().address().city()
}

// ✅ 修正
fn get_shipping_city(order: &Order) -> &str {
    order.shipping_city()
}

// Order
impl Order {
    pub fn shipping_city(&self) -> &str {
        self.customer.shipping_city()
    }
}

// Customer
impl Customer {
    pub fn shipping_city(&self) -> &str {
        self.address.city()
    }
}
```

### トレイトで依存を制限

```rust
// ❌ 違反: 具象型の内部構造に依存
fn calculate_tax(order: &Order) -> f64 {
    let rate = order.customer().address().country().tax_rate();
    order.total() * rate
}

// ✅ 修正: トレイトで必要な振る舞いだけ要求
trait Taxable {
    fn tax_rate(&self) -> f64;
    fn taxable_amount(&self) -> f64;

    fn calculate_tax(&self) -> f64 {
        self.taxable_amount() * self.tax_rate()
    }
}

impl Taxable for Order {
    fn tax_rate(&self) -> f64 {
        self.customer.tax_rate()
    }

    fn taxable_amount(&self) -> f64 {
        self.total
    }
}
```

---

## Scala

### 委譲メソッドの導入

```scala
// ❌ 違反
def shippingCity(order: Order): String =
  order.customer.address.city

// ✅ 修正
def shippingCity(order: Order): String =
  order.shippingCity

// Order
case class Order(customer: Customer) {
  def shippingCity: String = customer.shippingCity
}

// Customer
case class Customer(address: Address) {
  def shippingCity: String = address.city
}
```

### 型クラスで依存を制限

```scala
// ✅ 型クラスで必要な振る舞いだけを抽象化
trait HasShippingInfo[A] {
  extension (a: A) def shippingCity: String
}

given HasShippingInfo[Order] with {
  extension (o: Order) def shippingCity: String =
    o.customer.shippingCity
}
```

---

## リファクタリング手順

### Step 1: 違反箇所の特定

```
検索対象:
- ドット連鎖が2段以上のメソッド呼び出し（a.b().c()）
- getter連鎖（a.getB().getC()）
- フィールドアクセス連鎖（a.b.c.d）
```

### Step 2: 例外の除外

```
以下は違反ではない:
- 流暢API / ビルダーパターン（同一オブジェクトを返す）
- ストリーム / コレクション操作
- DTO / Value Object のフィールドアクセス
- 標準ライブラリの同一型メソッドチェーン
```

### Step 3: 委譲メソッドの設計

```
問い:
1. この連鎖は何を達成したいのか？（目的の特定）
2. 目的を表すメソッド名は何か？（命名）
3. どのオブジェクトがそのメソッドを持つべきか？（責任の配置）
4. 中間オブジェクトにも委譲が必要か？（連鎖の分解）
```

### Step 4: 段階的な変換

```
手順:
1. 最も外側のオブジェクトに目的メソッドを追加
2. 中間オブジェクトに必要な委譲メソッドを追加
3. 呼び出し側を新しいメソッドに変更
4. 他に同じ連鎖を使っている箇所を検索・変更
5. 不要になったgetterの削除を検討
```

### Step 5: 検証

```
確認事項:
- 振る舞いが変わっていないこと
- 委譲メソッドが過剰でないこと（3個以内が目安）
- 新しいメソッド名が目的を適切に表していること
- テストが通ること
```

---

## 警戒すべきシグナル

| シグナル | 対応 |
|----------|------|
| `a.getB().getC()` | 委譲メソッドを `a` に追加 |
| `a.getB().getC().doD()` | 振る舞いを `a` に移動 |
| `a.b.c.d` (フィールド直接アクセス) | 委譲プロパティを追加 |
| `if (a.getB().getC().isX())` | 判定メソッドを `a` に追加 |
| オプショナルチェーン `a?.b?.c` | 委譲メソッドで隠蔽 |
| 委譲メソッドが4個以上 | 設計見直し（責務の分割） |
