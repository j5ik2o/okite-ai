# Scalaの掟

## 基本原則

- Scala Style Guideに従う
- scalafmtを使用してコードフォーマットを統一する
- scalafix, wartremoverを使用してコード品質を維持する
- 関数型プログラミングの原則を重視する

## ドキュメンテーション

- [Scalaドキュメンテーションルール](scala/scaladoc.md)を参照してください。

## コーディングスタイル

### プロジェクト構成

- sbtを使用してプロジェクトを管理する
- マルチプロジェクト構成を適切に活用する
- 依存関係は明示的に管理する
- 適切なScalaバージョンを使用する

### 命名規則

- クラス名、トレイト名はパスカルケース（例：`UserService`）
- メソッド名、変数名はキャメルケース（例：`getUserData`）
- 定数は大文字のスネークケース（例：`MAX_RETRY_COUNT`）
- パッケージ名は小文字のドット区切り
- 型パラメータは意味のある名前を使用する（`A`, `B`ではなく`T`, `U`や具体的な名前）

### 関数型プログラミング

- 副作用は可能な限り避ける
- イミュータブルなデータ構造を優先する
- for式とmap/flatMapを適切に使い分ける
- パターンマッチングを効果的に活用する
- Option、Either、Tryを適切に使用する

### エラー処理

- Either[Error, A]やValidatedを使用して型安全なエラー処理を行う
- カスタムエラー型を定義して、エラーを表現する
- 例外は可能な限り避け、型で表現する
- エラーメッセージは具体的で理解しやすいものにする

### 非同期処理

- Future/Promiseを適切に使用する
- ExecutionContextは明示的に渡す
- ブロッキング処理は適切に処理する
- cats-effectやZIOなどの型安全な非同期処理ライブラリの使用を検討する

### テスト

- ScalaTestを使用してテストを記述する
- プロパティベーステストを活用する
- モックは必要最小限に抑える
- テストカバレッジを維持する

## ツール活用

### 必須ツール

- sbt - ビルドツール
- scalafmt - コードフォーマッター
- scalafix - リファクタリングツール
- wartremover - コード品質チェック

### オプショナルツール

- metals - 言語サーバー
- scaladoc - ドキュメント生成
- sbt-updates - 依存関係の更新確認
- sbt-native-packager - アプリケーションのパッケージング

## レビュー時の注意点

- 不要な可変状態がないか
- 型の使用が適切か
- パターンマッチングが網羅的か
- エラー処理が型安全に行われているか
- パフォーマンスを考慮した実装になっているか

## 参考文献

- [Scala Style Guide](https://docs.scala-lang.org/style/)
- [Effective Scala](https://twitter.github.io/effectivescala/)
- [Scala with Cats](https://underscore.io/books/scala-with-cats/)
