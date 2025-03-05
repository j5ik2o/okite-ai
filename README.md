# 掟 AI ドキュメント

このリポジトリは、Okite AIプロジェクトのドキュメントを管理するためのObsidianボルトです。

## 構造

- `docs/` - メインドキュメント
  - `ai-agents.md` - AIエージェントに関する基本原則とガイドラインの概要
  - `ai-agents/` - AIエージェント関連ドキュメント
    - `ai-code-agent.md` - AIコードエージェント
    - `best-practices.md` - ベストプラクティス
    - `capabilities.md` - 機能と制限
    - `collaboration-principles.md` - 協働原則
    - `guidelines.md` - ガイドライン
    - `interaction.md` - 対話プロトコル
    - `troubleshooting.md` - トラブルシューティング
  - `development.md` - 開発に関する基本情報
  - `development/` - 開発関連ドキュメント
    - `api/` - API関連ドキュメント
      - `guidelines.md` - APIガイドライン
      - `types/` - API型定義
        - `graphql.md` - GraphQL
        - `grpc.md` - gRPC
        - `rest.md` - REST
    - `coding.md` - コーディング概要
    - `coding/` - コーディング関連ドキュメント
      - `doc_comment.md` - ドキュメントコメント
      - `golang.md` - Golang概要
      - `golang/` - Golang関連
      - `rust.md` - Rust概要
      - `rust/` - Rust関連
      - `scala.md` - Scala概要
      - `scala/` - Scala関連
      - `typescript.md` - TypeScript概要
      - `typescript/` - TypeScript関連
    - `document.md` - ドキュメント作成
    - `pull-request.md` - プルリクエスト
    - `testing.md` - テスト概要
    - `testing/` - テスト関連ドキュメント
      - `benchmark.md` - ベンチマーク
      - `unit-testing.md` - ユニットテスト
  - `meta.md` - メタ情報概要
  - `meta/` - メタ情報関連ドキュメント
    - `rules.md` - ルール
    - `structure.md` - 構造
  - `task-management.md` - タスク管理
  - `tools.md` - ツール
  - `version-control.md` - バージョン管理
- `_templates/` - ドキュメントテンプレート
- `_assets/` - 画像やPDF等のリソース
- `_archive/` - アーカイブされたドキュメント

## 使い方

1. [Obsidian](https://obsidian.md/)をインストール
2. このリポジトリをクローン
3. Obsidianでこのフォルダをボルトとして開く

## 注意事項

- 新しいドキュメントを作成する際は、適切なテンプレートを使用してください
- 画像等のアセットは`_assets`ディレクトリに配置してください
- アーカイブが必要なドキュメントは`_archive`ディレクトリに移動してください
