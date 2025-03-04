---
title: ドキュメント作成ルール
description: プロジェクトのドキュメント構造とファイル配置規則の詳細
created: 2024-03-04
updated: 2024-03-04
tags: [documentation, rules, structure, guidelines]
aliases: [doc-rules, documentation-guidelines]
---

# ドキュメント作成ルール

## ファイル構造規則

### 基本規則

1. `index.md`の使用は禁止
   - 単独の`index.md`
   - ディレクトリ内の`${dir}/index.md`
   - 上記いずれも配置禁止

2. Rust2018方式のモジュール構造に準拠
   ```
   docs.md                    # トップレベルモジュールインデックス
   docs/                      # トップレベルモジュールディレクトリ
     coding.md               # サブモジュールインデックス
     coding/                # サブモジュールディレクトリ
       doc_comment.md       # サブモジュールファイル
     testing.md            # 単独のサブモジュール（ディレクトリなし）
   ```

### 命名規則

#### 禁止パターン
1. ディレクトリ内にindex.mdを配置
   ```
   ❌ ${dir_name}/index.md
   ```

2. ディレクトリ名と同名のmdファイルをディレクトリ内に配置
   ```
   ❌ ${dir_name}/${dir_name}.md
   ```

#### 推奨パターン
1. モジュールがサブファイルを持つ場合
   ```
   ✅ ${dir_name}.md          # モジュールインデックス
   ✅ ${dir_name}/            # モジュールディレクトリ
      └── ${file_name}.md    # サブモジュールファイル
   ```

2. モジュールが単独の場合
   ```
   ✅ ${file_name}.md        # 単独のモジュールファイル
   ```

### メタデータ要件

各Markdownファイルには以下のフロントマターを含める：
```yaml
---
title: ドキュメントタイトル
description: ドキュメントの説明
created: 作成日
updated: 更新日
tags: [関連タグ]
aliases: [別名]
---
``` 