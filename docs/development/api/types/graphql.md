---
description: GraphQL APIドキュメントの作成ガイドライン
tags: [api, graphql, documentation]
aliases: [graphql-api-guidelines]
---

# GraphQL APIドキュメント作成ガイドライン

## 概要

このドキュメントは、GraphQL APIのドキュメント作成に関するガイドラインを定義します。

## スキーマ定義

### 型定義

```graphql
type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}
```

- 必須フィールドの指定方法
- リレーション定義の方針
- カスタムスカラーの使用基準

**実装例**:
```graphql
# スキーマ定義例
# カスタムスカラー定義
scalar DateTime
scalar EmailAddress

# ユーザー型定義
type User {
  id: ID!                      # 必須の一意識別子
  name: String!                # 必須のユーザー名
  email: EmailAddress          # カスタムスカラーを使用したメールアドレス
  profileImage: String         # オプションのプロフィール画像URL
  role: UserRole!              # 必須のユーザーロール（列挙型）
  posts: [Post!]!              # 投稿の配列（空配列可、要素はnull不可）
  comments: [Comment!]!        # コメントの配列（空配列可、要素はnull不可）
  createdAt: DateTime!         # 作成日時
  updatedAt: DateTime!         # 更新日時
}

# 投稿型定義
type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!                # ユーザーへの参照（リレーション）
  comments: [Comment!]!        # コメントへの参照（リレーション）
  tags: [Tag!]                 # タグへの参照（オプション）
  createdAt: DateTime!
  updatedAt: DateTime!
}

# コメント型定義
type Comment {
  id: ID!
  content: String!
  author: User!                # ユーザーへの参照
  post: Post!                  # 投稿への参照
  createdAt: DateTime!
}

# タグ型定義
type Tag {
  id: ID!
  name: String!
  posts: [Post!]!              # 多対多リレーション
}

# ユーザーロール列挙型
enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}
```

**ユースケース**:
- 基本型定義: ID、文字列、真偽値などの基本データ型の使用
- カスタムスカラー: 特殊なデータ型（日時、メールアドレスなど）の定義
- リレーション: 一対多（User-Posts）、多対多（Posts-Tags）の関係定義
- 列挙型: 固定値セット（ユーザーロールなど）の定義

### クエリ設計

```graphql
type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}
```

- ページネーションの実装
- フィルタリングの設計
- N+1問題への対応

**実装例**:
```graphql
# クエリ定義例
type Query {
  # 単一ユーザー取得
  user(id: ID!): User
  
  # ユーザー一覧取得（Relay風ページネーション）
  users(
    first: Int
    after: String
    filter: UserFilterInput
    orderBy: UserOrderByInput
  ): UserConnection!
  
  # 投稿一覧取得（オフセットベースページネーション）
  posts(
    page: Int = 1
    perPage: Int = 10
    filter: PostFilterInput
    orderBy: PostOrderByInput
  ): PostPaginatedResult!
  
  # 投稿検索（全文検索）
  searchPosts(
    query: String!
    page: Int = 1
    perPage: Int = 10
  ): PostPaginatedResult!
}

# Relay風ページネーション用の型
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# オフセットベースページネーション用の型
type PostPaginatedResult {
  items: [Post!]!
  meta: PaginationMeta!
}

type PaginationMeta {
  currentPage: Int!
  perPage: Int!
  totalItems: Int!
  totalPages: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

# フィルタリング用の入力型
input UserFilterInput {
  name: StringFilterInput
  email: StringFilterInput
  role: UserRole
  createdAt: DateTimeFilterInput
}

input StringFilterInput {
  eq: String
  contains: String
  startsWith: String
  endsWith: String
  in: [String!]
}

input DateTimeFilterInput {
  eq: DateTime
  gt: DateTime
  gte: DateTime
  lt: DateTime
  lte: DateTime
  between: DateTimeRangeInput
}

input DateTimeRangeInput {
  from: DateTime!
  to: DateTime!
}

# ソート用の入力型
input UserOrderByInput {
  field: UserOrderByField!
  direction: OrderDirection! = ASC
}

enum UserOrderByField {
  NAME
  EMAIL
  CREATED_AT
  UPDATED_AT
}

enum OrderDirection {
  ASC
  DESC
}
```

**ユースケース**:
- Relay風ページネーション: カーソルベースのページネーションで大規模データセットを効率的に処理
  ```graphql
  # 最初の10件を取得
  query {
    users(first: 10) {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  
  # 次の10件を取得
  query {
    users(first: 10, after: "cursor_value") {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  ```

- 複合フィルタリング: 複数条件での絞り込み
  ```graphql
  query {
    users(
      filter: {
        name: { contains: "山田" }
        role: ADMIN
        createdAt: { gte: "2023-01-01T00:00:00Z" }
      }
    ) {
      edges {
        node {
          id
          name
          email
        }
      }
    }
  }
  ```

- N+1問題への対応: データローダーパターンの実装
  ```javascript
  // Apollo Serverでのデータローダー実装例
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
      return {
        // バッチ処理によるN+1問題の解決
        userLoader: new DataLoader(async (ids) => {
          const users = await UserModel.findByIds(ids);
          // IDでソートされた結果を返す
          return ids.map(id => users.find(user => user.id === id));
        }),
        postsByUserLoader: new DataLoader(async (userIds) => {
          const posts = await PostModel.findByUserIds(userIds);
          // ユーザーIDごとに投稿をグループ化
          return userIds.map(userId => 
            posts.filter(post => post.userId === userId)
          );
        })
      };
    }
  });
  
  // リゾルバーでのデータローダー使用例
  const resolvers = {
    User: {
      posts: async (user, args, { postsByUserLoader }) => {
        return postsByUserLoader.load(user.id);
      }
    },
    Query: {
      user: async (_, { id }, { userLoader }) => {
        return userLoader.load(id);
      }
    }
  };
  ```

