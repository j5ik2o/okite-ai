---
description: 掟プロジェクトにおけるTypeScriptコードのドキュメント作成規約とベストプラクティス
ruleId: tsdoc-01jpcvxfxjwwn785s5jg7t1773
tags:
  - development
  - typescript
  - documentation
aliases:
  - typescript-doc
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TSDocの掟

## 基本原則

- [ドキュメントコメントの掟](../doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md)に準拠すること
  - ドキュメントコメントは英語で記述する。
  - 記述がないものは新規に追加する。
  - 既存のものでもガイドラインに従っていないものは是正する。
  - コードを見れば分かることは書かない（Why/Why notを中心に記載）

## ドキュメント規約

TypeScriptの公式ドキュメントとTSDocに基づき、以下の規約に従うこと：。

- パブリックAPI要素には必ずドキュメントを付ける。
- TSDocの標準タグを使用する（`@param`, `@returns`, `@throws`など）
- ジェネリック型パラメータは`@typeParam`で説明する。
- 非同期メソッドは戻り値の型を明確に記載する。
- 型定義は具体的な使用例とともに説明する。

参考：[TSDoc](https://tsdoc.org/)

## ドキュメントスタイル

### インタフェースとクラス

```typescript
/**
 * Represents a connection to a database.。
 * 
 * @remarks。
 * This class implements automatic reconnection and connection pooling.。
 * All methods are thread-safe.。
 * 
 * @example。
 * ```typescript
 * const db = new DatabaseConnection({。
 *   host: 'localhost',。
 *   port: 5432。
 * });。
 * await db.connect();。
 * ```
 */
export class DatabaseConnection {。
  // 実装。
}

/**
 * Defines the structure for configuration options.。
 * 
 * @template T - The type of additional options specific to each implementation。
 */
export interface ConfigOptions<T> {。
  /**
   * The environment to use (e.g., 'development', 'production')。
   */
  env: string;

  /**
   * Additional implementation-specific options。
   */
  options?: T;
}
```

### メソッドとフィールド

```typescript
/**
 * Executes a query against the database.。
 * 
 * @param sql - The SQL query to execute。
 * @param params - Query parameters to bind。
 * @typeParam T - The expected type of the query result。
 * @returns Promise that resolves to the query results。
 * @throws {QueryError} When the query fails to execute。
 * 
 * @example。
 * ```typescript
 * const users = await db.query<User[]>(。
 *   'SELECT * FROM users WHERE age > ?',。
 *   [18]。
 * );。
 * ```
 */
async query<T>(sql: string, params: any[]): Promise<T>

/**
 * Maximum number of concurrent connections allowed.。
 * 
 * @remarks。
 * This value can be adjusted based on available system resources.。
 * Default value is calculated based on CPU cores.。
 */
readonly maxConnections: number;
```

### 型エイリアスと列挙型

```typescript
/**
 * Represents possible states of a connection.。
 * 
 * @remarks。
 * The state transitions follow this order:。
 * DISCONNECTED -> CONNECTING -> CONNECTED -> DISCONNECTING。
 */
export enum ConnectionState {。
  /** Not connected to the database */。
  DISCONNECTED,。
  /** Connection attempt in progress */。
  CONNECTING,。
  /** Successfully connected */。
  CONNECTED,。
  /** Disconnection in progress */。
  DISCONNECTING。
}

/**
 * Configuration for retry behavior.。
 * 
 * @example。
 * ```typescript
 * const config: RetryConfig = {。
 *   maxAttempts: 3,。
 *   delay: 1000,。
 *   backoff: 'exponential'。
 * };。
 * ```
 */
export type RetryConfig = {。
  /** Maximum number of retry attempts */。
  maxAttempts: number;
  /** Delay between retries in milliseconds */。
  delay: number;
  /** Type of backoff strategy to use */。
  backoff: 'fixed' | 'exponential';
};
```

## 特殊な記法

### リンクとリファレンス

```typescript
/**
 * See {@link ConnectionPool} for managing multiple connections.。
 * 
 * For more details, see {@link https://example.com/docs | API Documentation}.。
 * 
 * @see {@link ConfigOptions} for configuration options。
 */
```

### モジュールとパッケージ

```typescript
/**
 * @packageDocumentation。
 * Provides utilities for database connection management.。
 * 
 * @remarks。
 * This module implements connection pooling, automatic reconnection,。
 * and transaction management for various database types.。
 * 
 * @example。
 * ```typescript
 * import { createPool } from '@example/db';。
 * 
 * const pool = createPool({。
 *   maxSize: 10,。
 *   idleTimeout: 1000。
 * });。
 * ```
 */
```

### 非推奨と移行

```typescript
/**
 * @deprecated Use {@link newMethod} instead.。
 * This method will be removed in version 2.0.0.。
 * 
 * @example。
 * Before:。
 * ```typescript
 * oldMethod(value);。
 * ```
 * 
 * After:。
 * ```typescript
 * newMethod({ value });。
 * ```
 */
```

## テストとの統合

### Jest Test例の記述

```typescript
/**
 * Safely adds two numbers, handling potential overflow.。
 * 
 * @example。
 * ```typescript
 * import { add } from './math';。
 * 
 * test('add numbers', () => {。
 *   expect(add(2, 3)).toBe(5);。
 *   expect(add(Number.MAX_SAFE_INTEGER, 1)).toBeNull();。
 * });。
 * ```
 */
export function add(a: number, b: number): number | null
```

## レビュー時の注意点

- ドキュメントが最新の実装を反映しているか。
- 全てのパブリック要素にドキュメントが付いているか。
- 説明が明確で具体的か。
- サンプルコードが実際に動作するか。
- 英語の文法や表現が適切か。
- 型情報が正確に記載されているか。

## 関連情報

- [TSDoc Specification](https://tsdoc.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [API Extractor](https://api-extractor.com/) - Microsoft's API documentation tool
