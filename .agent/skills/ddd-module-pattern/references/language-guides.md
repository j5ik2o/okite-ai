# 言語別ガイダンス

DDDモジュールパターンを各言語で適用する際の具体的な構造例。

## Java/Kotlin

```
com.example.domain/
  order/
    Order.java
    OrderId.java
    OrderItem.java
    OrderStatus.java
  customer/
    Customer.java
    CustomerId.java
    CustomerName.java
  pricing/
    PricingPolicy.java
    Discount.java
    Money.java
```

**ポイント**:
- パッケージ名は小文字のドメイン用語
- 実装クラスはインフラ層に配置

## Rust

```
domain/
  order/
    mod.rs
    order.rs
    order_id.rs
    order_item.rs
  customer/
    mod.rs
    customer.rs
    customer_id.rs
  pricing/
    mod.rs
    pricing_policy.rs
    money.rs
```

**ポイント**:
- `mod.rs` または `{module_name}.rs` + `{module_name}/` 方式
- traitはドメインモジュール内で定義
- 実装はインフラクレートに配置

## TypeScript

```
domain/
  order/
    index.ts
    Order.ts
    OrderId.ts
    OrderItem.ts
  customer/
    index.ts
    Customer.ts
    CustomerId.ts
  pricing/
    index.ts
    PricingPolicy.ts
    Money.ts
```

**ポイント**:
- `index.ts` で公開APIをエクスポート
- インターフェースはドメインディレクトリ内
- バレルエクスポートでインポートを簡潔に

## Python

```
domain/
  order/
    __init__.py
    order.py
    order_id.py
    order_item.py
  customer/
    __init__.py
    customer.py
    customer_id.py
  pricing/
    __init__.py
    pricing_policy.py
    money.py
```

**ポイント**:
- `__init__.py` で公開クラスをエクスポート
- 型ヒントを活用

## Go

```
domain/
  order/
    order.go
    order_id.go
    order_item.go
  customer/
    customer.go
    customer_id.go
  pricing/
    pricing_policy.go
    money.go
```

**ポイント**:
- パッケージ = ディレクトリ
- インターフェースは使用側で定義する慣習もあるが、ドメインパッケージ内でも可
- 小さなインターフェースを推奨

## Scala

```
domain/
  order/
    Order.scala
    OrderId.scala
    OrderItem.scala
  customer/
    Customer.scala
    CustomerId.scala
  pricing/
    PricingPolicy.scala
    Money.scala
```

**ポイント**:
- パッケージオブジェクトで共通型をエクスポート
- case classで値オブジェクトを表現

## C#

```
Domain/
  Order/
    Order.cs
    OrderId.cs
    OrderItem.cs
  Customer/
    Customer.cs
    CustomerId.cs
  Pricing/
    PricingPolicy.cs
    Money.cs
```

**ポイント**:
- 名前空間 = フォルダ構造
- インターフェースは`I`プレフィックス
- recordで値オブジェクトを表現（C# 9+）
