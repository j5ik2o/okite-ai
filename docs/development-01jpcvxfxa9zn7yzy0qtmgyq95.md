---
description: プロジェクトの開発プロセスと規約の全体像
ruleId: development-01jpcvxfxa9zn7yzy0qtmgyq95
tags:
  - development
  - process
  - guidelines
aliases:
  - dev-guidelines
  - development-rules
globs:
  - '**/*'
---


# 開発の掟

## 概要

このドキュメントは、プロジェクトにおける開発プロセス全体の指針と規約を定義します。
各開発者は、これらの規約に従って開発を進めることが求められます。

## 開発プロセス

### コーディング

- [コーディングの掟](development/coding-01jpcvxfxca2m945xeb4tjn95b.md) - 言語共通のコーディング規約
  - [Golangの掟](development/coding/golang-01jpcvxfxgyqe2jprh9hgn6xq7.md) - Go言語固有の規約
  - [Rustの掟](development/coding/rust-01jpcvxfxf9jafj03jk1zks31y.md) - Rust言語固有の規約
  - [Scalaの掟](development/coding/scala-01jpcvxfxf9jafj03jk1zks31x.md) - Scala言語固有の規約
  - [TypeScriptの掟](development/coding/typescript-01jpcvxfxf9jafj03jk1zks31w.md) - TypeScript固有の規約
  - [ドキュメントコメントの掟](development/coding/doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md) - コードコメントの書き方

### ドキュメント

- [ドキュメント規約](development/document-01jpfcn4mphghcm0jaj3wy7b7j.md) - 開発ドキュメントの作成規約
  - API仕様書。
  - 設計ドキュメント。
  - 運用ドキュメント。

### テスト

- [テスト戦略](development/testing-01jpcvxfxbfm6z9tc89zm9c37c.md) - テストコードの作成規約
  - [ユニットテスト](development/testing/unit-testing-01jpfcdnrsxk3j5vqvjgqp2f6t.md) - ユニットテストの作成と実行
  - [ベンチマークの掟](development/testing/benchmark-01jpcvxfxe99ev6x7f60xvbk8t.md) - パフォーマンステストの作成と実行

### レビュー

- [プルリクエストの掟](development/pull-request-01jpcvxfxbfm6z9tc89zm9c37d.md) - PRの作成とレビューのガイドライン

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
