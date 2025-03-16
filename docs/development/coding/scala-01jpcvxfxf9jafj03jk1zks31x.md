---
description: Scalaのコーディング規約と開発ガイドライン
ruleId: scala-01jpcvxfxf9jafj03jk1zks31x
tags:
  - scala
  - coding
  - guidelines
aliases:
  - scala-rules
  - scala-guidelines
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
  - '**/*.go'
  - '**/*.rs'
  - '**/*.scala'
---

# Scalaの掟

## 基本原則

- [Scala Style Guide](https://docs.scala-lang.org/style/)に従う
- scalafmtを使用してコードフォーマットを統一する。
- scalafix, wartremoverを使用してコード品質を維持する。
- 関数型プログラミングの原則を重視する。

## モジュール構成

Scalaのコーディング規約は以下のモジュールに分かれています：。

- [Scaladocの掟](scala/scaladoc-01jpcvxfxmsb49cge8ewg55kah.md) - コードドキュメントの書き方
- [Scalaコーディングスタイル](scala/scalastyle-01jpcvxfxmsb49cge8ewg55kae.md) - 命名規則、コード構造、関数型プログラミングなど
- [Scalaツール活用](scala/scalatools-01jpcvxfxk935q9x97vbpfp9ta.md) - 開発ツールの使用方法
- [Scalaコードレビュー](scala/scalareview-01jpcvxfxmsb49cge8ewg55kaf.md) - レビュー時のチェックポイント
- [Scala参考文献](scala/scalarefs-01jpcvxfxmsb49cge8ewg55kag.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- クラス名はパスカルケース、変数・メソッド名はキャメルケースを使用する。
- 可変状態（`var`）の使用は最小限に抑える。
- 副作用は明示的に分離し、純粋関数を優先する。
- `Option`、`Either`、`Try`を使用して型安全なエラー処理する。
- テストは網羅的に書き、エッジケースも考慮する。

### 必須ツール

- `sbt` - ビルドツール。
- `scalafmt` - コードフォーマッター。
- `scalafix` - リファクタリングツール。
- `wartremover` - コード品質チェック。
- `metals` - 言語サーバー。
