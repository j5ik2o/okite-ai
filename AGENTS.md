# 大前提

- 日本語でやりとりすること
 
# 基本原則

- シンプルさの優先: すべての変更を可能な限りシンプルに保ち、コードへの影響範囲を最小限に抑える。
- 妥協の排除: 根本原因を特定すること。一時しのぎの修正は行わず、シニア開発者としての基準を維持する。
- 影響の最小化: 必要な箇所のみを変更し、新たなバグの混入を徹底的に防ぐ。

# AI-DLC and Spec-Driven Development

@.agent/CC-SDD.md

# Claude Code向け

- `.claude/skills/` はシンボリックリンクですが、本体のパス(`.agent/skills/`)は意識しないでください。通常どおり処理してください。

# Codex CLI向け

- `.codex/skills/` はシンボリックリンクですが、本体のパス(`.agent/skills/`)は意識しないでください。通常どおり処理してください。


# 参照ドキュメント

- `references/*`以下は参照ドキュメントです。当該プロジェクトのファイルではないので参照のみとしてください。

# Rules


# 曖昧なサフィックスを避ける

型の命名において曖昧なサフィックスを検出し、明確な命名へ導く。

## 目的

- 型・モジュール名から責務・境界・契約が即座に推測できる状態を保つ
- 曖昧な語による責務の吸い込み・肥大化・境界崩壊を防ぐ
- ドメイン語彙を優先する

## 基本原則

- 命名は「何をするか」ではなく「何であるか」を表す
- 名前は責務・境界・依存方向を最小限の語で符号化する
- プロジェクト内で意味が一意に定義できない語はサフィックスとして使わない

## 禁止サフィックス

新規命名では以下を使用しない：

| サフィックス | 問題 |
|--------------|------|
| Manager | 「Xxxに関することを全部やる箱」になる |
| Util | 「設計されていない再利用コード」 |
| Facade | 責務の境界が不明確 |
| Service | 層や責務が未整理 |
| Runtime | 何が動くのか不明 |
| Engine | 実行体の責務が不明確 |

## 責務別 命名パターン

### データ保持・管理
`*Registry`, `*Catalog`, `*Index`, `*Table`, `*Store`

### 選択・分岐・方針
`*Policy`, `*Selector`, `*Router`

### 仲介・調停・制御
`*Coordinator`, `*Dispatcher`, `*Controller`

### 生成・構築
`*Factory`, `*Builder`

### 変換・適合
`*Adapter`, `*Bridge`, `*Mapper`

### 実行・評価
`*Executor`, `*Scheduler`, `*Evaluator`

## 例外ルール

- 外部API/OSS/フレームワーク由来の名称は無理に改名しない
- 既存コードで責務が明文化されている場合のみ例外的に許容

## 判定フロー

1. 禁止サフィックスを含むか確認
2. 含む場合:
   - この名前だけで責務を一文で説明できるか？
   - 依存してよい層・してはいけない層が推測できるか？
3. できない場合は具体名への置換案を提示

## 最終チェック

「この名前だけ見て、何に依存してよいか分かるか？」

分からないなら、その名前はまだ設計途中である。


# Explain Skill Selection

スキルを使用する際は、選択したスキルとその選択理由を明示する。

## 基本原則

**スキルを呼び出す前に、どのスキルをなぜ選んだかをユーザーに説明しなければならない。**

AIはスキルを暗黙的に呼び出す傾向があるが、ユーザーはどのスキルが使われたか、なぜそのスキルが適切だったかを理解する必要がある。このルールはスキル選択の透明性を強制する。

## ルール

### MUST（必須）

- スキルを呼び出す前に、選択したスキル名を明示する
- そのスキルを選んだ理由（ユーザーのリクエストとスキルの目的の対応関係）を説明する
- 複数のスキル候補がある場合は、なぜそのスキルが最適かを述べる

### MUST NOT（禁止）

- 説明なしにスキルを呼び出す
- スキル名だけ提示して理由を省略する

## 説明のフォーマット

スキル呼び出し前に以下の形式で説明する：

```
スキル: [スキル名]
目的: [このスキルを選んだ理由。ユーザーのリクエストとスキルの機能がどう対応するか]
```

## 例

```
# 良い例
スキル: parse-dont-validate
目的: バリデーション関数の改善リクエストに対し、型で不変式を保証するパターンへの変換を支援するため

# 良い例
スキル: creating-rules
目的: プロジェクト固有のルール（.claude/rules/*.md）を新規作成するリクエストのため

# 悪い例（説明なし）
（スキルをいきなり呼び出す）

# 悪い例（理由がない）
スキル: clean-architecture
（なぜこのスキルかの説明がない）
```

## 理由

- **透明性**: ユーザーがAIの判断プロセスを理解できる
- **学習効果**: ユーザーが利用可能なスキルとその用途を学べる
- **検証可能性**: スキル選択が不適切な場合にユーザーが指摘できる


# コーディング前の学習

新しいコードを書く前に既存の実装を分析する。既存のコードベースこそがプロジェクト規約のドキュメントである。

## 基本原則

**このプロジェクトで類似のコードがどのように書かれているかを理解せずにコードを書いてはならない。**

AIは一般的なベストプラクティスに従った「教科書的に正しい」コードを書く傾向があるが、プロジェクト固有のパターンを無視しがちである。このルールは必須の分析フェーズを強制する。

## 必須ワークフロー

### 1. 類似コードの特定

