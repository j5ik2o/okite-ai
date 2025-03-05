---
description: gRPC APIドキュメントの作成ガイドライン
tags: [api, grpc, documentation]
aliases: [grpc-api-guidelines]
---

# gRPC APIドキュメント作成ガイドライン

## 概要

このドキュメントは、gRPC APIのドキュメント作成に関するガイドラインを定義します。

## Protocol Buffers

### メッセージ定義

```protobuf
message Request {
  string id = 1;  // リクエストの一意識別子
  // ... 他のフィールド
}
```

- フィールド番号の管理方法
- 型の選択基準
- コメントの記述方法

**実装例**:
```protobuf
// ユーザー関連のメッセージ定義
syntax = "proto3";

package user.v1;

import "google/protobuf/timestamp.proto";

// ユーザー情報を表すメッセージ
message User {
  string id = 1;                                // ユーザーID（UUID形式）
  string name = 2;                              // ユーザー名
  string email = 3;                             // メールアドレス
  UserStatus status = 4;                        // ユーザーステータス
  repeated string roles = 5;                    // ユーザーロール
  google.protobuf.Timestamp created_at = 6;     // 作成日時
  google.protobuf.Timestamp updated_at = 7;     // 更新日時
  
  // フィールド番号10-19は予約済み（将来の拡張用）
  reserved 10 to 19;
  // 削除済みフィールド（再利用禁止）
  reserved "password", "secret";
}

// ユーザーステータスを表す列挙型
enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;  // 未指定（デフォルト値）
  USER_STATUS_ACTIVE = 1;       // アクティブ
  USER_STATUS_INACTIVE = 2;     // 非アクティブ
  USER_STATUS_SUSPENDED = 3;    // 一時停止
}
```

**ユースケース**:
- ユーザー情報の定義: ID、名前、メールアドレス、ステータス、ロールなどの基本情報
- 列挙型の使用: ステータスなどの固定値セットを定義
- フィールド予約: 将来の拡張性を考慮した設計

### サービス定義

```protobuf
service ExampleService {
  rpc GetData(Request) returns (Response);
  rpc StreamData(Request) returns (stream Response);
}
```

- RPCメソッドの命名規則
- ストリーミングの使用基準
- エラー処理の方針

**実装例**:
```protobuf
// ユーザーサービスの定義
service UserService {
  // 単一ユーザーの取得
  rpc GetUser(GetUserRequest) returns (GetUserResponse) {
    option (google.api.http) = {
      get: "/v1/users/{user_id}"
    };
  }
  
  // ユーザー一覧の取得（ページネーション対応）
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse) {
    option (google.api.http) = {
      get: "/v1/users"
    };
  }
  
  // ユーザーの作成
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse) {
    option (google.api.http) = {
      post: "/v1/users"
      body: "*"
    };
  }
  
  // ユーザーの更新
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse) {
    option (google.api.http) = {
      patch: "/v1/users/{user_id}"
      body: "*"
    };
  }
  
  // ユーザーの削除
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse) {
    option (google.api.http) = {
      delete: "/v1/users/{user_id}"
    };
  }
  
  // ユーザーイベントのストリーミング（サーバーストリーミング）
  rpc StreamUserEvents(StreamUserEventsRequest) returns (stream UserEvent) {}
  
  // ユーザー情報の一括更新（クライアントストリーミング）
  rpc BatchUpdateUsers(stream UpdateUserRequest) returns (BatchUpdateUsersResponse) {}
  
  // ユーザーチャット（双方向ストリーミング）
  rpc ChatSession(stream ChatMessage) returns (stream ChatMessage) {}
}
```

**ユースケース**:
- 単項RPC: 単一リソースの取得・作成・更新・削除（CRUD操作）
- サーバーストリーミングRPC: イベント通知、大量データの分割送信
- クライアントストリーミングRPC: 一括処理、ファイルアップロード
- 双方向ストリーミングRPC: リアルタイムチャット、ビデオ会議

## インタフェース設計

### メソッド設計

- 単項RPC vs ストリーミングRPC
- バッチ処理の設計
- タイムアウト設定

