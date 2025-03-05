---
description: API設計とドキュメント作成のガイドライン
tags: [api, development, guidelines]
aliases: [api-guidelines]
---

# API設計・ドキュメント作成ガイドライン

## 概要

このドキュメントは、APIの設計とドキュメント作成に関するガイドラインを定義します。
各APIタイプ（REST、gRPC、GraphQL）に特化したガイドラインは、それぞれのサブドキュメントを参照してください。

## API設計原則

### 一貫性

- 命名規則の統一
  - リソース名：単数形/複数形の一貫した使用
  - メソッド名：動詞の統一（get/fetch/retrieveなど）
  - パラメータ名：共通パラメータの命名統一

- バージョニング
  - セマンティックバージョニングの採用
  - 後方互換性の維持方針
  - 非推奨化のプロセス

### セキュリティ

- 認証方式
  - Bearer Token認証
  - API Key認証
  - OAuth 2.0
  - カスタム認証ヘッダー

- 認可
  - ロールベースアクセス制御（RBAC）
  - 属性ベースアクセス制御（ABAC）
  - スコープベースの権限管理

**実装例**:
```typescript
// TypeScriptでのJWT認証実装例
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT設定
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';

// JWTペイロードインターフェース
interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

// JWTトークン生成関数
function generateToken(user: { id: string; email: string; roles: string[] }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// JWT認証ミドルウェア
function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '認証が必要です'
      }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // リクエストにユーザー情報を追加
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles
    };
    
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: '認証トークンの有効期限が切れています'
        }
      });
    }
    
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: '無効な認証トークンです'
      }
    });
  }
}

// ロールベースアクセス制御（RBAC）ミドルウェア
function authorize(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です'
        }
      });
    }
    
    const hasRequiredRole = requiredRoles.some(role => req.user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'アクセス権限がありません'
        }
      });
    }
    
    next();
  };
}

// OAuth 2.0認証実装例
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

// OAuth 2.0設定
const oauth2Options = {
  authorizationURL: 'https://provider.example.com/oauth2/authorize',
  tokenURL: 'https://provider.example.com/oauth2/token',
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: 'https://api.example.com/auth/callback'
};

// OAuth 2.0ストラテジー設定
passport.use(new OAuth2Strategy(oauth2Options,
  async (accessToken, refreshToken, profile, done) => {
    try {
      // ユーザー情報取得
      const userInfo = await fetchUserInfo(accessToken);
      
      // ユーザー検索または作成
      let user = await userService.findByExternalId(userInfo.id);
      
      if (!user) {
        user = await userService.createFromOAuth({
          externalId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          // 他の必要な情報
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// OAuth 2.0ルート設定
app.get('/auth/provider',
  passport.authenticate('oauth2', { scope: ['profile', 'email'] })
);

app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    // 認証成功時の処理
    const token = generateToken(req.user);
    res.redirect(`/auth/success?token=${token}`);
  }
);
```

**ユースケース**:
- JWT認証: APIアクセスの認証
  ```
  // リクエスト例
  GET /api/users/me HTTP/1.1
  Host: api.example.com
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  // レスポンス例
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
    "data": {
      "user": {
        "id": "123",
        "email": "user@example.com",
        "name": "山田太郎"
      }
    }
  }
  ```

- ロールベースアクセス制御: 権限に基づくAPIアクセス制限
  ```
  // 管理者ユーザーのリクエスト
  GET /api/admin/users HTTP/1.1
  Host: api.example.com
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  // 成功レスポンス
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
    "data": {
      "users": [...]
    }
  }
  
  // 一般ユーザーのリクエスト
  GET /api/admin/users HTTP/1.1
  Host: api.example.com
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  // 権限エラーレスポンス
  HTTP/1.1 403 Forbidden
  Content-Type: application/json
  
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "アクセス権限がありません"
    }
  }
  ```

