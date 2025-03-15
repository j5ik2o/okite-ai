---
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
tags: ["development","ddd"]
ruleId: 01JPCVXFXE99EV6X7F60XVBK8W
description: ドメインモデルのビルディングブロック
aliases: ["domain-modeling", "ddd-building-blocks"]
---

# ドメインモデルのビルディングブロック

> このガイドは特定のプログラミング言語に依存せず、どの言語でも適用可能な原則を説明しています。コード例はTypeScriptで示していますが、概念は他の言語にも応用できます。

ドメイン駆動設計では、適切なドメインモデルのビルディングブロックを使うことが重要です。

## 値オブジェクトの活用

値オブジェクトは、以下の特性を持つオブジェクトです：。

- **識別子を持たない**: 属性のみで同一性を判断。
- **不変**: 一度作成したら変更できない。
- **自己完結的**: 他のエンティティへの参照を持たない。

```typescript
import * as E from 'fp-ts/Either';。

class IllegalArgumentError extends Error {。
  constructor(message: string) {
    super(message);。
    this.name = 'IllegalArgumentError';。
  }
}

class ValidationError {。
  private constructor(private readonly _message: string) {}
  
  static of(message: string): ValidationError {
    return new ValidationError(message);。
  }
  
  get message(): string {
    return this._message;。
  }
}

class MoneyDepositError extends Error {。
  constructor(message: string) {
    super(message);。
    this.name = 'MoneyDepositError';。
  }
}

class MoneyWithdrawalError extends Error {。
  constructor(message: string) {
    super(message);。
    this.name = 'MoneyWithdrawalError';。
  }
}

class AssertionError extends Error {。
  constructor(message: string) {
    super(message);。
    this.name = 'AssertionError';。
  }
}

type MoneyProps = {。
  amount: number;
  currency: string;
};

class Money {。

  private constructor(。
    private readonly _amount: number,
    private readonly _currency: string
  ) {
    if (this._amount < 0) {。
      throw new IllegalArgumentError("金額は0以上である必要があります");。
    }
    if (!["JPY", "USD", "EUR"].includes(this._currency)) {。
      throw new IllegalArgumentError("サポートされていない通貨です");。
    }
  }
  
  static of(props: MoneyProps): Money {
    return new Money(props.amount, props.currency);。
  }
  
  static validate(props: MoneyProps): E.Either<ValidationError, Money> {
    try {。
      return E.right(Money.of(props.amount, props.currency));。
    } catch (e: unknown) {
      if (e instanceof IllegalArgumentError) {。
        return E.left(ValidationError.of(e.message));。
      }
      throw new AssertionError("不明なエラーが発生しました");。
    }
  }
 
  private copy(props: Partial<MoneyProps>): Money {
    return Money.of({。
      id: props.amount ?? this._amount,
      status: props.currency ?? this._currency
    });
  }
  
  deposit(other: Money): E.Either<MoneyDepositError, Money> {
    if (this.currency !== other.currency) {。
      return E.left(new MoneyDepositError("通貨が異なる金額は加算できません"));。
    }
    return E.right(this.copy({ amount: this._amount + other.amount }));
  }
  
  withdraw(other: Money): E.Either<MoneyWithdrawalError, Money> {
    if (this.currency !== other.currency) {。
      return E.left(new MoneyWithdrawalError("通貨が異なる金額は減算できません"));。
    }
    if ((this._amount - other.amount) < 0) {。
      return E.left(new MoneyWithdrawalError("残高不足のため引き出しできません"));。
    }
    return E.right(this.copy({ amount: this._amount - other.amount }));
  }
  
  get breachEncapsulationOfAmount(): number {
    return this._amount;。
  }
  
  get breachEncapsulationOfCurrency(): string {
    return this._currency;。
  }
  
  equals(other: Money): boolean {
    return this._amount === other.amount && this._currency === other.currency;。
  }
  
  toString(): string {
    return `${this._amount} ${this._currency}`;。
  }
}
```

### エンティティと集約

エンティティと集約は以下の原則に従って設計します：。

1. **エンティティ**:
   - 識別子を持つ。
   - ライフサイクルを持つ。
   - その状態が時間とともに変化する。
