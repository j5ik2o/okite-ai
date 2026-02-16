---
name: spec-scope-guard
description: >-
  実装中のスコープ逸脱を検出するスキル。制約カード（`.constraints/<name>.md`）の非目標(NOT)と
  制約(MUST)を参照し、現在の変更差分が制約カードの範囲内に収まっているかを分析する。
  仕様インフレーションのAI側ガードレールとして機能し、実装の脱線を早期に検出する。
  既存の設計原則スキル（tell-dont-ask, law-of-demeter等）も統合的にチェック可能。
  spec-constraint-cardスキルで作成した制約カードが存在する状態で使用する。
  トリガー：「スコープ確認」「scope guard」「脱線してないか」「スコープ逸脱チェック」
  「範囲外の変更がないか」「制約カードの範囲内か」といった実装中のスコープ確認リクエストで起動。
---

# スコープガード（Scope Guard）

制約カードの範囲内で実装が進んでいるかを検証する。

## 核心原則

**実装中の脱線を早期に検出する。「やらないこと」に手を出していないか、「やること」を超えていないかを確認する。**

## 手順

### 1. 制約カードと差分の取得

```
/spec-scope-guard jwt-authentication
```

以下を取得する:
- `.constraints/jwt-authentication.md` の制約カード
- `git diff` および `git diff --cached` の変更差分
- `git diff --name-only` の変更ファイル一覧

引数がない場合は `.constraints/` 内の `status: active` のカード一覧を表示し選択を求める。

ステータス確認:
- `status: active` → チェック対象
- `status: done` → スキップ（「完了済みです」と表示）
- `status: draft` → スキップ（「まだ下書きです」と表示）

### 2. 非目標(NOT)逸脱チェック

制約カードの各NOT項目に対して、変更が触れていないかを確認する。

```
NOT項目: 「OAuth2対応」
  → oauth, oauth2, authorization_code, client_id 等の
    キーワードが差分に含まれていないか確認
  → OAuth関連のファイルが新規作成されていないか確認
```

判定:
- **OK**: NOT項目に関連する変更なし
- **WARN**: NOT項目に関連する可能性のある変更あり（要確認）
- **VIOLATION**: NOT項目に明確に該当する実装がある

### 3. スコープ超過チェック

変更されたファイルと差分の内容が、制約カードの「意図」と「制約(MUST)」から
合理的に導かれる範囲内かを確認する。

確認観点:
- 制約カードに関係ないモジュールを変更していないか
- 制約に記載されていない新しい機能を追加していないか
- 変更の規模が制約の範囲に対して過大でないか

### 4. 設計原則チェック（任意）

以下の条件で実行する:

- **ユーザーが明示的に要求した場合**: 常に実行
- **自動検出**: 差分に以下のパターンが含まれる場合、該当項目のみ自動で [INFO] 出力
  - 3段以上のドット連鎖（`a.b.c.d`） → law-of-demeter
  - getter呼び出し後の条件分岐（`if obj.getX() then`） → tell-dont-ask
  - validate関数が bool/void を返す → parse-dont-validate
  - 空の catch ブロック、エラー握りつぶし → error-handling

| チェック項目 | 関連スキル | 自動検出パターン |
|-------------|-----------|-----------------|
| getter乱用・カプセル化破壊 | tell-dont-ask | getter + 条件分岐 |
| 連鎖呼び出し・結合度 | law-of-demeter | 3段以上のドット連鎖 |
| バリデーションの型安全性 | parse-dont-validate | validate → bool/void |
| エラー処理パターン | error-handling | 空catch/エラー無視 |

設計原則の詳細は各スキルに委譲する。ここでは「違反の兆候があるか」の検出のみ行い、
詳細確認は各スキルの実行を推奨する。

### 5. 結果の出力

```
## スコープガード: <制約カード名>

### 非目標チェック
- [OK] OAuth2対応 → 触れていない
- [OK] リフレッシュトークン → 触れていない
- [WARN] セッション管理 → utils/session.ts を変更（インポート整理のみ）

### スコープチェック
- [OK] 変更ファイル数: 5（妥当）
- [OK] 変更内容は認証モジュール内に収まっている
- [WARN] middleware/logging.ts を変更 → 制約カードの範囲外の可能性

### 設計原則（検出のみ）
- [INFO] auth/token.ts:42 にgetter連鎖あり → /tell-dont-ask で詳細確認を推奨

### 判定: OK（WARN 2件）
```

## 判定ルール

| 状態 | 判定 |
|------|------|
| 全項目 OK | **OK** |
| WARN のみ（VIOLATION なし） | **OK（WARN N件）** |
| VIOLATION が1つでもある | **VIOLATION**（逸脱リストを表示） |

## VIOLATIONへの対応

VIOLATION検出時の推奨アクション:

1. **意図的な逸脱の場合**: 制約カードを更新する（非目標から除外、制約に追加）
2. **脱線していた場合**: 該当コードを削除またはrevertする
3. **制約カードの粒度が粗い場合**: 制約カードを分割する

## 関連スキル

- **spec-constraint-card**: 制約カードの作成
- **spec-done-check**: 制約カードに対する実装完了検証
- **tell-dont-ask**: カプセル化・責務配置の設計原則
- **law-of-demeter**: 結合度・連鎖呼び出しの設計原則
- **parse-dont-validate**: 型安全性の設計原則
- **error-handling**: エラー処理の設計原則
