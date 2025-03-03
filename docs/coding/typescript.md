# TypeScriptの掟

## 基本原則

- TypeScriptの公式スタイルガイドに従う
- Prettierを使用してコードフォーマットを統一する
- ESLintを使用してコード品質を維持する

## コーディングスタイル

### プロジェクト構成

- `tsconfig.json`で適切なコンパイラオプションを設定する
- モジュールは機能単位で適切に分割する
- バレル（index.ts）を活用して、APIの公開範囲を制御する

### 命名規則

- クラス名、インターフェース名はパスカルケース（例：`UserService`）
- 変数名、関数名、メソッド名はキャメルケース（例：`getUserData`）
- 定数、enum値は大文字のスネークケース（例：`MAX_RETRY_COUNT`）
- インターフェース名に`I`プレフィックスは付けない
- タイプエイリアスは`Type`サフィックスを付ける

### 型システム

- any型の使用は可能な限り避ける
- union型とintersection型を適切に活用する
- ジェネリクスは意味のある制約を付ける
- インデックスシグネチャは慎重に使用する
- readonlyを積極的に活用する

### 非同期処理

- 可能な限りasync/awaitを使用する
- Promiseチェーンは適切に例外処理を行う
- 複数の非同期処理は`Promise.all`や`Promise.race`を活用する

### エラー処理

- カスタムエラークラスを定義して、型安全なエラー処理を行う
- try-catchブロックは適切な範囲で使用する
- エラーメッセージは具体的で理解しやすいものにする

### テスト

- Jestを使用してユニットテストを作成する
- テストケースは境界値を考慮する
- モックとスタブを適切に使用する
- テストカバレッジを維持する

## ツール活用

### 必須ツール

- TypeScript Compiler (`tsc`)
- ESLint - 静的解析
- Prettier - コードフォーマッティング
- Jest - テストフレームワーク

### オプショナルツール

- TypeDoc - ドキュメント生成
- ts-node - 開発時の実行環境
- type-coverage - 型カバレッジチェック

## レビュー時の注意点

- 適切な型定義がされているか
- 不要な型キャストがないか
- null/undefinedの扱いが適切か
- 非同期処理が正しく実装されているか
- パフォーマンスを考慮した実装になっているか

## 参考文献

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [クリーンコード TypeScript](https://github.com/labs42io/clean-code-typescript)
