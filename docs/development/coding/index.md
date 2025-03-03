# コーディングの掟

## 基本原則

- コーディング規約は言語の標準に従う（フォーマッターで自動適用）
- オブジェクト間の循環参照を避ける
- シンプルで理解しやすいコードを心がける

## コードの品質管理

### コメントに関するルール

- 全てのコメントは英語で記述する（コード上のコメント、ドキュメンテーションコメント共に）
- コードを読めば分かることはコメントに書かない
- コメントには以下を記述する
  - Why: なぜその実装が必要か
  - Why not: なぜ他の実装方法を選択しなかったか

### デバッグに関するルール

- 適切なログ出力を入れる
- ステップバイステップで解析可能にする
- デバッグログとアプリケーションログを区別する

## コード設計の原則

- 単一責任の原則を守る
- 依存関係を最小限に抑える
- テスト容易性を考慮した設計を行う

## 言語固有の規約

各プログラミング言語固有のコーディング規約とドキュメンテーションルールは以下を参照してください：

### Golang
- [Golangコーディング規約](golang/index.md)
- [Golangドキュメンテーションルール](golang/golangdoc.md)
- [Golangコーディングスタイル](golang/golangstyle.md)
- [Golangツール活用](golang/golangtools.md)
- [Golangコードレビュー](golang/golangreview.md)
- [Golang参考文献](golang/golangrefs.md)

### Rust
- [Rustコーディング規約](rust/index.md)
- [Rustドキュメンテーションルール](rust/rustdoc.md)

### Scala
- [Scalaコーディング規約](scala/index.md)
- [Scalaドキュメンテーションルール](scala/scaladoc.md)

### TypeScript
- [TypeScriptコーディング規約](typescript/index.md)
- [TypeScriptドキュメンテーションルール](typescript/tsdoc.md)

## 共通ドキュメント

- [ドキュメントコメント規約](doc_comment.md) - 言語共通のドキュメントコメント規約
