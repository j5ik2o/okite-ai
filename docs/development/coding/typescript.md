# TypeScriptの掟

## 基本原則

- TypeScriptの公式スタイルガイドに従う
- Prettierを使用してコードフォーマットを統一する
- ESLintを使用してコード品質を維持する

## モジュール構成

TypeScriptのコーディング規約は以下のモジュールに分かれています：

- [ドキュメンテーションルール](typescript/tsdoc.md) - コードドキュメントの書き方
- [コーディングスタイル](typescript/tsstyle.md) - 命名規則、型システム、エラー処理など
- [ツール活用](typescript/tstools.md) - 開発ツールの使用方法
- [コードレビュー](typescript/tsreview.md) - レビュー時のチェックポイント
- [参考文献](typescript/tsrefs.md) - 学習リソースと参考資料

## クイックリファレンス

### 重要な原則

- クラス名はパスカルケース、変数・関数名はキャメルケースを使用する
- `any`型の使用は可能な限り避ける
- 非同期処理には`async/await`を一貫して使用する
- 型安全なエラー処理を実装する
- テストは網羅的に書き、エッジケースも考慮する

### 必須ツール

- `tsc` - TypeScriptコンパイラ
- `eslint` - 静的解析
- `prettier` - コードフォーマッター
- `jest` - テストフレームワーク
- `ts-node` - 開発時の実行環境
