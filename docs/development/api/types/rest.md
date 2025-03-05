---
description: 掟プロジェクトにおけるREST APIの設計と実装に関するガイドライン
tags: [development, api, rest]
aliases: [rest-api-guidelines]
---

# REST APIの掟

## 概要

このドキュメントは、掟プロジェクトにおけるREST APIの設計と実装に関するガイドラインを定義します。

## 基本原則

### URIの設計

1. リソース指向
   - 名詞を使用し、動詞は避ける
   - 複数形を使用する

   ```
   ✅ /api/v1/users
   ❌ /api/v1/getUser
   ```

   **実装例**:
   ```typescript
   // Express.jsでのルート定義例
   router.get('/api/v1/users', userController.listUsers);
   router.get('/api/v1/users/:userId', userController.getUser);
   ```

   **ユースケース**:
   - ユーザー管理API: `/api/v1/users`
   - 商品カタログAPI: `/api/v1/products`
   - 注文管理API: `/api/v1/orders`

2. 階層構造
   - 関連リソースは階層的に表現

   ```
   /api/v1/users/{userId}/posts
   /api/v1/users/{userId}/posts/{postId}/comments
   ```

   **実装例**:
   ```typescript
   // Express.jsでのネストしたルート定義例
   router.get('/api/v1/users/:userId/posts', postController.listUserPosts);
   router.get('/api/v1/users/:userId/posts/:postId', postController.getUserPost);
   router.get('/api/v1/users/:userId/posts/:postId/comments', commentController.listPostComments);
   ```

   **ユースケース**:
   - ユーザーの投稿一覧取得: `/api/v1/users/123/posts`
   - 特定の投稿のコメント一覧取得: `/api/v1/users/123/posts/456/comments`

### HTTPメソッド

- GET: リソースの取得
- POST: リソースの作成
- PUT: リソースの置換
- PATCH: リソースの部分更新
- DELETE: リソースの削除

**実装例**:
```typescript
// Express.jsでのCRUD操作の実装例
// ユーザーリソースのCRUD
router.get('/api/v1/users', userController.listUsers);           // 一覧取得
router.get('/api/v1/users/:userId', userController.getUser);     // 単一取得
router.post('/api/v1/users', userController.createUser);         // 作成
router.put('/api/v1/users/:userId', userController.replaceUser); // 置換
router.patch('/api/v1/users/:userId', userController.updateUser); // 部分更新
router.delete('/api/v1/users/:userId', userController.deleteUser); // 削除
```

**ユースケース**:
- ユーザー情報の取得: `GET /api/v1/users/123`
- 新規ユーザーの登録: `POST /api/v1/users`
- ユーザー情報の完全更新: `PUT /api/v1/users/123`
- ユーザー情報の部分更新: `PATCH /api/v1/users/123`
- ユーザーの削除: `DELETE /api/v1/users/123`

### ステータスコード

- 200: 成功
- 201: 作成成功
- 204: 成功（レスポンスボディなし）
- 400: リクエストエラー
- 401: 認証エラー
- 403: 認可エラー
- 404: リソースが存在しない
- 409: 競合
- 500: サーバーエラー

**実装例**:
```typescript
// Express.jsでのステータスコード使用例
const createUser = async (req, res) => {
  try {
    // バリデーション
    if (!req.body.email || !req.body.name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '必須フィールドが不足しています',
          details: [
            { field: !req.body.email ? 'email' : 'name', message: '必須フィールドです' }
          ]
        }
      });
    }

    // 既存ユーザーチェック
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'このメールアドレスは既に使用されています',
          details: { field: 'email' }
        }
      });
    }

    // ユーザー作成
    const user = await UserModel.create(req.body);
    
    // 201 Created で作成したリソースを返す
    return res.status(201).json({ data: user });
  } catch (error) {
    // サーバーエラー
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'サーバー内部エラーが発生しました'
      }
    });
  }
};
```

**ユースケース**:
- ユーザー作成成功: `201 Created`
- ユーザー情報更新成功: `200 OK`
- ユーザー削除成功: `204 No Content`
- 存在しないユーザーの取得: `404 Not Found`
- 権限のないリソースへのアクセス: `403 Forbidden`

