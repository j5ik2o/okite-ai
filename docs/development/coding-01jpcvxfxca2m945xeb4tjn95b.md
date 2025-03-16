---
description: プロジェクトのコーディング規約と基本原則
ruleId: coding-01jpcvxfxca2m945xeb4tjn95b
tags:
  - coding
  - guidelines
  - standards
aliases:
  - coding-standards
  - coding-guidelines
globs:
  - '**/*.go'
  - '**/*.rs'
  - '**/*.scala'
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---


# コーディングの掟

## 概要

このドキュメントは、プロジェクトにおけるコーディング規約と基本原則を定義します。
全ての開発者は、これらの規約に従ってコードを作成することが求められます。

## 基本原則

以下の原則は、全ての言語やフレームワークに共通する基本的な規約です：。

- コーディング規約は言語の標準に従う（フォーマッターで自動適用）
- オブジェクト間の循環参照を避ける。
- シンプルで理解しやすいコードを心がける。

## コードの品質管理

コードの品質を維持するための具体的なガイドラインを提供します。

### コメントに関するルール

コメントは、コードの意図と理由を明確に伝えるために重要です：。

- 全てのコメントは英語で記述する（コード上のコメント、ドキュメントコメント共に）
- コードを読めば分かることはコメントに書かない。
- コメントには以下を記述する。
  - Why: なぜその実装が必要か。
  - Why not: なぜ他の実装方法を選択しなかったか。

### デバッグに関するルール

効果的なデバッグを可能にするための規約：。

- 適切なログ出力を入れる。
- ステップバイステップで解析可能にする。
- デバッグログとアプリケーションログを区別する。

## コード設計の原則

保守性と拡張性の高いコードを実現するための設計原則：。

- 単一責任の原則を守る。
- 依存関係を最小限に抑える。
- テスト容易性を考慮した設計する。

## 言語固有の規約

各プログラミング言語固有のコーディング規約とドキュメントルールは以下を参照してください：。

### Golang

- [Golangの掟](coding/golang-01jpcvxfxgyqe2jprh9hgn6xq7.md) - 基本的なコーディング規約
- [Golangdocの掟](coding/golang/golangdoc-01jpcvxfxqe37ka9pn3xb4m9yr.md) - ドキュメント作成ガイド
- [Golangコーディングスタイル](coding/golang/golangstyle-01jpcvxfxpsvpepv85myk6s6bg.md) - 推奨されるコーディングスタイル
- [Golangツール活用](coding/golang/golangtools-01jpcvxfxpsvpepv85myk6s6bf.md) - 開発ツールの使用方法
- [Golangコードレビュー](coding/golang/golangreview-01jpcvxfxpsvpepv85myk6s6bh.md) - レビュー時のチェックポイント
- [Golang参考文献](coding/golang/golangrefs-01jpcvxfxpsvpepv85myk6s6bj.md) - 推奨される学習リソース

### Rust

- [Rustの掟](coding/rust-01jpcvxfxf9jafj03jk1zks31y.md) - Rust固有の規約とベストプラクティス
- [Rustdocの掟](coding/rust/rustdoc-01jpcvxfxpsvpepv85myk6s6be.md) - Rustdocの活用方法

### Scala

- [Scalaの掟](coding/scala-01jpcvxfxf9jafj03jk1zks31x.md) - Scala固有の規約とパターン
- [Scaladocの掟](coding/scala/scaladoc-01jpcvxfxmsb49cge8ewg55kah.md) - Scaladocの書き方

### TypeScript

- [TypeScriptの掟](coding/typescript-01jpcvxfxf9jafj03jk1zks31w.md) - TypeScript固有の規約と型の使用方法
- [TSDocの掟](coding/typescript/tsdoc-01jpcvxfxjwwn785s5jg7t1773.md) - TSDocの活用ガイド

## 共通ドキュメント

- [ドキュメントコメントの掟](coding/doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md) - 言語共通のドキュメントコメント規約
