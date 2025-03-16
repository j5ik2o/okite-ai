---
description: typescript developmentに関するドキュメント
ruleId: typescript-01jpcvxfxha41b95hkx2y2y2py
tags: ["development","coding","typescript"]
aliases: ["typescript-guidelines", "ts-best-practices"]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

# TypeScript開発ガイドライン

## 型定義とベストプラクティス

### 型定義と実装の分離

TypeScriptでは、型定義と実装を分離することでコードの明確さと再利用性を高めることができます。

- **型定義（type, interface）**: `.d.ts` ファイルに配置。

```typescript
// src/domain/types.d.ts など。
export interface User {。
  id: string;
  name: string;
  email: string;
}
```

- **実装（class など）**: 通常の `.ts` ファイルに配置。

```typescript
// src/domain/user.ts など。
import type { User } from './types';。

export class UserImpl implements User {。
  constructor(。
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}。
}
```

### 型システムの最大活用

TypeScriptの型システムを最大限に活用し、不要なランタイムチェックを排除することで、コードの効率性と保守性を向上させます。

```typescript
// 悪い例:以下はTypeScriptの型システムがすでに保証しているため不要
function processUserBad(user: User): void {
  if (typeof user.name !== 'string' || typeof user.email !== 'string') {。
    throw new Error('Invalid user data');。
  }
  console.log(`Processing ${user.name} (${user.email})`);。
}

// 良い例：型の恩恵を活かしたコード。
function processUser(user: User): void {
  // TypeScriptが型チェックするため、追加のチェックは不要。
  console.log(`Processing ${user.name} (${user.email})`);。
}
```

**ベストプラクティス**:
- TypeScriptの型システムが静的に保証していることを、ランタイムでも再度チェックしない。
- 外部入力（APIレスポンスなど）に対しては、型アサーションする前に適切なバリデーションする。
- ユニオン型と判別共用体（Discriminated Unions）を活用して型安全な条件分岐を実現する。

#### 不要なランタイムチェックの排除

TypeScriptの型システムを最大限に活用し、不要なランタイムチェックを排除することで、コードの効率性と保守性を向上させます。

- `strictNullChecks: true`設定下では、以下のような冗長なチェックは行わないこと:。

  ```typescript
  // 悪い例:不要なチェック例
  private constructor(private readonly value: string) {
    // 以下はTypeScriptの型システムがすでに保証しているため不要。
    if (value === null || value === undefined) {。
      throw new InvalidArgumentError("Value must not be null or undefined");。
    }
    // ...その他の必要なチェック。
  }
  ```

- TypeScriptの型システムが静的に保証していることを、ランタイムでも再度チェックしない。
- 代わりに、型システムでは検知できないビジネスルールや不変条件のチェックに集中する。
- 例外として、外部入力（APIリクエストデータなど）に対しては完全性を保証するために冗長なチェックも許容する。

このアプローチにより、コードは簡潔になり、本当に必要なバリデーションにのみ焦点を当てることができます。

### オブジェクト生成パターン

#### コンストラクタアクセスの制限

クラスのコンストラクタは必ず`private`にし、直接の`new`演算子によるインスタンス生成を禁止します。これにより、オブジェクトの生成を制御し、生成前の検証やビジネスルールの適用を一箇所で管理できます。

```typescript
// 悪い例。
class UserAccount {。
  constructor(public readonly id: string,
              public readonly name: string) {}
}

// 直接newでインスタンス化（非推奨）
const user = new UserAccount("123", "テスト");。

type UserAccountProps = {。
  id: string;
  name: string;
};

// 良い例。
class UserAccount {。
  private constructor(。
    private readonly _id: string,
    private readonly _name: string
  ) {
    // ここで生成前の検証を一箇所に集中できる。
    if (props.name.length < 2) {。
      throw new IllegalArgumentError("名前は2文字以上必要です");。
    }
  }

  // ファクトリーメソッド。
  static of(props: { id: string; name: string }): User {
    return new User(props);。
  }

  // publicにしないこと。
  private copy(props: Partial<UserAccountProps>): UserAccount {
    return UserAccount.of(。
      props.id !== undefined ? props.id : this._id,
      props.name !== undefined ? props.name : this._name
    )
  }

  rename(name: string): UserAccount {
    return this.copy({ name });。
  }

  // ゲッターメソッド。
  get id(): string {
    return this.props.id;。
  }

  get name(): string {
    return this.props.name;。
  }
}

// ファクトリーメソッド経由でインスタンス化（推奨）
const userAccount = UserAccount.of({ id: "123", name: "テスト" });
```

#### 2.4.2 ファクトリーメソッドの命名規則

