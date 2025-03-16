---
description: 掟プロジェクトにおけるTypeScript開発で使用する必須およびオプショナルツールの説明と設定方法
ruleId: tstools-01jpcvxfxha41b95hkx2y2y2pz
tags:
  - development
  - typescript
  - tools
aliases:
  - typescript-tools
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TypeScriptツール活用

## 開発環境

### TypeScriptコンパイラ

TypeScriptの基本ツールであるコンパイラ（tsc）は、TypeScriptコードをJavaScriptに変換します。

```bash
# グローバルインストール
npm install -g typescript。

# プロジェクトへのインストール
npm install --save-dev typescript。

# バージョン確認
tsc --version。

# コンパイル
tsc file.ts。

# プロジェクト全体のコンパイル
tsc。

# 監視モード
tsc --watch。
```

#### tsconfig.json

TypeScriptプロジェクトの設定ファイルです。コンパイラオプションやプロジェクト構造を定義します。

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

主要なコンパイラオプション：。

- `target`: 出力するJavaScriptのバージョン。
- `module`: モジュールシステム（CommonJS, ESModules等）
- `strict`: 厳格な型チェックを有効にする。
- `outDir`: コンパイル結果の出力先。
- `sourceMap`: ソースマップの生成。
- `declaration`: 型定義ファイル（.d.ts）の生成。

### IDEとエディタ

#### Visual Studio Code

TypeScript開発に最適なエディタです。Microsoft（TypeScriptの開発元）によって開発されており、優れたTypeScriptサポートを提供します。

主な機能：。

- 型チェック。
- コード補完。
- リファクタリング。
- デバッグ。
- 定義へのジャンプ。

推奨拡張機能：。

- ESLint。
- Prettier。
- Error Lens。
- Import Cost。
- Path Intellisense。

#### WebStorm

JetBrainsのTypeScript対応IDEです。高度な機能を提供します。

主な機能：。

- 高度なコード補完。
- リファクタリングツール。
- デバッガ。
- テスト実行とカバレッジ。
- バージョン管理との統合。

## コード品質ツール

### ESLint

JavaScriptとTypeScriptのための静的解析ツールです。コードの問題を検出し、コーディング規約を強制します。

```bash
# インストール
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin。

# 設定ファイルの生成
npx eslint --init。

# 実行
npx eslint src/。
```

#### .eslintrc.js の例

```javascript
module.exports = {。
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

### Prettier

コードフォーマッターです。一貫したコードスタイルを維持します。

```bash
# インストール
npm install --save-dev prettier。

# 単一ファイルのフォーマット
npx prettier --write src/file.ts。

# プロジェクト全体のフォーマット
npx prettier --write "src/**/*.ts"。

# フォーマットチェック
npx prettier --check "src/**/*.ts"。
```

#### .prettierrc の例

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### ESLintとPrettierの統合

ESLintとPrettierを連携させることで、コードスタイルとコード品質の両方を一貫して管理できます。

```bash
# 必要なパッケージのインストール
npm install --save-dev eslint-config-prettier eslint-plugin-prettier。
```

### TypeScript ESLint

TypeScript専用のESLintルールを提供します。

```bash
# インストール
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser。
```

### husky と lint-staged

コミット前に自動的にリントとフォーマットするします。

```bash
# インストール
npm install --save-dev husky lint-staged。

# 設定
npx husky install。
npx husky add .husky/pre-commit "npx lint-staged"。
```

#### package.json の設定例

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",。
      "prettier --write"。
    ]
  }
}
```

## テストツール

### Jest

JavaScriptとTypeScriptのためのテストフレームワークです。

```bash
# インストール
npm install --save-dev jest ts-jest @types/jest。

# 設定ファイルの生成
npx ts-jest config:init。

# テスト実行
npx jest。

# 監視モード
npx jest --watch。

# カバレッジレポート
npx jest --coverage。
```

#### jest.config.js の例

```javascript
module.exports = {。
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',。
    '!src/**/*.d.ts',。
    '!src/**/*.interface.ts',。
    '!src/**/*.module.ts'。
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Testing Library

ユーザー視点でのテストを促進するライブラリです。主にUIコンポーネントのテストに使用されます。

```bash
# Reactの場合
npm install --save-dev @testing-library/react @testing-library/jest-dom。

# Angularの場合
npm install --save-dev @testing-library/angular。

# Vue.jsの場合
npm install --save-dev @testing-library/vue。
```

### Cypress

エンドツーエンドテストのためのフレームワークです。

```bash
# インストール
npm install --save-dev cypress。

# 起動
npx cypress open。

# ヘッドレス実行
npx cypress run。
```

#### TypeScriptサポートの設定

```json
// cypress/tsconfig.json。
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts"]
}
```

## ビルドツール

### webpack

モジュールバンドラーです。複数のファイルを1つにまとめます。

```bash
# インストール
npm install --save-dev webpack webpack-cli webpack-dev-server typescript ts-loader。

# 開発サーバー起動
npx webpack serve。

# ビルド
npx webpack。
```

#### webpack.config.js の例

```javascript
const path = require('path');。

module.exports = {。
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
};
```

### Vite

高速なフロントエンド開発ツールです。

```bash
# プロジェクト作成
npm create vite@latest my-app -- --template typescript。

# 開発サーバー起動
npm run dev。

# ビルド
npm run build。
```

#### vite.config.ts の例

```typescript
import { defineConfig } from 'vite';。
import react from '@vitejs/plugin-react';。

