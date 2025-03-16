---
description: 掟プロジェクトにおけるTypeScriptコードのスタイルガイドと規約
ruleId: tsstyle-01jpcvxfxjwwn785s5jg7t1770
tags:
  - development
  - typescript
  - style
aliases:
  - typescript-style
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TypeScriptコーディングスタイル

## 基本原則

- TypeScriptの公式スタイルガイドに従う。
- 可読性と保守性を最優先する。
- 型安全性を確保する。
- 一貫性のあるコードを書く。

## 命名規則

### 基本ルール

- クラス名、インタフェース名、型名はパスカルケース。
  - 例: `UserService`, `HttpClient`, `ApiResponse`。
- 変数名、関数名、メソッド名、プロパティ名はキャメルケース。
  - 例: `userData`, `fetchUserData`, `isValid`。
- 定数は大文字のスネークケース。
  - 例: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`。
- ファイル名はケバブケース。
  - 例: `user-service.ts`, `http-client.ts`。

### 特殊なケース

- インタフェース名に`I`プレフィックスは付けない。
  - 良い例: `UserRepository` (× `IUserRepository`)。
- タイプエイリアスには`Type`サフィックスを付ける。
  - 例: `UserDataType`, `ApiResponseType`。
- ジェネリック型パラメータは意味のある名前を使用する。
  - 単純な場合: `T`, `U`, `V`。
  - 複雑な場合: `TKey`, `TValue`, `TResult`。
- 真偽値を返す関数やプロパティは`is`, `has`, `can`などで始める。
  - 例: `isValid`, `hasPermission`, `canEdit`。

```typescript
// 良い例。
interface User {。
  id: string;
  name: string;
  email: string;
}

type UserResponseType = {。
  data: User;
  status: number;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);。
}

// 避けるべき例。
interface IUser { // 'I'プレフィックスは不要。
  Id: string; // キャメルケースではない
  Name: string;
  Email: string;
}

type UserResponse = { // 'Type'サフィックスがない。
  Data: User; // キャメルケースではない
  Status: number;
};
```

## ファイル構造

### ファイル編成

- 1ファイルにつき1つの主要な概念（クラス、インタフェースなど）を基本とする。
- ファイル名は内容を反映したものにする。
- インポートは以下の順序でグループ化する:。
  1. 外部ライブラリ。
  2. アプリケーション内の他のモジュール。
  3. 相対パスでのインポート。
- エクスポートはファイルの最後にまとめる。

```typescript
// user-service.ts。
import { Injectable } from '@angular/core';。
import { HttpClient } from '@angular/common/http';。

import { ApiService } from 'src/app/core/api.service';。
import { LoggerService } from 'src/app/core/logger.service';。

import { User } from '../models/user';。
import { UserRepository } from './user-repository';。

@Injectable()。
export class UserService implements UserRepository {。
  constructor(。
    private http: HttpClient,
    private apiService: ApiService,
    private logger: LoggerService
  ) {}。

  async getUser(id: string): Promise<User> {
    // 実装。
  }

  // その他のメソッド。
}

export { User };。
```

### モジュール構成

- 関連する機能をモジュールにグループ化する。
- バレル（index.ts）を使用してAPIの公開範囲を制御する。
- 循環依存を避ける。
- 適切な粒度でモジュールを分割する。

```typescript
// features/users/index.ts。
export * from './user.model';。
export * from './user.service';。
export * from './user-list.component';。
// user-utils.ts はエクスポートされていないため、内部実装として扱われる。
```

## 型システム

### 型の使用

- `any`型の使用は可能な限り避ける。
- 明示的な型注釈よりも型推論を優先する。
- 複雑な型には型エイリアスやインタフェースを使用する。
- union型とintersection型を適切に活用する。
- ジェネリクスは意味のある制約を付ける。

```typescript
// 良い例。
function getUser<T extends { id: string }>(id: string): Promise<T> {
  // 実装。
}

// 型エイリアスの使用。
type UserRole = 'admin' | 'editor' | 'viewer';。

interface User {。
  id: string;
  name: string;
  role: UserRole;
}