### ミューテーション設計

```graphql
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}

input CreateUserInput {
  name: String!
  email: String!
}
```

- 入力型の設計
- ペイロード型の設計
- エラー処理の方針

**実装例**:
```graphql
# ミューテーション定義例
type Mutation {
  # ユーザー作成
  createUser(input: CreateUserInput!): CreateUserPayload!
  
  # ユーザー更新
  updateUser(input: UpdateUserInput!): UpdateUserPayload!
  
  # ユーザー削除
  deleteUser(input: DeleteUserInput!): DeleteUserPayload!
  
  # 投稿作成
  createPost(input: CreatePostInput!): CreatePostPayload!
  
  # 投稿公開/非公開切り替え
  togglePostPublished(input: TogglePostPublishedInput!): TogglePostPublishedPayload!
}

# 入力型の例
input CreateUserInput {
  name: String!
  email: String!
  password: String!
  role: UserRole = VIEWER
}

input UpdateUserInput {
  id: ID!
  name: String
  email: String
  profileImage: String
}

input DeleteUserInput {
  id: ID!
}

input CreatePostInput {
  title: String!
  content: String!
  published: Boolean = false
  tagIds: [ID!]
}

input TogglePostPublishedInput {
  id: ID!
}

# ペイロード型の例
type CreateUserPayload {
  user: User
  errors: [UserError!]
}

type UpdateUserPayload {
  user: User
  errors: [UserError!]
}

type DeleteUserPayload {
  success: Boolean!
  errors: [UserError!]
}

type CreatePostPayload {
  post: Post
  errors: [UserError!]
}

type TogglePostPublishedPayload {
  post: Post
  errors: [UserError!]
}

# エラー型
type UserError {
  message: String!
  path: [String!]
  code: ErrorCode!
}

enum ErrorCode {
  INVALID_INPUT
  UNAUTHORIZED
  FORBIDDEN
  NOT_FOUND
  ALREADY_EXISTS
  INTERNAL_ERROR
}
```

**ユースケース**:
- 入力検証: 入力型を使用した強力な型チェックとバリデーション
  ```graphql
  mutation {
    createUser(input: {
      name: "山田太郎",
      email: "yamada@example.com",
      password: "secure_password123"
    }) {
      user {
        id
        name
        email
      }
      errors {
        message
        path
        code
      }
    }
  }
  ```

- エラー処理: 構造化されたエラー情報の返却
  ```graphql
  # レスポンス例（エラーあり）
  {
    "data": {
      "createUser": {
        "user": null,
        "errors": [
          {
            "message": "このメールアドレスは既に使用されています",
            "path": ["input", "email"],
            "code": "ALREADY_EXISTS"
          }
        ]
      }
    }
  }
  ```

- 複合操作: 単一リクエストでの複数操作
  ```graphql
  mutation {
    # 投稿作成
    createPost(input: {
      title: "GraphQLの基本",
      content: "GraphQLは...",
      published: true,
      tagIds: ["tag1", "tag2"]
    }) {
      post {
        id
        title
      }
      errors {
        message
      }
    }
    
    # 同時にユーザー更新
    updateUser(input: {
      id: "user1",
      profileImage: "https://example.com/profile.jpg"
    }) {
      user {
        id
        profileImage
      }
      errors {
        message
      }
    }
  }
  ```

**サーバー側実装例**:
```javascript
// Apollo Serverでのミューテーションリゾルバー実装例
const resolvers = {
  Mutation: {
    createUser: async (_, { input }, { dataSources }) => {
      try {
        // 入力検証
        const errors = validateUserInput(input);
        if (errors.length > 0) {
          return { user: null, errors };
        }
        
        // メールアドレス重複チェック
        const existingUser = await dataSources.userAPI.findByEmail(input.email);
        if (existingUser) {
          return {
            user: null,
            errors: [{
              message: "このメールアドレスは既に使用されています",
              path: ["input", "email"],
              code: "ALREADY_EXISTS"
            }]
          };
        }
        
        // パスワードハッシュ化
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // ユーザー作成
        const user = await dataSources.userAPI.createUser({
          ...input,
          password: hashedPassword
        });
        
        return { user, errors: [] };
      } catch (error) {
        console.error("ユーザー作成エラー:", error);
        return {
          user: null,
          errors: [{
            message: "内部エラーが発生しました",
            path: [],
            code: "INTERNAL_ERROR"
          }]
        };
      }
    }
  }
};
```

## ドキュメント生成

### スキーマ文書化

- GraphQL Docgenの利用
- インラインドキュメントの記述
- 例示の提供方法

### プレイグラウンド

- GraphQL Playgroundの設定
- クエリ例の提供
- 認証情報の扱い

## セキュリティ

### クエリ複雑性

- クエリの深さ制限
- フィールド制限
- レート制限

### 認証・認可

- JWT認証の実装
- 権限管理
- センシティブデータの保護
