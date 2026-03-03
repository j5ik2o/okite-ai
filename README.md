# okite-ai

AIエージェント（Claude Code / Codex CLI / Gemini CLI / Cursor Agent など）向けに、再利用可能な `skills` と `rules`、および Spec-Driven Development（SDD）ワークフローを提供するリポジトリです。
`skills/` と `.agents/` を実体にして、各CLI側ディレクトリをシンボリックリンクで同期します。

## Highlights

- `skills/` / `rules/` / `.agents/commands` を単一ソースで管理
- `scripts/configure.sh` で `.claude` `.codex` `.gemini` `.cursor` `.opencode` `.kiro` を一括セットアップ
- Kiro SDD コマンド群（仕様策定→設計→タスク→実装）を利用可能
- CLIごとの起動スクリプトを同梱（`run-claude.sh` など）

## Quickstart

### Requirements

- Git
- Bash（macOS / Linux）
- 利用するCLIのいずれか: `claude` / `codex` / `gemini` / `cursor-agent` / `opencode`

## Usage

### 他プロジェクトへ導入する

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

### AIエージェントの起動

```sh
./scripts/run-codex.sh
# または
./scripts/run-claude.sh
```

### スキルを使う

エージェントとの対話中に、スキル名またはトリガー文を入力します。

```txt
$repository-design
リポジトリ設計をレビューして
```

### Kiro SDDを使う（例）

```txt
/kiro-spec-init "ユーザー認証機能"
/kiro-spec-requirements auth
/kiro-spec-design auth -y
/kiro-spec-tasks auth
/kiro-spec-impl auth
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
