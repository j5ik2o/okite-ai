# Single Type Per File

コード生成時に「1公開型 = 1ファイル」を強制する。言語を問わず適用する。

## 原則

**1つの公開型につき1つのファイルを作成する。**

## 公開型の定義

| 言語 | 公開型 |
|------|--------|
| Java/Kotlin/Scala | `public`な `class`, `trait`, `object`, `enum` |
| Rust | `pub struct`, `pub trait`, `pub enum` |
| Go | 大文字始まりの `type` |
| Python | モジュールレベルの `class` |
| TypeScript/JavaScript | `export`された `class`, `interface`, `type`, オブジェクト |
| Swift | `public class`, `public protocol`, `public enum` |
| C# | `public class`, `public interface`, `public enum` |

## ルール

### MUST（必須）

- 1つの公開型につき1つのファイルを作成
- ファイル名は公開型の名前を反映（例: `UserRepository` → `user_repository.py`）
- 既存ファイルに新しい公開型を追加しない

### ALLOWED（許可）

- 公開型に必要な**プライベート実装型**は同居可
- 公開型の**内部ネスト型**は同居可
- **sealed interface/trait**とその閉じた実装群は同居可

### MUST NOT（禁止）

- 1ファイルに複数の公開クラス/構造体/インターフェース
- 「関連しているから」という理由での型の集約

## 判断基準

1. この型は公開型か？ → Yes なら新規ファイル作成
2. 既存の公開型の内部実装か？ → Yes なら同居可
3. sealed interface/traitの閉じた実装か？ → Yes なら同居可
4. 上記以外 → 新規ファイル作成

## 理由

- ナビゲーション性の向上（ファイル名 = 型名）
- 責任の明確化（ファイル肥大化 = 設計の問題）
- Git履歴の追跡容易性