何かを実装する前に、以下の条件を満たす既存のコードを見つける：
- **同じレイヤー**：リポジトリを追加するなら、他のリポジトリを見つける
- **同じ種類**：サービスを追加するなら、他のサービスを見つける
- **同じドメイン**：認証周りで作業するなら、他の認証コードを見つける
- **同じパターン**：APIエンドポイントを追加するなら、他のエンドポイントを見つける

### 2. プロジェクトパターンの抽出

2〜3個の類似実装を分析する：

| 観点 | 確認事項 |
|------|----------|
| 構造 | インターフェース + クラス？クラスのみ？関数型？ |
| 命名 | プレフィックス/サフィックス規約、ケーシングスタイル |
| 依存関係 | 依存性はどのように注入されるか？ |
| エラー処理 | 例外？Result型？エラーコード？ |
| テスト | テストファイルの場所、命名、パターン |
| インポート | 絶対パス？相対パス？ |

### 3. パターンに従って実装

分析完了後にのみ、特定したパターンに正確に一致するコードを書く。

## 禁止事項

| やってはいけないこと | 代わりにやるべきこと |
|----------------------|----------------------|
| プロジェクトが直接クラスを使用しているのにインターフェースを追加 | 既存パターンに合わせる |
| プロジェクトが手動DIを使用しているのにDIフレームワークを使用 | 手動のコンストラクタインジェクションを使用 |
| プロジェクトがシンプルなthrowを使用しているのに包括的なエラー処理を追加 | 既存のエラースタイルに合わせる |
| プロジェクトにコメントがないのにJSDocを追加 | 既存のドキュメントスタイルに従う |

## チェックリスト

新しいコードを書く前に：

1. **検索**: 2〜3個の類似する既存実装を見つける
2. **読む**: その構造、パターン、規約を学ぶ
3. **抽出**: プロジェクト固有のパターンを把握
4. **一致**: 新しいコードが特定したパターンに正確に従うようにする


# Less Is More

過剰設計を避け、シンプルで保守しやすいコードを書く。

## 核心原則

### YAGNI (You Aren't Gonna Need It)

**今必要ないものは作らない。**

- ❌ 「将来使うかもしれない」機能
- ❌ 「念のため」の設定オプション
- ❌ 仮定に基づく拡張ポイント
- ✅ 現在の要件のみ実装
- ✅ 必要になったら追加

### KISS (Keep It Simple, Stupid)

**複雑さは敵。シンプルさは味方。**

- ❌ 3行で書けるコードを10行にする
- ❌ 不要なデザインパターンの適用
- ❌ 過度な階層化・抽象化
- ✅ 最も単純な解決策をまず検討
- ✅ 読みやすさ > 賢さ

### 早すぎる抽象化の回避

**3回ルール: 3回繰り返すまで抽象化しない。**

- 1回目: 直接書く
- 2回目: 直接書く（メモする）
- 3回目: パターンを確認してから抽象化を検討

## 過剰設計の兆候

| 兆候 | 問題 |
|------|------|
| 実装より設計に時間がかかる | 分析麻痺 |
| 「将来のために」が頻出 | YAGNI違反 |
| 1機能に5+ファイル | 過度な分離 |
| 設定可能な点が10+ | 過剰な柔軟性 |
| 継承階層が3+レベル | 過度な抽象化 |
| インターフェースの実装が1つだけ | 不要な抽象化 |

## 追加前チェックリスト

- [ ] 今この機能は必要か？（YAGNI）
- [ ] より簡単な方法はないか？（KISS）
- [ ] 同じコードが3回以上あるか？（抽象化判断）
- [ ] この複雑さは価値に見合うか？
- [ ] 削除するのは追加より難しいか？

## 格言

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupery


# Prefer Immutability

Rust以外の言語では、常に不変（immutable）なデータ操作を優先する。

## 基本原則

**データを変更せず、新しいデータを作成する。**

ミューテーション（破壊的変更）は予測困難なバグの温床となる。参照を共有するオブジェクトを変更すると、
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


# Single Type Per File

コード生成時に「1公開型 = 1ファイル」を強制する。言語を問わず適用する。

## 原則

**1つの公開型につき1つのファイルを作成する。**

## 公開型の定義

| 言語 | 公開型 |
|------|--------|
| Java/Kotlin/Scala | `public`な `class`, `trait`, `object`, `enum` |
| Rust | `pub struct`, `pub trait`, `pub enum` |
| Go | 大文字始まりの `type` |
| Python | モジュールレベルの `class` |
| TypeScript/JavaScript | `export`された `class`, `interface`, `type`, オブジェクト |
| Swift | `public class`, `public protocol`, `public enum` |
| C# | `public class`, `public interface`, `public enum` |

## ルール

### MUST（必須）

- 1つの公開型につき1つのファイルを作成
- ファイル名は公開型の名前を反映（例: `UserRepository` → `user_repository.py`）
- 既存ファイルに新しい公開型を追加しない

### ALLOWED（許可）

- 公開型に必要な**プライベート実装型**は同居可
- 公開型の**内部ネスト型**は同居可
- **sealed interface/trait**とその閉じた実装群は同居可

### MUST NOT（禁止）

- 1ファイルに複数の公開クラス/構造体/インターフェース
- 「関連しているから」という理由での型の集約

## 判断基準

1. この型は公開型か？ → Yes なら新規ファイル作成
2. 既存の公開型の内部実装か？ → Yes なら同居可
3. sealed interface/traitの閉じた実装か？ → Yes なら同居可
4. 上記以外 → 新規ファイル作成

## 理由

- ナビゲーション性の向上（ファイル名 = 型名）
- 責任の明確化（ファイル肥大化 = 設計の問題）
- Git履歴の追跡容易性