## レスポンス形式

### 成功時

```json
{
  "data": {
    // リソースデータ
  },
  "meta": {
    "totalCount": 100,
    "page": 1,
    "perPage": 20
  }
}
```

**実装例**:
```typescript
// Express.jsでのレスポンス形式実装例
const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const skip = (page - 1) * perPage;
    
    const [users, totalCount] = await Promise.all([
      UserModel.find().skip(skip).limit(perPage),
      UserModel.countDocuments()
    ]);
    
    return res.status(200).json({
      data: users,
      meta: {
        totalCount,
        page,
        perPage,
        pageCount: Math.ceil(totalCount / perPage)
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'サーバー内部エラーが発生しました'
      }
    });
  }
};
```

**ユースケース**:
- ページネーション付きユーザー一覧:
  ```
  GET /api/v1/users?page=2&perPage=10
  ```
  ```json
  {
    "data": [
      { "id": "123", "name": "山田太郎", "email": "yamada@example.com" },
      { "id": "124", "name": "鈴木花子", "email": "suzuki@example.com" }
      // ...他のユーザー
    ],
    "meta": {
      "totalCount": 45,
      "page": 2,
      "perPage": 10,
      "pageCount": 5
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

**実装例**:
```typescript
// Express.jsでのバリデーションエラー処理例
const validateUser = (req, res, next) => {
  const errors = [];
  
  // メールアドレスのバリデーション
  if (req.body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      errors.push({ field: 'email', message: 'メールアドレスの形式が不正です' });
    }
  } else if (req.method === 'POST') {
    errors.push({ field: 'email', message: 'メールアドレスは必須です' });
  }
  
  // 名前のバリデーション
  if (!req.body.name && req.method === 'POST') {
    errors.push({ field: 'name', message: '名前は必須です' });
  }
  
  // エラーがあればエラーレスポンスを返す
  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'リクエストパラメータが不正です',
        details: errors
      }
    });
  }
  
  // エラーがなければ次のミドルウェアへ
  next();
};
```

**ユースケース**:
- 不正なメールアドレスでのユーザー登録:
  ```
  POST /api/v1/users
  Content-Type: application/json
  
  {
    "name": "山田太郎",
    "email": "invalid-email"
  }
  ```
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "リクエストパラメータが不正です",
      "details": [
        {
          "field": "email",
          "message": "メールアドレスの形式が不正です"
        }
      ]
    }
  }
  ```

## バージョニング

- URIベースのバージョニング

  ```
  /api/v1/resources
  /api/v2/resources
  ```

**実装例**:
```typescript
// Express.jsでのAPIバージョニング実装例
// v1 APIルーター
const v1Router = express.Router();
v1Router.get('/users', v1Controllers.listUsers);
v1Router.post('/users', v1Controllers.createUser);
app.use('/api/v1', v1Router);

// v2 APIルーター（新機能追加）
const v2Router = express.Router();
v2Router.get('/users', v2Controllers.listUsers);
v2Router.post('/users', v2Controllers.createUser);
v2Router.get('/users/:userId/stats', v2Controllers.getUserStats); // v2で追加された機能
app.use('/api/v2', v2Router);
```

**ユースケース**:
- 古いクライアントは引き続きv1 APIを使用:
  ```
  GET /api/v1/users
  ```
- 新しいクライアントはv2 APIの新機能を利用:
  ```
  GET /api/v2/users/123/stats
  ```

## セキュリティ

1. 認証
   - Bearer トークンの使用
   - APIキーの適切な管理

   **実装例**:
   ```typescript
   // Express.jsでのJWT認証ミドルウェア例
   const authMiddleware = (req, res, next) => {
     // Authorizationヘッダーの取得
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({
         error: {
           code: 'UNAUTHORIZED',
           message: '認証が必要です'
         }
       });
     }
     
     // トークンの検証
     const token = authHeader.split(' ')[1];
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({
         error: {
           code: 'INVALID_TOKEN',
           message: '無効なトークンです'
         }
       });
     }
   };
   
   // 認証が必要なルートに適用
   router.get('/api/v1/users/:userId/profile', authMiddleware, userController.getProfile);
   ```

