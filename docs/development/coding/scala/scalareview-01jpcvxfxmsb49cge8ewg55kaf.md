---
description: scalareviewに関するドキュメント
ruleId: scalareview-01jpcvxfxmsb49cge8ewg55kaf
tags:
  - development
  - coding
  - scala
aliases:
  - scala-code-review
  - scala-review-guidelines
globs:
  - '**/*.scala'
---

# Scalaコードレビュー

## 基本原則

- コードの品質と保守性を向上させることを目的とする。
- 建設的なフィードバックを心がける。
- 問題点だけでなく、良い点も指摘する。
- 個人ではなくコードに焦点を当てる。
- 「なぜ」と「どのように」の両方を説明する。

## レビューの流れ

1. **全体像の把握**。
   - コードの目的と設計を理解する。
   - 変更の範囲と影響を確認する。
   - テストの有無と品質を確認する。

2. **詳細レビュー**。
   - コードの正確性を確認する。
   - パフォーマンスとリソース使用を評価する。
   - エラー処理の適切さを確認する。
   - コードスタイルとドキュメントを確認する。

3. **フィードバック提供**。
   - 明確で具体的なコメントを提供する。
   - 重要な問題と軽微な問題を区別する。
   - 可能な場合は解決策を提案する。

## チェックリスト

### 関数型プログラミング

#### イミュータビリティ

- [ ] 可変状態（`var`）の使用は最小限に抑えられているか。
- [ ] イミュータブルなデータ構造が適切に使用されているか。
- [ ] 副作用は明示的に分離されているか。
- [ ] 状態変更が必要な場合、新しいインスタンスを作成しているか。

```scala
// 良い例。
val users = List("Alice", "Bob")。
val updatedUsers = users :+ "Charlie"

// 避けるべき例。
var users = List("Alice", "Bob")。
users = users :+ "Charlie"
```

#### 型の活用

- [ ] 豊富な型が使用されているか。
- [ ] プリミティブ型の代わりにドメイン固有の型が定義されているか。
- [ ] `Option`, `Either`, `Try`が適切に使用されているか。
- [ ] 型パラメータが適切に活用されているか。

```scala
// 良い例。
case class UserId(value: String)
case class User(id: UserId, name: String)

def findUser(id: UserId): Option[User] = ???

// 避けるべき例。
def findUser(id: String): User = {
  // nullを返す可能性がある。
}
```

#### 関数合成

- [ ] 高階関数が適切に使用されているか。
- [ ] パターンマッチングが効果的に活用されているか。
- [ ] for式とmap/flatMapが適切に使い分けられているか。
- [ ] 部分適用と関数合成が適切に使用されているか。

```scala
// 良い例。
val numbers = List(1, 2, 3, 4, 5)。
val doubled = numbers.map(_ * 2)。
val evenDoubled = numbers.filter(_ % 2 == 0).map(_ * 2)。

// または。
val result = for {。
  n <- numbers。
  if n % 2 == 0。
} yield n * 2。
```

### エラー処理

#### 型安全なエラー処理

- [ ] 例外の代わりに戻り値の型でエラーが表現されているか。
- [ ] `Either[Error, A]`が適切に使用されているか。
- [ ] エラー型は具体的で意味のあるものか。
- [ ] エラーメッセージは明確で有用か。

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

#### モナド変換子

- [ ] モナドの組み合わせには適切なモナド変換子が使用されているか。
- [ ] `EitherT`や`OptionT`が適切に使用されているか。
- [ ] for式が読みやすく使用されているか。
- [ ] エラーハンドリングが一貫しているか。

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

### 非同期処理

#### Future

- [ ] `Future`が適切に使用されているか。
- [ ] `ExecutionContext`は明示的に渡されているか。
- [ ] `Future`のネストは避けられているか。
- [ ] 失敗した`Future`は適切に処理されているか。

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

#### ブロッキング処理

