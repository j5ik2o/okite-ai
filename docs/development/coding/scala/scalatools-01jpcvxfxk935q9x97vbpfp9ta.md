---
description: scalatoolsに関するドキュメント
ruleId: scalatools-01jpcvxfxk935q9x97vbpfp9ta
tags:
  - development
  - coding
  - scala
aliases:
  - scala-tools
  - scala-ecosystem
globs:
  - '**/*.scala'
---

# Scalaツール活用

## ビルドツール

### sbt (Scala Build Tool)

Scalaの標準的なビルドツールです。プロジェクトの依存関係管理、コンパイル、テスト、パッケージング、公開などを行います。

```bash
# 新しいプロジェクトの作成
sbt new scala/scala-seed.g8。

# コンパイル
sbt compile。

# テスト実行
sbt test。

# 継続的コンパイル
sbt ~compile。

# 依存関係の更新
sbt update。

# パッケージの作成
sbt package。
```

#### sbt設定例

```scala
// build.sbt。
name := "my-project"
version := "0.1.0"
scalaVersion := "2.13.10"

libraryDependencies ++= Seq(。
  "org.typelevel" %% "cats-core" % "2.9.0",。
  "org.scalatest" %% "scalatest" % "3.2.15" % Test。
)

// マルチプロジェクト設定。
lazy val core = project。
  .in(file("core"))。
  .settings(。
    name := "my-project-core",
    libraryDependencies ++= coreDependencies。
  )

lazy val api = project。
  .in(file("api"))。
  .dependsOn(core)。
  .settings(。
    name := "my-project-api",
    libraryDependencies ++= apiDependencies。
  )

lazy val root = project。
  .in(file("."))。
  .aggregate(core, api)。
```

### Mill

sbtの代替となる高速なビルドツールです。

```bash
# 新しいプロジェクトの作成
mill init。

# コンパイル
mill foo.compile。

# テスト実行
mill foo.test。

# 実行
mill foo.run。

# REPL起動
mill -i foo.repl。
```

#### Mill設定例

```scala
// build.sc。
import mill._。
import mill.scalalib._。

object foo extends ScalaModule {。
  def scalaVersion = "2.13.10"。
  
  def ivyDeps = Agg(。
    ivy"org.typelevel::cats-core:2.9.0"
  )
  
  object test extends Tests {。
    def ivyDeps = Agg(。
      ivy"org.scalatest::scalatest:3.2.15"
    )
    def testFramework = "org.scalatest.tools.Framework"。
  }
}
```

## コード品質ツール

### Scalafmt

Scalaコードのフォーマッターです。一貫したコードスタイルを維持するために使用します。

```bash
# sbtプラグインとして追加
// project/plugins.sbt。
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.0")。

# コードのフォーマット
sbt scalafmt。

# テストコードのフォーマット
sbt Test/scalafmt。

# フォーマットチェック
sbt scalafmtCheck。
```

#### Scalafmt設定例

```hocon
// .scalafmt.conf。
version = "3.7.3"。
runner.dialect = scala213。
maxColumn = 100。
align.preset = more。
rewrite.rules = [。
  AvoidInfix,。
  RedundantBraces,。
  RedundantParens,。
  SortModifiers。
]
```

### Scalafix

Scalaコードの自動リファクタリングと静的解析するツールです。

```bash
# sbtプラグインとして追加
// project/plugins.sbt。
addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.10.4")。

# ルールの適用
sbt "scalafix RemoveUnused"。

# すべてのルールの適用
sbt "scalafix"。

# 特定のファイルにルールを適用
sbt "scalafix RemoveUnused src/main/scala/Fix.scala"。
```

#### Scalafix設定例

```hocon
// .scalafix.conf。
rules = [。
  DisableSyntax,。
  LeakingImplicitClassVal,。
  NoValInForComprehension,。
  ProcedureSyntax,。
  RemoveUnused。
]

DisableSyntax.noVars = true。
DisableSyntax.noNulls = true。
DisableSyntax.noReturns = true。
DisableSyntax.noWhileLoops = true。
```

### Wartremover

コンパイル時にコード内の潜在的な問題を検出するツールです。

```bash
# sbtプラグインとして追加
// project/plugins.sbt。
addSbtPlugin("org.wartremover" % "sbt-wartremover" % "3.1.3")。

# build.sbtでの設定
wartremoverErrors ++= Warts.unsafe。
```

#### Wartremover設定例

