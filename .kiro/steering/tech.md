# 技術スタック

## アーキテクチャ

- ドメイン中心のレイヤード構成（domain / usecase / adapters / infra）
- usecaseでポート（Protocol）を定義し、infraが実装、adaptersがI/O変換を担当
- CLIがコンポジションルートとして依存性を組み立てる

## コア技術

- **言語**: Python 3.12+
- **エージェントフレームワーク**: Google ADK (Agent Development Kit)
- **CLIフレームワーク**: Typer
- **モデル定義**: Pydantic v2
- **ランタイム**: Python / asyncio

## 主要ライブラリ

- google-adk（マルチエージェントオーケストレーション）
- Pydantic v2（イミュータブルなモデル設計）
- Typer + Rich（CLI UI）

## 開発標準

### 型安全
- mypy strict を前提とし、未型定義を許可しない
- モデルはPydanticで型と不変性を明示する

### コード品質
- Ruffでlint/formatを統一（line length 120）

### テスト
- pytest + pytest-asyncio
- pytest-covでカバレッジ計測

## 開発環境

### 必須ツール
- Python 3.12+
- uv

### よく使うコマンド
```bash
# 依存関係
uv sync

# テスト
uv run pytest

# 型チェック
uv run mypy src/

# フォーマット
uv run ruff format .
```

## 主要な技術的決定

- srcレイアウト（src/ai_site_builder/）を採用
- 依存方向は domain → usecase → adapters/infra を基本とする
- LLM・画像生成・ランタイムはプロバイダ切り替え可能な抽象化を採用
- ADKのAgent/Tool/Callbackパターンを活用

---
_依存関係の一覧ではなく、判断に影響する技術パターンを記述する_
