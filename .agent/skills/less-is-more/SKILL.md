---
name: less-is-more
description: 過剰設計を防ぎ、シンプルで保守しやすいコードを促進するスキル。コードレビュー、設計、リファクタリング、新機能実装など、すべての開発場面で発動。「シンプルにして」「過剰設計では？」「YAGNI」「KISS」「抽象化しすぎ」などのキーワードや、複雑なコード・設計に対する改善依頼時に使用。
---

# Less Is More

過剰設計を避け、シンプルで保守しやすいコードを書くための原則集。

## 核心原則

### YAGNI (You Aren't Gonna Need It)

**今必要ないものは作らない。**

```
❌ 避けるべき:
- 「将来使うかもしれない」機能
- 「念のため」の設定オプション
- 仮定に基づく拡張ポイント

✅ 実践:
- 現在の要件のみ実装
- 必要になったら追加（それは簡単）
- 削除が困難なものは特に慎重に
```

### KISS (Keep It Simple, Stupid)

**複雑さは敵。シンプルさは味方。**

```
❌ 避けるべき:
- 3行で書けるコードを10行にする
- 不要なデザインパターンの適用
- 過度な階層化・抽象化

✅ 実践:
- 最も単純な解決策をまず検討
- 「これより簡単にできないか？」と常に問う
- 読みやすさ > 賢さ
```

### 早すぎる抽象化の回避

**3回ルール: 3回繰り返すまで抽象化しない。**

```
❌ 避けるべき:
- 1回目から共通関数化
- 「DRYだから」という理由だけの抽象化
- 似ているが同じでないものの統合

✅ 実践:
- 1回目: 直接書く
- 2回目: 直接書く（メモする）
- 3回目: パターンを確認してから抽象化を検討
```

## アンチパターン検出

### 過剰設計の兆候

| 兆候 | 問題 |
|------|------|
| 実装より設計に時間がかかる | 分析麻痺 |
| 「将来のために」が頻出 | YAGNI違反 |
| 1機能に5+ファイル | 過度な分離 |
| 設定可能な点が10+ | 過剰な柔軟性 |
| 継承階層が3+レベル | 過度な抽象化 |
| インターフェースの実装が1つだけ | 不要な抽象化 |

### よくある過剰設計

```typescript
// ❌ Over-engineered
interface IUserRepositoryFactory {
  createRepository(): IUserRepository;
}
class UserRepositoryFactory implements IUserRepositoryFactory {
  createRepository(): IUserRepository {
    return new UserRepository(new DatabaseConnection());
  }
}

// ✅ Simple
class UserRepository {
  constructor(private db: Database) {}
}
```

## 判断フレームワーク

### 追加前チェックリスト

```
□ 今この機能は必要か？（YAGNI）
□ より簡単な方法はないか？（KISS）
□ 同じコードが3回以上あるか？（抽象化判断）
□ この複雑さは価値に見合うか？
□ 削除するのは追加より難しいか？
```

### 複雑さのコスト計算

```
複雑さのコスト =
  理解時間 + 変更コスト + バグ発生率 + テスト難易度

シンプルさの価値 =
  即時理解 + 容易な変更 + 低バグ率 + 簡単なテスト
```

## 実践ガイド

### コードレビュー時

- 「なぜこの抽象化が必要？」と問う
- 「もっとシンプルにできない？」を常に検討
- 将来の仮定に基づく設計を指摘

### 設計時

- 最小限の設計から始める
- 複雑さは問題が証明されてから追加
- 「賢い」解決策より「明白な」解決策

### リファクタリング時

- 抽象化の追加より削除を優先
- 使われていないコードは削除
- 条件: シンプルになるか？

## 格言

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

> "The best code is no code at all." - Jeff Atwood

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci
