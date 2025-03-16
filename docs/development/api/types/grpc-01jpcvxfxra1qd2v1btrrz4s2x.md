---
description: gRPC APIドキュメントの作成ガイドライン
ruleId: grpc-01jpcvxfxra1qd2v1btrrz4s2x
tags: [api, grpc, documentation]
aliases: [grpc-api-guidelines]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]
---

# gRPC APIドキュメント作成ガイドライン

## 概要

このドキュメントは、gRPC APIのドキュメント作成に関するガイドラインを定義します。

## Protocol Buffers

### メッセージ定義

```protobuf
message Request {。
  string id = 1;  // リクエストの一意識別子。
  // ... 他のフィールド。
}
```

- フィールド番号の管理方法。
- 型の選択基準。
- コメントの記述方法。

### サービス定義

```protobuf
service ExampleService {。
  rpc GetData(Request) returns (Response);。
  rpc StreamData(Request) returns (stream Response);。
}
```

- RPCメソッドの命名規則。
- ストリーミングの使用基準。
- エラー処理の方針。

## インタフェース設計

### メソッド設計

- 単項RPC vs ストリーミングRPC。
- バッチ処理の設計。
- タイムアウト設定。

### エラー処理

- gRPCステータスコードの使用。
- エラーメッセージの形式。
- リトライ戦略。

## ドキュメント生成

### ツール利用

- protoc-gen-docの設定。
- CI/CDでの自動生成。
- バージョン管理。

### API参照

- メソッド仕様の記述。
- 型定義の説明。
- 例示の提供。