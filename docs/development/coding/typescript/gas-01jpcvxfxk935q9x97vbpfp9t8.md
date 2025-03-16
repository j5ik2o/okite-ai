---
description: gas developmentに関するドキュメント
ruleId: gas-01jpcvxfxk935q9x97vbpfp9t8
tags: ["development","coding","typescript"]
aliases: ["gas-guidelines", "google-apps-script"]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

# Google Apps Script (GAS) 開発ガイドライン

## 1. GASの基本概念

Google Apps Script (GAS) は、Google のクラウドサービスを拡張するためのJavaScriptベースのスクリプト言語およびプラットフォームです。以下の特徴を持ちます：。

- Google サービス（Sheets, Docs, Calendar, Gmail など）と密接に統合。
- クラウド上で実行され、サーバーサイドのスクリプト機能を提供。
- V8ランタイムエンジンを採用（最新のJavaScript機能の一部をサポート）
- WebアプリケーションやGoogle WorkspaceアドオンなどのUI構築が可能。

## 2. GAS の制約と注意点

### 2.1 非同期処理の制約

- GAS は V8 ランタイムで Promise や async/await 構文が構文上は使用可能ですが、**真の非同期処理は実行されません**。
- GAS には本格的なイベントループが存在せず、並列処理の実行はできません。
- async/await を使用しても、実行は基本的に同期処理としてブロックされます。
- このため、同期処理パターンを前提としたコードを使用することを推奨します。

### 2.2 ES6+機能の制限

- 一部のモダンな JavaScript 機能は利用できない場合があります。
- ES6 以降の機能はサポートされていますが、一部の機能（例：dynamic import）は利用できません。
- 場合によってはトランスパイルが必要です。
- モジュールシステムはサポートされていますが、従来の GAS とは実装方法が異なります。

### 2.3 実行時間制限

- GAS には 1 回の実行につき 6 分という制限があります。
- 大量のデータを処理する場合は、バッチ処理や分割実行を検討する必要があります。
- 特に無条件のデータ取得メソッドは避け、常に検索条件を指定してデータ量を制限すべきです。
- トリガーを使用して長時間の処理を小さなタスクに分割できます。

### 2.4 メモリ制限

- GAS には処理可能なデータサイズの制限があります。
- スクリプトのファイル数とサイズにも制限があります（スクリプトプロジェクト全体で 50MB まで）
- 大きなデータセットを扱う場合はページネーションを利用しましょう。
- プロパティストアやキャッシュサービスを使って大きなデータを分割して保存することを検討してください。

### 2.5 スクリプトの保護

- GAS スクリプトにはバージョン管理があり、デプロイ時に特定のバージョンを指定できます。
- スクリプトに対するアクセス権限を制御できます（読み取り専用、編集可能など）
- コードの公開範囲を注意深く設定する必要があります。

## 3. GAS の主要コンポーネント

### 3.1 スクリプトエディタ

- ブラウザベースのコードエディタ。
- デバッグ機能（ログ出力、例外表示など）
- 実行履歴の確認。
- プロジェクト管理機能。

### 3.2 トリガー

- 時間駆動トリガー：定期的に実行（分単位、時間単位、日単位など）
- イベント駆動トリガー：特定のイベント（フォーム送信、ドキュメント編集など）発生時に実行。
- インストール可能トリガー：ユーザー認証が必要で高い権限を持つ。
- 単純トリガー：権限が限定的だが設定が簡単。

### 3.3 スクリプトバインディング

- コンテナバインドスクリプト：特定の Google ドキュメント、スプレッドシートなどに紐づくスクリプト。
- スタンドアローンスクリプト：特定のドキュメントに紐づかない独立したスクリプト。
- アドオン：Google Workspace アプリケーション用の拡張機能。

### 3.4 ウェブアプリケーション

- GAS を使ってウェブアプリケーションを構築可能。
- HTML サービスと HTML テンプレートによる UI 構築。
- doGet() と doPost() によるHTTPリクエスト処理。
- アクセス権限の制御（自分のみ、ドメイン内、全員など）