2. 認可
   - 適切なスコープの定義
   - きめ細かなアクセス制御

   **実装例**:
   ```typescript
   // Express.jsでのロールベース認可ミドルウェア例
   const checkRole = (roles) => {
     return (req, res, next) => {
       // 認証済みユーザー情報の取得（authMiddlewareで設定）
       const { user } = req;
       
       if (!user) {
         return res.status(401).json({
           error: {
             code: 'UNAUTHORIZED',
             message: '認証が必要です'
           }
         });
       }
       
       // ユーザーのロールチェック
       if (!roles.includes(user.role)) {
         return res.status(403).json({
           error: {
             code: 'FORBIDDEN',
             message: 'このリソースにアクセスする権限がありません'
           }
         });
       }
       
       next();
     };
   };
   
   // 管理者のみアクセス可能なルート
   router.delete('/api/v1/users/:userId', authMiddleware, checkRole(['admin']), userController.deleteUser);
   ```

3. レート制限
   - 適切なレート制限の設定
   - 429ステータスコードの使用

   **実装例**:
   ```typescript
   // Express.jsでのレート制限実装例（express-rate-limitを使用）
   const rateLimit = require('express-rate-limit');
   
   // API全体のレート制限
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15分間
     max: 100, // 15分間に100リクエストまで
     standardHeaders: true,
     legacyHeaders: false,
     handler: (req, res) => {
       res.status(429).json({
         error: {
           code: 'RATE_LIMIT_EXCEEDED',
           message: 'リクエスト数の上限を超えました。しばらく経ってから再試行してください',
           details: {
             retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000)
           }
         }
       });
     }
   });
   
   // 認証エンドポイントの厳しいレート制限
   const authLimiter = rateLimit({
     windowMs: 60 * 60 * 1000, // 1時間
     max: 5, // 1時間に5回まで
     standardHeaders: true,
     legacyHeaders: false,
     handler: (req, res) => {
       res.status(429).json({
         error: {
           code: 'AUTH_RATE_LIMIT_EXCEEDED',
           message: '認証試行回数の上限を超えました。1時間後に再試行してください'
         }
       });
     }
   });
   
   // レート制限の適用
   app.use('/api/', apiLimiter);
   app.use('/api/v1/auth/login', authLimiter);
   ```

## ドキュメント化

- OpenAPI (Swagger) の使用
- エンドポイントの詳細な説明
- リクエスト/レスポンスの例示
- エラーケースの説明

**実装例**:
```javascript
// Express.jsでのSwagger設定例
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '掟プロジェクト API',
      version: '1.0.0',
      description: '掟プロジェクトのREST API仕様',
    },
    servers: [
      {
        url: 'https://api.okite-project.example.com/v1',
        description: '本番環境',
      },
      {
        url: 'https://staging-api.okite-project.example.com/v1',
        description: 'ステージング環境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // APIルート定義ファイルのパス
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**ユースケース**:
- APIドキュメントの例（ユーザー作成エンドポイント）:
  ```javascript
  /**
   * @swagger
   * /users:
   *   post:
   *     summary: 新規ユーザーを作成する
   *     description: ユーザー情報を受け取り、新しいユーザーを作成します
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 description: ユーザーの名前
   *               email:
   *                 type: string
   *                 format: email
   *                 description: ユーザーのメールアドレス
   *               password:
   *                 type: string
   *                 format: password
   *                 description: ユーザーのパスワード（8文字以上）
   *     responses:
   *       201:
   *         description: ユーザーが正常に作成された
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: ユーザーID
   *                     name:
   *                       type: string
   *                       description: ユーザー名
   *                     email:
   *                       type: string
   *                       description: メールアドレス
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       description: 作成日時
   *       400:
   *         description: バリデーションエラー
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: メールアドレスが既に使用されている
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  ```
