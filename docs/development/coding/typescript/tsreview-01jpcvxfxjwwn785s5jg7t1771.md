---
description: 掟プロジェクトにおけるTypeScriptコードのレビュー基準とベストプラクティス
ruleId: tsreview-01jpcvxfxjwwn785s5jg7t1771
tags:
  - development
  - typescript
  - review
aliases:
  - typescript-review
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TypeScriptコードレビュー

## 基本原則

- コードの品質と保守性を向上させることを目的とする。
- 建設的なフィードバックを心がける。
- 問題点だけでなく、良い点も指摘する。
- 個人ではなくコードに焦点を当てる。
- 「なぜ」と「どのように」の両方を説明する。

## レビューの流れ

1. **全体像の把握**。
   - コードの目的と設計を理解する。
   - 変更の範囲と影響を確認する。
   - テストの有無と品質を確認する。

2. **詳細レビュー**。
   - コードの正確性を確認する。
   - パフォーマンスとリソース使用を評価する。
   - エラー処理の適切さを確認する。
   - コードスタイルとドキュメントを確認する。

3. **フィードバック提供**。
   - 明確で具体的なコメントを提供する。
   - 重要な問題と軽微な問題を区別する。
   - 可能な場合は解決策を提案する。

## チェックリスト

### 型システム

#### 型の使用

- [ ] `any`型の使用は最小限に抑えられているか。
- [ ] 明示的な型注釈は必要な場所でのみ使用されているか。
- [ ] union型とintersection型は適切に活用されているか。
- [ ] ジェネリクスは意味のある制約を持っているか。
- [ ] インデックスシグネチャは慎重に使用されているか。

```typescript
// 良い例。
function getUser<T extends { id: string }>(id: string): Promise<T> {
  // 実装。
}

// 型エイリアスの使用。
type UserRole = 'admin' | 'editor' | 'viewer';。

// 避けるべき例。
function processData(data: any): any { // any型の使用
  // 実装。
}
```

#### 型安全性

- [ ] 型アサーションは必要最小限に抑えられているか。
- [ ] `null`と`undefined`は適切に処理されているか。
- [ ] 型ガードは効果的に使用されているか。
- [ ] `readonly`修飾子は適切に使用されているか。
- [ ] 条件付き型は複雑すぎないか。

```typescript
// 良い例 - 型ガードの使用。
function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;。
}

function processEntity(entity: User | Company) {
  if (isUser(entity)) {。
    // entityはUser型として扱われる。
    console.log(entity.name);。
  } else {。
    // entityはCompany型として扱われる。
    console.log(entity.companyName);。
  }
}

// 避けるべき例 - 型アサーションの乱用。
function processUser(data: any) {
  const user = data as User; // 危険な型アサーション。
  console.log(user.name); // 実行時エラーの可能性。
}
```

### コード構造

#### 関数設計

- [ ] 関数は単一責任の原則に従っているか。
- [ ] 引数は適切な数に抑えられているか。
- [ ] デフォルト値は適切に使用されているか。
- [ ] 戻り値の型は明確か。
- [ ] 副作用は最小限に抑えられているか。

```typescript
// 良い例。
interface UserOptions {。
  includeDetails?: boolean;
  fetchRoles?: boolean;
}

async function getUser(。
  id: string,
  options: UserOptions = {}
): Promise<User> {
  const { includeDetails = false, fetchRoles = false } = options;。
  // 実装。
}

// 避けるべき例。
async function getUser(。
  id: string,
  includeDetails: boolean,
  fetchRoles: boolean,
  cache: boolean,
  timeout: number
): Promise<User> {
  // 引数が多すぎる。
}
```

#### クラス設計

- [ ] クラスは単一責任の原則に従っているか。
- [ ] プロパティは適切にカプセル化されているか。
- [ ] 継承よりもコンポジションが優先されているか。
- [ ] インタフェースは適切に使用されているか。
- [ ] 静的メソッドと静的プロパティは適切に使用されているか。

```typescript
// 良い例 - コンポジションの使用。
class UserService {。
  constructor(。
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}。

  async getUser(id: string): Promise<User> {
    this.logger.info(`Fetching user: ${id}`);
    const user = await this.userRepository.findById(id);。
    if (!user) {。
      throw new NotFoundError(`User with ID ${id} not found`);。
    }
    return user;。
  }
}

// 避けるべき例 - 継承の乱用。
class BaseService {。
  protected logger: Logger;
  protected db: Database;
  
  constructor() {。
    this.logger = new Logger();。
    this.db = new Database();。
  }
  
  // 共通メソッド。
}

class UserService extends BaseService {。
  // UserServiceの実装。
}

class ProductService extends BaseService {。
  // ProductServiceの実装。
}
```

#### モジュール構成