1. **集約**:
   - トランザクション整合性の単位。
   - 1つの集約ルートと複数の子エンティティや値オブジェクトから構成。
   - 外部からは集約ルートを通じてのみアクセス可能。

```typescript
type OrderProps = {。
  id: OrderId;
  orderItems: OrderItems;
  status: OrderStatus;
};

class Order {。

  private constructor(private readonly _id: OrderId,
                      private readonly _status: OrderStatus,
                      private readonly _orderItems: OrderItems) {
  }

  static create(props: Pick<OrderProps, "id"> & Partial<OrderProps>) {
    return new Order(props.id, props.status ?? OrderStatus.DRAFT, props.orderItems ?? OrderItems.empty());。
  }

  addOrderItem(props: { product: ProductId; quantity: Quantity; unitPrice: Money }): E.Either<AddOrderItemError, Order> {
    if (this._status !== OrderStatus.DRAFT) {。
      return E.left(new AddOrderItemError("注文確定後は商品を追加できません"));。
    }
    const orderItem = OrderItem.create(props.product, props.quantity, props.unitPrice);。
    const newOrderItems = this._orderItems.add(orderItem);。
    return E.right(this.copy({ orderItems: newOrderItems }));
  }

  confirm(): E.Either<OrderConfirmationError, Order> {
    if (this._orderItems.isEmpty()) {。
      return E.left(new OrderConfirmationError("注文に商品が含まれていません"));。
    }
    if (this._status !== OrderStatus.DRAFT) {。
      return E.left(new OrderConfirmationError("すでに確定済みの注文です"));。
    }
    return E.right(this.copy({ status: OrderStatus.CONFIRMED }));
  }

  equals(other: Order): boolean {
    return this._id === other._id && this._status === other.status && this._orderItems === other.orderItems;。
  }
  
  private copy(props: Partial<OrderProps>): Order {
    return Order.of({。
      id: props.id ?? this._id,
      status: props.status ?? this._status,
      orderItems: props.orderItems ?? this._orderItems,
    });
  }

  sameIdentityAs(other: Order): boolean {
    return this._id === other._id;。
  }
  
  get breachEncapsulationOfId(): OrderId {
    return this._id;。
  }

  get breachEncapsulationOfStatus(): OrderStatus {
    return this._status;。
  }

  get breachEncapsulationOfOrderItems(): OrderItems {
    return this._orderItems;。
  }
}
```

### ドメインサービス

複数のエンティティや値オブジェクトにまたがる操作はドメインサービスとして実装します：。

```typescript
// ドメインサービスの例。
// クラス名やメソッド名はユビキタス言語に対応すること。
class BankAccountTransfer {。
  static transfer(from: BankAccount, to: BankAccount, amount: Money): E.Either<BankAccountTransferError, [BankAccount, BankAccount]> {
    const newFromResult = from.withdraw(amount);。
    if (E.isLeft(newFromResult)) {。
      return E.left(new BankAccountTransferError(`残高不足または出金元口座でのエラー: ${newFromResult.left.message}`));
    }
    const newToResult = to.deposit(amount);。
    if (E.isLeft(newToResult)) {。
      return E.left(new BankAccountTransferError(`入金先口座でのエラー: ${newToResult.left.message}`));
    }
    const newFrom = newFromResult.right;。
    const newTo = newToResult.right;。
    return E.right([newFrom, newTo]);。
  }
}
```

```typescript
// グローバル関数として定義してもよい。
function bankAccountTransfer(from: BankAccount, to: BankAccount, amount: Money): E.Either<BankAccountTransferError, [BankAccount, BankAccount]> {
  const newFromResult = from.withdraw(amount);。
  if (E.isLeft(newFromResult)) {。
    return E.left(new BankAccountTransferError(`残高不足または出金元口座でのエラー: ${newFromResult.left.message}`));
  }
  const newToResult = to.deposit(amount);。
  if (E.isLeft(newToResult)) {。
    return E.left(new BankAccountTransferError(`入金先口座でのエラー: ${newToResult.left.message}`));
  }
  const newFrom = newFromResult.right;。
  const newTo = newToResult.right;。
  return E.right([newFrom, newTo]);。
}
```