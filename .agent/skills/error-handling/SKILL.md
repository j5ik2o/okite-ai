---
name: error-handling
description: >-
  エラーハンドリングのベストプラクティスを適用するスキル。回復可能性を基準にしたエラー設計、
  Either/Result型の使用、ドメインエラーとシステムエラーの適切な分類を支援する。コードレビュー、
  新規実装、リファクタリング時にエラー処理パターンの改善が必要な場合に使用。対象言語: Go,
  Rust, Scala, Java, TypeScript, JavaScript
---

# Error Handling

回復可能性を基準にしたエラーハンドリング設計を支援する。

## 判断フロー

```
エラー発生
    ↓
回復可能か？
    ├─ YES → Either/Result型で表現
    └─ NO → 例外/panicで即座に停止
```

| 回復可能 | 回復不能 |
|----------|----------|
| ビジネスルール違反 | 引数の不正 (IllegalArgumentException) |
| 外部システムエラー | 状態の矛盾 (IllegalStateException) |
| 権限不足・リソース競合 | 到達不可コード (unreachable) |

## 回復可能なエラー

Either/Result型で表現し、呼び出し元に判断を委ねる。

```typescript
// TypeScript - neverthrow
import { Result, ok, err } from 'neverthrow';

type UserError =
  | { type: 'NOT_FOUND'; userId: string }
  | { type: 'VALIDATION_FAILED'; field: string; reason: string };

function findUser(id: string): Result<User, UserError> {
  if (!isValidId(id)) {
    return err({ type: 'VALIDATION_FAILED', field: 'id', reason: 'Invalid format' });
  }
  const user = repository.find(id);
  return user ? ok(user) : err({ type: 'NOT_FOUND', userId: id });
}
```

## 回復不能なエラー

プログラムの前提条件違反は即座に停止。

```typescript
// 引数の不正
if (order === null) throw new Error('IllegalArgument: order must not be null');

// 状態の矛盾
if (order.status === 'COMPLETED' && order.items.length === 0)
  throw new Error('IllegalState: completed order must have items');

// 到達不可コード
default: throw new Error(`Unreachable: unknown status ${order.status}`);
```

## 推奨ライブラリ

| 言語 | ライブラリ |
|------|-----------|
| TypeScript | `neverthrow`, `fp-ts` |
| Rust | 標準 `Result<T, E>`, `thiserror` |
| Scala | 標準 `Either[L, R]` |
| Java | `vavr.io Either` |
| Go | 標準 `(T, error)` パターン |

## 詳細ガイドライン

全言語の実装パターン、エラー型設計の詳細は [references/guidelines.md](references/guidelines.md) を参照。
