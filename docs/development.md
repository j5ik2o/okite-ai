---
description: プロジェクトの開発プロセスと規約の全体像
ruleId: 01JPCVXFXA9ZN7YZY0QTMGYQ95
tags: [development, process, guidelines]
aliases: [dev-guidelines, development-rules]
globs: ["**/*"]
---


# 開発の掟

## 概要

このドキュメントは、プロジェクトにおける開発プロセス全体の指針と規約を定義します。
各開発者は、これらの規約に従って開発を進めることが求められます。

## 開発プロセス

### コーディング

- [コーディング規約](development/coding.md) - 言語共通のコーディング規約
  - [Golang](development/coding/golang.md) - Go言語固有の規約
  - [Rust](development/coding/rust.md) - Rust言語固有の規約
  - [Scala](development/coding/scala.md) - Scala言語固有の規約
  - [TypeScript](development/coding/typescript.md) - TypeScript固有の規約
  - [ドキュメントコメント](development/coding/doc_comment.md) - コードコメントの書き方

### ドキュメント

- [ドキュメント規約](development/document.md) - 開発ドキュメントの作成規約
  - API仕様書。
  - 設計ドキュメント。
  - 運用ドキュメント。

### テスト

- [テスト規約](development/testing.md) - テストコードの作成規約
  - [ユニットテスト](development/testing/unit-testing.md) - ユニットテストの作成と実行
  - [ベンチマーク](development/testing/benchmark.md) - パフォーマンステストの作成と実行

### レビュー

- [プルリクエスト規約](development/pull-request.md) - PRの作成とレビューのガイドライン

## 開発フロー

1. 要件定義・設計。
   - 機能要件の明確化。
   - アーキテクチャ設計。
   - インタフェース設計。

2. 実装。
   - コーディング規約に従った実装。
   - 適切なドキュメント作成。
   - ユニットテストの作成。

3. レビュー。
   - コードレビュー。
   - ドキュメントレビュー。
   - テストケースレビュー。

4. テスト。
   - ユニットテストの実行。
   - 統合テストの実行。
   - E2Eテストの実行。

5. デプロイ。
   - ステージング環境への展開。
   - 本番環境への展開。
   - 監視体制の確認。

## 品質基準

1. コード品質。
   - 静的解析ツールのチェックをパス。
   - テストカバレッジ基準の達成。
   - パフォーマンス要件の達成。

2. ドキュメント品質。
   - 最新状態の維持。
   - 完全性と正確性。
   - 可読性と理解のしやすさ。

3. テスト品質。
   - テストケースの網羅性。
   - テスト実行の安定性。
   - 自動化率の維持。