```scala
// build.sbt。
wartremoverErrors ++= Seq(。
  Wart.Any,。
  Wart.Null,。
  Wart.Return,。
  Wart.Var,。
  Wart.Throw。
)

// 特定のファイルを除外。
wartremoverExcluded += baseDirectory.value / "src" / "main" / "scala" / "legacy"。
```

## 開発支援ツール

### Metals

Scalaの言語サーバープロトコル（LSP）実装です。VSCode、Vim、Emacsなどのエディタと統合して、コード補完、定義ジャンプ、リファクタリングなどの機能を提供します。

```bash
# VSCodeの場合、Metals拡張機能をインストール
# https://marketplace.visualstudio.com/items?itemName=scalameta.metals

# Coursierを使用してMetalsをインストール
cs install metals。
```

#### Metals機能

- コード補完。
- 定義へのジャンプ。
- 型情報の表示。
- リファクタリング。
- インラインエラー表示。
- コードフォーマット（Scalafmtと統合）

### IntelliJ IDEA with Scala Plugin

JetBrainsのIDEであるIntelliJ IDEAにScalaプラグインを追加して使用します。

#### 主な機能

- 高度なコード補完。
- リファクタリングツール。
- デバッガ。
- テスト実行とカバレッジ。
- sbtとの統合。
- Scalafmtとの統合。

### Ammonite REPL

高機能なScala REPLです。インポート、自動補完、複数行編集などの機能を提供します。

```bash
# インストール
cs install ammonite。

# 起動
amm。

# スクリプト実行
amm script.sc。
```

#### Ammonite使用例

```scala
// REPLでの使用。
@ import $ivy.`org.typelevel::cats-core:2.9.0`
@ import cats.implicits._。
@ List(1, 2, 3).map(_ + 1)。
res0: List[Int] = List(2, 3, 4)

// スクリプトファイル (script.sc)。
#!/usr/bin/env amm

import $ivy.`org.typelevel::cats-core:2.9.0`
import cats.implicits._。

@main。
def main(args: String*) = {
  println(s"Arguments: ${args.mkString(", ")}")
  List(1, 2, 3).map(_ + 1).foreach(println)。
}
```

## テストツール

### ScalaTest

Scalaの主要なテストフレームワークです。様々なテストスタイルをサポートしています。

```scala
// build.sbtでの依存関係。
libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.15" % Test。

// テスト例。
import org.scalatest._。
import org.scalatest.flatspec.AnyFlatSpec。
import org.scalatest.matchers.should.Matchers。

class CalculatorSpec extends AnyFlatSpec with Matchers {。
  "A Calculator" should "add two numbers" in {。
    Calculator.add(1, 2) should be (3)。
  }
  
  it should "subtract two numbers" in {。
    Calculator.subtract(5, 2) should be (3)。
  }
}
```

### Specs2

もう1つの人気のあるテストフレームワークです。

```scala
// build.sbtでの依存関係。
libraryDependencies += "org.specs2" %% "specs2-core" % "4.19.2" % Test。

// テスト例。
import org.specs2.mutable.Specification。

class CalculatorSpec extends Specification {。
  "Calculator" should {。
    "add two numbers" in {。
      Calculator.add(1, 2) must beEqualTo(3)。
    }
    
    "subtract two numbers" in {。
      Calculator.subtract(5, 2) must beEqualTo(3)。
    }
  }
}
```

### MUnit

シンプルで高速なテストフレームワークです。

```scala
// build.sbtでの依存関係。
libraryDependencies += "org.scalameta" %% "munit" % "0.7.29" % Test。

// テスト例。
class CalculatorSuite extends munit.FunSuite {。
  test("add two numbers") {。
    assertEquals(Calculator.add(1, 2), 3)。
  }
  
  test("subtract two numbers") {。
    assertEquals(Calculator.subtract(5, 2), 3)。
  }
}
```

### ScalaMock

Scalaのモックフレームワークです。

```scala
// build.sbtでの依存関係。
libraryDependencies += "org.scalamock" %% "scalamock" % "5.2.0" % Test。

// 使用例。
import org.scalamock.scalatest.MockFactory。
import org.scalatest.flatspec.AnyFlatSpec。

class UserServiceSpec extends AnyFlatSpec with MockFactory {。
  "UserService" should "get user by id" in {。
    val mockRepository = mock[UserRepository]。
    (mockRepository.findById _).expects(1).returning(Some(User(1, "test")))。
    
    val service = new UserService(mockRepository)。
    assert(service.getUser(1).contains(User(1, "test")))。
  }
}
```

## パフォーマンス分析ツール

### JMH (Java Microbenchmark Harness)

JVMベースのマイクロベンチマークを作成するためのツールです。

