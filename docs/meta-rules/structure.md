---
description: ドキュメント構造と編成ルール
ruleId: META-STRUCTURE-01JPBRY7BHTJ625M42600MC54N
tags: [meta, documentation, structure]
aliases: [doc-structure, documentation-structure]
globs: ["**/*.md", "**/*.mdc"] 
---

# 掟ドキュメント構造定義

## 概要

このドキュメントは、掟プロジェクトのドキュメント構造と編成ルールを定義します。
ドキュメントの階層構造、ファイル配置、相互参照の方針を規定します。

## ディレクトリ構造

### トップレベル構成

```text
${PROJECT_ROOT}/
  ├── docs/          # プロジェクトドキュメント
  │   ├── meta/           # メタドキュメント
  │   ├── development/    # 開発関連ドキュメント
  │   ├── operation/      # 運用関連ドキュメント
  │   └── management/     # プロジェクト管理ドキュメント
  └── _templates/    # Obsidianテンプレート
```

### メタドキュメント

```text
${PROJECT_ROOT}/docs/meta/
  ├── rules.md        # 基本ルール
  └── structure.md    # 構造定義
```

### 開発ドキュメント

```text
${PROJECT_ROOT}/docs/development/
  ├── api/           # API関連
  ├── coding/        # コーディング規約
  ├── testing/       # テスト関連
  └── deployment/    # デプロイメント関連
```

### 運用ドキュメント

```text
${PROJECT_ROOT}/docs/operation/
  ├── monitoring/    # 監視関連
  ├── backup/        # バックアップ関連
  └── security/      # セキュリティ関連
```

## ファイル命名規則

### 基本ルール

1. 全て小文字を使用

   ```text
   ✅ coding-guidelines.md
   ❌ Coding-Guidelines.md
   ```

2. 複数単語はハイフンで接続

   ```text
   ✅ api-authentication.md
   ❌ api_authentication.md
   ```

3. 言語やツール名は接頭辞として使用

   ```text
   ✅ scala-coding-guidelines.md
   ✅ docker-deployment.md
   ```

### 禁止パターン

1. スペースを含むファイル名

   ```text
   ❌ coding guidelines.md
   ```

2. 特殊文字の使用

   ```text
   ❌ coding_guidelines(v1).md
   ```

## 相互参照ルール

### リンク形式

1. 同一ディレクトリ内

   ```markdown
   [基本ルール](rules.md)
   ```

2. 異なるディレクトリ

   ```markdown
   [コーディング規約](/docs/development/coding.md)
   ```

### インデックスファイル

1. 各ディレクトリのルートに配置

   ```text
   development/
     ├── README.md    # 開発ドキュメントの概要
     └── ...
   ```

2. 必須記載事項
   - ディレクトリの目的
   - 含まれるドキュメントの一覧
   - 主要なドキュメントへのリンク