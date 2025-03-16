---
description: 掟プロジェクトにおけるREST APIの設計と実装に関するガイドライン
ruleId: rest-01jpcvxfxra1qd2v1btrrz4s2w
tags: [development, api, rest]
aliases: [rest-api-guidelines]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
---

# REST APIの掟

## 概要

このドキュメントは、掟プロジェクトにおけるREST APIの設計と実装に関するガイドラインを定義します。

## 基本原則

### URIの設計

1. リソース指向。
   - 名詞を使用し、動詞は避ける。
   - 複数形を使用する。

   ```
   ✅ /api/v1/users。
   ❌ /api/v1/getUser。
   ```

2. 階層構造。
   - 関連リソースは階層的に表現。

   ```
   /api/v1/users/{userId}/posts。
   /api/v1/users/{userId}/posts/{postId}/comments。
   ```

### HTTPメソッド

- GET: リソースの取得。
- POST: リソースの作成。
- PUT: リソースの置換。
- PATCH: リソースの部分更新。
- DELETE: リソースの削除。

### ステータスコード

- 200: 成功。
- 201: 作成成功。
- 204: 成功（レスポンスボディなし）
- 400: リクエストエラー。
- 401: 認証エラー。
- 403: 認可エラー。
- 404: リソースが存在しない。
- 409: 競合。
- 500: サーバーエラー。

## レスポンス形式

### 成功時

```json
{
  "data": {
    // リソースデータ。
  },
  "meta": {
    "totalCount": 100,
    "page": 1,
    "perPage": 20
  }
}
```

### エラー時

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## バージョニング

- URIベースのバージョニング。

  ```
  /api/v1/resources。
  /api/v2/resources。
  ```

## セキュリティ

1. 認証。
   - Bearer トークンの使用。
   - APIキーの適切な管理。

2. 認可。
   - 適切なスコープの定義。
   - きめ細かなアクセス制御。

3. レート制限。
   - 適切なレート制限の設定。
   - 429ステータスコードの使用。

## ドキュメント化

- OpenAPI (Swagger) の使用。
- エンドポイントの詳細な説明。
- リクエスト/レスポンスの例示。
- エラーケースの説明。