- OAuth 2.0認証フロー: サードパーティ認証
  ```
  // 1. 認証リクエスト
  GET /auth/provider HTTP/1.1
  Host: api.example.com
  
  // 2. 認証プロバイダーにリダイレクト
  HTTP/1.1 302 Found
  Location: https://provider.example.com/oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&scope=profile+email
  
  // 3. 認証コードを含むコールバック
  GET /auth/callback?code=abc123 HTTP/1.1
  Host: api.example.com
  
  // 4. 認証成功後のリダイレクト
  HTTP/1.1 302 Found
  Location: /auth/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### エラー処理

- エラーレスポンス形式

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

- HTTPステータスコード/gRPCステータスコード
  - 適切なステータスコードの選択
  - カスタムエラーコードの定義
  - エラーメッセージの多言語対応

**実装例**:
```typescript
// TypeScriptでのエラーハンドリング実装例
// エラーコード定義
enum ErrorCode {
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// エラー詳細インターフェース
interface ErrorDetail {
  field?: string;
  reason: string;
}

// APIエラーレスポンスインターフェース
interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  details?: ErrorDetail | ErrorDetail[];
}

// エラーハンドラーミドルウェア
function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // デフォルトエラーレスポンス
  const errorResponse: ApiErrorResponse = {
    code: ErrorCode.INTERNAL_ERROR,
    message: '内部エラーが発生しました'
  };
  
  let statusCode = 500;
  
  // エラータイプに基づいて適切なレスポンスを設定
  if (err instanceof ValidationError) {
    statusCode = 400;
    errorResponse.code = ErrorCode.INVALID_PARAMETER;
    errorResponse.message = 'パラメータが不正です';
    errorResponse.details = err.errors.map(e => ({
      field: e.path,
      reason: e.message
    }));
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorResponse.code = ErrorCode.UNAUTHORIZED;
    errorResponse.message = '認証が必要です';
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    errorResponse.code = ErrorCode.FORBIDDEN;
    errorResponse.message = 'アクセス権限がありません';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorResponse.code = ErrorCode.NOT_FOUND;
    errorResponse.message = 'リソースが見つかりません';
    if (err.resource) {
      errorResponse.details = {
        reason: `${err.resource}が見つかりません`
      };
    }
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    errorResponse.code = ErrorCode.CONFLICT;
    errorResponse.message = 'リソースの競合が発生しました';
    if (err.details) {
      errorResponse.details = err.details;
    }
  }
  
  // 多言語対応
  if (req.headers['accept-language']) {
    const lang = req.headers['accept-language'].split(',')[0].trim();
    if (translations[lang] && translations[lang][errorResponse.code]) {
      errorResponse.message = translations[lang][errorResponse.code];
    }
  }
  
  // エラーログ記録（内部エラーの場合のみスタックトレースを記録）
  if (statusCode === 500) {
    logger.error('Internal server error', { error: err.stack, requestId: req.id });
  } else {
    logger.warn('Client error', { 
      statusCode, 
      errorCode: errorResponse.code, 
      requestId: req.id 
    });
  }
  
  // エラーレスポンス送信
  res.status(statusCode).json({ error: errorResponse });
}

// 使用例
app.use(errorHandler);

// エンドポイントでのエラー発生例
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User', req.params.id);
    }
    res.json({ data: user });
  } catch (err) {
    next(err); // エラーハンドラーミドルウェアにエラーを渡す
  }
});
```

**ユースケース**:
- バリデーションエラー: フォーム入力やAPIリクエストのパラメータ検証
  ```
  HTTP/1.1 400 Bad Request
  Content-Type: application/json
  
  {
    "error": {
      "code": "INVALID_PARAMETER",
      "message": "パラメータが不正です",
      "details": [
        {
          "field": "email",
          "reason": "メールアドレスの形式が不正です"
        },
        {
          "field": "password",
          "reason": "パスワードは8文字以上である必要があります"
        }
      ]
    }
  }
  ```

- リソース競合エラー: 一意制約違反や楽観的ロック失敗
  ```
  HTTP/1.1 409 Conflict
  Content-Type: application/json
  
  {
    "error": {
      "code": "CONFLICT",
      "message": "リソースの競合が発生しました",
      "details": {
        "field": "email",
        "reason": "このメールアドレスは既に使用されています"
      }
    }
  }
  ```

- 多言語対応エラーメッセージ: 国際化対応
  ```
  // 英語
  HTTP/1.1 404 Not Found
  Content-Type: application/json
  Accept-Language: en
  
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "Resource not found",
      "details": {
        "reason": "User with ID 123 not found"
      }
    }
  }
  
  // 日本語
  HTTP/1.1 404 Not Found
  Content-Type: application/json
  Accept-Language: ja
  
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "リソースが見つかりません",
      "details": {
        "reason": "ID 123のユーザーが見つかりません"
      }
    }
  }
  ```

### パフォーマンス

- レート制限
  - API単位の制限
  - ユーザー/クライアント単位の制限
  - 超過時の対応

- キャッシュ
  - キャッシュヘッダーの設定
  - キャッシュ無効化の方針
  - 条件付きリクエスト

**実装例**:
```typescript
// TypeScriptでのレート制限実装例
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Redisクライアント
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// グローバルレート制限（全APIエンドポイント共通）
const globalLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore: 型定義の問題
    sendCommand: (...args: any[]) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15分間
  max: 100, // IPアドレスごとに15分間で100リクエストまで
  standardHeaders: true, // X-RateLimit-* ヘッダーを含める
  legacyHeaders: false, // X-RateLimit-* ヘッダーを含めない
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'リクエスト数の上限を超えました。しばらく経ってから再試行してください。'
    }
  }
});

