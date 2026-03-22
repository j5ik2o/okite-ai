# 戻り値の握りつぶし禁止

`Result` / `Option` / `#[must_use]` な戻り値を、理由なく捨ててはならない。

## 目的

- 配送失敗、停止失敗、監視失敗、永続化失敗を無言で消さない
- 「失敗したが観測できない」状態を防ぐ
- TOCTOU を避けつつ、失敗を呼び出し元またはログに確実に反映する

## MUST

- `Result` を返す処理は、`?`、`match`、`if let Err(...)` のいずれかで明示的に扱う
- `#[must_use]` な戻り値は、使うか、使わない理由をコメント付きで明示する
- `tell`、`send_system_message`、`try_send`、`send_write_messages`、`send_snapshot_message` の失敗は原則として握りつぶさない
- fire-and-forget が必要な場合でも、少なくとも以下のどれかを行う
  - 呼び出し元へエラーを返す
  - メトリクスを記録する
  - ログを出す
  - 失敗しても安全である理由をコメントで明記する

## MUST NOT

- `let _ = expr;` で `Result` や `#[must_use]` を捨てる
- `.ok()` でエラー情報を捨てる
- `match _ { Ok(_) => {}, Err(_) => {} }` のように無言で両方捨てる
- stop / watch / terminated / persistence / remote / cluster 通信で失敗を黙殺する

## 許容例外

以下のみ例外とする。ただし、なぜ安全かを直前コメントで必ず書くこと。

1. `Drop` 実装や shutdown best-effort で、失敗時に回復不能かつ後続整合性に影響しない場合
2. メトリクス通知や補助的なイベント配送で、失敗しても主処理の契約が壊れない場合
3. `Vec::pop`、`HashMap::remove` など、値の取得目的で戻り値を受けているが明示的に破棄したい場合
4. `Arc::into_raw` / `from_raw` など所有権操作で、意図的に値を捨てる必要がある低レベルコード

## 判定フロー

```
1. 戻り値は `Result` / `Option` / `#[must_use]` か？
   ├─ No → 通常どおり扱う
   └─ Yes → 次へ

2. 呼び出し失敗で契約は壊れるか？
   ├─ Yes → 握りつぶし禁止。伝播、記録、分岐のいずれかで扱う
   └─ No → 次へ

3. best-effort として安全か？
   ├─ No → 握りつぶし禁止
   └─ Yes → 次へ

4. 失敗しても安全な理由をコメントで説明できるか？
   ├─ No → 握りつぶし禁止
   └─ Yes → 例外的に許容
```

## レビュー観点

戻り値を捨てているコードを見つけたら、必ず次を確認する。

1. 失敗時に契約が壊れないか
2. 失敗が観測可能か
3. 再試行・停止・代替経路のどれで扱うべきか
4. 本当に best-effort でよいか

## Rust で特に見る対象

- `ActorRef::tell`
- `ActorContext::watch` / `unwatch`
- `ActorSystemState::send_system_message`
- `tokio::sync::mpsc::Sender::try_send`
- 永続化コンテキストの `send_write_messages` / `send_snapshot_message`

## 機械的強制

- `clippy::let_underscore_must_use`
- `unused_must_use`

少なくとも CI ではこれらを有効にし、warning ではなく failure として扱うことを検討する。
