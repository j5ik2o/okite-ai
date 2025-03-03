---
created: 2025-03-03
updated: 2025-03-03
tags: [version-control, rules]
aliases: [version-control-rules]
---

# バージョン管理の掟

## コミットメッセージのルール

- git commitのメッセージは英語で書き、Conventional Commitsの規約に従う
  - 例: `fix:`, `feat:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
  - コミットメッセージは変更内容を明確に説明する
  - プレフィックスは変更の種類を正確に反映する

## コミットの粒度

- 1つのコミットは1つの論理的な変更を表す
- 複数の異なる変更は別々のコミットに分ける
- コミット前に`git diff`で変更内容を確認する
