---
description: 掟プロジェクトのタスク管理に関するルールと規約
ruleId: task-management-01jpcvxfxa9zn7yzy0qtmgyq94
tags: [task-management, rules]
aliases: [task-management-rules]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---


# タスク管理の掟

## GitHub Issueの利用

- TODO管理はGitHub Issueを使用して行う。
- 各Issueには適切なラベルを付与する。
- タスクの目的、要件、受入基準を明確に記述する。
- 関連するIssueやPull Requestへの参照を含める。

## タスクの追跡

- タスクの進捗状況は定期的に更新する。
- ブロッカーや懸念事項が発生した場合は、速やかにIssueにコメントする。
- 完了基準を満たしたことを確認してからIssueをクローズする。

## ブランチ管理とIssueの関係

### イシューブランチの作成

- Issueに対応する作業を開始する際は、必ずIssueブランチを作成する。
- Issueブランチは`issue-[issue番号]`の形式で作成する。

### サブイシューの管理

- 大きなIssueは必要に応じてサブIssueに分割する。
- サブIssueに対応するブランチは、親となるIssueブランチから作成する。
- サブIssueブランチは`issue-[親issue番号]-[サブissue番号]`の形式で作成する。
- サブIssueの作業完了後は、必ず親のIssueブランチに向けてマージする。

### マージの流れ

- すべてのサブIssueブランチが親のIssueブランチにマージされていることを確認する。
- CIがパスしていることを確認する。
- 上記の条件を満たした場合のみ、Issueブランチをmainブランチにマージできる。
