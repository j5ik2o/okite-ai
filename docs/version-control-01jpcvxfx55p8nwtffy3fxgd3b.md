---
description: バージョン管理に関するルールと規約
ruleId: version-control-01jpcvxfx55p8nwtffy3fxgd3b
tags: [version-control, rules]
aliases: [version-control-rules]
globs: ["**/*.ts", "**/*.js", "**/*.go", "**/*.rs", "**/*.scala", "**/*.java", "**/*.py", "**/*.sh"]
---


# バージョン管理の掟

## コミットメッセージのルール

- Git commitのメッセージは英語で書き、Conventional Commitsの規約に従う。
  - 例: `fix:` `feat:` `docs:` `style:` `refactor:` `test:` `chore:`
  - コミットメッセージは変更内容を明確に説明する。
  - プレフィックスは変更の種類を正確に反映する。

## コミットの粒度

- 1つのコミットは1つの論理的な変更を表す。
- 複数の異なる変更は別々のコミットに分ける。
- コミット前に`git diff`で変更内容を確認する。

## Gitサブモジュール

Gitサブモジュールは、あるGitリポジトリ内に別のGitリポジトリを含める機能です。これにより、複数のプロジェクト間で共通のコードやドキュメントを共有できます。

### サブモジュールの基本

既存のリポジトリにサブモジュールとして別のリポジトリを追加するには：。

```bash
# リポジトリのルートディレクトリで実行
git submodule add <リポジトリURL> <サブディレクトリパス>。

# 例: このドキュメントリポジトリをサブモジュールとして追加
git submodule add https://github.com/j5ik2o/okite-ai.git docs/okite-ai。

# 変更をコミット
git add .gitmodules <サブディレクトリパス>。
git commit -m "feat: add okite-ai documentation as submodule"
```

### 具体的な使用例

例えば、`github.com/j5ik2o/hoge` リポジトリに、このナレッジベースを共通ドキュメントとして `./common` ディレクトリに追加する場合：。

```bash
# j5ik2o/hoge リポジトリのルートディレクトリで実行
git submodule add https://github.com/j5ik2o/okite-ai.git ./common。

# 変更をコミット
git add .gitmodules ./common。
git commit -m "feat: add okite-ai knowledge base as common documentation"
git push origin main。
```

この操作により、以下のファイルが作成または更新されます：。

- `.gitmodules`: サブモジュールの設定情報を保存するファイル。
- サブモジュールのディレクトリ: 指定したパスにサブモジュールのコンテンツが配置される。

### サブモジュールを含むリポジトリをクローンする

サブモジュールを含むリポジトリをクローンする場合：。

```bash
# リポジトリをクローン
git clone <リポジトリURL>。

# サブモジュールを初期化して更新
cd <リポジトリディレクトリ>。
git submodule init。
git submodule update。

# または、クローン時に一度に行う
git clone --recurse-submodules <リポジトリURL>。
```

### サブモジュールを更新する

サブモジュールを最新の状態に更新するには：。

```bash
# 特定のサブモジュールを更新
git submodule update --remote <サブディレクトリパス>。

# すべてのサブモジュールを更新
git submodule update --remote。
```

### サブモジュール管理のベストプラクティス

1. **明確なドキュメント化**: サブモジュールの目的と使用方法をREADMEに記載する
2. **バージョン固定**: 安定したコミットハッシュを参照するようにする
3. **更新頻度の管理**: サブモジュールの更新頻度を計画的に決める
4. **CI/CDとの統合**: CI/CDパイプラインでサブモジュールを適切に処理する設定する

```bash
# 特定のタグやブランチを指定してサブモジュールを追加
git submodule add -b main <リポジトリURL> <サブディレクトリパス>。
```

### サブモジュールの削除

不要になったサブモジュールを削除するには：。

```bash
# サブモジュールの登録を解除
git submodule deinit -f <サブディレクトリパス>。

# .gitmodulesからサブモジュールの情報を削除
git rm -f <サブディレクトリパス>。

# Gitのキャッシュからサブモジュールを削除
rm -rf .git/modules/<サブディレクトリパス>。

# 変更をコミット
git commit -m "chore: remove submodule"。
```
