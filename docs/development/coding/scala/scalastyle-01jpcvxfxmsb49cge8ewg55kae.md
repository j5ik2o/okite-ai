---
description: scalastyleに関するドキュメント
ruleId: scalastyle-01jpcvxfxmsb49cge8ewg55kae
tags:
  - development
  - coding
  - scala
aliases:
  - scala-style-guide
  - scala-coding-conventions
globs:
  - '**/*.scala'
---

# Scalaコーディングスタイル

## 基本原則

- [Scala Style Guide](https://docs.scala-lang.org/style/)に従う
- 可読性と保守性を最優先する。
- 関数型プログラミングの原則を重視する。
- 型安全性を確保する。

## 命名規則

### 基本ルール

- クラス名、トレイト名はパスカルケース。
  - 例: `UserService`, `HttpClient`, `JsonParser`。
- メソッド名、変数名はキャメルケース。
  - 例: `getUserData`, `parseJson`, `isValid`。
- 定数は大文字のスネークケース。
  - 例: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`。
- パッケージ名は小文字のドット区切り。
  - 例: `com.example.project.module`。

### 特殊なケース

- 型パラメータは意味のある名前を使用する。
  - 単純な場合: `A` `B` `C`ではなく`T` `U` `V`を使用。
  - 複雑な場合: `Key`, `Value`, `Element`など具体的な名前。
- 関数型プログラミングでの慣習に従う。
  - 関数型の変換メソッドは`map`, `flatMap`, `filter`などの標準名を使用。
  - 副作用のあるメソッドは命令形の動詞で始める。
  - 述語関数は`is`, `has`, `can`などで始める。

```scala
// 良い例。
def getUserById(id: UserId): Option[User]
def isValidEmail(email: String): Boolean
def mapToDto(entity: Entity): EntityDto

// 避けるべき例。
def getUser(id: UserId): Option[User] // 曖昧な名前
def validEmail(email: String): Boolean // 動詞/形容詞が不明確
def userToDto(entity: Entity): EntityDto // 一貫性のない命名
```

## コード構造

### ファイル構成

- 1ファイルにつき1つのクラス/トレイト/オブジェクトを基本とする。
- ファイル名はクラス名と一致させる。
- 関連する小さなクラスは同じファイルに配置してもよい。
- ファイルの長さは500行を超えないようにする。

### クラス構造

- フィールド、メソッド、内部クラスの順に配置する。
- 公開APIを先頭に配置し、プライベートメソッドは後方に配置する。
- 関連するメソッドをグループ化する。
- メソッドの長さは30行を超えないようにする。
- case classは継承を防ぐために `final case class` として定義する。

```scala
class UserService(repository: UserRepository, validator: UserValidator) {
  // 公開メソッド。
  def findUser(id: UserId): Future[Option[User]] = {
    repository.findById(id)。
  }
  
  def createUser(data: UserData): Future[Either[ValidationError, User]] = {
    for {。
      validationResult <- validateUser(data)。
      result <- validationResult match {。
        case Right(validData) => saveUser(validData)。
        case Left(error) => Future.successful(Left(error))。
      }
    } yield result。
  }
  
  // プライベートメソッド。
  private def validateUser(data: UserData): Future[Either[ValidationError, UserData]] = {
    Future.successful(validator.validate(data))。
  }
  
  private def saveUser(data: UserData): Future[Either[ValidationError, User]] = {
    repository.save(data.toUser).map(Right(_))。
  }
}
```

## 関数型プログラミング

### イミュータビリティ

- 可能な限りイミュータブルなデータ構造を使用する。
- `var`の使用は避け、`val`を優先する。
- 定数は `final val` で定義して再定義を防ぐ。
- コレクションは不変（immutable）版を使用する。
- 状態変更が必要な場合は、新しいインスタンスを作成する。

```scala
// 良い例。
val users = List("Alice", "Bob", "Charlie")。
val updatedUsers = users :+ "Dave"

// 避けるべき例。
var users = List("Alice", "Bob", "Charlie")。
users = users :+ "Dave"
```

### 副作用の管理

- 副作用は可能な限り避ける。
- 副作用が必要な場合は、明示的に分離する。
- IO操作やデータベースアクセスなどの副作用は境界に押し込める。
- 純粋関数と副作用のある関数を明確に区別する。

```scala
// 良い例。
def processData(data: Data): ProcessedData = {
  // 純粋な変換処理。
}

def saveProcessedData(data: ProcessedData): Future[Unit] = {
  // 副作用（データベース保存）
  repository.save(data)。
}

// 避けるべき例。
def processAndSaveData(data: Data): Future[Unit] = {
  // 処理と保存が混在している。
  val processed = transform(data)。
  repository.save(processed)。
}
```

### 型の活用

- 豊富な型を使用して意図を明確にする。
- プリミティブ型の代わりにドメイン固有の型を定義する。
- `Option`, `Either`, `Try`を適切に使用する。
- 型パラメータを活用して汎用的なコードを書く。

```scala
// 良い例。
case class UserId(value: String)
case class Email(value: String)
case class User(id: UserId, email: Email)

// 避けるべき例。
case class User(id: String, email: String)
```

## エラー処理

### 型安全なエラー処理

- 例外は可能な限り避け、戻り値の型でエラーを表現する。
- `Either[Error, A]`を使用して失敗の可能性を型で表現する。
- `Validated`を使用してエラーを蓄積する。
- カスタムエラー型を定義して、エラーを明確に表現する。

```scala
// 良い例。
sealed trait UserError。
case class ValidationError(message: String) extends UserError
case class DatabaseError(cause: Throwable) extends UserError

def createUser(data: UserData): Either[UserError, User] = {
  // 実装。
}

// 避けるべき例。
def createUser(data: UserData): User = {
  if (!isValid(data)) {。
    throw new IllegalArgumentException("Invalid data")。
  }
  // 実装。
}
```

### モナド変換子

- モナドの組み合わせには適切なモナド変換子を使用する。
- `EitherT`を使用して`Future[Either[A, B]]`を扱う。
- `OptionT`を使用して`Future[Option[A]]`を扱う。
- cats-effectやZIOなどのライブラリを検討する。

```scala
// 良い例。
import cats.data.EitherT。
import cats.implicits._。

def findUser(id: UserId): EitherT[Future, UserError, User] = {
  EitherT(userRepository.findById(id).map {。
    case Some(user) => Right(user)。
    case None => Left(UserNotFoundError(id))。
  })
}

def getUserPermissions(user: User): EitherT[Future, UserError, Permissions] = {
  EitherT(permissionService.getPermissions(user.id).map(Right(_)))。
}

val result: EitherT[Future, UserError, Permissions] = for {
  user <- findUser(userId)。
  permissions <- getUserPermissions(user)。
} yield permissions。
```

## 非同期処理

### Future

- `Future`を使用して非同期処理を表現する。
- `ExecutionContext`は明示的に渡す。
- `Future`のネストを避け、for式やモナド変換子を使用する。
- 失敗したFutureの処理を忘れない。

```scala
// 良い例。
def processUser(userId: UserId)(implicit ec: ExecutionContext): Future[ProcessedUser] = {
  for {。
    user <- userRepository.findById(userId)。
    profile <- profileRepository.findByUserId(userId)。
    processed <- processingService.process(user, profile)。
  } yield processed。
}

// 避けるべき例。
def processUser(userId: UserId): Future[ProcessedUser] = {
  // 暗黙のExecutionContext。
  userRepository.findById(userId).flatMap { user =>。
    profileRepository.findByUserId(userId).flatMap { profile =>。
      processingService.process(user, profile)。
    }
  }
}
```

### ブロッキング処理

- ブロッキング処理は専用のExecutionContextで実行する。
- ブロッキング処理は明示的にマークする。
- 可能な限り非ブロッキングAPIを使用する。

```scala
// 良い例。
implicit val blockingEc: ExecutionContext = 
  ExecutionContext.fromExecutor(Executors.newFixedThreadPool(5))。

def readLargeFile(path: String): Future[String] = Future {
  // ブロッキング処理。
  scala.io.Source.fromFile(path).mkString。
}(blockingEc)。
```

## テスト

### テスト構造

- テストは明確な構造に従う（Arrange-Act-Assert）
- テストケースは独立していて再現可能にする。
- テスト名は何をテストしているかを明確に示す。
- テストヘルパーを活用して重複を減らす。

```scala
// 良い例。
"UserService" should "return user when valid ID is provided" in {。
  // Arrange。
  val userId = UserId("123")。
  val user = User(userId, "test@example.com")。
  when(mockRepository.findById(userId)).thenReturn(Future.successful(Some(user)))。
  
  // Act。
  val result = userService.findUser(userId).futureValue。
  
  // Assert。
  result shouldBe Some(user)。
}
```

### モックとスタブ

- モックは必要最小限に抑える。
- テスト用の実装を提供できる場合はスタブを使用する。
- モックの期待値設定は明示的に行う。
- モックフレームワーク（ScalaTest, Mockito）を適切に使用する。

```scala
// 良い例。
val mockRepository = mock[UserRepository]。
when(mockRepository.findById(any[UserId])).thenReturn(Future.successful(None))。

// テスト用スタブ。
class InMemoryUserRepository extends UserRepository {。
  private var users: Map[UserId, User] = Map.empty
  
  def findById(id: UserId): Future[Option[User]] = 
    Future.successful(users.get(id))。
  
  def save(user: User): Future[User] = {
    users = users + (user.id -> user)。
    Future.successful(user)。
  }
}
```

## ライブラリとフレームワーク

### 標準ライブラリ

- Scalaの標準ライブラリを十分に理解し活用する。
- コレクションAPIを適切に使用する。
- 標準ライブラリで提供されている機能を再実装しない。
- Java標準ライブラリとの相互運用性を理解する。

### サードパーティライブラリ

- 一貫したライブラリセットを使用する。
- 広く使われている信頼性の高いライブラリを選択する。
- ライブラリの依存関係を最小限に保つ。
- ライブラリのバージョンを定期的に更新する。

```scala
// build.sbtの例。
libraryDependencies ++= Seq(。
  "org.typelevel" %% "cats-core" % "2.9.0",。
  "org.typelevel" %% "cats-effect" % "3.4.8",。
  "io.circe" %% "circe-core" % "0.14.5",。
  "io.circe" %% "circe-generic" % "0.14.5",。
  "io.circe" %% "circe-parser" % "0.14.5"。
)
```

## ドキュメント

- 公開APIには適切なScaladocを付ける。
- 複雑なアルゴリズムや非自明なコードには説明を追加する。
- サンプルコードを提供する。
- 詳細は[Scaladocの掟](scaladoc-01jpcvxfxmsb49cge8ewg55kah.md)を参照

```scala
/**
 * ユーザー情報を管理するサービス。
 *
 * このサービスはユーザーの検索、作成、更新、削除機能を提供します。
 * すべての操作はトランザクション内で実行され、結果は非同期で返されます。
 *
 * @param repository ユーザー情報を格納するリポジトリ。
 * @param validator ユーザーデータの検証するバリデーター。
 */
class UserService(。
  repository: UserRepository,
  validator: UserValidator
) {
  // 実装。
}
```

## 関連情報

- [Scala Style Guide](https://docs.scala-lang.org/style/)
- [Effective Scala](https://twitter.github.io/effectivescala/)
- [Scaladocの掟](scaladoc-01jpcvxfxmsb49cge8ewg55kah.md)
- [Scalaツール活用](scalatools-01jpcvxfxk935q9x97vbpfp9ta.md)