- [ ] ブロッキング処理は専用の`ExecutionContext`で実行されているか。
- [ ] ブロッキング処理は明示的にマークされているか。
- [ ] 可能な限り非ブロッキングAPIが使用されているか。
- [ ] 長時間実行される処理は適切に管理されているか。

```scala
// 良い例。
implicit val blockingEc: ExecutionContext = 
  ExecutionContext.fromExecutor(Executors.newFixedThreadPool(5))。

def readLargeFile(path: String): Future[String] = Future {
  // ブロッキング処理。
  scala.io.Source.fromFile(path).mkString。
}(blockingEc)。
```

### コード品質

#### 可読性

- [ ] 変数名と関数名は明確で意味があるか。
- [ ] コードは適切に構造化されているか。
- [ ] 複雑な処理には適切なコメントがあるか。
- [ ] マジックナンバーは避けられているか。

```scala
// 良い例。
val MaxRetryCount = 3。
val RetryDelayMs = 100。

def fetchWithRetry(url: String): Future[Response] = {
  def attempt(retries: Int): Future[Response] = {
    httpClient.get(url).recoverWith {。
      case NonFatal(e) if retries < MaxRetryCount =>。
        logger.warn(s"Request failed, retrying (${retries + 1}/$MaxRetryCount)")。
        Thread.sleep(RetryDelayMs)。
        attempt(retries + 1)。
    }
  }
  
  attempt(0)。
}

// 避けるべき例。
def fetch(url: String): Future[Response] = {
  def retry(n: Int): Future[Response] = {
    httpClient.get(url).recoverWith {。
      case NonFatal(e) if n < 3 =>。
        Thread.sleep(100)。
        retry(n + 1)。
    }
  }
  
  retry(0)。
}
```

#### テスト

- [ ] 適切なテストカバレッジがあるか。
- [ ] テストは独立していて再現可能か。
- [ ] エッジケースはテストされているか。
- [ ] テストは明確で理解しやすいか。

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

"UserService" should "return None when user is not found" in {。
  // Arrange。
  val userId = UserId("456")。
  when(mockRepository.findById(userId)).thenReturn(Future.successful(None))。
  
  // Act。
  val result = userService.findUser(userId).futureValue。
  
  // Assert。
  result shouldBe None。
}
```

#### ドキュメント

- [ ] パブリックAPIには適切なScaladocがあるか。
- [ ] ドキュメントには例が含まれているか。
- [ ] 複雑な処理や非自明な動作は説明されているか。
- [ ] ドキュメントは[Scaladocの掟](scaladoc-01jpcvxfxmsb49cge8ewg55kah.md)に従っているか

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

### API設計

#### インタフェース

- [ ] APIは使いやすく直感的か。
- [ ] メソッドのシグネチャは明確で一貫しているか。
- [ ] トレイトの設計は適切か。
- [ ] 依存性は明示的に宣言されているか。

```scala
// 良い例。
trait UserRepository {。
  def findById(id: UserId): Future[Option[User]]
  def save(user: User): Future[User]
  def delete(id: UserId): Future[Boolean]
}

// 避けるべき例。
trait Repo {。
  def find(id: String): Option[User] // 非同期処理がない
  def save(user: User): Boolean // 成功/失敗の理由が不明確
  def remove(id: String): Boolean // 命名が一貫していない (delete vs remove)
}
```

#### 型システム

- [ ] 代数的データ型（ADT）は適切に使用されているか。
- [ ] トレイト階層は適切に設計されているか。
- [ ] 型パラメータは明確で意味があるか。
- [ ] 型クラスは適切に使用されているか。

```scala
// 良い例。
sealed trait PaymentMethod。
case class CreditCard(number: String, expiry: YearMonth, cvv: String) extends PaymentMethod
case class BankTransfer(accountNumber: String, bankCode: String) extends PaymentMethod
case class DigitalWallet(provider: String, accountId: String) extends PaymentMethod