- [ ] 関連する機能は論理的なモジュールにグループ化されているか。
- [ ] 循環依存は避けられているか。
- [ ] インポートとエクスポートは適切に管理されているか。
- [ ] バレル（index.ts）は効果的に使用されているか。
- [ ] 公開APIは明確に定義されているか。

```typescript
// 良い例 - 明確なモジュール構造。
// users/index.ts。
export { User } from './models/user';。
export { UserService } from './services/user-service';。
export { UserController } from './controllers/user-controller';。
// UserRepositoryはエクスポートされていないため、内部実装として扱われる。

// 避けるべき例 - 循環依存。
// a.ts。
import { B } from './b';。
export class A {。
  b: B;
}

// b.ts。
import { A } from './a';。
export class B {。
  a: A;
}
```

### エラー処理

#### エラー設計

- [ ] カスタムエラークラスは適切に定義されているか。
- [ ] エラーは適切に分類されているか。
- [ ] エラーメッセージは具体的で理解しやすいか。
- [ ] エラーには追加情報が含まれているか。
- [ ] エラー型は型安全か。

```typescript
// 良い例。
abstract class ApplicationError extends Error {。
  constructor(message: string, public readonly metadata?: Record<string, unknown>) {
    super(message);。
    this.name = this.constructor.name;。
    Error.captureStackTrace(this, this.constructor);。
  }
}

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

// 避けるべき例。
function handleError(error: any) {
  if (error.code === 'NOT_FOUND') {。
    // エラーコードに依存した処理。
  }
}
```

#### エラーハンドリング

- [ ] try-catchブロックは適切な範囲で使用されているか。
- [ ] エラーは適切に変換して伝播されているか。
- [ ] 非同期エラーは適切に処理されているか。
- [ ] エラーログは有用な情報を含んでいるか。
- [ ] 回復可能なエラーと回復不可能なエラーは区別されているか。

```typescript
// 良い例。
async function processUserData(userId: string): Promise<ProcessedData> {
  try {。
    const userData = await fetchUserData(userId);。
    return transformData(userData);。
  } catch (error) {。
    if (error instanceof NotFoundError) {。
      logger.warn(`User data not found: ${userId}`);
      return getDefaultData();。
    }
    
    if (error instanceof ValidationError) {。
      logger.error('Validation failed', { errors: error.validationErrors });
      throw error; // 再スロー。
    }
    
    // 未知のエラーを変換。
    logger.error('Unexpected error during data processing', { error });。
    throw new ApplicationError('Failed to process user data', { cause: error });
  }
}

// 避けるべき例。
async function processUserData(userId: string): Promise<ProcessedData> {
  try {。
    const userData = await fetchUserData(userId);。
    return transformData(userData);。
  } catch (error) {。
    console.error('Error:', error);
    throw error; // 情報が追加されていない。
  }
}
```

### 非同期処理

#### Promise と async/await

- [ ] `async/await`は一貫して使用されているか。
- [ ] Promiseチェインは適切に例外処理されているか。
- [ ] 複数の非同期処理は効率的に並列化されているか。
- [ ] 非同期関数は戻り値の型を明確に定義しているか。
- [ ] 非同期エラーは適切に処理されているか。

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

#### 非同期パフォーマンス

- [ ] 不必要な直列化は避けられているか。
- [ ] 非同期操作のキャッシュは考慮されているか。
- [ ] 長時間実行される処理は適切に管理されているか。
- [ ] キャンセル可能な操作は実装されているか。
- [ ] 非同期リソースは適切に解放されているか。

```typescript
// 良い例 - 並列処理。
async function loadDashboardData(userId: string): Promise<DashboardData> {
  const [。
    userProfile,。
    recentActivity,。
    notifications。
  ] = await Promise.all([。
    userService.getProfile(userId),。
    activityService.getRecentActivity(userId),。
    notificationService.getUnread(userId)。
  ]);
  
  return {。
    userProfile,。
    recentActivity,。
    notifications。
  };
}

// 避けるべき例 - 直列処理。
async function loadDashboardData(userId: string): Promise<DashboardData> {
  const userProfile = await userService.getProfile(userId);。
  const recentActivity = await activityService.getRecentActivity(userId);。
  const notifications = await notificationService.getUnread(userId);。
  
  return {。
    userProfile,。
    recentActivity,。
    notifications。
  };
}
```

### コード品質

#### 可読性

- [ ] 変数名と関数名は明確で意味があるか。
- [ ] コードは適切に構造化されているか。
- [ ] 複雑な処理には適切なコメントがあるか。
- [ ] マジックナンバーは避けられているか。
- [ ] ネストは最小限に抑えられているか。

