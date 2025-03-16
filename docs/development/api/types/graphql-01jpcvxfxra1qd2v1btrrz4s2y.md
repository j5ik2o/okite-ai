---
description: GraphQL APIドキュメントの作成ガイドライン
ruleId: graphql-01jpcvxfxra1qd2v1btrrz4s2y
tags: [api, graphql, documentation]
aliases: [graphql-api-guidelines]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
---

# GraphQL APIドキュメント作成ガイドライン

## 概要

このドキュメントは、GraphQL APIのドキュメント作成に関するガイドラインを定義します。

## スキーマ定義

### 型定義

```graphql
type User {。
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}
```

- 必須フィールドの指定方法。
- リレーション定義の方針。
- カスタムスカラーの使用基準。

### クエリ設計

```graphql
type Query {。
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}
```

- ページネーションの実装。
- フィルタリングの設計。
- N+1問題への対応。

### ミューテーション設計

```graphql
type Mutation {。
  createUser(input: CreateUserInput!): CreateUserPayload!
}

input CreateUserInput {。
  name: String!
  email: String!
}
```

- 入力型の設計。
- ペイロード型の設計。
- エラー処理の方針。

## ドキュメント生成

### スキーマ文書化

- GraphQL Docgenの利用。
- インラインドキュメントの記述。
- 例示の提供方法。

### プレイグラウンド

- GraphQL Playgroundの設定。
- クエリ例の提供。
- 認証情報の扱い。

## セキュリティ

### クエリ複雑性

- クエリの深さ制限。
- フィールド制限。
- レート制限。

### 認証・認可

- JWT認証の実装。
- 権限管理。
- センシティブデータの保護。