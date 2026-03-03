# Tell, Don't Ask - 言語別パターン

## 目次

1. [Java/Kotlin](#javakotlin)
2. [TypeScript](#typescript)
3. [Python](#python)
4. [Ruby](#ruby)
5. [Go](#go)
6. [Rust](#rust)
7. [リファクタリング手順](#リファクタリング手順)

---

## Java/Kotlin

### 状態判定の内部化

```java
// ❌ Ask
public class OrderService {
    public void process(Order order) {
        if (order.getStatus() == OrderStatus.PENDING
            && order.getTotal() > 0) {
            order.setStatus(OrderStatus.PROCESSING);
            // 処理ロジック
        }
    }
}

// ✅ Tell
public class Order {
    public void processIfReady() {
        if (canProcess()) {
            this.status = OrderStatus.PROCESSING;
            // 処理ロジック
        }
    }

    private boolean canProcess() {
        return status == OrderStatus.PENDING && total > 0;
    }
}
```

### ポリモーフィズムによる分岐解消

```kotlin
// ❌ Ask
fun calculateDiscount(customer: Customer): Double {
    return when (customer.type) {
        CustomerType.GOLD -> customer.purchaseAmount * 0.2
        CustomerType.SILVER -> customer.purchaseAmount * 0.1
        CustomerType.REGULAR -> 0.0
    }
}

// ✅ Tell
interface Customer {
    fun calculateDiscount(): Double
}

class GoldCustomer(private val purchaseAmount: Double) : Customer {
    override fun calculateDiscount() = purchaseAmount * 0.2
}

class SilverCustomer(private val purchaseAmount: Double) : Customer {
    override fun calculateDiscount() = purchaseAmount * 0.1
}
```

### デメテルの法則違反の修正

```java
// ❌ Ask (Train Wreck)
String city = order.getCustomer().getAddress().getCity();

// ✅ Tell: 必要な情報を直接取得するメソッドを提供
String city = order.getShippingCity();

// Order内部
public String getShippingCity() {
    return customer.getShippingCity();
}

// Customer内部
public String getShippingCity() {
    return address.getCity();
}
```

---

## TypeScript

### 状態チェックの内部化

```typescript
// ❌ Ask
function processPayment(account: Account, amount: number) {
  if (account.getBalance() >= amount && !account.isFrozen()) {
    account.setBalance(account.getBalance() - amount);
  }
}

// ✅ Tell
class Account {
  withdraw(amount: number): boolean {
    if (this.canWithdraw(amount)) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  private canWithdraw(amount: number): boolean {
    return this.balance >= amount && !this.frozen;
  }
}
```

### コールバックによる委譲

```typescript
// ❌ Ask
if (user.isAdmin()) {
  renderAdminDashboard();
} else {
  renderUserDashboard();
}

// ✅ Tell
user.renderDashboard({
  onAdmin: () => renderAdminDashboard(),
  onRegular: () => renderUserDashboard(),
});

// User class
class User {
  renderDashboard(handlers: DashboardHandlers) {
    if (this.isAdmin()) {
      handlers.onAdmin();
    } else {
      handlers.onRegular();
    }
  }
}
```

### コレクション操作の委譲

```typescript
// ❌ Ask
const activeItems = cart.getItems().filter(item => item.isActive());
const total = activeItems.reduce((sum, item) => sum + item.getPrice(), 0);

// ✅ Tell
const total = cart.calculateActiveTotal();

// Cart class
class Cart {
  calculateActiveTotal(): number {
    return this.items
      .filter(item => item.isActive())
      .reduce((sum, item) => sum + item.price, 0);
  }
}
```

---

## Python

### プロパティの活用

```python
# ❌ Ask
if employee.get_salary() > threshold and employee.get_years() > 5:
    employee.set_bonus(employee.get_salary() * 0.1)

# ✅ Tell
class Employee:
    def award_bonus_if_eligible(self, threshold: int) -> None:
        if self._is_eligible_for_bonus(threshold):
            self._bonus = self._salary * 0.1

    def _is_eligible_for_bonus(self, threshold: int) -> bool:
        return self._salary > threshold and self._years > 5
```

### ダックタイピングとポリモーフィズム

```python
# ❌ Ask
def send_notification(user):
    if isinstance(user, EmailUser):
        send_email(user.get_email(), message)
    elif isinstance(user, SmsUser):
        send_sms(user.get_phone(), message)

# ✅ Tell
class EmailUser:
    def notify(self, message: str) -> None:
        send_email(self._email, message)

class SmsUser:
    def notify(self, message: str) -> None:
        send_sms(self._phone, message)

# 使用側
user.notify(message)
```

---

## Ruby

### メソッドの移動

```ruby
# ❌ Ask
if order.items.any? { |item| item.price > 100 }
  apply_premium_discount(order)
end

# ✅ Tell
class Order
  def apply_discount_if_premium
    apply_premium_discount if has_premium_items?
  end

  private

  def has_premium_items?
    items.any? { |item| item.price > 100 }
  end
end
```

### ブロックによる委譲

```ruby
# ❌ Ask
if user.verified?
  yield
else
  redirect_to login_path
end

# ✅ Tell
user.when_verified { yield } || redirect_to(login_path)

# User class
class User
  def when_verified
    yield if verified?
  end
end
```

---

## Go

### メソッドレシーバーの活用

```go
// ❌ Ask
func ProcessOrder(order *Order) error {
    if order.Status == StatusPending && order.Total > 0 {
        order.Status = StatusProcessing
        // 処理
    }
    return nil
}

// ✅ Tell
func (o *Order) ProcessIfReady() error {
    if !o.canProcess() {
        return nil
    }
    o.status = StatusProcessing
    // 処理
    return nil
}

func (o *Order) canProcess() bool {
    return o.status == StatusPending && o.total > 0
}
```

### インターフェースによる抽象化

```go
// ❌ Ask
func CalculateShipping(item interface{}) float64 {
    switch v := item.(type) {
    case *Book:
        return v.Weight * 0.5
    case *Electronics:
        return v.Weight * 1.0 + 5.0  // 保険料
    }
    return 0
}

// ✅ Tell
type Shippable interface {
    ShippingCost() float64
}

func (b *Book) ShippingCost() float64 {
    return b.weight * 0.5
}

func (e *Electronics) ShippingCost() float64 {
    return e.weight*1.0 + 5.0
}
```

---

## Rust

### メソッドによるカプセル化

```rust
// ❌ Ask
fn process_account(account: &mut Account) {
    if account.balance >= 100 && !account.is_frozen {
        account.balance -= 100;
    }
}

// ✅ Tell
impl Account {
    pub fn withdraw(&mut self, amount: u64) -> Result<(), WithdrawError> {
        if !self.can_withdraw(amount) {
            return Err(WithdrawError::InsufficientFunds);
        }
        self.balance -= amount;
        Ok(())
    }

    fn can_withdraw(&self, amount: u64) -> bool {
        self.balance >= amount && !self.is_frozen
    }
}
```

### トレイトによるポリモーフィズム

```rust
// ❌ Ask
fn format_output(data: &Data) -> String {
    match data.format {
        Format::Json => serde_json::to_string(data).unwrap(),
        Format::Xml => format_as_xml(data),
    }
}

// ✅ Tell
trait Formattable {
    fn format(&self) -> String;
}

impl Formattable for JsonData {
    fn format(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}

impl Formattable for XmlData {
    fn format(&self) -> String {
        // XML形式に変換
    }
}
```

---

## リファクタリング手順

### Step 1: Askパターンの特定

```
検索対象:
- getter呼び出し後のif文
- switch/match文での型判定
- ループ内でのデータ収集
- 連鎖的なメソッド呼び出し (a.getB().getC())
```

### Step 2: 責任の分析

```
問い:
1. この判定ロジックは誰の責任か？
2. このデータを持っているのは誰か？
3. この処理は他の場所でも重複していないか？
```

### Step 3: メソッドの移動

```
変換パターン:
1. 判定ロジックをデータ所有者に移動
2. 公開メソッドとして提供
3. 呼び出し側を更新
4. 元のgetter使用箇所を確認・削除検討
```

### Step 4: テストの更新

```
確認事項:
- 振る舞いが変わっていないこと
- 新しいメソッドが正しく動作すること
- エッジケースが網羅されていること
```

---

## 警戒すべきシグナル

| シグナル | 対応 |
|----------|------|
| `obj.getX()` 後の `if` 文 | 判定メソッドをobjに追加 |
| `obj.setX(obj.getX() + n)` | 操作メソッドをobjに追加 |
| `a.getB().getC().doD()` | 委譲メソッドを各レベルに追加 |
| `switch(obj.getType())` | ポリモーフィズムで置換 |
| `for` + `getter` + `accumulator` | 集計メソッドをコレクション所有者に追加 |
