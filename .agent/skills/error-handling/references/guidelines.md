# エラーハンドリングガイドライン詳細

## 目次

1. [回復可能なエラーの詳細](#回復可能なエラーの詳細)
2. [回復不能なエラーの詳細](#回復不能なエラーの詳細)
3. [言語別実装パターン](#言語別実装パターン)
4. [エラー型設計パターン](#エラー型設計パターン)

---

## 回復可能なエラーの詳細

### 特徴

- 外部要因や入力に起因
- 呼び出し元で適切に対処可能
- プログラムの継続実行が可能

### 代表的な例

- ビジネスルール違反、バリデーションエラー
- 外部システム接続エラー、タイムアウト
- リソース未発見、権限不足、リソース競合

---

## 回復不能なエラーの詳細

### 特徴

- プログラムの前提条件違反
- 開発者のバグを示す
- 即座に停止すべき状態

### 種類と対応

| 種類 | 説明 | 例 |
|------|------|-----|
| 引数の不正 | null、範囲外、不正な形式 | `IllegalArgumentException` |
| 状態の矛盾 | オブジェクトの不整合状態 | `IllegalStateException` |
| 到達不可コード | 論理的にありえない分岐 | `unreachable!()` |

---

## 言語別実装パターン

### TypeScript (neverthrow)

```typescript
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

// 回復不能エラー
function processOrder(order: Order): void {
  if (order === null) throw new Error('IllegalArgument: order must not be null');
  if (order.status === 'COMPLETED' && order.items.length === 0)
    throw new Error('IllegalState: completed order must have items');
}
```

### Rust (標準Result + thiserror)

```rust
use thiserror::Error;

#[derive(Debug, Error)]
enum UserError {
    #[error("User not found: {0}")]
    NotFound(String),
    #[error("Validation failed: {field} - {reason}")]
    ValidationFailed { field: String, reason: String },
}

fn find_user(id: &str) -> Result<User, UserError> {
    if !is_valid_id(id) {
        return Err(UserError::ValidationFailed {
            field: "id".to_string(),
            reason: "Invalid format".to_string(),
        });
    }
    repository.find(id).ok_or_else(|| UserError::NotFound(id.to_string()))
}

// 回復不能エラー
fn process_order(order: &Order) {
    assert!(!order.items.is_empty(), "order must have items");
    if order.status == Status::Completed && order.items.is_empty() {
        panic!("IllegalState: completed order must have items");
    }
}
```

### Go (標準エラーパターン)

```go
type UserError struct {
    Type   string
    UserID string
    Field  string
    Reason string
}

func (e *UserError) Error() string {
    switch e.Type {
    case "NOT_FOUND":
        return fmt.Sprintf("user not found: %s", e.UserID)
    case "VALIDATION_FAILED":
        return fmt.Sprintf("validation failed: %s - %s", e.Field, e.Reason)
    }
    return "unknown error"
}

func FindUser(id string) (*User, error) {
    if !isValidID(id) {
        return nil, &UserError{Type: "VALIDATION_FAILED", Field: "id", Reason: "Invalid format"}
    }
    user, err := repository.Find(id)
    if err != nil {
        return nil, &UserError{Type: "NOT_FOUND", UserID: id}
    }
    return user, nil
}

// 回復不能エラー
func processOrder(order *Order) {
    if order == nil {
        panic("IllegalArgument: order must not be nil")
    }
}
```

### Scala (標準Either)

```scala
sealed trait UserError
case class NotFound(userId: String) extends UserError
case class ValidationFailed(field: String, reason: String) extends UserError

def findUser(id: String): Either[UserError, User] = {
  if (!isValidId(id)) {
    Left(ValidationFailed("id", "Invalid format"))
  } else {
    repository.find(id).toRight(NotFound(id))
  }
}

// 回復不能エラー
def processOrder(order: Order): Unit = {
  require(order != null, "order must not be null")
  require(!(order.status == "COMPLETED" && order.items.isEmpty),
    "completed order must have items")
}
```

### Java (vavr.io Either)

```java
import io.vavr.control.Either;

sealed interface UserError permits NotFound, ValidationFailed {}
record NotFound(String userId) implements UserError {}
record ValidationFailed(String field, String reason) implements UserError {}

Either<UserError, User> findUser(String id) {
    if (!isValidId(id)) {
        return Either.left(new ValidationFailed("id", "Invalid format"));
    }
    return repository.find(id)
        .<UserError>toEither(() -> new NotFound(id));
}

// 回復不能エラー
void processOrder(Order order) {
    if (order == null) throw new IllegalArgumentException("order must not be null");
    if (order.status().equals("COMPLETED") && order.items().isEmpty())
        throw new IllegalStateException("completed order must have items");
}
```

### JavaScript (neverthrow)

```javascript
import { ok, err } from 'neverthrow';

function findUser(id) {
  if (!isValidId(id)) {
    return err({ type: 'VALIDATION_FAILED', field: 'id', reason: 'Invalid format' });
  }
  const user = repository.find(id);
  return user ? ok(user) : err({ type: 'NOT_FOUND', userId: id });
}

// 回復不能エラー
function processOrder(order) {
  if (order === null || order === undefined)
    throw new Error('IllegalArgument: order must not be null');
}
```

---

## エラー型設計パターン

### Union型による表現 (TypeScript)

```typescript
type DomainError =
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'NOT_FOUND'; resource: string; id: string }
  | { type: 'CONFLICT'; resource: string; reason: string }
  | { type: 'PERMISSION_DENIED'; action: string; resource: string };
```

### Enum型による表現 (Rust)

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("Validation error: {field} - {message}")]
    Validation { field: String, message: String },

    #[error("{resource} not found: {id}")]
    NotFound { resource: String, id: String },

    #[error("Conflict in {resource}: {reason}")]
    Conflict { resource: String, reason: String },
}
```

### sealed class/interface (Scala/Java)

```scala
// Scala
sealed trait DomainError
case class ValidationError(field: String, message: String) extends DomainError
case class NotFound(resource: String, id: String) extends DomainError
```

```java
// Java 17+
sealed interface DomainError permits ValidationError, NotFound {}
record ValidationError(String field, String message) implements DomainError {}
record NotFound(String resource, String id) implements DomainError {}
```