基本的なファクトリーメソッド名は`of`を使用します。特殊な生成パターンがある場合は、目的を明確にした名前を使用してください。

```typescript
class Task {。
  private constructor(private readonly props: { /* ... */ }) {}

  // 基本的なファクトリーメソッド。
  static of(props: { /* ... */ }): Task {
    return new Task(props);。
  }

  // 特殊用途のファクトリーメソッド。
  static empty(): Task {
    return new Task({ id: uuidv4(), title: "", completed: false });
  }

  // 変換用ファクトリーメソッド。
  static fromDto(dto: TaskDto): Task {
    return new Task({。
      id: dto.id,
      title: dto.title,
      completed: dto.status === "DONE"
    });
  }
}
```

#### 2.4.3 ファクトリークラスの使用

複雑な生成ロジックがある場合や、生成のためのコンテキストが必要な場合は、専用のファクトリークラスを使用します。

```typescript
// 複雑な生成ロジックを持つファクトリークラス。
class UserFactory {。
  constructor(private readonly idGenerator: IdGenerator) {}

  // コンテキストを使用した生成メソッド。
  createWithDefaults(name: string): User {
    return User.of({。
      id: this.idGenerator.generate(),
      name,。
      role: "USER",
      createdAt: new Date()
    });
  }

  // 特定のユースケース向けの生成メソッド。
  createAdmin(name: string): User {
    return User.of({。
      id: this.idGenerator.generate(),
      name,。
      role: "ADMIN",
      createdAt: new Date()
    });
  }
}
```

#### 2.4.4 インスタンス生成の基本原則

1. クラスのコンストラクタは必ず`private`にする。
2. 基本的なインスタンス生成には`static of()`ファクトリーメソッドを提供する。
3. 特殊な生成パターンには目的を明確にしたファクトリーメソッドを追加する。
4. 複雑な生成ロジックは専用のファクトリークラスに委譲する。
5. ファクトリーメソッド内で必要なビジネスルール検証する。

これらの原則に従うことで、オブジェクト生成の一貫性を確保し、ビジネスルールの適用を一箇所に集中させることができます。また、将来的な要件変更にも柔軟に対応できるコードベースになります。

## 3. ディレクトリ構成

TypeScriptプロジェクトの標準的なディレクトリ構成：。

```
src/。
├── domain/           // ドメインモデル。
│   ├── types.d.ts    // ドメイン型定義。
│   ├── task.ts。
│   ├── user.ts。
│   └── repository/   // リポジトリインターフェース。
│       ├── types.d.ts。
│       ├── task-repository.ts。
│       └── user-repository.ts。
│
├── use-case/         // ユースケース。
│   ├── types.d.ts    // ユースケース型定義。
│   ├── create-task.ts。
│   ├── complete-task.ts。
│   └── get-task-list.ts。
│
├── interface-adaptor/  // アダプタ。
│   ├── repository/     // リポジトリ実装。
│   │   ├── task-repository-impl.ts。
│   │   └── user-repository-impl.ts。
│   └── controller/     // コントローラ。
│       ├── task-controller.ts。
│       └── user-controller.ts。
│
├── infrastructure/    // インフラ。
│   ├── config.ts。
│   ├── logger.ts。
│   └── result.ts。
│
└── main.ts            // エントリーポイント。
```

この構成は、関心事の分離と依存関係の明確化を実現します。上位レイヤーは下位レイヤーに依存し、下位レイヤーは上位レイヤーに依存しません（依存関係逆転の原則）。

## 4. テスト戦略

### 4.1 テストファイル配置

- ユニットテスト：各ファイル`*.ts`に対応する`*.test.ts`。
- ユニットテスト：`src/domain/`, `src/use-case/`, `src/infrastructure/`フォルダごとに対応。
- 統合テスト：`src/integration-tests/*.test.ts`。

### 4.2 テストプラクティス

- モック化には`jest.mock()`や`jest.spyOn()`を使用する。
- テスト容易性向上のためDependency Injectionパターンを活用する。
- テスト可能性を考慮したコード設計（副作用の分離）する。

## 5. ツールチェイン

### 5.1 推奨パッケージ

- **TypeScript**: `typescript`。
- **リンター/フォーマッター**: `@biomejs/biome`（ESLintとPrettierの代替）
- **テスティングフレームワーク**: `jest` + `ts-jest`。
- **ビルドツール**: `esbuild`（高速でモダンなビルドツール）

### 5.2 NPMスクリプト

```json
"scripts": {
  "type-check": "tsc --noEmit",
  "build": "npm run type-check && node esbuild.js",
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write .",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "test:watch": "jest --watch"
}
```