def processPayment(amount: Money, method: PaymentMethod): Future[PaymentResult] = {
  method match {。
    case CreditCard(number, expiry, cvv) => processCreditCardPayment(amount, number, expiry, cvv)。
    case BankTransfer(account, code) => processBankTransfer(amount, account, code)。
    case DigitalWallet(provider, id) => processDigitalWalletPayment(amount, provider, id)。
  }
}
```

### パフォーマンス

#### リソース管理

- [ ] リソースは適切に解放されているか。
- [ ] メモリ使用量は適切か。
- [ ] コネクションプールは適切に管理されているか。
- [ ] ファイルハンドルやネットワーク接続は適切にクローズされるか。

```scala
// 良い例。
def readFile(path: String): Try[String] = {
  val source = Source.fromFile(path)。
  try {。
    Success(source.mkString)。
  } catch {。
    case NonFatal(e) => Failure(e)。
  } finally {。
    source.close()。
  }
}

// または。
def readFile(path: String): Try[String] = {
  Using(Source.fromFile(path)) { source =>。
    source.mkString。
  }
}
```

#### 最適化

- [ ] 不必要なオブジェクト生成は避けられているか。
- [ ] コレクション操作は効率的か。
- [ ] 再帰は末尾再帰になっているか。
- [ ] ホットスポットは最適化されているか。

```scala
// 良い例 (末尾再帰)。
def factorial(n: Int): BigInt = {
  @tailrec。
  def loop(n: Int, acc: BigInt): BigInt = {
    if (n <= 1) acc。
    else loop(n - 1, n * acc)。
  }
  
  loop(n, 1)。
}

// 避けるべき例 (非末尾再帰)。
def factorial(n: Int): BigInt = {
  if (n <= 1) 1。
  else n * factorial(n - 1) // スタックオーバーフローの可能性。
}
```

### セキュリティ

- [ ] ユーザー入力は適切に検証されているか。
- [ ] 機密情報は適切に保護されているか。
- [ ] SQLインジェクションやXSSなどの脆弱性は対策されているか。
- [ ] 認証と認可は適切に実装されているか。

```scala
// 良い例 (SQLインジェクション対策)。
def findUserByName(name: String): Future[Option[User]] = {
  val query = sql"SELECT * FROM users WHERE name = $name"。
  database.run(query.map(_.headOption))。
}

// 避けるべき例。
def findUserByName(name: String): Future[Option[User]] = {
  val query = s"SELECT * FROM users WHERE name = '$name'" // SQLインジェクションの脆弱性。
  database.run(query)。
}
```

## レビューコメントの書き方

### 効果的なフィードバック

- 具体的な問題点を指摘する。
- 理由を説明する。
- 改善案を提案する。
- 肯定的な側面も指摘する。

```
// 良いフィードバック例。
この部分では `Option` の代わりに例外を使用していますが、これは型安全性を損なう可能性があります。
ユーザーが見つからない場合は、例外をスローするのではなく `Option[User]` を返すことを検討してください。
これにより、呼び出し元は戻り値の型からユーザーが存在しない可能性を認識でき、適切に処理できます。

例えば:
```scala
def findUser(id: UserId): Option[User] = {
  userRepository.findById(id)。
}
```

// 悪いフィードバック例。
例外を使わないでください。

```

### 優先順位付け

- 重大な問題（正確性、セキュリティ、パフォーマンス）を最優先する。
- 中程度の問題（API設計、エラー処理）を次に優先する。
- 軽微な問題（スタイル、ドキュメント）は最後に扱う。

## レビュー後のフォローアップ

- 修正されたコードを再確認する。
- 未解決の問題を追跡する。
- 学んだ教訓をチームで共有する。
- 必要に応じてコーディングガイドラインを更新する。

## 関連情報

- [Scala Style Guide](https://docs.scala-lang.org/style/)
- [Effective Scala](https://twitter.github.io/effectivescala/)
- [Scaladocの掟](scaladoc-01jpcvxfxmsb49cge8ewg55kah.md)
- [Scalaコーディングスタイル](scalastyle-01jpcvxfxmsb49cge8ewg55kae.md)
- [Scalaツール活用](scalatools-01jpcvxfxk935q9x97vbpfp9ta.md)