## 4. GAS 開発のベストプラクティス

### 4.1 スクリプトの構造化

- 関数を機能ごとにグループ化し、命名規則を統一する。
- グローバル変数の使用を最小限に抑える。
- 可能な限りモジュール性を高める（関数やクラスを再利用可能に設計）
- TypeScript を使用する場合は、GAS の制約を考慮した tsconfig.json 設定する。

### 4.2 効率的なコーディング

- API 呼び出しは最小限に抑える（特に外部 API）
- バッチ処理を活用（例：SpreadsheetApp.flush() でまとめて更新）
- キャッシュとプロパティストアを効果的に使用する。
- 処理の進捗状況をログに記録し、デバッグを容易にする。

### 4.3 エラー処理とロギング

- try-catch ブロックを使用して例外を適切に処理する。
- Console.log() を使用してデバッグ情報を出力する。
- ユーザーに分かりやすいエラーメッセージを表示する。
- 重要な操作の前にはバックアップを作成する。

### 4.4 セキュリティ対策

- スクリプトの公開範囲と権限を最小限に設定する。
- パスワードやAPIキーなどの機密情報はプロパティストアに保存する。
- ユーザー入力は必ず検証し、インジェクション攻撃を防止する。
- OAuth 認証を適切に実装する。

## 5. TypeScript と GAS の連携

### 5.1 開発環境の準備

- clasp を使用したローカル開発環境の構築。
- TypeScript の型定義ファイル（@types/google-apps-script）のインストール。
- エディタ設定（VS Code の場合は extensions.json や settings.json）

### 5.2 TypeScript の設定

GAS の実行環境に合わせた tsconfig.json の推奨設定：。

```json
{
  "compilerOptions": {
    "target": "es2019", // GAS の V8 ランタイムに合わせる
    "module": "none", // GAS での実行を考慮
    "moduleResolution": "node",
    "esModuleInterop": true,
    "lib": ["esnext"],
    "strict": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "downlevelIteration": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 5.2.1 esbuildの設定

TypeScriptで記述したGASプロジェクトをバンドルするために、esbuildを使用することをお勧めします。以下に`esbuild.js`の標準的な設定例を示します：。

```javascript
import path from "node:path";
import esbuild from "esbuild";。
import { GasPlugin } from "esbuild-gas-plugin";。

esbuild。
  .build({。
    entryPoints: ["./src/main.ts"], // エントリポイントを指定
    bundle: true,                   // 依存関係をまとめて一括バンドル
    minify: true,                   // コードを圧縮
    outfile: "./dist/main.js",      // 出力先
    plugins: [GasPlugin],           // GAS用にimport文やstrictを除去するプラグイン
    target: ["es2019"],             // V8ランタイムに対応
    format: "esm",                  // 一旦ESモジュール形式でバンドル
    sourcemap: false,               // ソースマップ不要ならfalse
    resolveExtensions: [".ts", ".js"],
    alias: {
      "@": path.resolve("src"),     // "@/..." で src配下を簡単にimport可能
    },
  })
  .catch((e) => {。
    console.error(e);。
    process.exit(1);。
  });
```

この設定の主なポイント：。
- `GasPlugin`を使って、GAS環境で問題になる`import`文などを適切に処理します。
- `target: ["es2019"]`で、GASのV8ランタイムに対応したコードを生成します。
- エイリアス設定により`@/`から始まるパスでソースコードのインポートが容易になります。
- 依存関係をすべて1つのファイルにバンドルすることで、GASでの読み込み順の問題を解消します。

#### 5.2.2 tsconfig.jsonの完全な設定

TypeScriptコンパイラの設定として、以下の`tsconfig.json`をGAS開発で使用することを推奨します：。

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "none",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "lib": ["esnext"],
    "strict": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "downlevelIteration": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "docs", "coverage"]
}
```

この設定は：。
- GASのV8ランタイムに合わせた`target: "es2019"`を指定。
- 厳格な型チェックを有効化し、コードの安全性を確保。
- パスエイリアス機能を提供し、`@/`からのインポートパスがesbuildの設定と一致。
- デコレータなどのモダンな機能をサポート。

