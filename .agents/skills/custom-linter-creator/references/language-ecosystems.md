# 言語別リンターエコシステム

## 目次

- [Rust (dylint)](#rust-dylint)
- [TypeScript / JavaScript (ESLint)](#typescript--javascript-eslint)
- [Python (pylint)](#python-pylint)
- [Go (golangci-lint / analysis)](#go-golangci-lint--analysis)

---

## Rust (dylint)

### 概要

dylintはRust用のカスタムlintライブラリ。clippy相当のlintを独自に定義できる。

### バージョン互換性

| ツール | 対象バージョン | 注意事項 |
|--------|--------------|---------|
| dylint | 3.x | rustc内部APIに依存するため、rustcバージョンと合わせる必要あり |
| rustc | nightly | `#![feature(rustc_private)]` が必要 |
| clippy_utils | rustcバージョンに対応 | rustcのバージョンアップ時に追従が必要 |

**注意:** dylintはrustcの内部APIを使用するため、rustcのバージョンアップ時にコンパイルエラーになる場合がある。その際は依存クレートのバージョンを調整すること。

### ディレクトリ構造

```
lints/
├── Cargo.toml
├── rust-toolchain.toml  # nightlyバージョン固定推奨
└── src/
    ├── lib.rs           # lint登録エントリポイント
    └── rules/
        ├── mod.rs       # (注: lints内部ではmod.rs許容)
        ├── no_mod_rs.rs
        └── single_type_per_file.rs
```

### セットアップ

**rust-toolchain.toml:**
```toml
[toolchain]
channel = "nightly-2024-01-01"  # プロジェクトで固定
components = ["rustc-dev", "llvm-tools-preview"]
```

**Cargo.toml:**
```toml
[package]
name = "project-lints"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
dylint_linting = "3"
clippy_utils = "0.1"

[package.metadata.rust-analyzer]
rustc_private = true
```

**src/lib.rs:**
```rust
#![feature(rustc_private)]

extern crate rustc_driver;
extern crate rustc_lint;
extern crate rustc_session;
extern crate rustc_span;

mod rules;

dylint_linting::dylint_library!();

#[allow(clippy::no_mangle_with_rust_abi)]
#[no_mangle]
pub fn register_lints(sess: &rustc_session::Session, lint_store: &mut rustc_lint::LintStore) {
    lint_store.register_lints(&[rules::no_mod_rs::NO_MOD_RS]);
    lint_store.register_late_pass(|_| Box::new(rules::no_mod_rs::NoModRs));
}
```

### ルール実装例

```rust
// src/rules/no_mod_rs.rs
use rustc_hir::Mod;
use rustc_lint::{LateContext, LateLintPass, LintContext};
use rustc_session::{declare_lint, declare_lint_pass};
use rustc_span::Span;

declare_lint! {
    /// mod.rsの使用を禁止する。
    pub NO_MOD_RS,
    Deny,
    "mod.rs の使用はプロジェクト規約で禁止されている"
}

declare_lint_pass!(NoModRs => [NO_MOD_RS]);

impl<'tcx> LateLintPass<'tcx> for NoModRs {
    // check_mod は各モジュールに対して呼ばれる（サブモジュール含む）
    fn check_mod(&mut self, cx: &LateContext<'tcx>, _: &'tcx Mod<'tcx>, span: Span, _: rustc_hir::HirId) {
        let source_map = cx.sess().source_map();
        let file_info = source_map.span_to_location_info(span);

        if let (Some(source_file), Some(line), _, _) = file_info {
            let path_str = source_file.name.prefer_local().to_string_lossy();
            if path_str.ends_with("mod.rs") {
                // モジュール名を抽出（親ディレクトリ名）
                let module_name = std::path::Path::new(&*path_str)
                    .parent()
                    .and_then(|p| p.file_name())
                    .map(|n| n.to_string_lossy())
                    .unwrap_or_default();

                // AI向けテンプレート準拠メッセージを構築
                let message = format!(
                    "このファイルは mod.rs を使用しているが、プロジェクト規約で禁止されている。\n\
                     修正手順:\n\
                     1. このファイルの内容を親ディレクトリ名.rs にコピーする\n\
                     2. 例: src/actors/mod.rs → src/actors.rs に移動する\n\
                     3. mod.rs ファイルを削除する\n\
                     4. 他ファイルの use/mod 宣言に変更は不要（パスは同じ）\n\
                     コンテキスト: {}:{} の {}\n\
                     スコープ: 対象ファイルとその移動先のみ変更すること\n\
                     理由: Rust 2018 エディションのモジュールスタイルに統一するため",
                    path_str, line, module_name
                );
                // |_| {} で自動的に診断が発行される
                cx.span_lint(NO_MOD_RS, span, message);
            }
        }
    }
}
```

**コンテキスト情報の取得方法:**
- `check_mod`: 各モジュール（サブモジュール含む）に対して呼ばれる
- `source_map.span_to_location_info()`: Spanからファイルパス・行番号を取得
- `cx.span_lint()`: 位置情報付きでメッセージを出力（自動emit）

### プロジェクトへの統合

**ワークスペース Cargo.toml:**
```toml
[workspace.metadata.dylint]
libraries = [{ path = "lints" }]
```

**実行:**
```bash
cargo dylint --all
```

---

## TypeScript / JavaScript (ESLint)

### 概要

ESLintのカスタムルールをローカルプラグインとして作成する。

### バージョン互換性

| ツール | 対象バージョン | 注意事項 |
|--------|--------------|---------|
| ESLint | 8.x / 9.x | 9.x以降は flat config が推奨 |
| Node.js | 18.x以上 | ESLint 9.x は Node.js 18.18.0+ 必須 |

**注意:**
- ESLint 9.x では `.eslintrc.*` 形式は非推奨（将来廃止予定）
- 以下では両形式のサンプルを示す

### ディレクトリ構造

```
lints/
├── package.json
├── index.js            # プラグインエントリポイント
└── rules/
    ├── no-ambiguous-suffix.js
    └── single-export-per-file.js
```

### セットアップ

**package.json:**
```json
{
  "name": "eslint-plugin-project-lints",
  "version": "1.0.0",
  "main": "index.js",
  "peerDependencies": {
    "eslint": ">=8.0.0"
  }
}
```

**index.js:**
```javascript
const noAmbiguousSuffix = require("./rules/no-ambiguous-suffix");
const singleExportPerFile = require("./rules/single-export-per-file");

module.exports = {
  rules: {
    "no-ambiguous-suffix": noAmbiguousSuffix,
    "single-export-per-file": singleExportPerFile,
  },
};
```

### ルール実装例

```javascript
// rules/no-ambiguous-suffix.js
const AMBIGUOUS_SUFFIXES = ["Manager", "Util", "Helper", "Service", "Handler"];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "曖昧なサフィックスの使用を禁止する",
    },
    messages: {
      ambiguousSuffix:
        "クラス '{{class_name}}' は曖昧なサフィックス '{{suffix}}' を使用している。\n" +
        "修正手順:\n" +
        "1. このクラスの責務を特定する\n" +
        "2. 責務を具体的に表す名前に変更する\n" +
        "   例: UserManager → UserRepository / UserAuthenticator\n" +
        "3. このクラスへの全参照を新しい名前に更新する\n" +
        "コンテキスト: {{file_path}}:{{line_number}} の {{class_name}}\n" +
        "スコープ: クラス定義とその参照のみ変更すること\n" +
        "理由: 曖昧な名前はコードの意図を伝えにくいため",
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        if (!node.id) return;
        const className = node.id.name;
        for (const suffix of AMBIGUOUS_SUFFIXES) {
          if (className.endsWith(suffix)) {
            context.report({
              node: node.id,
              messageId: "ambiguousSuffix",
              data: {
                class_name: className,
                suffix,
                // コンテキスト情報を動的に埋め込む
                file_path: context.getFilename(),
                line_number: node.id.loc.start.line,
              },
            });
            break;
          }
        }
      },
    };
  },
};
```

**コンテキスト情報の取得方法:**
- `context.getFilename()`: 現在のファイルパスを取得
- `node.loc.start.line`: ノードの開始行番号を取得
- `node.loc.start.column`: ノードの開始列番号を取得
- `context.getSourceCode().getText(node)`: ノードのソースコードを取得

### プロジェクトへの統合

**eslint.config.js (flat config, ESLint 9.x 推奨):**
```javascript
const projectLints = require("./lints");

module.exports = [
  {
    plugins: {
      "project-lints": projectLints,
    },
    rules: {
      "project-lints/no-ambiguous-suffix": "error",
      "project-lints/single-export-per-file": "error",
    },
  },
];
```

**.eslintrc.js (レガシー形式, ESLint 8.x):**
```javascript
module.exports = {
  plugins: ["project-lints"],
  rules: {
    "project-lints/no-ambiguous-suffix": "error",
    "project-lints/single-export-per-file": "error",
  },
};
```

**実行:**
```bash
npx eslint .
```

---

## Python (pylint)

### 概要

pylintのカスタムチェッカーをプラグインとして作成する。

### バージョン互換性

| ツール | 対象バージョン | 注意事項 |
|--------|--------------|---------|
| pylint | 3.x | 2.x からAPIが一部変更されている |
| Python | 3.9以上 | pylint 3.x は Python 3.9+ 必須 |
| astroid | pylintに追従 | pylintと一緒にインストールされる |

**注意:** ruffはRust実装のためカスタムルール追加が困難。カスタムルールが必要な場合はpylintを使用する。

### ディレクトリ構造

```
lints/
├── __init__.py
└── checkers/
    ├── __init__.py
    ├── no_wildcard_import.py
    └── single_class_per_file.py
```

### セットアップ

**lints/__init__.py:**
```python
"""プロジェクト固有のpylintチェッカー"""
```

**lints/checkers/__init__.py:**
```python
"""チェッカーモジュール"""
```

### ルール実装例

```python
# lints/checkers/single_class_per_file.py
"""1ファイル1パブリッククラスルール"""

import astroid
from pylint.checkers import BaseChecker


class SingleClassPerFileChecker(BaseChecker):
    """1ファイルに複数のパブリッククラスを禁止するチェッカー"""

    name = "single-class-per-file"
    msgs = {
        "C9001": (
            # %s プレースホルダでコンテキスト情報を埋め込む
            "ファイルに複数のパブリッククラスが定義されている。\n"
            "修正手順:\n"
            "1. 各パブリッククラスを個別のファイルに分割する\n"
            "2. ファイル名はクラス名の snake_case にする（例: MyClass → my_class.py）\n"
            "3. プライベートクラス（_Prefixed）は同一ファイルに残してよい\n"
            "4. 分割後、import文を全て更新する\n"
            "コンテキスト: %s:%s の %s\n"
            "スコープ: 対象ファイルとそのimport元のみ変更すること\n"
            "理由: ファイル単位の責務を明確にし、変更時の影響範囲を限定するため",
            "multiple-public-classes",
            "1ファイル1パブリッククラスの原則に違反している",
        ),
    }

    def visit_module(self, node: astroid.Module) -> None:
        """モジュール訪問時にクラス数をチェック"""
        public_classes = [
            child
            for child in node.body
            if isinstance(child, astroid.ClassDef) and not child.name.startswith("_")
        ]
        if len(public_classes) > 1:
            # 2つ目以降の各クラスに対してメッセージを出力
            for cls in public_classes[1:]:
                self.add_message(
                    "multiple-public-classes",
                    node=cls,
                    args=(node.file, cls.lineno, cls.name),  # コンテキスト情報
                )


def register(linter):
    """pylintにチェッカーを登録"""
    linter.register_checker(SingleClassPerFileChecker(linter))
```

**コンテキスト情報の取得方法:**
- `node.file`: モジュールのファイルパスを取得
- `node.lineno`: ノードの行番号を取得
- `node.col_offset`: ノードの列オフセットを取得
- `node.name`: クラス/関数等の名前を取得
- `args=(...)`: メッセージの `%s` プレースホルダに値を埋め込む

### プロジェクトへの統合

**pyproject.toml:**
```toml
[tool.pylint.main]
load-plugins = ["lints.checkers.single_class_per_file"]

[tool.pylint."messages control"]
enable = ["C9001"]
```

**.pylintrc (レガシー形式):**
```ini
[MAIN]
load-plugins=lints.checkers.single_class_per_file

[MESSAGES CONTROL]
enable=C9001
```

**実行:**
```bash
pylint --load-plugins=lints.checkers.single_class_per_file src/
```

---

## Go (golangci-lint / analysis)

### 概要

`golang.org/x/tools/go/analysis` フレームワークでカスタムAnalyzerを作成し、golangci-lintのプラグインとして統合する。

### バージョン互換性

| ツール | 対象バージョン | 注意事項 |
|--------|--------------|---------|
| Go | 1.21以上 | analysis framework は安定 |
| golangci-lint | 1.55以上 | プラグインシステムはexperimentalな場合あり |

**注意:** golangci-lintのカスタムプラグイン機能は公式にはexperimentalとされる場合がある。安定性が必要な場合は、スタンドアロンのanalysisツールとして実行することを検討する。

### ディレクトリ構造

```
lints/
├── go.mod
├── cmd/
│   └── linter/
│       └── main.go     # スタンドアロン実行用
└── analyzers/
    ├── nonakedreturn/
    │   └── analyzer.go
    └── singlestructperfile/
        └── analyzer.go
```

### セットアップ

**go.mod:**
```go
module example.com/project/lints

go 1.21

require golang.org/x/tools v0.16.0
```

**cmd/linter/main.go:**
```go
package main

import (
    "example.com/project/lints/analyzers/singlestructperfile"
    "golang.org/x/tools/go/analysis/singlechecker"
)

func main() {
    singlechecker.Main(singlestructperfile.Analyzer)
}
```

### ルール実装例

```go
// analyzers/singlestructperfile/analyzer.go
package singlestructperfile

import (
    "go/ast"

    "golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
    Name: "singlestructperfile",
    Doc:  "1ファイルに複数のエクスポートされた構造体を禁止する",
    Run:  run,
}

func run(pass *analysis.Pass) (interface{}, error) {
    for _, file := range pass.Files {
        // ファイルパスを取得
        filePath := pass.Fset.Position(file.Pos()).Filename

        var exportedStructs []*ast.TypeSpec
        for _, decl := range file.Decls {
            genDecl, ok := decl.(*ast.GenDecl)
            if !ok {
                continue
            }
            for _, spec := range genDecl.Specs {
                typeSpec, ok := spec.(*ast.TypeSpec)
                if !ok {
                    continue
                }
                if _, ok := typeSpec.Type.(*ast.StructType); ok && typeSpec.Name.IsExported() {
                    exportedStructs = append(exportedStructs, typeSpec)
                }
            }
        }
        if len(exportedStructs) > 1 {
            for _, s := range exportedStructs[1:] {
                // 行番号を取得
                pos := pass.Fset.Position(s.Pos())
                pass.Reportf(s.Pos(),
                    "ファイルに複数のエクスポート構造体が存在する（'%s'）。\n"+
                        "修正手順:\n"+
                        "1. 構造体 '%s' を専用ファイルに移動する\n"+
                        "2. ファイル名は構造体名の snake_case にする（例: MyStruct → my_struct.go）\n"+
                        "3. 関連するメソッドも一緒に移動する\n"+
                        "4. import文を更新する\n"+
                        "コンテキスト: %s:%d の %s\n"+
                        "スコープ: 対象ファイルとそのimport元のみ変更すること\n"+
                        "理由: ファイル単位の責務を明確にするため",
                    s.Name.Name, s.Name.Name, filePath, pos.Line, s.Name.Name)
            }
        }
    }
    return nil, nil
}
```

**コンテキスト情報の取得方法:**
- `pass.Fset.Position(node.Pos())`: ノードの位置情報（ファイル・行・列）を取得
- `position.Filename`: ファイルパスを取得
- `position.Line`: 行番号を取得
- `position.Column`: 列番号を取得
- `pass.Reportf()`: フォーマット付きでメッセージを出力

### プロジェクトへの統合

**スタンドアロン実行:**
```bash
go build -o bin/linter ./lints/cmd/linter
./bin/linter ./...
```

**.golangci.yml (golangci-lint統合):**
```yaml
linters-settings:
  custom:
    singlestructperfile:
      # 注意: ビルド済みバイナリのパスを指定する（ソースファイルではない）
      path: ./bin/linter
      description: "1ファイル1エクスポート構造体ルール"
      original-url: ""

linters:
  enable:
    - singlestructperfile
```

**注意:** golangci-lintのカスタムプラグインを使用する前に、必ずバイナリをビルドすること。

**実行:**
```bash
# 1. まずバイナリをビルド
go build -o bin/linter ./lints/cmd/linter

# 2. golangci-lintで実行
golangci-lint run
```
