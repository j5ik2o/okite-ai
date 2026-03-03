# Skills

このリポジトリのスキル実体は `.agents/skills/` 配下です。
`.claude/skills/` と `.codex/skills/` はシンボリックリンク経由で参照します。

## DDD / Domain Modeling

| Skill | 概要 |
|---|---|
| [`aggregate-design`](../.agents/skills/aggregate-design/SKILL.md) | 集約設計ルールに基づく設計/レビュー支援 |
| [`aggregate-transaction-boundary`](../.agents/skills/aggregate-transaction-boundary/SKILL.md) | 集約とトランザクション境界の設計支援 |
| [`cross-aggregate-constraints`](../.agents/skills/cross-aggregate-constraints/SKILL.md) | 集約間制約の設計判断を支援 |
| [`domain-building-blocks`](../.agents/skills/domain-building-blocks/SKILL.md) | 値オブジェクト/エンティティ/集約/ドメインサービス設計 |
| [`domain-model-first`](../.agents/skills/domain-model-first/SKILL.md) | ドメインモデル中心の開発手順 |
| [`domain-model-extractor`](../.agents/skills/domain-model-extractor/SKILL.md) | 既存コードからドメインモデル抽出 |
| [`domain-primitives-and-always-valid`](../.agents/skills/domain-primitives-and-always-valid/SKILL.md) | Domain Primitives / Always-Valid設計 |
| [`ddd-module-pattern`](../.agents/skills/ddd-module-pattern/SKILL.md) | DDDモジュールパターンに沿った構造設計 |
| [`repository-design`](../.agents/skills/repository-design/SKILL.md) | リポジトリ設計ルールとアンチパターン検出 |
| [`repository-placement`](../.agents/skills/repository-placement/SKILL.md) | リポジトリ配置場所の設計ガイド |
| [`when-to-wrap-primitives`](../.agents/skills/when-to-wrap-primitives/SKILL.md) | プリミティブ型ラップの判断支援 |

## CQRS / Event Sourcing

| Skill | 概要 |
|---|---|
| [`cqrs-aggregate-modeling`](../.agents/skills/cqrs-aggregate-modeling/SKILL.md) | CQRS/ES導入時の集約モデリング支援 |
| [`cqrs-to-event-sourcing`](../.agents/skills/cqrs-to-event-sourcing/SKILL.md) | CQRSでESが必要になる背景を整理 |
| [`cqrs-tradeoffs`](../.agents/skills/cqrs-tradeoffs/SKILL.md) | CQRSの一貫性/可用性/拡張性のトレードオフ分析 |
| [`pekko-cqrs-es-implementation`](../.agents/skills/pekko-cqrs-es-implementation/SKILL.md) | Scala 3 + PekkoでのCQRS/ES実装パターン |

## Architecture / Design

| Skill | 概要 |
|---|---|
| [`clean-architecture`](../.agents/skills/clean-architecture/SKILL.md) | クリーンアーキテクチャ設計/レビュー支援 |
| [`error-classification`](../.agents/skills/error-classification/SKILL.md) | Error/Defect/Fault/Failure分類の整理 |
| [`error-handling`](../.agents/skills/error-handling/SKILL.md) | 回復可能性ベースのエラー設計 |
| [`parse-dont-validate`](../.agents/skills/parse-dont-validate/SKILL.md) | Parse, don't validate パターンの適用 |
| [`backward-compat-governance`](../.agents/skills/backward-compat-governance/SKILL.md) | 後方互換性ガバナンスの設計支援 |

## OOP Principles

| Skill | 概要 |
|---|---|
| [`tell-dont-ask`](../.agents/skills/tell-dont-ask/SKILL.md) | Tell, Don't Ask に基づく責務整理 |
| [`law-of-demeter`](../.agents/skills/law-of-demeter/SKILL.md) | デメテルの法則に基づく結合度改善 |
| [`first-class-collection`](../.agents/skills/first-class-collection/SKILL.md) | ファーストクラスコレクション設計 |
| [`breach-encapsulation-naming`](../.agents/skills/breach-encapsulation-naming/SKILL.md) | カプセル化を破るgetter命名規約 |
| [`intent-based-dedup`](../.agents/skills/intent-based-dedup/SKILL.md) | 意図ベースでの共通化判断 |

## Package / Module Refactoring

| Skill | 概要 |
|---|---|
| [`package-design`](../.agents/skills/package-design/SKILL.md) | パッケージ/モジュール構造の設計支援 |
| [`refactoring-packages`](../.agents/skills/refactoring-packages/SKILL.md) | 既存構造の分割/整理リファクタリング |

## Skills / Rules Operations

| Skill | 概要 |
|---|---|
| [`deepresearch-readme`](../.agents/skills/deepresearch-readme/SKILL.md) | OSS向けREADME作成/改善/レビュー |
| [`creating-rules`](../.agents/skills/creating-rules/SKILL.md) | `.claude/rules/*.md` ルール作成支援 |
| [`custom-linter-creator`](../.agents/skills/custom-linter-creator/SKILL.md) | AI向けカスタムlintルール作成 |
| [`reviewing-skills`](../.agents/skills/reviewing-skills/SKILL.md) | SKILL.md品質レビュー |
| [`skill-creator`](../.agents/skills/skill-creator/SKILL.md) | 新規スキル作成支援 |
| [`migrate-skill-to-agent`](../.agents/skills/migrate-skill-to-agent/SKILL.md) | スキル実体を `.agents/skills` へ移行 |

## Codex System Skills

| Skill | 概要 |
|---|---|
| [`skill-creator (system)`](../.agents/skills/.system/skill-creator/SKILL.md) | Codex用のスキル作成支援（system） |
| [`skill-installer (system)`](../.agents/skills/.system/skill-installer/SKILL.md) | Codexスキルのインストール支援（system） |

## Notes

- 実体: `.agents/skills/`
- Claude参照: `.claude/skills/`（リンク）
- Codex参照: `.codex/skills/`（リンク）
- 最新の詳細トリガー/説明は [AGENTS.md](../AGENTS.md) の `Available skills` を参照
