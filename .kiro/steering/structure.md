# プロジェクト構造

## 組織方針

- ドメイン中心のレイヤード構成（domain / usecase / adapters / infra）
- ビジネスルールはdomainに集約し、外部I/Oはadapters/infraに隔離する
- appsはコンポジションルートとして依存性を配線する

## ディレクトリパターン

### ドメイン層
**Location**: `/packages/domain/src/ai_site_builder_domain/`  
**Purpose**: エンティティ、値オブジェクト、不変条件の定義  
**Example**: `site/site.py`, `shared_kernel/identifiers.py`

### ユースケース層
**Location**: `/packages/usecase/src/ai_site_builder_usecase/`  
**Purpose**: ユースケースのオーケストレーションとポート定義  
**Example**: `interactors/site_generation.py`, `ports/runtime.py`

### アダプター層
**Location**: `/packages/adapters/src/ai_site_builder_adapters/`  
**Purpose**: CLI入出力の変換や表示、ユースケース呼び出し  
**Example**: `cli/app.py`, `cli/commands/generate.py`

### インフラ層
**Location**: `/packages/infra/src/ai_site_builder_infra/`  
**Purpose**: LLM/画像/ランタイム/パイプラインなど外部統合  
**Example**: `llm/openai_provider.py`, `runtime/local_runtime.py`

### アプリ層
**Location**: `/apps/cli/src/ai_site_builder_cli/`  
**Purpose**: 依存性注入の組み立てとエントリーポイント  
**Example**: `main.py`, `di.py`

### テスト
**Location**: `/tests` および `/packages/*/tests`  
**Purpose**: ユニット/インテグレーションテスト

## 命名規約

- **Files**: snake_case（例: `site_generation.py`）
- **Classes**: PascalCase（例: `SiteGenerationUseCase`）
- **Functions**: snake_case（例: `create_site`）
- **Tests**: `test_*.py` または `*_test.py`

## Import構成

```python
from ai_site_builder_domain.site.site import Site  # パッケージ絶対import
from .local_helper import build_output            # 近接モジュールは相対import
```

**Path Aliases**:
- なし（Pythonパッケージ名を使った絶対importを基本とする）

## コード構成の原則

- domainはインフラ依存を持たず、不変条件を自己完結で守る
- usecaseはポートに依存し、具体実装には依存しない
- infraは外部サービスの実装責務を持ち、ポートを満たす
- adaptersはCLI入出力とユースケースの橋渡しを行う
- appsはDI/初期化を担い、実行開始点を提供する

---
_ディレクトリの羅列ではなく、配置の意図とパターンを記述する_
