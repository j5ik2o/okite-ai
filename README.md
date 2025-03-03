# AI Code Agentのための「掟」

このリポジトリには、AI Code Agentが従うべきルールやナレッジをまとめている。

「掟（okite）」には、共通のルールを示す「掟」という意味に加えて、「起きて！（目覚めよ！）」というAIへの呼びかけの意味も込められている。

## 掟の目的

AI Code Agentがタスクを正確かつ一貫性をもって遂行できるよう、共通の基準を明示することが目的である。これにより、タスクの品質と効率を向上させ、認識の統一を図る。

## 掟のカテゴリ

### 実装ルール

- **コーディングルール**
  - Scala固有ルール
  - Rust固有ルール
  - Go固有ルール
- **バージョン管理ルール**

### 設計ルール

- モジュール設計ルール
- レイヤー設計ルール
- ドメインモデル設計ルール

### テストルール

- **テスト実施ルール**
- **テストコード記述ルール**
  - 単体テスト
  - プロパティベースドテスト
  - ベンチマークテスト
- **テスト結果報告ルール**

### ドキュメンテーションルール

- ドキュメントの作成・管理方法

### セキュリティルール

- セキュリティ対策およびベストプラクティス

### 使用可能なツール

以下のツールを原則として使用できる。

- git
- GitHub CLI (gh)
- sbt
- cargo
- その他、プロジェクトで明示的に指定されたツール

## 利用方法

- AI Code Agentは、このリポジトリに記載された掟に従ってタスクを実行する。
- ナレッジやルールは定期的に見直し、常に最新の状態を維持する。
- 新しいルールや改善案がある場合は、プルリクエストを通じて提案する。
- 提案されたルールは、レビュープロセスで精査され、合意を得てから反映する。

## 運用方法

- 本リポジトリはGit Submoduleとして各プロジェクトから参照される。
- 各プロジェクトは随時リポジトリを更新し、最新のナレッジを取り入れる。
- 共通ナレッジの更新は本リポジトリで一元的に管理し、変更履歴を明確に記録する。
- 影響が大きい変更やルールの大幅な改訂については、事前に通知し、周知期間を設ける。

## コントリビューション

- ルールを追加・修正する際は、明確かつ簡潔な記述を心がける。
- 提案には変更の背景や理由を添え、内容が容易に理解されるよう工夫する。
- 提案者同士で積極的に意見を交換し、ナレッジの質を高める。

## 注意事項

- AIの安定した挙動のため、ルールの変更は慎重に行う。
- 変更による影響を事前に評価し、必要に応じて検証を行う。
- 提案された変更は、影響範囲を考慮したレビューを経てからマージされる。
- 緊急時を除き、大幅な変更は段階的に実施し、リスクの低減を図る。

