# Parse, Don't Validate - 言語別パターン

## 目次

1. [Rust](#rust)
2. [TypeScript](#typescript)
3. [Haskell](#haskell)
4. [Scala](#scala)
5. [Java](#java)
6. [Go](#go)
7. [Python](#python)

---

## Rust

### NonEmpty

```rust
use std::num::NonZeroUsize;

pub struct NonEmpty<T> {
    head: T,
    tail: Vec<T>,
}

impl<T> NonEmpty<T> {
    pub fn parse(vec: Vec<T>) -> Option<Self> {
        let mut iter = vec.into_iter();
        iter.next().map(|head| NonEmpty {
            head,
            tail: iter.collect(),
        })
    }

    pub fn head(&self) -> &T { &self.head }
    pub fn len(&self) -> NonZeroUsize {
        NonZeroUsize::new(1 + self.tail.len()).unwrap()
    }
}
```

### Newtype + Smart Constructor

```rust
mod positive {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
    pub struct PositiveI32(i32);

    impl PositiveI32 {
        pub fn new(n: i32) -> Option<Self> {
            if n > 0 { Some(Self(n)) } else { None }
        }
        pub fn get(self) -> i32 { self.0 }
    }
}
```

### 検証済み設定

```rust
pub struct ValidatedConfig {
    pub db_url: Url,           // 検証済みURL
    pub port: NonZeroU16,      // 0でないポート
    pub max_conn: NonZeroU32,  // 正の接続数
}

impl ValidatedConfig {
    pub fn parse(raw: RawConfig) -> Result<Self, ConfigError> {
        Ok(Self {
            db_url: Url::parse(&raw.db_url)?,
            port: NonZeroU16::new(raw.port)
                .ok_or(ConfigError::InvalidPort)?,
            max_conn: NonZeroU32::new(raw.max_connections)
                .ok_or(ConfigError::InvalidMaxConn)?,
        })
    }
}
```

---

## TypeScript

### NonEmptyArray

```typescript
export type NonEmptyArray<T> = [T, ...T[]];

export function parseNonEmpty<T>(arr: T[]): NonEmptyArray<T> | null {
  if (arr.length === 0) return null;
  return arr as NonEmptyArray<T>;
}

export function head<T>(arr: NonEmptyArray<T>): T {
  return arr[0];  // 安全にアクセス可能
}
```

### Branded Types

```typescript
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type Email = Brand<string, 'Email'>;
type UserId = Brand<string, 'UserId'>;

function parseEmail(s: string): Email | null {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    return s as Email;
  }
  return null;
}

function parseUserId(s: string): UserId | null {
  if (/^[a-z0-9_]{3,20}$/.test(s)) {
    return s as UserId;
  }
  return null;
}
```

### Zod による Parse

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().positive(),
});

type User = z.infer<typeof UserSchema>;

// parse: 成功すれば型付き値、失敗すれば例外
const user: User = UserSchema.parse(unknownInput);

// safeParse: Result型風の戻り値
const result = UserSchema.safeParse(unknownInput);
if (result.success) {
  const user: User = result.data;
}
```

---

## Haskell

### NonEmpty

```haskell
import Data.List.NonEmpty (NonEmpty(..))
import qualified Data.List.NonEmpty as NE

parseNonEmpty :: [a] -> Maybe (NonEmpty a)
parseNonEmpty = NE.nonEmpty

-- 使用例
getConfigDirs :: IO (NonEmpty FilePath)
getConfigDirs = do
  dirs <- getEnv "CONFIG_DIRS" >>= pure . splitOn ','
  case parseNonEmpty dirs of
    Just ne -> pure ne
    Nothing -> throwIO $ userError "CONFIG_DIRS cannot be empty"

main :: IO ()
main = do
  configDirs <- getConfigDirs
  initializeCache (NE.head configDirs)  -- headは安全
```

### Smart Constructor

```haskell
module Email (Email, parseEmail, emailToText) where

import Data.Text (Text)
import qualified Data.Text as T

newtype Email = Email Text  -- constructorは非公開

parseEmail :: Text -> Maybe Email
parseEmail t
  | T.any (== '@') t && T.length t > 3 = Just (Email t)
  | otherwise = Nothing

emailToText :: Email -> Text
emailToText (Email t) = t
```

---

## Scala

### Refined Types

```scala
import eu.timepit.refined._
import eu.timepit.refined.api.Refined
import eu.timepit.refined.numeric._
import eu.timepit.refined.collection._

type PositiveInt = Int Refined Positive
type NonEmptyString = String Refined NonEmpty

def parsePositive(n: Int): Either[String, PositiveInt] =
  refineV[Positive](n)

// コンパイル時検証
val port: PositiveInt = refineMV[Positive](8080)  // OK
val invalid: PositiveInt = refineMV[Positive](-1) // コンパイルエラー
```

### Opaque Types (Scala 3)

```scala
opaque type Email = String

object Email:
  def parse(s: String): Either[String, Email] =
    if s.contains("@") && s.length > 3 then Right(s)
    else Left("Invalid email format")

  extension (e: Email)
    def value: String = e
```

---

## Java

### Value Objects

```java
public final class Email {
    private final String value;

    private Email(String value) {
        this.value = value;
    }

    public static Email parse(String s) {
        if (s == null || !s.contains("@") || s.length() <= 3) {
            throw new IllegalArgumentException("Invalid email: " + s);
        }
        return new Email(s);
    }

    public static Optional<Email> tryParse(String s) {
        try {
            return Optional.of(parse(s));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public String value() { return value; }
}
```

### NonEmpty List

```java
public final class NonEmptyList<T> {
    private final T head;
    private final List<T> tail;

    private NonEmptyList(T head, List<T> tail) {
        this.head = head;
        this.tail = tail;
    }

    public static <T> Optional<NonEmptyList<T>> parse(List<T> list) {
        if (list.isEmpty()) return Optional.empty();
        return Optional.of(new NonEmptyList<>(
            list.get(0),
            list.subList(1, list.size())
        ));
    }

    public T head() { return head; }
    public int size() { return 1 + tail.size(); }
}
```

---

## Go

### Parse関数パターン

```go
type Email struct {
    value string
}

func ParseEmail(s string) (Email, error) {
    if !strings.Contains(s, "@") || len(s) <= 3 {
        return Email{}, fmt.Errorf("invalid email: %s", s)
    }
    return Email{value: s}, nil
}

func (e Email) String() string { return e.value }

// 使用例
func main() {
    email, err := ParseEmail(input)
    if err != nil {
        log.Fatal(err)
    }
    // emailは検証済み
    sendEmail(email)
}
```

### NonEmpty Slice

```go
type NonEmptySlice[T any] struct {
    head T
    tail []T
}

func ParseNonEmpty[T any](s []T) (NonEmptySlice[T], error) {
    if len(s) == 0 {
        return NonEmptySlice[T]{}, errors.New("slice cannot be empty")
    }
    return NonEmptySlice[T]{head: s[0], tail: s[1:]}, nil
}

func (n NonEmptySlice[T]) Head() T    { return n.head }
func (n NonEmptySlice[T]) Len() int   { return 1 + len(n.tail) }
```

---

## Python

### Pydantic による Parse

```python
from pydantic import BaseModel, EmailStr, PositiveInt, validator
from typing import List

class User(BaseModel):
    email: EmailStr
    age: PositiveInt
    tags: List[str]

    @validator('tags')
    def tags_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError('tags cannot be empty')
        return v

# parse: 失敗すれば ValidationError
user = User(email="a@b.com", age=25, tags=["admin"])
```

### NewType + 検証関数

```python
from typing import NewType
from dataclasses import dataclass

Email = NewType('Email', str)

def parse_email(s: str) -> Email:
    if '@' not in s or len(s) <= 3:
        raise ValueError(f"Invalid email: {s}")
    return Email(s)

@dataclass(frozen=True)
class NonEmpty[T]:
    head: T
    tail: list[T]

    @classmethod
    def parse(cls, items: list[T]) -> 'NonEmpty[T]':
        if not items:
            raise ValueError("List cannot be empty")
        return cls(head=items[0], tail=items[1:])
```

---

## 共通原則

### データ構造の選択

| 避ける | 推奨 | 理由 |
|--------|------|------|
| `List<(K, V)>` | `Map<K, V>` | 重複キーを型で防ぐ |
| `List<T>` (非空前提) | `NonEmpty<T>` | 空を型で防ぐ |
| `String` (検証済み前提) | `Email`, `UserId` | フォーマットを型で保証 |
| `Int` (正数前提) | `PositiveInt` | 範囲を型で保証 |

### 警戒すべきシグナル

```
✓ m () / void を返す関数 → 実は検証が目的？
✓ 正規化されていない可変データ → Parseで正規化型に変換
✓ 複数箇所で重複したデータ表現 → 単一の型に統一
✓ "should never happen" → 型で不可能にできないか
```