#### 5.2.3 package.jsonの設定

GASプロジェクトの開発に必要な依存関係とスクリプトを定義するpackage.jsonの例：。

```json
{
  "name": "gas-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "npm run type-check && node esbuild.js",
    "push": "cp appsscript.json dist/ && clasp push",
    "open": "clasp open",
    "deploy": "npm run build && npm run push",
    "lint": "biome check .",
    "lint:fix": "biome check --write && biome format --write .",
    "test": "npm run lint && npm run type-check && jest",
    "test:coverage": "npm run lint && npm run type-check && jest --coverage",
    "test:watch": "jest --watch",
    "verify": "npm run lint && npm run test"
  },
  "type": "module",
  "license": "ISC",
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@google/clasp": "^2.5.0",
    "@jest/globals": "^29.7.0",
    "@types/google-apps-script": "^1.0.97",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.13.10",
    "clasp": "^1.0.0",
    "esbuild": "^0.25.0",
    "esbuild-gas-plugin": "^0.8.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.6",
    "typescript": "^5.8.2"
  },
  "dependencies": {
    "date-fns": "^4.1.0"
  }
}
```

この設定で可能になる主な開発ワークフロー：。
- `npm run build`: TypeScriptの型チェックとesbuildによるバンドルする。
- `npm run push`: 生成されたコードとappsscript.jsonをGASにアップロード。
- `npm run deploy`: ビルドとデプロイを一度に実行。
- テスト、リント、型チェックの統合による品質管理。

これにより、モダンな開発環境でGASプロジェクトの開発が効率的に行えます。

#### 5.2.4 Biomeの設定

Biomeは高速かつ現代的なJavaScript/TypeScriptのリンター兼フォーマッターです。以下の`biome.json`設定はGAS開発に最適化されています：。

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "files": {
    "maxSize": 2000000,
    "ignore": ["docs/**/*", "node_modules/**/*", "dist/**/*", ".obsidian/**/*", "coverage/**/*"]
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noConstAssign": "error",
        "useExhaustiveDependencies": "error"
      },
      "suspicious": {
        "noExplicitAny": "off",
        "noImplicitAnyLet": "off"
      },
      "complexity": {
        "noForEach": "off",
        "noStaticOnlyClass": "off"
      },
      "style": {
        "useConst": "error",
        "useSingleVarDeclarator": "off",
        "noUnusedTemplateLiteral": "off",
        "useTemplate": "off"
      }
    },
    "ignore": ["node_modules", "dist", "docs", "docs/**/*", ".obsidian/**/*", "coverage/**/*"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "ignore": ["node_modules", "dist", "docs"]
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  },
  "overrides": [
    {
      "include": ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
      "linter": {
        "rules": {
          "complexity": {
            "useLiteralKeys": "off"
          }
        }
      }
    }
  ]
}
```

この設定の主なポイント：。
- **コード品質の向上**:。
  - 未使用変数の検出、定数の再代入防止、依存配列の網羅性確認など、コード品質を担保するルールを設定。
  - GAS開発に適した設定（`noExplicitAny`や`noImplicitAnyLet`をオフにするなど）

- **コードスタイルの統一**:。
  - スペースによるインデント（2スペース）
  - ダブルクォート、末尾カンマ、セミコロンの使用を統一。
  - 行の最大幅を100文字に制限。

- **最適化されたルール**:。
  - テストファイルに対しては一部ルールを緩和（`useLiteralKeys`をオフ）
  - 生成されたファイルや依存関係のディレクトリは検査対象から除外。

- **自動インポート整理**:。
  - `organizeImports.enabled: true`でインポート文を自動的に整理。

Biomeはpackage.jsonに記載されているとおり、`npm run lint`や`npm run lint:fix`コマンドで実行できます。ESlintよりも高速で、TypeScriptとの統合もスムーズなため、GAS開発のような中小規模プロジェクトに適しています。

### 5.3 clasp の設定

.clasp.json の例：。

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "dist"
}
```