```typescript
// 良い例。
const MAX_RETRY_COUNT = 3;。
const RETRY_DELAY_MS = 100;。

async function fetchWithRetry(url: string): Promise<Response> {
  let attempts = 0;。
  
  while (true) {。
    try {。
      return await fetch(url);。
    } catch (error) {。
      attempts++;。
      
      if (attempts >= MAX_RETRY_COUNT) {。
        throw new NetworkError(`Failed to fetch ${url} after ${MAX_RETRY_COUNT} attempts`, { cause: error });
      }
      
      await delay(RETRY_DELAY_MS);。
    }
  }
}

// 避けるべき例。
async function f(u: string): Promise<Response> {
  let a = 0;。
  
  while (true) {。
    try {。
      return await fetch(u);。
    } catch (e) {。
      a++;。
      
      if (a >= 3) {。
        throw e;。
      }
      
      await delay(100);。
    }
  }
}
```

#### テスト

- [ ] 適切なテストカバレッジがあるか。
- [ ] テストは独立していて再現可能か。
- [ ] エッジケースはテストされているか。
- [ ] テストは明確で理解しやすいか。
- [ ] モックとスタブは適切に使用されているか。

```typescript
// 良い例。
describe('UserService', () => {。
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {。
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

// 避けるべき例。
test('user service', async () => {。
  const service = new UserService(new UserRepository());。
  const user = await service.getUser('123');。
  expect(user).toBeDefined();。
});
```

#### ドキュメント

- [ ] パブリックAPIには適切なJSDocがあるか。
- [ ] パラメータと戻り値の型は明示的に記述されているか。
- [ ] 例外がスローされる条件は記載されているか。
- [ ] 例が含まれているか。
- [ ] 複雑な処理や非自明な動作は説明されているか。

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

### パフォーマンス

#### 最適化

- [ ] 不必要なオブジェクト生成は避けられているか。
- [ ] メモ化は適切に使用されているか。
- [ ] 大きな配列操作は効率的に行われているか。
- [ ] 計算コストの高い処理は最適化されているか。
- [ ] 再レンダリングは最小限に抑えられているか（フロントエンド）

```typescript
// 良い例 - メモ化。
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

// 避けるべき例 - 不必要なオブジェクト生成。
function processItems(items: Item[]): Result[] {
  return items.map(item => {。
    // 毎回新しいオブジェクトを作成。
    const data = {。
      id: item.id,
      name: item.name,
      // ...その他のプロパティ。
    };
    return transform(data);。
  });
}
```

#### バンドルサイズ

- [ ] ツリーシェイキングを考慮したインポートが使用されているか。
- [ ] 大きなライブラリは必要な部分だけインポートされているか。
- [ ] コード分割は適切に実装されているか。
- [ ] 遅延ロードは考慮されているか。
- [ ] 依存関係は最小限に抑えられているか。

```typescript
// 良い例。
import { map, filter } from 'lodash-es';。

// 避けるべき例。
import _ from 'lodash'; // 全体をインポート。
```

### セキュリティ

- [ ] ユーザー入力は適切に検証されているか。
- [ ] クロスサイトスクリプティング（XSS）対策は実装されているか。
- [ ] 機密情報は適切に保護されているか。
- [ ] 認証と認可は適切に実装されているか。
- [ ] 依存関係に既知の脆弱性はないか。

```typescript
// 良い例 - 入力検証。
function validateUsername(username: string): boolean {
  // 英数字とアンダースコアのみを許可。
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);。
}

// 避けるべき例 - 危険なHTML生成。
function createUserHTML(userData: any): string {
  return `<div class="user">。
    <h2>${userData.name}</h2>
    <div class="bio">${userData.bio}</div>
  </div>`;
}
```

## レビューコメントの書き方

### 効果的なフィードバック

- 具体的な問題点を指摘する。
- 理由を説明する。
- 改善案を提案する。
- 肯定的な側面も指摘する。

```
// 良いフィードバック例。
この関数では `any` 型を使用していますが、これは型安全性を損なう可能性があります。
具体的な型を定義することで、コンパイル時のエラーチェックが強化され、バグを早期に発見できます。

例えば、次のように型を定義することを検討してください：。
```typescript
interface UserData {。
  id: string;
  name: string;
  email: string;
}

function processUser(userData: UserData): void {
  // 実装。
}
```

// 悪いフィードバック例。
any型を使わないでください。

```

### 優先順位付け

- 重大な問題（セキュリティ、正確性、パフォーマンス）を最優先する。
- 中程度の問題（型安全性、エラー処理）を次に優先する。
- 軽微な問題（スタイル、ドキュメント）は最後に扱う。

## レビュー後のフォローアップ

- 修正されたコードを再確認する。
- 未解決の問題を追跡する。
- 学んだ教訓をチームで共有する。
- 必要に応じてコーディングガイドラインを更新する。

## 関連情報

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [TSDocの掟](tsdoc-01jpcvxfxjwwn785s5jg7t1773.md)
- [TypeScriptコーディングスタイル](tsstyle-01jpcvxfxjwwn785s5jg7t1770.md)
- [TypeScriptツール活用](tstools-01jpcvxfxha41b95hkx2y2y2pz.md)