// 認証済みユーザー用のレート制限（ユーザーIDベース）
const authenticatedLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore: 型定義の問題
    sendCommand: (...args: any[]) => redisClient.call(...args),
    // ユーザーIDをキーとして使用
    keyPrefix: 'ratelimit:user:',
    // キー生成関数をカスタマイズ
    getKey: (req) => req.user?.id || req.ip,
  }),
  windowMs: 60 * 1000, // 1分間
  max: 60, // ユーザーごとに1分間で60リクエストまで
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'APIリクエスト数の上限を超えました。しばらく経ってから再試行してください。'
    }
  },
  // レート制限の超過時にヘッダーを設定
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

// 特定のエンドポイント用のレート制限（より厳しい制限）
const loginLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore: 型定義の問題
    sendCommand: (...args: any[]) => redisClient.call(...args),
    keyPrefix: 'ratelimit:login:',
  }),
  windowMs: 60 * 60 * 1000, // 1時間
  max: 5, // IPアドレスごとに1時間で5回まで
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'ログイン試行回数の上限を超えました。1時間後に再試行してください。'
    }
  }
});

// レート制限の適用
app.use(globalLimiter); // グローバルレート制限を全ルートに適用

// 認証済みルートにユーザーベースのレート制限を適用
app.use('/api/users', authenticateJwt, authenticatedLimiter);

// ログインエンドポイントに特別なレート制限を適用
app.post('/api/login', loginLimiter, loginController.login);
```

**キャッシュ実装例**:
```typescript
// TypeScriptでのキャッシュ制御実装例
import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// インメモリキャッシュ
const cache = new NodeCache({
  stdTTL: 60, // デフォルトの有効期限（秒）
  checkperiod: 120 // キャッシュクリーンアップの間隔（秒）
});

