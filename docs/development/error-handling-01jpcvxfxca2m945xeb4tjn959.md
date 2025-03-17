---
description: エラーハンドリングの基本原則と実装ガイドライン
ruleId: error-handling-01jpcvxfxca2m945xeb4tjn959
tags: [development, error-handling, guidelines]
aliases: [error-guidelines]
globs: ["**/*.go", "**/*.rs", "**/*.scala", "**/*.java", "**/*.ts", "**/*.js"]
---


# エラーハンドリングのルール

## 基本原則

エラーハンドリングは「回復可能性」を基準に設計します。適切なエラーハンドリングにより、コードの堅牢性と保守性が向上します。

## 回復可能なエラー

プログラムの実行を継続できるエラーには、戻り値型を活用します。

### 戻り値型の選択

| 言語 | 推奨戻り値型 |。
|------|--------------|。
| Java | `vavr`の`Either<E, T>`型 |。
| Scala | 標準ライブラリの`Either[E, T]`型 |。
| Rust | 標準ライブラリの`Result<T, E>`型 |。
| Go | `samber/mo`の`Either[E, T]`型 |。
| TypeScript | `fp-ts`の`Either<E, T>`型 |。

### 回復可能なエラーの代表的なケース

1. **ドメインモデルでのビジネスルール違反**。
   - バリデーションエラー。
   - 在庫不足。
   - 権限不足。
1. **リポジトリでの外部データアクセスエラー**。
   - データベース接続の一時的エラー。
   - 外部APIからの予期されたエラーレスポンス。
   - 楽観的ロックによる競合。
1. **ユースケースでのアプリケーションロジックエラー**。
   - ワークフロー状態の遷移エラー。
   - 依存サービスからの回復可能なエラー。

## 回復不能・致命的状況

プログラムの実行を継続できない、回復不能・致命的な状況では、キャッチしない例外やパニックを使用します。

### 引数としてありえない状況

| 言語 | 対応方法 |
|------|----------|
| Java/Scala | `IllegalArgumentException` |
| Rust | `panic!` |
| Go | `panic` |
| TypeScript | `IllegalArgumentError` (型がなければ作る) |

### 状態としてありえない状況

| 言語 | 対応方法 |
|------|----------|
| Java/Scala | `IllegalStateException` |
| Rust | `panic!` |
| Go | `panic` |
| TypeScript | `IllegalStateError` (型がなければ作る) |

### 本来発生しない箇所（到達不可コード）

| 言語 | 対応方法 |
|------|----------|
| Java/Scala | `AssertionError` |
| Rust | `panic`または`unreachable!()` |
| Go | `panic` |
| TypeScript | `AssertionError` (型がなければ作る) |

## エラーハンドリングの設計指針

エラーハンドリングの設計時には、以下の質問に答えてください：

1. **このエラーは回復可能か？**。
   - はい → `Either`/`Result`型を使用。
   - いいえ → 例外やpanicを使用。
1. **エラーの性質は何か？**。
   - 引数の問題 → `IllegalArgumentException`。
   - 状態の問題 → `IllegalStateException`。
   - 到達不能 → `AssertionError`。
1. **エラー発生時に期待される動作は？**。
   - 代替パスの実行。
   - リトライ。
   - ユーザーへの通知。
   - ログ記録。

適切なエラーハンドリングは、プログラムの堅牢性、可読性、保守性を向上させます。