---
created: 2025-03-03
updated: 2025-03-03
tags: [index]
aliases: [home]
---

# 掟 AI ドキュメント

## メインコンテンツ

### 開発プロセス

- [[development|開発の掟]]
  - [[coding|コーディングの掟]]
  - [[testing|テストの掟]]
  - [[documentation|ドキュメント管理の掟]]

### プロジェクト管理

- [[task-management|タスク管理の掟]]
- [[version-control|バージョン管理の掟]]
- [[pull-request|PRレビューの掟]]

### ツール

- [[tools|開発ツールの掟]]

## このドキュメントの書き方

- index.mdは使用禁止。${dir}/index.mdを配置することも禁止
- Rust2018方式のモジュールと同じ形式
```
docs.md # モジュールインデックス
docs/ # モジュールディレクトリ（ファイルを持つ場合）
  coding.md # サブモジュールインデックス
  coding/ # サブモジュールディレクトリ
    doc_comment.md サブサブモジュールインデックス
  testing.md # モジュールインデックス（ファイルを持たない場合）
```
- 悪い例
  - 例1: ${dir_name}/index.md
  - 例2: ${dir_name}/${dir_name}.md
- 良い例
  - 例1: モジュール内にファイルを持つ場合
    - ${dir_name}.md
    - ${dir_name}/${file_name}.md
  - 例2: モジュール内にファイルを持たない場合
    - ${file_name}.md