```scala
// build.sbtでの設定。
libraryDependencies += "org.openjdk.jmh" % "jmh-core" % "1.36" % Test。
libraryDependencies += "org.openjdk.jmh" % "jmh-generator-annprocess" % "1.36" % Test。

// ベンチマーク例。
import org.openjdk.jmh.annotations._。
import java.util.concurrent.TimeUnit。

@State(Scope.Thread)。
@BenchmarkMode(Array(Mode.AverageTime))。
@OutputTimeUnit(TimeUnit.NANOSECONDS)。
class StringBenchmark {。
  @Benchmark。
  def concatenation(): String = {
    "Hello" + " " + "World"。
  }
  
  @Benchmark。
  def interpolation(): String = {
    s"Hello World"。
  }
}
```

### Flame Graph

プロファイリング結果を視覚化するためのツールです。

```bash
# JVMのプロファイリングツールを使用
java -XX:+PreserveFramePointer -jar target/benchmarks.jar。

# async-profilerを使用
./profiler.sh -d 30 -f profile.html <pid>。
```

## CI/CD統合

### GitHub Actions

GitHub Actionsを使用したScalaプロジェクトのCI/CD設定例：。

```yaml
# .github/workflows/scala.yml
name: Scala CI。

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3。
    - name: Set up JDK 11。
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
        cache: 'sbt'
    - name: Run tests。
      run: sbt test
    - name: Check formatting。
      run: sbt scalafmtCheckAll
    - name: Run scalafix。
      run: sbt "scalafix --check"
```

### SBT Native Packager

アプリケーションのパッケージングとデプロイメントを自動化するためのsbtプラグインです。

```scala
// project/plugins.sbt。
addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.9.16")。

// build.sbt。
enablePlugins(JavaAppPackaging)。
enablePlugins(DockerPlugin)。

dockerBaseImage := "openjdk:11-jre-slim"
dockerExposedPorts := Seq(8080)
```

## ドキュメント生成ツール

### Scaladoc

Scalaの標準ドキュメント生成ツールです。

```bash
# ドキュメント生成
sbt doc。

# ドキュメントを開く
sbt doc-open。
```

### Mdoc

型チェックされたMarkdownドキュメントを生成するツールです。

```scala
// project/plugins.sbt。
addSbtPlugin("org.scalameta" % "sbt-mdoc" % "2.3.7")。

// build.sbt。
enablePlugins(MdocPlugin)。
mdocIn := file("docs-src")
mdocOut := file("docs")
```

## 依存関係管理ツール

### Coursier

Scala依存関係の解決と取得を高速化するツールです。

```bash
# インストール
curl -fLo cs https://git.io/coursier-cli-"$(uname | tr LD ld)"。
chmod +x cs。
./cs setup。

# アプリケーションのインストール
cs install scala。
cs install scalafmt。
cs install ammonite。

# 依存関係の解決
cs resolve org.typelevel::cats-core:2.9.0。
```

### sbt-updates

プロジェクトの依存関係の更新状況を確認するsbtプラグインです。

```scala
// project/plugins.sbt。
addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.6.3")。

// 使用方法。
sbt dependencyUpdates。
```

## 推奨ワークフロー

1. **プロジェクト開始時**:
   - `sbt new`でプロジェクト作成。
   - Scalafmt、Scalafixの設定。
   - CIの設定（GitHub Actions等）

2. **日常の開発**:
   - Metals/IntelliJ IDEAを使用したコーディング。
   - `sbt ~compile`で継続的コンパイル。
   - `sbt ~test`で継続的テスト。
   - Ammoniteを使用した実験。

3. **コードレビュー前**:
   - `sbt scalafmtAll`でフォーマット。
   - `sbt scalafix`で静的解析。
   - `sbt test`でテスト実行。

4. **リリース前**:
   - `sbt dependencyUpdates`で依存関係の確認。
   - `sbt test`でテスト実行。
   - `sbt doc`でドキュメント生成。
   - `sbt package`/`sbt docker:publishLocal`でパッケージング。

## 関連情報

- [Scala公式サイト](https://www.scala-lang.org/)
- [sbt リファレンスマニュアル](https://www.scala-sbt.org/1.x/docs/)
- [Scalafmt ドキュメント](https://scalameta.org/scalafmt/)
- [Scalafix ドキュメント](https://scalacenter.github.io/scalafix/)
- [Scaladocの掟](scaladoc-01jpcvxfxmsb49cge8ewg55kah.md)
- [Scalaコーディングスタイル](scalastyle-01jpcvxfxmsb49cge8ewg55kae.md)
