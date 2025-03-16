---
description: rusttoolsに関するドキュメント
ruleId: rusttools-01jpcvxfxnn1eg2jxgy2jns9w4
tags:
  - development
  - coding
  - rust
aliases:
  - rust-tools
  - rust-ecosystem
globs:
  - '**/*.rs'
---

# Rustツール活用

## 基本ツール

### rustup

Rustのツールチェイン管理システム。複数のRustバージョンを管理し、簡単に切り替えることができます。

```bash
# Rustのインストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh。

# 最新の安定版に更新
rustup update stable。

# 特定のバージョンをインストール
rustup install 1.67.0。

# デフォルトのツールチェーンを設定
rustup default stable。

# クロスコンパイル用のターゲットを追加
rustup target add wasm32-unknown-unknown。
```

### cargo

Rustの公式ビルドシステムおよびパッケージマネージャー。プロジェクトの作成、ビルド、テスト、依存関係の管理などを行います。

```bash
# 新しいプロジェクトを作成
cargo new my_project。
cargo new --lib my_library。

# ビルド
cargo build。
cargo build --release。

# テスト実行
cargo test。
cargo test -- --nocapture。

# ドキュメント生成
cargo doc --open。

# 依存関係の更新
cargo update。
```

## コード品質ツール

### rustfmt

Rustコードのフォーマッターです。一貫したコードスタイルを維持するために使用します。

```bash
# インストール
rustup component add rustfmt。

# 単一ファイルのフォーマット
rustfmt src/main.rs。

# プロジェクト全体のフォーマット
cargo fmt。

# フォーマットチェックのみ（変更なし）
cargo fmt -- --check。
```

設定は`.rustfmt.toml`ファイルでカスタマイズできますが、特別な理由がない限りデフォルト設定を使用することを推奨します。

### clippy

Rustの静的解析ツールです。コードの問題点や改善点を指摘します。

```bash
# インストール
rustup component add clippy。

# 解析の実行
cargo clippy。

# 警告をエラーとして扱う
cargo clippy -- -D warnings。

# 特定のカテゴリの警告のみを有効化
cargo clippy -- -W clippy::pedantic。
```

プロジェクトルートに`.clippy.toml`ファイルを作成して設定をカスタマイズできます。

### cargo-audit

依存関係のセキュリティ脆弱性をチェックするツールです。

```bash
# インストール
cargo install cargo-audit。

# 監査の実行
cargo audit。

# 詳細な出力
cargo audit --verbose。
```

定期的に実行して、使用しているクレートの脆弱性を確認することを推奨します。

## 開発支援ツール

### rust-analyzer

Rustの言語サーバー実装です。IDEやエディタに統合して、コード補完、定義ジャンプ、リファクタリングなどの機能を提供します。

```bash
# rustupでインストール
rustup component add rust-analyzer。
```

VSCode、IntelliJ IDEA、Vimなど多くのエディタで利用できます。

### cargo-watch

ファイルの変更を監視し、自動的にコマンドするするツールです。

```bash
# インストール
cargo install cargo-watch。

# ファイル変更時にビルド
cargo watch -x build。

# ファイル変更時にテスト
cargo watch -x test。

# 複数のコマンドを連続実行
cargo watch -x check -x test -x run。
```

開発中のフィードバックループを短縮するのに役立ちます。

### cargo-expand

マクロを展開して、生成されたコードを表示するツールです。

```bash
# インストール
cargo install cargo-expand。

# マクロ展開の表示
cargo expand。
cargo expand --bin my_binary。
cargo expand path::to::module
```

マクロのデバッグや理解に役立ちます。

## パフォーマンス分析ツール

### cargo-flamegraph

プログラムのパフォーマンスプロファイリングを行い、フレームグラフを生成するツールです。

```bash
# インストール
cargo install flamegraph。

# フレームグラフの生成
cargo flamegraph。
cargo flamegraph --bin my_binary -- arg1 arg2。

# リリースビルドでプロファイリング
cargo flamegraph --release。
```

ホットスポットの特定やパフォーマンス最適化に役立ちます。

### criterion

ベンチマークテストのためのフレームワークです。

```bash
# Cargo.tomlに追加
[dev-dependencies]。
criterion = "0.4"。

[bench]。
name = "my_benchmark"。
harness = false。
```