export default defineConfig({。
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
  },
});
```

### esbuild

非常に高速なJavaScript/TypeScriptバンドラーです。

```bash
# インストール
npm install --save-dev esbuild。

# ビルド
npx esbuild src/index.ts --bundle --outfile=dist/bundle.js。
```

## ドキュメント生成ツール

### TypeDoc

TypeScriptコードからドキュメントを生成するツールです。

```bash
# インストール
npm install --save-dev typedoc。

# ドキュメント生成
npx typedoc src/index.ts。

# 設定ファイルを使用
npx typedoc --options typedoc.json。
```

#### typedoc.json の例

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "name": "My Project Documentation",
  "excludePrivate": true,
  "excludeProtected": true,
  "theme": "default",
  "readme": "README.md"
}
```

### Compodoc

Angular向けのドキュメント生成ツールです。

```bash
# インストール
npm install --save-dev @compodoc/compodoc。

# ドキュメント生成
npx compodoc -p tsconfig.json。

# サーバー起動
npx compodoc -s。
```

## パフォーマンス最適化ツール

### Lighthouse

Webアプリケーションのパフォーマンス、アクセシビリティ、SEOなどを分析するツールです。

```bash
# インストール
npm install --save-dev lighthouse。

# 実行
npx lighthouse https://example.com --view。
```

### webpack-bundle-analyzer

webpackバンドルの内容を視覚化し、最適化の機会を特定するツールです。

```bash
# インストール
npm install --save-dev webpack-bundle-analyzer。

# webpack.config.jsに追加
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;。

module.exports = {。
  plugins: [
    new BundleAnalyzerPlugin()。
  ]
};
```

## CI/CD統合

### GitHub Actions

GitHub Actionsを使用したTypeScriptプロジェクトのCI/CD設定例：。

```yaml
# .github/workflows/main.yml
name: CI。

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3。
    - name: Use Node.js。
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
        cache: 'npm'
    - run: npm ci。
    - run: npm run lint。
    - run: npm run test。
    - run: npm run build。
```

### GitLab CI

GitLab CIを使用したTypeScriptプロジェクトのCI/CD設定例：。

```yaml
# .gitlab-ci.yml
image: node:16。

stages:
  - test。
  - build。

cache:
  paths:
    - node_modules/。

lint:
  stage: test
  script:
    - npm ci。
    - npm run lint。

test:
  stage: test
  script:
    - npm ci。
    - npm run test。

build:
  stage: build
  script:
    - npm ci。
    - npm run build。
  artifacts:
    paths:
      - dist/。
```

## 型定義ツール

### TypeScript Definition Manager (TSD)

TypeScriptの型定義ファイルを管理するツールです。

```bash
# インストール
npm install -g tsd。

# 型定義の検索
tsd query lodash。

# 型定義のインストール
tsd install lodash。
```

### DefinitelyTyped

コミュニティによって維持されているTypeScriptの型定義リポジトリです。

```bash
# 型定義のインストール
npm install --save-dev @types/lodash。
```

## 開発ワークフロー

### 推奨ワークフロー

1. **プロジェクト設定**:
   - TypeScriptのインストールと`tsconfig.json`の設定。
   - ESLintとPrettierのセットアップ。
   - Jestのセットアップ。
   - huskyとlint-stagedの設定。

2. **開発サイクル**:
   - コードの作成と編集。
   - `tsc --watch`または`npm run dev`で継続的なコンパイル。
   - `npm run test -- --watch`で継続的なテスト。
   - コミット前に`npm run lint`と`npm run format`する。

3. **コードレビュー**:
   - ESLintとPrettierのチェック。
   - テストカバレッジの確認。
   - TypeScriptの型チェックエラーの確認。

4. **ビルドとデプロイ**:
   - `npm run build`でプロダクションビルド。
   - バンドルサイズの分析。
   - CI/CDパイプラインでの自動テストとデプロイ。

### package.json スクリプト例

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "lint:fix": "eslint 'src/**/*.{ts,tsx}' --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx}'",
    "typecheck": "tsc --noEmit",
    "docs": "typedoc",
    "prepare": "husky install"
  }
}
```

## フレームワーク固有のツール

### React

- Create React App: Reactアプリケーションの作成。
- React Developer Tools: ブラウザ拡張機能。
- React Testing Library: コンポーネントテスト。

```bash
# TypeScriptを使用したReactアプリの作成
npx create-react-app my-app --template typescript。
```

### Angular

- Angular CLI: Angularアプリケーションの作成と管理。
- Angular Language Service: エディタサポート。
- Angular DevTools: ブラウザ拡張機能。

```bash
# Angularアプリの作成
ng new my-app --strict。
```

### Vue.js

- Vue CLI: Vueアプリケーションの作成と管理。
- Vue DevTools: ブラウザ拡張機能。
- Vue Test Utils: コンポーネントテスト。

```bash
# TypeScriptを使用したVueアプリの作成
vue create my-app。
# TypeScriptを選択
```

## 関連情報

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [TSDocの掟](tsdoc-01jpcvxfxjwwn785s5jg7t1773.md)
- [TypeScriptコーディングスタイル](tsstyle-01jpcvxfxjwwn785s5jg7t1770.md)
- [TypeScriptコードレビュー](tsreview-01jpcvxfxjwwn785s5jg7t1771.md)