// 避けるべき例。
function processData(data: any): any { // any型の使用
  // 実装。
}
```

### 高度な型機能

- インデックスシグネチャは慎重に使用する。
- `readonly`を積極的に活用する。
- 条件付き型を使用して柔軟な型を定義する。
- マップ型を使用して既存の型から新しい型を生成する。
- テンプレートリテラル型を活用する。

```typescript
// インデックスシグネチャ。
interface Dictionary<T> {。
  [key: string]: T;
}

// readonly。
interface User {。
  readonly id: string;
  name: string;
  email: string;
}

// 条件付き型。
type NonNullable<T> = T extends null | undefined ? never : T;

// マップ型。
type Readonly<T> = {。
  readonly [P in keyof T]: T[P];
};

// テンプレートリテラル型。
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';。
type Endpoint = `/api/${string}`;。
type ApiRoute = `${HttpMethod} ${Endpoint}`;。
```

## 関数とメソッド

### 関数設計

- 関数は単一責任の原則に従う。
- 副作用は可能な限り避ける。
- 引数は3つ以下に抑える。
- 複数の引数がある場合はオブジェクトパラメータを使用する。
- デフォルト値を適切に使用する。

```typescript
// 良い例。
interface UserOptions {。
  includeDetails?: boolean;
  fetchRoles?: boolean;
  timeout?: number;
}

async function getUser(。
  id: string,
  options: UserOptions = {}
): Promise<User> {
  const { includeDetails = false, fetchRoles = false, timeout = 5000 } = options;。
  // 実装。
}

// 避けるべき例。
async function getUser(。
  id: string,
  includeDetails: boolean,
  fetchRoles: boolean,
  timeout: number
): Promise<User> {
  // 実装。
}
```

### 非同期処理

- 可能な限り`async/await`を使用する。
- Promiseチェインは適切に例外処理する。
- 複数の非同期処理は`Promise.all`や`Promise.race`を活用する。
- 非同期関数は戻り値の型を明確にする。

```typescript
// 良い例。
async function fetchUserData(userId: string): Promise<UserData> {
  try {。
    const user = await userRepository.findById(userId);。
    if (!user) {。
      throw new NotFoundError(`User with ID ${userId} not found`);。
    }
    
    const [profile, permissions] = await Promise.all([。
      profileService.getProfile(userId),。
      permissionService.getPermissions(userId)。
    ]);
    
    return {。
      user,。
      profile,。
      permissions。
    };
  } catch (error) {。
    logger.error('Failed to fetch user data', { userId, error });。
    throw new ApplicationError('Failed to fetch user data', { cause: error });
  }
}

// 避けるべき例。
function fetchUserData(userId: string) { // 戻り値の型が不明確
  return userRepository.findById(userId)。
    .then(user => {。
      if (!user) {。
        throw new Error(`User not found: ${userId}`);
      }
      return user;。
    })
    .then(user => {。
      // ネストされたPromiseチェーン。
      return profileService.getProfile(userId)。
        .then(profile => {。
          return { user, profile };。
        });
    });
}
```

## エラー処理

### エラー設計

- カスタムエラークラスを定義して、型安全なエラー処理する。
- エラーは適切に分類する。
- エラーメッセージは具体的で理解しやすいものにする。
- エラーには追加情報を含める。

```typescript
// 基本エラークラス。
abstract class ApplicationError extends Error {。
  constructor(message: string, public readonly metadata?: Record<string, unknown>) {
    super(message);。
    this.name = this.constructor.name;。
    // Stack traceを保持するためのハック（TypeScriptの制限）
    Error.captureStackTrace(this, this.constructor);。
  }
}

// 具体的なエラークラス。
class NotFoundError extends ApplicationError {。
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata);。
  }
}

