---
description: プロジェクトのコーディング規約と基本原則
tags: [coding, guidelines, standards]
aliases: [coding-standards, coding-guidelines]
---

# コーディングの掟

## 概要

このドキュメントは、プロジェクトにおけるコーディング規約と基本原則を定義します。
全ての開発者は、これらの規約に従ってコードを作成することが求められます。

## 基本原則

以下の原則は、全ての言語やフレームワークに共通する基本的な規約です：

- コーディング規約は言語の標準に従う（フォーマッターで自動適用）
- オブジェクト間の循環参照を避ける
- シンプルで理解しやすいコードを心がける

## コードの品質管理

コードの品質を維持するための具体的なガイドラインを提供します。

### コメントに関するルール

コメントは、コードの意図と理由を明確に伝えるために重要です：

- 全てのコメントは英語で記述する（コード上のコメント、ドキュメンテーションコメント共に）
- コードを読めば分かることはコメントに書かない
- コメントには以下を記述する
  - Why: なぜその実装が必要か
  - Why not: なぜ他の実装方法を選択しなかったか

### デバッグに関するルール

効果的なデバッグを可能にするための規約：

- 適切なログ出力を入れる
- ステップバイステップで解析可能にする
- デバッグログとアプリケーションログを区別する

## コード設計の原則

保守性と拡張性の高いコードを実現するための設計原則：

- 単一責任の原則を守る
- 依存関係を最小限に抑える
- テスト容易性を考慮した設計を行う

## 言語固有の規約

各プログラミング言語固有のコーディング規約とドキュメンテーションルールは以下を参照してください：

### Golang

- [Golangコーディング規約](coding/golang.md) - 基本的なコーディング規約
- [Golangドキュメンテーションルール](coding/golang/golangdoc.md) - ドキュメント作成ガイド
- [Golangコーディングスタイル](coding/golang/golangstyle.md) - 推奨されるコーディングスタイル
- [Golangツール活用](coding/golang/golangtools.md) - 開発ツールの使用方法
- [Golangコードレビュー](coding/golang/golangreview.md) - レビュー時のチェックポイント
- [Golang参考文献](coding/golang/golangrefs.md) - 推奨される学習リソース

### Rust

- [Rustコーディング規約](coding/rust.md) - Rust固有の規約とベストプラクティス
- [Rustドキュメンテーションルール](coding/rust/rustdoc.md) - Rustdocの活用方法

### Scala

- [Scalaコーディング規約](coding/scala.md) - Scala固有の規約とパターン
- [Scalaドキュメンテーションルール](coding/scala/scaladoc.md) - Scaladocの書き方

### TypeScript

- [TypeScriptコーディング規約](coding/typescript.md) - TypeScript固有の規約と型の使用方法
- [TypeScriptドキュメンテーションルール](coding/typescript/tsdoc.md) - TSDocの活用ガイド

## 共通ドキュメント

- [ドキュメントコメント規約](coding/doc_comment.md) - 言語共通のドキュメントコメント規約
