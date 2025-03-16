---
description: 掟プロジェクトで使用するツールとその管理に関するルール
ruleId: tools-01jpcvxfxbfm6z9tc89zm9c37b
tags: [tools, rules]
aliases: [tools-rules]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
---

# ツールの掟

## 1. 基本ツール構成

### 必須ツール（すべての環境に初期インストール）

- Git: バージョン管理。
- gh (GitHub CLI): GitHub操作。
- docker: コンテナ管理。
- make: ビルド自動化。
- mise: 言語・ツールバージョン管理 (<https://github.com/jdx/mise>)。

### 任意ツール（必要に応じてインストール）

- その他プロジェクト固有のツール。

## 2. 言語別ツール構成

### Scala開発環境

- **必須ツール**。
  - sbt (mise経由でインストール): ビルドツール。
- **任意ツール**。
  - scalac: 必要な場合のみインストール。

### Rust開発環境

- **必須ツール**。
  - cargo (rustup経由でインストール): パッケージマネージャ・ビルドツール。

### Go開発環境

- **必須ツール**。
  - go。

### TypeScript開発環境

- **必須ツール**。
  - npm (mise経由でインストール): パッケージマネージャ。
- **任意ツール**。
  - pnpm (npm経由でインストール): 高速パッケージマネージャ。
  - yarn (npm経由でインストール): 代替パッケージマネージャ。

## 3. ツールインストール階層

1. システムレベル。
   - Git, gh, docker, make。

2. ツールバージョン管理。
   - mise。

3. 言語・フレームワーク管理。
   - Scala: sbt (mise経由)。
   - Rust: cargo (rustup経由)。
   - TypeScript: npm (mise経由)→pnpm/yarn (npm経由)。

この構成は各言語やプロジェクトに対して一貫性を保ちながら、必要に応じた柔軟性も確保しています。
