# okite-ai

AIエージェント（Claude Code / Codex CLI / Gemini CLI / Cursor Agent など）向けに、再利用可能な **skills** と **rules**、および Spec-Driven Development（SDD）ワークフローを提供するリポジトリです。

## Highlights

- `skills/` / `rules/` を単一ソースで管理し、各CLI向けディレクトリへシンボリックリンクで同期
- `npx skills add` で個別スキルをインストール可能
- `scripts/configure.sh` で `.claude` `.codex` `.gemini` `.cursor` `.opencode` を一括セットアップ
- Kiro SDD コマンド群（仕様策定→設計→タスク→実装）を利用可能

## Quickstart

### Requirements

- Node.js（`npx` 利用時）
- Git / Bash（submodule 方式利用時）
- 利用するCLIのいずれか: `claude` / `codex` / `gemini` / `cursor-agent` / `opencode`

## Usage

### npx skills add で個別インストール（推奨）

必要なスキルだけを自分のプロジェクトにインストールできます。

```sh
# 単一スキルをインストール
npx skills add j5ik2o/okite-ai@aggregate-design

# 複数スキルを一括インストール
npx skills add j5ik2o/okite-ai@clean-architecture j5ik2o/okite-ai@error-handling
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

## Documentation

- ドキュメント索引: [docs/README.md](docs/README.md)
- 共通エージェント設定: [AGENTS.md](AGENTS.md)
- SDDガイド: [.agents/CC-SDD.md](.agents/CC-SDD.md)
- スキル一覧: [docs/skills.md](docs/skills.md)
- スキル実体: [skills/](skills)
- 共有ルール: [rules/](rules)

## Getting help

- バグ報告・質問: [Issues](https://github.com/j5ik2o/okite-ai/issues)

## Contributing

Issue / Pull Request を歓迎します。大きな変更は、先に Issue で方針を共有してください。

## Maintainers

- [@j5ik2o](https://github.com/j5ik2o)

## License

MIT License. See [MIT-LICENSE.md](MIT-LICENSE.md).
