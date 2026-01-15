# クリーンアーキテクチャ層別責務詳細

## ドメイン層（Domain Layer）

最内層。ビジネスの核心。

### 配置するもの

- Entity（集約ルート、エンティティ）
- Value Object
- Domain Service
- Domain Event
- Factory Interface

### 配置してはいけないもの

- DB接続、SQL
- HTTP/gRPC クライアント
- フレームワーク依存コード
- ログ出力の実装

---

## ユースケース層（Use Case Layer）

機能を実現するための、一連の操作を定義。ビジネスロジックの進行役。オーケストレーション。

### 配置するもの

- Use Case
- Input Port（ユースケースのインターフェース）
- Output Port（Repository Interface、Gateway Interface等）
- DTO（Use Case間のデータ転送）
- Application Event

### 配置してはいけないもの

- ドメインロジック（ドメイン層へ）
- DB実装、外部API呼び出し実装
- コントローラー

---

## インターフェースアダプタ層（Interface Adapters Layer）

外部世界との変換層。**永続化・RPC実装はここ**。

### 配置するもの

- Controller / Handler
- **Repository Implementation**（DB実装）
- **Gateway Implementation**（外部API/RPC実装）
- Request/Response DTO
- ORM Entity / DB Model
- Mapper（ドメイン ⇔ 永続化モデル変換）

### 重要な原則

```
Repository Interface  → ユースケース層で定義（Output Port）
Repository Impl       → インターフェースアダプタ層で実装
```

---

## インフラストラクチャ層（Infrastructure Layer）

**横断的関心事のみ**。永続化・RPCの場所ではない。

### 配置するもの

- Logging機構
- Configuration管理
- メトリクス収集
- トレーシング
- 共通エラーハンドリング
- DI Container設定
- 環境変数読み込み

### 配置してはいけないもの

- Repository実装 → インターフェースアダプタ層へ
- 外部API Gateway → インターフェースアダプタ層へ
- ドメイン固有のコード

---

## 依存関係ルール

```
外側 → 内側 への依存のみ許可

Infrastructure ──横断的に利用可能──┐
                                    ↓
Interface Adapters → Use Cases → Domain
        ↓               ↓
   （実装）         （利用）      （定義）
```

### 依存性逆転の適用例

```typescript
// ユースケース層（Output Port）
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
}

// インターフェースアダプタ層
class PostgresUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    // DB実装
  }
}
```