class ValidationError extends ApplicationError {。
  constructor(。
    message: string,
    public readonly validationErrors: Record<string, string[]>,
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata);。
  }
}
```

### エラーハンドリング

- try-catchブロックは適切な範囲で使用する。
- エラーは適切に変換して伝播する。
- グローバルエラーハンドラを実装する。
- 非同期エラーを適切に処理する。

```typescript
// 良い例。
async function processUserData(userId: string): Promise<ProcessedData> {
  try {。
    const userData = await fetchUserData(userId);。
    return transformData(userData);。
  } catch (error) {。
    if (error instanceof NotFoundError) {。
      // 特定のエラータイプに対する処理。
      logger.warn(`User data not found: ${userId}`);
      return getDefaultData();。
    }
    
    if (error instanceof ValidationError) {。
      // バリデーションエラーの処理。
      logger.error('Validation failed', { errors: error.validationErrors });
      throw error; // 再スロー。
    }
    
    // 未知のエラーを変換。
    logger.error('Unexpected error during data processing', { error });。
    throw new ApplicationError('Failed to process user data', { cause: error });
  }
}
```

## クラスと継承

### クラス設計

- クラスは単一責任の原則に従う。
- プロパティは適切にカプセル化する。
- 継承よりもコンポジションを優先する。
- インタフェースを使用して契約を定義する。
- 抽象クラスは共通の実装を提供する場合に使用する。

```typescript
// インターフェース定義。
interface UserRepository {。
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
}

// 実装クラス。
class PostgresUserRepository implements UserRepository {。
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    // 実装。
  }

  async save(user: User): Promise<User> {
    // 実装。
  }

  async delete(id: string): Promise<boolean> {
    // 実装。
  }
}

// コンポジションの例。
class UserService {。
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);。
    if (!user) {。
      throw new NotFoundError(`User with ID ${id} not found`);。
    }
    return user;。
  }
}
```

### アクセス修飾子

- `private`、`protected`、`public`を適切に使用する。
- デフォルトは`public`だが、明示的に指定することを推奨。
- `readonly`を使用して不変性を確保する。
- コンストラクタパラメータにアクセス修飾子を使用してプロパティを定義する。

```typescript
class UserService {。
  // コンストラクタパラメータでのプロパティ定義。
  constructor(。
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}。

  // publicメソッド。
  public async getUser(id: string): Promise<User> {
    this.logger.info(`Fetching user: ${id}`);
    return this.findUserById(id);。
  }

  // privateメソッド。
  private async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);。
    if (!user) {。
      throw new NotFoundError(`User with ID ${id} not found`);。
    }
    return user;。
  }
}
```

## モジュールとインポート

### モジュール設計

- 関連する機能を論理的なモジュールにグループ化する。
- 循環依存を避ける。
- 適切な粒度でモジュールを分割する。
- 公開APIを明示的に定義する。

```typescript
// users/index.ts。
export { User } from './models/user';。
export { UserService } from './services/user-service';。
export { UserController } from './controllers/user-controller';。
// UserRepositoryはエクスポートされていないため、内部実装として扱われる。
```

### インポート

- 名前付きインポートを優先する。
- デフォルトエクスポートは避ける。
- インポートはアルファベット順に並べる。
- 絶対パスと相対パスを適切に使い分ける。

```typescript
// 良い例。
import { Component, OnInit } from '@angular/core';。
import { FormBuilder, FormGroup, Validators } from '@angular/forms';。

import { User } from '@app/models';。
import { UserService } from '@app/services';。

import { ValidationUtils } from '../utils/validation-utils';。

// 避けるべき例。
import UserService from './user-service'; // デフォルトインポート。
import * as Forms from '@angular/forms'; // 名前空間インポート。
```

## コメントとドキュメント

### JSDoc

- パブリックAPIには適切なJSDocを付ける。
- パラメータと戻り値の型は明示的に記述する。
- 例外がスローされる条件を記載する。
- 例を含める。

```typescript
/**
 * ユーザー情報を取得します。
 * 
 * @param id - ユーザーID。
 * @param options - 取得オプション。
 * @returns ユーザー情報。
 * @throws {NotFoundError} ユーザーが見つからない場合。
 * @throws {AuthorizationError} アクセス権限がない場合。
 * 
 * @example。
 * ```typescript
 * const user = await userService.getUser('123', { includeDetails: true });。
 * console.log(user.name);。
 * ```
 */
