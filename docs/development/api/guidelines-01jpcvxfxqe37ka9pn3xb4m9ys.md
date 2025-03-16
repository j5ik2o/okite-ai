---
description: API設計とドキュメント作成のガイドライン
ruleId: guidelines-01jpcvxfxqe37ka9pn3xb4m9ys
tags:
  - api
  - development
  - guidelines
aliases:
  - api-guidelines
globs:
  - '**/api/**/*'
  - '**/controllers/**/*'
  - '**/routes/**/*'
  - '**/*.proto'
  - '**/graphql/**/*'
  - '**/schema.graphql'
---


# API設計・ドキュメント作成ガイドライン

## 概要

このドキュメントは、APIの設計とドキュメント作成に関するガイドラインを定義します。
各APIタイプ（REST、gRPC、GraphQL）に特化したガイドラインは、それぞれのサブドキュメントを参照してください。

## API設計原則

### 一貫性

- 命名規則の統一。
  - リソース名：単数形/複数形の一貫した使用。
  - メソッド名：動詞の統一（get/fetch/retrieveなど）
  - パラメータ名：共通パラメータの命名統一。

- バージョニング。
  - セマンティックバージョニングの採用。
  - 後方互換性の維持方針。
  - 非推奨化のプロセス。

### セキュリティ

- 認証方式。
  - Bearer Token認証。
  - API Key認証。
  - OAuth 2.0。
  - カスタム認証ヘッダー。

- 認可。
  - ロールベースアクセス制御（RBAC）
  - 属性ベースアクセス制御（ABAC）
  - スコープベースの権限管理。

### エラー処理

- エラーレスポンス形式。

  ```json
  {
    "code": "INVALID_PARAMETER",
    "message": "パラメータが不正です",
    "details": {
      "field": "email",
      "reason": "メールアドレスの形式が不正です"
    }
  }
  ```

- HTTPステータスコード/gRPCステータスコード。
  - 適切なステータスコードの選択。
  - カスタムエラーコードの定義。
  - エラーメッセージの多言語対応。

### パフォーマンス

- レート制限。
  - API単位の制限。
  - ユーザー/クライアント単位の制限。
  - 超過時の対応。

- キャッシュ。
  - キャッシュヘッダーの設定。
  - キャッシュ無効化の方針。
  - 条件付きリクエスト。

## ドキュメント要件

### 基本情報

- API概要。
  - 目的と用途。
  - 主要機能。
  - 技術スタック。

- 前提条件。
  - 必要な認証情報。
  - 環境要件。
  - 依存関係。

### インタフェース仕様

- エンドポイント/メソッド。
  - 完全なURI/メソッド名。
  - リクエスト/レスポンスの形式。
  - パラメータの制約。

- データ型。
  - 基本データ型の定義。
  - カスタム型の説明。
  - バリデーションルール。

### 使用例

- 基本的な使用例。

  ```bash
  # リクエスト例。
  curl -X POST \。
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "example"}' \
    https://api.example.com/v1/resources
  ```

- エラーケース。
  - よくあるエラーとその対処法。
  - トラブルシューティングガイド。

### 運用情報

- モニタリング。
  - 監視メトリクス。
  - アラート設定。
  - ログ形式。

- SLA/SLO。
  - 可用性目標。
  - レイテンシー要件。
  - エラーレート閾値。

## 各API仕様書

- [REST APIの掟](types/rest-01jpcvxfxra1qd2v1btrrz4s2w.md)
- [gRPC APIドキュメント作成ガイドライン](types/grpc-01jpcvxfxra1qd2v1btrrz4s2x.md)
- [GraphQL APIドキュメント作成ガイドライン](types/graphql-01jpcvxfxra1qd2v1btrrz4s2y.md)
