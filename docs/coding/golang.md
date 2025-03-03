# Golangの掟

## 基本原則

- [Effective Go](https://golang.org/doc/effective_go)に従う
- Go標準のフォーマッター（`go fmt`）を必ず使用する
- `golangci-lint`を使用してコード品質を維持する

## ドキュメンテーション

- [Golangドキュメンテーションルール](golang/golangdoc.md)を参照してください。

## コーディングスタイル

### パッケージ構成

- パッケージ名は小文字で、単一の単語を使用する
- `internal`パッケージを適切に活用し、公開APIを最小限に抑える
- サブパッケージは適切な粒度で分割する

### 命名規則

- インターフェース名は、単一メソッドの場合は「メソッド名 + er」（例：`Reader`, `Writer`）
- 略語は一貫して大文字または小文字で扱う（例：`ID`, `Http`は避けて`HTTP`を使用）
- エクスポートする識別子は必ずドキュメンテーションコメントを付ける

### エラー処理

- エラーは常に即座に処理する
- エラーメッセージは小文字で始め、句点を付けない
- カスタムエラーは`errors.New`または`fmt.Errorf`を使用する
- 意味のあるエラーラッピングを行う（`%w`を適切に使用）

### 並行処理

- ゴルーチンのリークを防ぐため、適切なキャンセル処理を実装する
- チャネルの所有権を明確にする
- 共有メモリへのアクセスは`sync`パッケージを使用して適切に保護する

### テスト

- テーブル駆動テストを活用する
- サブテストを使用して関連するテストをグループ化する
- ヘルパー関数には`t.Helper()`を付ける

## ツール活用

### 必須ツール

- `go fmt` - コードフォーマッティング
- `go vet` - 静的解析
- `golangci-lint` - 高度な静的解析
- `goimports` - インポートの整理とフォーマット

### オプショナルツール

- `gopls` - 言語サーバー
- `gotests` - テストコード生成
- `gofumpt` - より厳密なフォーマッティング

## レビュー時の注意点

- 不要なインターフェースの定義がないか
- エラー処理が適切に行われているか
- メモリ効率が考慮されているか
- 並行処理が適切に実装されているか
- パッケージ依存関係が適切か

## 参考文献

- [Effective Go](https://golang.org/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)