```rust
// benches/my_benchmark.rs。
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci_benchmark(c: &mut Criterion) {
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));。
}

criterion_group!(benches, fibonacci_benchmark);。
criterion_main!(benches);。
```

```bash
# ベンチマークの実行
cargo bench。
```

## ドキュメント関連ツール

### rustdoc

Rustの標準ドキュメント生成ツールです。

```bash
# ドキュメントの生成
cargo doc。

# ドキュメントを生成して自動的にブラウザで開く
cargo doc --open。

# プライベート項目も含めてドキュメントを生成
cargo doc --document-private-items。
```

詳細な使用方法は[Rustdocの掟](rustdoc-01jpcvxfxpsvpepv85myk6s6be.md)を参照してください。

### mdbook

Markdownからドキュメントを生成するツールです。Rustプロジェクトのマニュアルやガイドの作成に適しています。

```bash
# インストール
cargo install mdbook。

# 新しいブックの作成
mdbook init my-book。

# ローカルサーバーでプレビュー
mdbook serve --open。

# HTMLの生成
mdbook build。
```

## 依存関係管理ツール

### cargo-outdated

プロジェクトの依存関係の更新状況を確認するツールです。

```bash
# インストール
cargo install cargo-outdated。

# 古くなった依存関係の確認
cargo outdated。

# SemVerの互換性を考慮した確認
cargo outdated -R。
```

### cargo-edit

依存関係を簡単に追加、削除、更新するためのツールです。

```bash
# インストール
cargo install cargo-edit。

# 依存関係の追加
cargo add serde --features derive。
cargo add tokio -F full。

# 依存関係の削除
cargo rm unused-dependency。

# 依存関係の更新
cargo upgrade。
```

## デプロイメントツール

### cross

異なるプラットフォーム向けにクロスコンパイルするためのツールです。

```bash
# インストール
cargo install cross。

# Linuxターゲット向けにビルド
cross build --target x86_64-unknown-linux-gnu。

# Androidターゲット向けにビルド
cross build --target aarch64-linux-android。
```

### cargo-deb

Debianパッケージを作成するツールです。

```bash
# インストール
cargo install cargo-deb。

# Debianパッケージの作成
cargo deb。
```

### cargo-release

リリースプロセスを自動化するツールです。

```bash
# インストール
cargo install cargo-release。

# パッチバージョンをインクリメントしてリリース
cargo release patch。

# マイナーバージョンをインクリメントしてリリース
cargo release minor。
```

## CI/CD統合

### GitHub Actions

GitHub Actionsを使用したRustプロジェクトのCI/CD設定例：。

```yaml
# .github/workflows/rust.yml
name: Rust。

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3。
    - name: Build。
      run: cargo build --verbose
    - name: Run tests。
      run: cargo test --verbose
    - name: Run clippy。
      run: cargo clippy -- -D warnings
    - name: Check formatting。
      run: cargo fmt -- --check
```

### cargo-tarpaulin

コードカバレッジを計測するツールです。

```bash
# インストール
cargo install cargo-tarpaulin。

# カバレッジの計測
cargo tarpaulin。

# HTMLレポートの生成
cargo tarpaulin --out Html。
```

## 推奨ワークフロー

1. **プロジェクト開始時**:
   - `cargo new`でプロジェクト作成。
   - `.gitignore`の設定。
   - `rustfmt`と`clippy`のセットアップ。

2. **日常の開発**:
   - `cargo-watch`を使用して継続的なフィードバック。
   - `rust-analyzer`を活用したコーディング。
   - `cargo test`で定期的なテスト実行。

3. **コードレビュー前**:
   - `cargo fmt`でフォーマット。
   - `cargo clippy`で静的解析。
   - `cargo test`でテスト実行。

4. **リリース前**:
   - `cargo audit`でセキュリティチェック。
   - `cargo outdated`で依存関係の確認。
   - `cargo bench`でパフォーマンス確認。
   - `cargo doc`でドキュメント生成。

## 関連情報

- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust Tools](https://www.rust-lang.org/tools)
- [Awesome Rust](https://github.com/rust-unofficial/awesome-rust) - Rustツールとライブラリのキュレーションリスト
