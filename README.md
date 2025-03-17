# Okite AI

掟（Okite）ドキュメントを管理・活用するためのAIツール

## 概要

このプロジェクトは、掟ドキュメント（組織やプロジェクトのルールを定義したMarkdownファイル）を管理し、
AIを活用して検索・質問応答を行うためのツールセットを提供します。

## 機能

- 掟ドキュメントの管理（フロントマターの検証、リンクチェックなど）
- RAG（Retrieval Augmented Generation）を使った質問応答
- 環境に応じたLLMの切り替え（開発環境ではOllama、本番環境ではClaude）

## セットアップ

### 前提条件

- Node.js v18以上
- TypeScript
- Ollama（ローカル開発用）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/okite-ai.git
cd okite-ai

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要なAPIキーを設定
```

### Ollamaのセットアップ

ローカル開発環境では、Ollamaを使用してLLMを実行します。

1. [Ollama](https://ollama.ai/)をインストール
2. 必要なモデルをダウンロード

```bash
ollama pull llama3
```

## 使い方

### RAGテスト

掟ドキュメントに対して質問を行い、関連するドキュメントと回答を取得します。

```bash
# 質問に対する回答を取得
ts-node scripts/test-rag.ts "コーディング規約について教えてください"
```

### 環境の切り替え

`.env`ファイルの`ENVIRONMENT`変数を変更することで、使用するLLMを切り替えることができます。

- `development`: Ollamaを使用（ローカル実行）
- `production`: Claudeを使用（APIキーが必要）

## 開発

### 新しい掟ドキュメントの追加

1. `docs/`ディレクトリに新しいMarkdownファイルを作成
2. 適切なフロントマターを設定（ruleId, description, tags, globs, aliasesなど）
3. ドキュメントの内容を記述

### フロントマターの検証

```bash
# すべてのMarkdownファイルのフロントマターを検証
ts-node scripts/check-md-frontmatter.ts

# 特定のファイルのフロントマターを検証
ts-node scripts/check-single-file.ts docs/your-file.md
```

## ライセンス

MIT
