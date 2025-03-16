---
description: scaladocに関するドキュメント
ruleId: scaladoc-01jpcvxfxmsb49cge8ewg55kah
tags:
  - development
  - coding
  - scala
aliases:
  - scala-documentation
  - scaladoc-guidelines
globs:
  - '**/*.scala'
---

# Scaladocの掟

## 基本原則

- [ドキュメントコメントの掟](../doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md)に準拠すること
  - ドキュメントコメントは英語で記述する。
  - 記述がないものは新規に追加する。
  - 既存のものでもガイドラインに従っていないものは是正する。
  - コードを見れば分かることは書かない（Why/Why notを中心に記載）

## ドキュメント規約

Scalaの公式ドキュメントに基づき、以下の規約に従うこと：。

- パブリックAPI要素には必ずドキュメントを付ける。
- ドキュメントはMarkdown形式で記述する。
- メソッドの型パラメータ、引数、戻り値を明確に説明する。
- 非自明な動作や副作用は必ず記載する。
- サンプルコードは実際に動作するものを記述する。

参考：[Scaladoc Guide](https://docs.scala-lang.org/style/scaladoc.html)

## ドキュメントスタイル

### パッケージドキュメント

```scala
/** This package provides utilities for handling asynchronous computations.
  *
  * The main components are:。
  *   - `Future` for representing asynchronous computations。
  *   - `Promise` for creating and completing futures。
  *   - `ExecutionContext` for managing thread pools。
  */
package object async。
```

### クラスとトレイト

```scala
/** A thread-safe queue implementation that blocks on dequeue if the queue is empty.
  *
  * This implementation uses a circular buffer internally to achieve constant time。
  * enqueue and dequeue operations.。
  *
  * @tparam T the type of elements in the queue。
  * @param capacity the maximum number of elements the queue can hold。
  *
  * @note This implementation is not memory-adaptive. The internal buffer is。
  *       allocated at construction time and never resized.。
  */
class BlockingQueue[T](capacity: Int) {
  // 実装。
}

/** Represents operations that can be performed asynchronously.
  *
  * Implementors must ensure that:。
  *   - Operations are thread-safe。
  *   - Resources are properly cleaned up。
  *   - Errors are properly propagated。
  */
trait AsyncOperation {。
  /** The type of error that can occur during the operation. */。
  type Error。

  /** Executes the operation asynchronously.
    *
    * @return a Future containing either an error or the operation result。
    */
  def execute(): Future[Either[Error, Unit]]
}
```

### メソッド

```scala
/** Creates a new connection to the database.
  *
  * This method will retry the connection up to 3 times with exponential backoff。
  * before giving up.。
  *
  * @param config    the database configuration。
  * @param timeout   maximum time to wait for connection。
  * @return         either a connection error or the established connection。
  *
  * @note This method is blocking and should not be called from the event loop。
  */
def connect(。
    config: DbConfig,
    timeout: Duration
): Either[ConnectionError, Connection]
```

### ケースクラスとシール済みトレイト

```scala
/** Represents possible errors that can occur during HTTP operations.
  *
  * @param message   human-readable error message。
  * @param cause     optional underlying cause。
  */
sealed trait HttpError extends Exception(message)。

/** Indicates that the requested resource was not found.
  *
  * @param url      the URL that was not found。
  * @param message  additional details about why the resource was not found。
  */
case class NotFound(。
    url: String,
    message: String
) extends HttpError。
```

## 特殊な記法

### タグ

```scala
/** Provides utility functions for working with collections.
  *
  * @define ORDERED Items must be ordered for this operation。
  * @define POS Position must be non-negative。
  */
object CollectionUtils {。
  /** Binary search in a sequence.
    *
    * $ORDERED。
    * $POS。
    */
  def binarySearch[T: Ordering](seq: Seq[T], elem: T): Int
}
```

### クロスリンク

```scala
/** See [[DbConfig.builder]] for creating a configuration.
  *
  * For more details about connection management, see。
  * [[com.example.db.ConnectionManager]].。
  */
def connect(config: DbConfig): Connection
```

## テストとの統合

### ユニットテスト例の記述

```scala
/** Adds two numbers safely handling overflow.
  *
  * Example:。
  * {{{。
  * scala> safeAdd(Int.MaxValue, 1)。
  * res0: Option[Int] = None。
  *
  * scala> safeAdd(40, 2)。
  * res1: Option[Int] = Some(42)。
  * }}}。
  */
def safeAdd(a: Int, b: Int): Option[Int]
```

## レビュー時の注意点

- ドキュメントが最新の実装を反映しているか。
- 全てのパブリック要素にドキュメントが付いているか。
- 説明が明確で具体的か。
- サンプルコードが実際に動作するか。
- 英語の文法や表現が適切か。
- 非自明な動作や制約が明確に記載されているか。

## 関連情報

- [Scaladoc Guide](https://docs.scala-lang.org/style/scaladoc.html)
- [Scala Documentation Style](https://docs.scala-lang.org/style/documentation.html)
- [Scaladoc for Library Authors](https://docs.scala-lang.org/overviews/scaladoc/for-library-authors.html)
