# Rust 固有のパッケージングパターン

## 目次

- [モジュール階層設計](#モジュール階層設計)
  - [フラット vs ネスト](#フラット-vs-ネスト)
  - [2018 モジュール方式（mod.rs を使わない）](#2018-モジュール方式modrs-を使わない)
- [可視性レベル](#可視性レベル)
- [クレート分割の判断](#クレート分割の判断)
  - [単一クレート（デフォルト）](#単一クレートデフォルト)
  - [複数クレートのワークスペース](#複数クレートのワークスペース)
- [再エクスポートパターン](#再エクスポートパターン)
- [オプションパッケージの Feature フラグ](#オプションパッケージの-feature-フラグ)
- [パッケージ間のエラー設計](#パッケージ間のエラー設計)
- [依存方向](#依存方向)
- [よく使うモジュールパターン](#よく使うモジュールパターン)

## モジュール階層設計

### フラット vs ネスト

**フラット（小規模ならこちらを優先）:**
```
src/
├── lib.rs
├── user.rs
├── auth.rs
└── error.rs
```

**ネスト（複雑なドメイン向け）:**
```
src/
├── lib.rs
├── user.rs
├── user/
│   ├── entity.rs
│   ├── repository.rs
│   └── service.rs
├── auth.rs
└── auth/
    └── ...
```

### 2018 モジュール方式（mod.rs を使わない）

`{module}.rs` をモジュールの入口にして、同名ディレクトリ配下にサブモジュールを置く。

```rust
// user.rs
mod entity;
mod repository;
mod service;

pub use entity::User;
pub use service::UserService;

// repository は内部に留める
pub(crate) use repository::UserRepository;
```

## 可視性レベル

| 可視性 | 用途 |
| --- | --- |
| `pub` | 外部 API 契約 |
| `pub(crate)` | クレート内共有 |
| `pub(super)` | 親モジュールのみ |
| `pub(in path)` | 特定モジュールのみ |
| private | 同一モジュールのみ |

**目安:** まずは private、必要になったら拡張。

## クレート分割の判断

### 単一クレート（デフォルト）
以下に該当する場合:
- 変更が一緒に起きる
- 共有コンパイル時保証が必要
- 50k 行未満

### 複数クレートのワークスペース
以下に該当する場合:
- 独立したバージョン/リリースが必要
- コンパイル時間がボトルネック
- 明確な API 境界がある
- 依存セットが異なる

**ワークスペース構成例:**
```
my-project/
├── Cargo.toml (workspace)
├── crates/
│   ├── core/
│   │   └── Cargo.toml
│   ├── api/
│   │   └── Cargo.toml
│   └── cli/
│       └── Cargo.toml
```

## 再エクスポートパターン

### ファサード再エクスポート
```rust
// lib.rs - 公開 API をまとめる
pub mod prelude {
    pub use crate::user::User;
    pub use crate::auth::Token;
    pub use crate::error::Error;
}
```

### 内部 Prelude
```rust
// internal/prelude.rs - 内部共通の import 集約
pub(crate) use crate::error::{Error, Result};
pub(crate) use crate::config::Config;
```

他モジュールでの利用:
```rust
use crate::internal::prelude::*;
```

## オプションパッケージの Feature フラグ

```toml
# Cargo.toml
[features]
default = []
postgres = ["sqlx/postgres"]
mysql = ["sqlx/mysql"]
```

```rust
// lib.rs
#[cfg(feature = "postgres")]
pub mod postgres;

#[cfg(feature = "mysql")]
pub mod mysql;
```

## パッケージ間のエラー設計

### 選択肢1: 中央集約エラー型
```rust
// error.rs
pub enum Error {
    User(UserError),
    Auth(AuthError),
    Io(std::io::Error),
}
```

### 選択肢2: モジュール別エラー + 変換
```rust
// user/error.rs
pub enum UserError { /* ... */ }

impl From<UserError> for crate::Error {
    fn from(e: UserError) -> Self {
        Error::User(e)
    }
}
```

## 依存方向

```
┌──────────────────────────────────┐
│            アプリケーション       │
│  (main.rs, CLI, HTTP handlers)   │
└─────────────┬────────────────────┘
              │ 依存
              ▼
┌──────────────────────────────────┐
│             ユースケース              │
│   (ユースケース、アプリケーションサービス) │
└─────────────┬────────────────────┘
              │ 依存
              ▼
┌──────────────────────────────────┐
│              ドメイン             │
│  (エンティティ、値オブジェクト、   │
│   repository トレイト)            │
└──────────────────────────────────┘
              ▲
              │ 実装
┌─────────────┴────────────────────┐
│           インフラ層              │
│   (DB 実装、外部 API)             │
└──────────────────────────────────┘
```

ドメインは外部依存を持たない（安定・抽象）。
ユースケース層はビジネスロジックを記述する層ではない。オケーケストレーションの責務。
インフラ層はドメイントレイトを実装する（不安定・具体）。

## メトリクス計測

Rust エコシステムでパッケージメトリクスを計測する方法:

| 目的 | ツール/手法 | 備考 |
| --- | --- | --- |
| モジュール間依存グラフ | `cargo-depgraph`, `cargo-modules` | 循環検出に使える |
| サイクロマティック複雑度 | `cargo-geiger`（unsafe計測）、外部ツール | 複雑度観測の補助 |
| Ca/Ce の近似 | `cargo-modules` + 手動集計 | use 文の方向を数える |
| 循環依存検出 | Dylint カスタム lint、`cargo-modules --tree` | プロジェクト固有 lint で自動化可能 |
| アーキテクチャテスト | Dylint（`module-wiring-lint` 等） | 依存方向のルールを機械的に強制 |

**実務の進め方**:
1. `cargo-modules` でモジュール依存グラフを可視化する
2. 循環がないことを確認する（ADP）
3. 安定側（domain, core）が不安定側（infrastructure, adapter）に依存していないことを確認する（SDP）
4. Dylint 等で依存ルールを CI に組み込む

## よく使うモジュールパターン

### Types モジュール
```
types.rs
types/
├── id.rs       # ID 型（UserId, OrderId）
├── email.rs    # Email 値オブジェクト
└── money.rs    # Money 値オブジェクト
```

### Repository パターン
```rust
// domain/user/repository.rs（トレイト）
pub trait UserRepository {
    fn find(&self, id: UserId) -> Result<Option<User>>;
    fn save(&mut self, user: &User) -> Result<()>;
}

// infrastructure/postgres/user_repository.rs（実装）
pub struct PostgresUserRepository { /* ... */ }
impl UserRepository for PostgresUserRepository { /* ... */ }
```
