# okite-ai

AIエージェント（Claude Code、Codex CLI、Gemini CLI等）向けの実践的なスキルセットとSpec-Driven Development（SDD）ワークフローを提供するリポジトリ。

## ネーミングの由来

「okite-ai」には二つの意味が込められている：

- **AIのための掟** - AIエージェントが従うべきベストプラクティスと規約
- **目を覚ませAI!** - AIの能力を最大限に引き出すための起動フレーズ

## 概要

このリポジトリは以下を提供する：

1. **AIスキル集** - Claude Code / Codex CLI向けの再利用可能なスキルパッケージ
2. **Kiro SDD** - 仕様駆動開発ワークフローの実装

## スキル一覧

### コード品質・設計

| スキル | 説明 | トリガー例 |
|--------|------|-----------|
| **clean-architecture** | クリーンアーキテクチャの4層構造に基づく設計・レビュー支援 | 「クリーンアーキテクチャで」「クリーンアーキテクチャのレビュー」 |
| **error-handling** | 回復可能性を基準にしたエラーハンドリング設計。Either/Result型の活用 | 「エラー処理を改善して」「Result型を使いたい」 |
| **less-is-more** | YAGNI/KISSに基づく過剰設計防止 | 「シンプルにして」「過剰設計では？」「YAGNI」 |
| **single-type-per-file** | 1公開型=1ファイルの原則を強制 | 新規ファイル作成時に自動適用 |

### パッケージ・モジュール設計

| スキル | 説明 | トリガー例 |
|--------|------|-----------|
| **package-design** | MECE分割による明確なパッケージ構造設計 | 「パッケージ構造を見直したい」「モジュールの依存関係が複雑」 |
| **refactoring-packages** | 既存コードの構造分析とリファクタリング実行 | 「循環依存を解消して」「このモジュールを分割して」 |

### 命名・コーディング規約

| スキル | 説明 | トリガー例 |
|--------|------|-----------|
| **avoiding-ambiguous-suffixes** | Manager/Util/Service等の曖昧なサフィックスを検出・改善 | 「この命名で良いか」「Managerという名前を使いたい」 |
| **learning-before-coding** | 実装前に既存コードパターンを学習することを強制 | 新機能実装、コンポーネント追加時に自動適用 |

### スキル開発

| スキル | 説明 | トリガー例 |
|--------|------|-----------|
| **skill-creator** | 新規スキル作成のガイド | 「新しいスキルを作りたい」 |
| **reviewing-skills** | スキルのベストプラクティス準拠レビュー | 「このスキルをレビューして」 |

## Kiro Spec-Driven Development (SDD)

仕様駆動開発ワークフローを提供。要件定義→設計→タスク生成→実装の各フェーズを段階的に進める。

### ワークフロー

```
Phase 1: 仕様策定
  /kiro-spec-init "機能の説明"
  /kiro-spec-requirements {feature}
  /kiro-validate-gap {feature}        # 既存コードベース分析（任意）
  /kiro-spec-design {feature} [-y]
  /kiro-validate-design {feature}     # 設計レビュー（任意）
  /kiro-spec-tasks {feature} [-y]

Phase 2: 実装
  /kiro-spec-impl {feature} [tasks]
  /kiro-validate-impl {feature}       # 実装検証（任意）

進捗確認（いつでも）:
  /kiro-spec-status {feature}
```

## ディレクトリ構造

```
okite-ai/
├── .claude/
│   ├── skills/           # Claude Code向けスキル
│   │   ├── clean-architecture/
│   │   ├── error-handling/
│   │   ├── less-is-more/
│   │   ├── package-design/
│   │   ├── refactoring-packages/
│   │   ├── avoiding-ambiguous-suffixes/
│   │   ├── learning-before-coding/
│   │   ├── single-type-per-file/
│   │   ├── skill-creator/
│   │   └── reviewing-skills/
│   ├── commands/kiro/    # Kiro SDDコマンド
│   ├── agents/kiro/      # Kiroエージェント定義
│   └── rules/delegator/  # GPTエキスパート委譲ルール
├── .codex/
│   └── skills/           # Codex CLI向けスキル（シンボリックリンク）
├── .kiro/
│   ├── specs/            # 仕様ドキュメント
│   └── settings/         # Kiro設定・テンプレート
├── scripts/              # 起動スクリプト
└── CLAUDE.md             # Claude Code用設定
```

## セットアップ

### Claude Code

```bash
# プロジェクトルートに .claude/skills/ が存在すれば自動的に読み込まれる
claude
```

### Codex CLI

```bash
# .codex/skills/ はシンボリックリンクとして配置
codex
```

### スクリプトによる起動

```bash
# Claude Code
./scripts/run-claude.sh

# Codex CLI
./scripts/run-codex.sh

# Gemini CLI
./scripts/run-gemini.sh

# Cursor
./scripts/run-cursor.sh
```

## スキルの使い方

### 自動起動

スキルは特定のトリガーワードやコンテキストで自動的に起動する：

```
# error-handlingスキルが自動起動
ユーザー: 「Result型を使ってエラー処理を改善して」

# clean-architectureスキルが自動起動
ユーザー: 「クリーンアーキテクチャのレビューをお願い」

# learning-before-codingスキルが自動起動
ユーザー: 「UserRepositoryを追加して」
→ AIが既存のリポジトリパターンを分析してから実装
```

### Kiro SDDコマンド

```bash
# 新機能の仕様策定を開始
/kiro-spec-init "ユーザー認証機能"

# 要件定義
/kiro-spec-requirements auth

# 技術設計（-y で確認スキップ）
/kiro-spec-design auth -y

# タスク生成
/kiro-spec-tasks auth

# 実装開始
/kiro-spec-impl auth

# 進捗確認
/kiro-spec-status auth
```

## GPTエキスパート委譲

複雑な問題に対してGPTエキスパートに委譲可能：

| エキスパート | 専門分野 | トリガー |
|-------------|---------|---------|
| Architect | システム設計、トレードオフ分析 | 「アーキテクチャの設計」「トレードオフは？」 |
| Plan Reviewer | 計画の検証 | 「このプランをレビューして」 |
| Scope Analyst | スコープ分析、曖昧性の検出 | 「スコープを分析して」 |
| Code Reviewer | コード品質、バグ検出 | 「このコードをレビューして」 |
| Security Analyst | 脆弱性、脅威モデリング | 「セキュリティレビュー」 |

## 対応言語

スキルは以下の言語に対応：

- **error-handling**: Go, Rust, Scala, Java, TypeScript, JavaScript, Python
- **package-design**: Rust（主）、汎用原則は全言語
- **その他**: 言語非依存の設計原則

## 設計思想

### Less Is More

- 過剰設計を避け、シンプルで保守しやすいコードを促進
- YAGNIとKISSを徹底
- 3回ルール: 3回繰り返すまで抽象化しない

### Learning Before Coding

- 新しいコードを書く前に既存の実装パターンを分析
- プロジェクト固有の規約を尊重
- 「教科書的に正しい」より「プロジェクトに適合した」コード

### Spec-Driven Development

- 3フェーズ承認ワークフロー: 要件→設計→タスク→実装
- 各フェーズでの人間によるレビューを前提

## ライセンス

各スキルのライセンスは個別に確認してください。

## 関連リソース

- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude-code)
- [Codex CLI](https://github.com/openai/codex)
- [Kiro](https://kiro.dev)