**実装例**:
```go
// Go言語でのgRPCサーバー実装例
func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    // コンテキストからタイムアウトを設定
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // リクエスト検証
    if req.UserId == "" {
        return nil, status.Error(codes.InvalidArgument, "ユーザーIDは必須です")
    }
    
    // データベースからユーザー取得
    user, err := s.userRepo.FindByID(ctx, req.UserId)
    if err != nil {
        if errors.Is(err, repository.ErrNotFound) {
            return nil, status.Error(codes.NotFound, "指定されたユーザーが見つかりません")
        }
        s.logger.Error("ユーザー取得エラー", zap.Error(err), zap.String("user_id", req.UserId))
        return nil, status.Error(codes.Internal, "内部エラーが発生しました")
    }
    
    // レスポンス作成
    return &pb.GetUserResponse{
        User: &pb.User{
            Id:        user.ID,
            Name:      user.Name,
            Email:     user.Email,
            Status:    convertStatus(user.Status),
            Roles:     user.Roles,
            CreatedAt: timestamppb.New(user.CreatedAt),
            UpdatedAt: timestamppb.New(user.UpdatedAt),
        },
    }, nil
}

// ストリーミングRPCの実装例
func (s *userServer) StreamUserEvents(req *pb.StreamUserEventsRequest, stream pb.UserService_StreamUserEventsServer) error {
    // ユーザーイベントの購読
    subscription := s.eventBus.Subscribe(fmt.Sprintf("user:%s", req.UserId))
    defer subscription.Unsubscribe()
    
    // クライアント接続が切れるまでイベントを送信し続ける
    for {
        select {
        case <-stream.Context().Done():
            return nil
        case event := <-subscription.Channel():
            userEvent, ok := event.(*pb.UserEvent)
            if !ok {
                continue
            }
            
            if err := stream.Send(userEvent); err != nil {
                s.logger.Error("イベント送信エラー", zap.Error(err))
                return err
            }
        }
    }
}
```

**ユースケース**:
- タイムアウト設定: 長時間実行される可能性のある操作に対するタイムアウト制御
- バッチ処理: 大量のデータを効率的に処理するためのストリーミングRPC
- イベント通知: サーバーからクライアントへのリアルタイム通知

### エラー処理

- gRPCステータスコードの使用
- エラーメッセージの形式
- リトライ戦略

**実装例**:
```go
// Go言語でのgRPCエラーハンドリング例
func (s *userServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.CreateUserResponse, error) {
    // バリデーション
    if req.User == nil {
        return nil, status.Error(codes.InvalidArgument, "ユーザー情報は必須です")
    }
    
    if req.User.Email == "" {
        return nil, status.Errorf(codes.InvalidArgument, "メールアドレスは必須です")
    }
    
    // メールアドレスの重複チェック
    exists, err := s.userRepo.ExistsByEmail(ctx, req.User.Email)
    if err != nil {
        s.logger.Error("データベースエラー", zap.Error(err))
        return nil, status.Error(codes.Internal, "内部エラーが発生しました")
    }
    
    if exists {
        return nil, status.Error(codes.AlreadyExists, "このメールアドレスは既に使用されています")
    }
    
    // ユーザー作成処理
    // ...
    
    return &pb.CreateUserResponse{
        User: &pb.User{
            // ...
        },
    }, nil
}
```

**クライアント側のエラーハンドリングとリトライ例**:
```go
// Go言語でのgRPCクライアントエラーハンドリングとリトライ例
func getUserWithRetry(client pb.UserServiceClient, userID string) (*pb.User, error) {
    req := &pb.GetUserRequest{UserId: userID}
    
    // リトライ設定
    backoff := backoff.NewExponentialBackOff()
    backoff.MaxElapsedTime = 30 * time.Second
    
    var user *pb.User
    var err error
    
    // リトライ処理
    retryFn := func() error {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        
        resp, err := client.GetUser(ctx, req)
        if err != nil {
            st, ok := status.FromError(err)
            if !ok {
                // gRPCエラーでない場合はリトライしない
                return backoff.Permanent(err)
            }
            
            switch st.Code() {
            case codes.Unavailable, codes.DeadlineExceeded:
                // 一時的なエラーはリトライ
                return err
            case codes.NotFound, codes.InvalidArgument:
                // クライアントエラーはリトライしない
                return backoff.Permanent(err)
            default:
                // その他のエラーはリトライしない
                return backoff.Permanent(err)
            }
        }
        
        user = resp.User
        return nil
    }
    
    // リトライ実行
    err = backoff.Retry(retryFn, backoff)
    if err != nil {
        return nil, err
    }
    
    return user, nil
}
```

**ユースケース**:
- 適切なステータスコードの使用: クライアントエラー（InvalidArgument、NotFound）とサーバーエラー（Internal、Unavailable）の区別
- 詳細なエラーメッセージ: クライアントが問題を特定しやすいエラー情報の提供
- リトライ戦略: 一時的なエラー（Unavailable、DeadlineExceeded）に対する指数バックオフリトライ

## ドキュメント生成

### ツール利用

- protoc-gen-docの設定
- CI/CDでの自動生成
- バージョン管理

### API参照

- メソッド仕様の記述
- 型定義の説明
- 例示の提供