上記はesbuildなどのバンドラーを使用する場合の最小構成です。esbuildはすべての依存関係を解決して単一のファイルにバンドルするため、これだけで十分です。

- `scriptId`: GASプロジェクトの一意のID。
- `rootDir`: バンドルされたコードが出力されるディレクトリ。

> **注意**: バンドラーを使用せず個別のファイルをそのままpushする場合は、以下のような追加設定が必要になることがあります。

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "dist",
  "projectId": "YOUR_PROJECT_ID", // optional
  "fileExtension": "ts", // Change to "js" if not using TypeScript
  "filePushOrder": [
    "src/namespace/common.ts", // ユーティリティ関数など最初に読み込むべきファイル。
    "src/namespace/models.ts",。
    "src/namespace/services.ts",。
    "src/namespace/ui.ts"。
  ]
}
```

### 5.4 appsscript.json の設定

GASプロジェクトの設定ファイル appsscript.json の例：。

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Calendar",
        "version": "v3",
        "serviceId": "calendar"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

このファイルでは以下の設定が可能です：。
- `timeZone`：スクリプトの実行タイムゾーン。
- `dependencies`：有効化する高度なサービス（Google API）
- `exceptionLogging`：例外ログの出力先。
- `runtimeVersion`：使用するランタイムバージョン（V8推奨）
- `webapp`：Webアプリケーションの設定。
- `oauthScopes`：スクリプトが要求する権限スコープ。

## 6. GAS でのテスト戦略

### 6.1 テスト環境の制約

- GAS には組み込みのテストフレームワークがありません。
- ローカル環境では GAS API をモック化する必要があります。
- エミュレーションには限界があり、実際の GAS 環境との違いに注意が必要です。

### 6.2 テスト方法

- ユニットテスト：。
  - QUnit for GAS などのライブラリを使用。
  - ロジックを GAS API から分離し、テスト可能にする。
- 手動テスト：。
  - テスト用の関数を作成し、スクリプトエディタから実行。
  - Logger を使用して結果を確認。
- モック：。
  - 外部サービスや GAS API をモック化してテスト。

### 6.3 テスト駆動開発の適用

- ビジネスロジックを API 呼び出しから分離する。
- 純粋な関数を優先して使用する。
- Dependency Injection パターンを活用する。
- テスト可能なコード設計を心がける。

## 7. GAS 特有のセキュリティ考慮事項

### 7.1 認証と承認

- OAuth2 を使用した API アクセスの実装。
- スコープは必要最小限に設定する。
- ユーザー認証情報の安全な管理。

### 7.2 データ保護

- 機密データの保存には ScriptProperties または UserProperties を使用。
- クライアント側に機密情報を露出させない。
- HTTPS で通信する（WebアプリケーションのURL設定）

### 7.3 コンテンツセキュリティポリシー

- HTML サービスで生成する UI の XSS 対策。
- ユーザー入力のサニタイズ。
- HTML テンプレートの安全な使用。

## 8. GAS のパフォーマンス最適化

### 8.1 スプレッドシート操作の最適化

- Range.setValue() よりも Range.setValues() を使用する。
- getRange() の呼び出し回数を減らす。
- SpreadsheetApp.flush() を適切に使用する。

### 8.2 API 呼び出しの最適化

- キャッシュを活用（CacheService）
- バッチ処理を実装する。
- 必要なデータのみを取得する。

### 8.3 実行時間の管理

- 長時間実行される処理の分割。
- タイムトリガーを使った定期実行。
- 進捗状況の保存と再開機能の実装。

## 9. GAS のデバッグとトラブルシューティング

### 9.1 ロギング

- Console.log() と Logger.log() の使い分け。
- ログレベルの実装（ERROR, WARN, INFO, DEBUG など）
- 構造化ロギングの活用。

### 9.2 実行トレース

- スタックトレースの解析。
- 実行時間の計測。
- メモリ使用量の監視。

### 9.3 一般的な問題と解決策

- 実行時間超過エラーへの対応。
- 権限エラーのトラブルシューティング。
- API クォータ制限への対処。
- スクリプトのデバッグモードの活用。