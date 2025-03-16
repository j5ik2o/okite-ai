---
description: TypeScriptのコーディング規約と開発ガイドライン
ruleId: typescript-01jpcvxfxf9jafj03jk1zks31w
tags:
  - typescript
  - coding
  - guidelines
aliases:
  - typescript-rules
  - ts-guidelines
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
  - '**/*.go'
  - '**/*.rs'
  - '**/*.scala'
---

# TypeScriptの掟

## 基本原則

- TypeScriptの公式スタイルガイドに従う。
- Prettierを使用してコードフォーマットを統一する。
- ESLintを使用してコード品質を維持する。

## モジュール構成

TypeScriptのコーディング規約は以下のモジュールに分かれています：。

- [TSDocの掟](typescript/tsdoc-01jpcvxfxjwwn785s5jg7t1773.md) - コードドキュメントの書き方
- [TypeScriptコーディングスタイル](typescript/tsstyle-01jpcvxfxjwwn785s5jg7t1770.md) - 命名規則、型システム、エラー処理など
- [TypeScriptツール活用](typescript/tstools-01jpcvxfxha41b95hkx2y2y2pz.md) - 開発ツールの使用方法
- [TypeScriptコードレビュー](typescript/tsreview-01jpcvxfxjwwn785s5jg7t1771.md) - レビュー時のチェックポイント
- [TypeScript参考文献](typescript/tsrefs-01jpcvxfxjwwn785s5jg7t1772.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- クラス名はパスカルケース、変数・関数名はキャメルケースを使用する。
- `any`型の使用は可能な限り避ける。
- 非同期処理には`async/await`を一貫して使用する。
- 型安全なエラー処理を実装する。
- テストは網羅的に書き、エッジケースも考慮する。

### 必須ツール

- `tsc` - TypeScriptコンパイラ。
- `eslint` - 静的解析。
- `prettier` - コードフォーマッター。
- `jest` - テストフレームワーク。
- `ts-node` - 開発時の実行環境。
