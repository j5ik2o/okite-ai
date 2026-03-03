# okite-ai

AIエージェント（Claude Code / Codex CLI / Gemini CLI / Cursor Agent など）向けに、再利用可能な `skills` と `rules`、および Spec-Driven Development（SDD）ワークフローを提供するリポジトリです。
`skills/` と `.agents/` を実体にして、各CLI側ディレクトリをシンボリックリンクで同期します。

## Quickstart

### Requirements

- Git
- Bash（macOS / Linux）
- 利用するCLIのいずれか: `claude` / `codex` / `gemini` / `cursor-agent` / `opencode`

## Usage

### スキル単体で使う

submodule を使わず、必要なスキルだけを `npx skills` でインストールできます。

```sh
# 一覧を確認
npx skills add --list j5ik2o/okite-ai

# 特定のスキルをインストール
npx skills add j5ik2o/okite-ai -s aggregate-design

# 全スキルを一括インストール
npx skills add j5ik2o/okite-ai --all
```

### 他プロジェクトへ導入する（submodule）

```sh
git submodule add git@github.com:okite-ai/okite-ai.git references/okite-ai
./references/okite-ai/scripts/configure.sh
```

必要に応じて `.okite_ignore` を作成し、導入対象のスキル/ルールを除外できます。

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
- スキル実体: [skills](skills)
- 共有ルール: [rules](rules)

## Getting help

- バグ報告・質問: [Issues](https://github.com/j5ik2o/okite-ai/issues)

## Contributing

Issue / Pull Request を歓迎します。大きな変更は、先に Issue で方針を共有してください。

## Maintainers

- [@j5ik2o](https://github.com/j5ik2o)

## License

MIT License. See [MIT-LICENSE.md](MIT-LICENSE.md).
