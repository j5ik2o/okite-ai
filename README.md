# okite-ai

「okite-ai」には二つの意味が込められている：

- **AIのための掟** - AIエージェントが従うべきベストプラクティスと規約
- **目を覚ませAI!** - AIの能力を最大限に引き出すための起動フレーズ

DDD・CQRS/ES・クリーンアーキテクチャなどソフトウェア設計の知見を凝縮した、AIエージェント（Claude Code / Codex CLI / Gemini CLI / Cursor Agent など）向けの再利用可能な **skills** と **rules** のコレクションです。

## なぜ AI 時代でも設計が重要なのか

AIにとって「正しさ」は相対的なものであり、基準を与えなければ判断できない。

集約の境界を守ることも、ドメインロジックをコントローラに書くことも、コードを丸ごと削除することも——基準がなければどれも等しく「正解」になり得る。AIは自ら設計の良し悪しを判断できない。DDD・CQRS/ES・クリーンアーキテクチャといった設計の知識をスキルとして与えることは、AIの判断を **グラウンディング**（判断の拠り所を与えること） すること、すなわち「このプロジェクトにおける正しさの基準」を明示することに他ならない。

- **集約境界・不変条件** — 何を一つの整合性単位として守るべきか
- **コマンドとクエリの分離** — 読み書きをどう構造化すべきか
- **依存方向の制約** — どの層が何に依存してよいか

これらは教条的に適用するものではなく、プロジェクトの文脈に応じて判断し使い分けるものである。その判断の引き出しとなる設計知識を、AIが活用できる形で整備したのがこのリポジトリである。スキルをそのまま使うのではなく、各プロジェクトの文脈に応じてカスタマイズ・最適化して使うことを推奨する。

## 特徴

- `skills/` / `rules/` を単一ソースで管理し、各CLI向けディレクトリへシンボリックリンクで同期
- `npx skills add` で個別スキルをインストール可能
- `scripts/configure.sh` で `.claude` `.codex` `.gemini` `.cursor` `.opencode` を一括セットアップ

## クイックスタート

### 必要条件

- Node.js（`npx` 利用時）
- Git / Bash（submodule 方式利用時）
- 利用するCLIのいずれか: `claude` / `codex` / `gemini` / `cursor-agent` / `opencode`

## 使い方

### npx skills add で個別インストール（推奨）

必要なスキルだけを自分のプロジェクトにインストールできます。

```sh
# スキル一覧を表示
npx skills add j5ik2o/okite-ai --list

# 単一スキルをインストール
npx skills add j5ik2o/okite-ai@aggregate-design

# 複数スキルを一括インストール
npx skills add j5ik2o/okite-ai@clean-architecture j5ik2o/okite-ai@error-handling

# 特定バージョン（タグ）を指定してインストール
npx skills add https://github.com/j5ik2o/okite-ai/tree/v1.0.0/skills/aggregate-design
```

#### 利用可能なスキル一覧

<details>
<summary>DDD / Domain Modeling</summary>

```sh
npx skills add j5ik2o/okite-ai@aggregate-design
npx skills add j5ik2o/okite-ai@aggregate-transaction-boundary
npx skills add j5ik2o/okite-ai@cross-aggregate-constraints
npx skills add j5ik2o/okite-ai@domain-building-blocks
npx skills add j5ik2o/okite-ai@domain-model-first
npx skills add j5ik2o/okite-ai@domain-model-extractor
npx skills add j5ik2o/okite-ai@domain-primitives-and-always-valid
npx skills add j5ik2o/okite-ai@ddd-module-pattern
npx skills add j5ik2o/okite-ai@repository-design
npx skills add j5ik2o/okite-ai@repository-placement
npx skills add j5ik2o/okite-ai@when-to-wrap-primitives
```

</details>

<details>
<summary>CQRS / Event Sourcing</summary>

```sh
npx skills add j5ik2o/okite-ai@cqrs-aggregate-modeling
npx skills add j5ik2o/okite-ai@cqrs-to-event-sourcing
npx skills add j5ik2o/okite-ai@cqrs-tradeoffs
npx skills add j5ik2o/okite-ai@pekko-cqrs-es-implementation
```

</details>

<details>
<summary>Architecture / Design</summary>

```sh
npx skills add j5ik2o/okite-ai@clean-architecture
npx skills add j5ik2o/okite-ai@error-classification
npx skills add j5ik2o/okite-ai@error-handling
npx skills add j5ik2o/okite-ai@parse-dont-validate
npx skills add j5ik2o/okite-ai@backward-compat-governance
```

</details>

<details>
<summary>OOP Principles</summary>

```sh
npx skills add j5ik2o/okite-ai@tell-dont-ask
npx skills add j5ik2o/okite-ai@law-of-demeter
npx skills add j5ik2o/okite-ai@first-class-collection
npx skills add j5ik2o/okite-ai@breach-encapsulation-naming
npx skills add j5ik2o/okite-ai@intent-based-dedup
```

</details>

<details>
<summary>Package / Module</summary>

```sh
npx skills add j5ik2o/okite-ai@package-design
npx skills add j5ik2o/okite-ai@refactoring-packages
```

</details>

<details>
<summary>Skills / Rules Operations</summary>

```sh
npx skills add j5ik2o/okite-ai@creating-rules
npx skills add j5ik2o/okite-ai@custom-linter-creator
npx skills add j5ik2o/okite-ai@deepresearch-readme
npx skills add j5ik2o/okite-ai@reviewing-skills
npx skills add j5ik2o/okite-ai@skill-creator
npx skills add j5ik2o/okite-ai@migrate-skill-to-agent
```

</details>

### submodule + configure.sh で一括導入

すべてのスキル・ルール・コマンドをまとめて導入する場合はこちらを使います。

```sh
git submodule add git@github.com:j5ik2o/okite-ai.git references/okite-ai
./references/okite-ai/scripts/configure.sh
```

必要に応じて `.okite_ignore` を作成し、不要なスキル/ルールを除外できます。

```txt
# .okite_ignore
skills/clean-architecture
rules/prefer-immutability
```

## ドキュメント

- ドキュメント索引: [docs/README.md](docs/README.md)
- 共通エージェント設定: [AGENTS.md](AGENTS.md)
- SDDガイド: [.agents/CC-SDD.md](.agents/CC-SDD.md)
- スキル一覧: [docs/skills.md](docs/skills.md)
- スキル実体: [skills/](skills)
- 共有ルール: [rules/](rules)

## ヘルプ

- バグ報告・質問: [Issues](https://github.com/j5ik2o/okite-ai/issues)

## コントリビュート

Issue / Pull Request を歓迎します。大きな変更は、先に Issue で方針を共有してください。

## メンテナー

- [@j5ik2o](https://github.com/j5ik2o)

## ライセンス

MIT License. See [MIT-LICENSE.md](MIT-LICENSE.md).
