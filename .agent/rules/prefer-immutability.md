# イミュータブルを推奨

Rust以外の言語では、常に不変（immutable）なデータ操作を優先する。

## 基本原則

**データを変更せず、新しいデータを作成する。**

ミューテーション（状態の破壊的変更）は予測困難なバグの温床となる。参照を共有するオブジェクトを変更すると、
プログラムの別の場所で予期せぬ副作用が発生する。不変性を保つことで、コードの予測可能性と安全性が向上する。

## 適用範囲

| 言語 | 適用 | 備考 |
|------|------|------|
| JavaScript/TypeScript | ✅ | スプレッド構文、`Object.freeze`、Immutable.js等 |
| Python | ✅ | タプル、frozenset、dataclass(frozen=True)等 |
| Java | ✅ | レコード、Immutableコレクション、Builderパターン |
| Kotlin | ✅ | data class、`copy()`、不変コレクション |
| Scala | ✅ | case class、`copy()`、不変コレクションがデフォルト |
| Go | ✅ | 新しい構造体を返す、スライスのコピー |
| Ruby | ✅ | `freeze`、新しいオブジェクトを返す |
| **Rust** | ❌ | 所有権システムにより安全なミューテーションが可能 |

## ルール

### MUST（必須）

- オブジェクト/構造体の更新時は、元を変更せず新しいインスタンスを返す
- 配列/リストへの追加・削除は、新しいコレクションを返す
- 関数の引数を変更しない

### MUST NOT（禁止）

- 引数として受け取ったオブジェクトのプロパティを直接変更
- グローバルな状態のミューテーション
- 配列の `push`, `pop`, `splice` 等の破壊的メソッドの使用（代替手段がある場合）

## 言語別コード例

### JavaScript / TypeScript

```javascript
// ❌ WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // 引数を直接変更！
  return user
}

// ✅ CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

```javascript
// ❌ WRONG: Array mutation
function addItem(items, item) {
  items.push(item)  // 元の配列を破壊！
  return items
}

// ✅ CORRECT: New array
function addItem(items, item) {
  return [...items, item]
}
```

```javascript
// ❌ WRONG: Nested mutation
function updateAddress(user, city) {
  user.address.city = city
  return user
}

// ✅ CORRECT: Deep copy
function updateAddress(user, city) {
  return {
    ...user,
    address: {
      ...user.address,
      city
    }
  }
}
```

### Python

```python
# ❌ WRONG: Mutation
def update_user(user: dict, name: str) -> dict:
    user["name"] = name  # 引数を直接変更！
    return user

# ✅ CORRECT: Immutability
def update_user(user: dict, name: str) -> dict:
    return {**user, "name": name}
```

```python
# ❌ WRONG: List mutation
def add_item(items: list, item) -> list:
    items.append(item)  # 元のリストを破壊！
    return items

# ✅ CORRECT: New list
def add_item(items: list, item) -> list:
    return [*items, item]
```

```python
# ✅ BETTER: dataclass with frozen=True
from dataclasses import dataclass, replace

@dataclass(frozen=True)
class User:
    name: str
    age: int

def update_name(user: User, name: str) -> User:
    return replace(user, name=name)
```

### Java

```java
// ❌ WRONG: Mutation
public User updateUser(User user, String name) {
    user.setName(name);  // 引数を直接変更！
    return user;
}

// ✅ CORRECT: Immutability with Record (Java 16+)
public record User(String name, int age) {}

public User updateUser(User user, String name) {
    return new User(name, user.age());
}
```

```java
// ❌ WRONG: Collection mutation
public List<String> addItem(List<String> items, String item) {
    items.add(item);  // 元のリストを破壊！
    return items;
}

// ✅ CORRECT: New collection
public List<String> addItem(List<String> items, String item) {
    var newItems = new ArrayList<>(items);
    newItems.add(item);
    return Collections.unmodifiableList(newItems);
}

// ✅ BETTER: Stream API
public List<String> addItem(List<String> items, String item) {
    return Stream.concat(items.stream(), Stream.of(item))
                 .toList();
}
```

### Kotlin

```kotlin
// ❌ WRONG: Mutation
fun updateUser(user: MutableUser, name: String): MutableUser {
    user.name = name  // 引数を直接変更！
    return user
}

// ✅ CORRECT: data class + copy()
data class User(val name: String, val age: Int)

fun updateUser(user: User, name: String): User {
    return user.copy(name = name)
}
```

```kotlin
// ❌ WRONG: MutableList
fun addItem(items: MutableList<String>, item: String): List<String> {
    items.add(item)  // 元のリストを破壊！
    return items
}

// ✅ CORRECT: Immutable List
fun addItem(items: List<String>, item: String): List<String> {
    return items + item
}
```

### Scala

```scala
// ❌ WRONG: var + mutation
class User(var name: String, var age: Int)

def updateUser(user: User, name: String): User = {
  user.name = name  // 引数を直接変更！
  user
}

// ✅ CORRECT: case class + copy()
case class User(name: String, age: Int)

def updateUser(user: User, name: String): User = {
  user.copy(name = name)
}
```

```scala
// ✅ Scalaは不変コレクションがデフォルト
def addItem(items: List[String], item: String): List[String] = {
  items :+ item  // 新しいリストを返す
}
```

### Go

```go
// ❌ WRONG: Pointer mutation
func UpdateUser(user *User, name string) *User {
    user.Name = name  // 引数を直接変更！
    return user
}

// ✅ CORRECT: Return new struct
func UpdateUser(user User, name string) User {
    return User{
        Name: name,
        Age:  user.Age,
    }
}
```

```go
// ❌ WRONG: Slice mutation
func AddItem(items []string, item string) []string {
    return append(items, item)  // 容量次第で元を変更する可能性！
}

// ✅ CORRECT: Explicit copy
func AddItem(items []string, item string) []string {
    newItems := make([]string, len(items)+1)
    copy(newItems, items)
    newItems[len(items)] = item
    return newItems
}
```

### Ruby

```ruby
# ❌ WRONG: Mutation
def update_user(user, name)
  user[:name] = name  # 引数を直接変更！
  user
end

# ✅ CORRECT: Immutability
def update_user(user, name)
  user.merge(name: name).freeze
end
```

```ruby
# ❌ WRONG: Array mutation
def add_item(items, item)
  items << item  # 元の配列を破壊！
  items
end

# ✅ CORRECT: New array
def add_item(items, item)
  [*items, item].freeze
end
```

## 例外

以下の場合は、パフォーマンス上の理由でミューテーションを許容する：

- **大量データのバッチ処理**：ループ内で大量のオブジェクトを生成するとGC負荷が高い
- **ローカルスコープ内での一時変数**：関数外に漏れない場合
- **明示的にドキュメント化された場合**：副作用があることをコメントで明記

```javascript
// 例外: パフォーマンスが重要な場合（明示的にコメント）
function processLargeData(items) {
  // NOTE: Performance optimization - mutating in place
  const result = []
  for (const item of items) {
    result.push(transform(item))  // 許容
  }
  return result
}
```

## 理由

- **予測可能性**: 関数が引数を変更しないことが保証される
- **デバッグ容易性**: データの変更履歴を追跡しやすい
- **並行処理安全**: 共有状態のミューテーションによる競合を防ぐ
- **テスト容易性**: 入力と出力の関係が明確