async function getUser(。
  id: string,
  options: UserOptions = {}
): Promise<User> {
  // 実装。
}
```

### インラインコメント

- コードの「なぜ」を説明するコメントを書く。
- 複雑なアルゴリズムには説明を追加する。
- TODOコメントには理由と参照を含める。
- 自明なコードにはコメントを付けない。

```typescript
// 良いコメント例。
// RFC 5322に準拠したメールアドレスの検証。
// 参考: https://tools.ietf.org/html/rfc5322
function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regex.test(email);。
}

// TODO: パフォーマンス最適化が必要 (#123)
function slowFunction() {。
  // 実装。
}

// 避けるべきコメント例。
// ユーザー名を取得する。
function getUserName() { // 自明なコード。
  // ...
}
```

## テスト

### テスト構造

- テストは明確な構造に従う（Arrange-Act-Assert）
- テストケースは独立していて再現可能にする。
- テスト名は何をテストしているかを明確に示す。
- テストヘルパーを活用して重複を減らす。

```typescript
// Jestを使用したテスト例。
describe('UserService', () => {。
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {。
    // Arrange - テストの準備。
    mockRepository = {。
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    userService = new UserService(mockRepository);。
  });
  
  describe('getUser', () => {。
    it('should return user when valid ID is provided', async () => {。
      // Arrange。
      const mockUser = { id: '123', name: 'Test User' };
      mockRepository.findById.mockResolvedValue(mockUser);。
      
      // Act。
      const result = await userService.getUser('123');。
      
      // Assert。
      expect(result).toEqual(mockUser);。
      expect(mockRepository.findById).toHaveBeenCalledWith('123');。
    });
    
    it('should throw NotFoundError when user does not exist', async () => {。
      // Arrange。
      mockRepository.findById.mockResolvedValue(null);。
      
      // Act & Assert。
      await expect(userService.getUser('456')).rejects.toThrow(NotFoundError);。
      expect(mockRepository.findById).toHaveBeenCalledWith('456');。
    });
  });
});
```

### モックとスタブ

- モックは必要最小限に抑える。
- テスト用の実装を提供できる場合はスタブを使用する。
- モックの期待値設定は明示的に行う。
- モックフレームワーク（Jest, Sinon）を適切に使用する。

```typescript
// モックの例。
const mockUserRepository = {。
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

// スタブの例。
class InMemoryUserRepository implements UserRepository {。
  private users: Map<string, User> = new Map();
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;。
  }
  
  async save(user: User): Promise<User> {
    this.users.set(user.id, { ...user });。
    return user;。
  }
  
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);。
  }
}
```

## パフォーマンス

### 最適化

- 不必要なオブジェクト生成を避ける。
- メモ化を活用して計算を最適化する。
- 大きな配列操作は効率的に行う。
- 非同期処理は適切に並列化する。

```typescript
// メモ化の例。
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();。
  
  return (arg: T): R => {
    if (cache.has(arg)) {。
      return cache.get(arg)!;。
    }
    
    const result = fn(arg);。
    cache.set(arg, result);。
    return result;。
  };
}

const calculateExpensiveValue = memoize((input: number) => {
  // 計算コストの高い処理。
  return input * input;。
});

// 非同期処理の並列化。
async function fetchAllUserData(userIds: string[]): Promise<UserData[]> {
  return Promise.all(userIds.map(id => fetchUserData(id)));。
}
```

### バンドルサイズ

- ツリーシェイキングを考慮したインポートを使用する。
- 大きなライブラリは必要な部分だけインポートする。
- コード分割を活用する。
- 遅延ロードを実装する。

```typescript
// 良い例。
import { map, filter } from 'lodash-es';。

// 避けるべき例。
import _ from 'lodash'; // 全体をインポート。
```

## 関連情報

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [TSDocの掟](tsdoc-01jpcvxfxjwwn785s5jg7t1773.md)
- [TypeScriptツール活用](tstools-01jpcvxfxha41b95hkx2y2y2pz.md)
- [TypeScriptコードレビュー](tsreview-01jpcvxfxjwwn785s5jg7t1771.md)