// キャッシュミドルウェア
function cacheMiddleware(ttl: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // GETリクエストのみキャッシュ
    if (req.method !== 'GET') {
      return next();
    }
    
    // キャッシュキーの生成（URLとクエリパラメータに基づく）
    const key = `${req.originalUrl || req.url}`;
    
    // キャッシュからデータを取得
    const cachedData = cache.get(key);
    
    if (cachedData) {
      // キャッシュヒット
      return res.json(cachedData);
    }
    
    // レスポンスの元のjsonメソッドを保存
    const originalJson = res.json;
    
    // jsonメソッドをオーバーライド
    res.json = function(body) {
      // レスポンスをキャッシュに保存
      cache.set(key, body, ttl);
      
      // 元のjsonメソッドを呼び出し
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// 条件付きリクエスト用のミドルウェア
function conditionalGet() {
  return (req: Request, res: Response, next: NextFunction) => {
    // リソースのバージョン（例: データベースの更新タイムスタンプ）
    const getResourceVersion = async () => {
      // 実際の実装ではデータベースから最終更新日時などを取得
      const resource = await resourceService.findById(req.params.id);
      return resource ? resource.updatedAt.getTime().toString() : '';
    };
    
    // リソースのバージョンを取得してETAGを設定
    getResourceVersion().then(version => {
      if (!version) {
        return next();
      }
      
      // ETAGを生成（単純な例）
      const etag = `W/"${version}"`;
      
      // Last-Modifiedヘッダーを設定
      const lastModified = new Date(parseInt(version)).toUTCString();
      
      // レスポンスヘッダーを設定
      res.set({
        'ETag': etag,
        'Last-Modified': lastModified,
        'Cache-Control': 'private, max-age=300' // 5分間のキャッシュ
      });
      
      // 条件付きリクエストのチェック
      const ifNoneMatch = req.get('If-None-Match');
      const ifModifiedSince = req.get('If-Modified-Since');
      
      // ETAGが一致する場合は304を返す
      if (ifNoneMatch === etag) {
        return res.status(304).end();
      }
      
      // 最終更新日時が変わっていない場合も304を返す
      if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
        return res.status(304).end();
      }
      
      next();
    }).catch(next);
  };
}

// 使用例
// 一般的なエンドポイントに60秒のキャッシュを適用
app.get('/api/posts', cacheMiddleware(60), postsController.list);

// 頻繁に変更されないリソースに長めのキャッシュを適用
app.get('/api/categories', cacheMiddleware(3600), categoriesController.list);

// 条件付きリクエストを使用した単一リソースの取得
app.get('/api/posts/:id', conditionalGet(), postsController.getById);

// キャッシュ無効化の例（リソース更新時）
app.put('/api/posts/:id', async (req, res, next) => {
  try {
    // リソースの更新
    const updatedPost = await postsService.update(req.params.id, req.body);
    
    // 関連するキャッシュを無効化
    cache.del(`/api/posts/${req.params.id}`);
    cache.del('/api/posts');
    
    res.json({ data: updatedPost });
  } catch (err) {
    next(err);
  }
});
```

**ユースケース**:
- レート制限: APIの過剰利用防止
  ```
  // レート制限超過時のレスポンス
  HTTP/1.1 429 Too Many Requests
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1614556800
  Content-Type: application/json
  
  {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "リクエスト数の上限を超えました。しばらく経ってから再試行してください。"
    }
  }
  ```

- キャッシュ制御: パフォーマンス向上と負荷軽減
  ```
  // 初回リクエスト
  GET /api/posts HTTP/1.1
  Host: api.example.com
  
  // レスポンス（キャッシュヘッダー付き）
  HTTP/1.1 200 OK
  Content-Type: application/json
  Cache-Control: private, max-age=300
  ETag: W/"1614556800000"
  Last-Modified: Mon, 01 Mar 2021 12:00:00 GMT
  
  {
    "data": [...]
  }
  
  // 2回目のリクエスト（条件付き）
  GET /api/posts HTTP/1.1
  Host: api.example.com
  If-None-Match: W/"1614556800000"
  If-Modified-Since: Mon, 01 Mar 2021 12:00:00 GMT
  
  // 変更がない場合のレスポンス
  HTTP/1.1 304 Not Modified
  Cache-Control: private, max-age=300
  ETag: W/"1614556800000"
  Last-Modified: Mon, 01 Mar 2021 12:00:00 GMT
  ```

- 大規模APIのパフォーマンス最適化: 複合戦略
  ```
  // 1. レート制限の階層化
  - 匿名ユーザー: 1分間に30リクエスト
  - 認証済みユーザー: 1分間に60リクエスト
  - プレミアムユーザー: 1分間に120リクエスト
  
  // 2. キャッシュ戦略の階層化
  - 頻繁に変更されるデータ: 短期キャッシュ（30秒）
  - 一般的なデータ: 中期キャッシュ（5分）
  - 静的データ: 長期キャッシュ（1時間）
  
  // 3. 条件付きリクエストの活用
  - ETAGを使用した効率的なリソース取得
  - バージョニングによる一貫性の確保
  ```

## ドキュメント要件

### 基本情報

- API概要
  - 目的と用途
  - 主要機能
  - 技術スタック

- 前提条件
  - 必要な認証情報
  - 環境要件
  - 依存関係

### インタフェース仕様

- エンドポイント/メソッド
  - 完全なURI/メソッド名
  - リクエスト/レスポンスの形式
  - パラメータの制約

- データ型
  - 基本データ型の定義
  - カスタム型の説明
  - バリデーションルール

### 使用例

- 基本的な使用例

  ```bash
  # リクエスト例
  curl -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "example"}' \
    https://api.example.com/v1/resources
  ```

- エラーケース
  - よくあるエラーとその対処法
  - トラブルシューティングガイド

### 運用情報

- モニタリング
  - 監視メトリクス
  - アラート設定
  - ログ形式

- SLA/SLO
  - 可用性目標
  - レイテンシー要件
  - エラーレート閾値

## 各API仕様書

- [REST API](types/rest.md)
- [gRPC API](types/grpc.md)
- [GraphQL API](types/graphql.md)
