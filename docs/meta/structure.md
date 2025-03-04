---
description: 掟プロジェクトのドキュメント構造と編成ルール
tags: [meta, documentation, structure]
aliases: [doc-structure, documentation-structure]
---

# 掟ドキュメント構造定義

## 概要

このドキュメントは、掟プロジェクトのドキュメント構造と編成ルールを定義します。
ドキュメントの階層構造、ファイル配置、相互参照の方針を規定します。

## ディレクトリ構造

### トップレベル構成

```text
docs/
  ├── meta/           # メタドキュメント
  ├── development/    # 開発関連ドキュメント
  ├── operation/      # 運用関連ドキュメント
  └── management/     # プロジェクト管理ドキュメント
```

### メタドキュメント

```text
meta/
  ├── rules.md        # 基本ルール
  ├── structure.md    # 構造定義
  └── templates/      # ドキュメントテンプレート
```

### 開発ドキュメント

```text
development/
  ├── api/           # API関連
  ├── coding/        # コーディング規約
  ├── testing/       # テスト関連
  └── deployment/    # デプロイメント関連
```

### 運用ドキュメント

```text
operation/
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
   [コーディング規約](coding-guidelines.md)
   ```

2. 異なるディレクトリ
   ```markdown
   [API認証](/docs/development/api/authentication.md)
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