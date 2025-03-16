---
description: 掟プロジェクトにおけるGolangコードのドキュメント作成規約とベストプラクティス
ruleId: golangdoc-01jpcvxfxqe37ka9pn3xb4m9yr
tags:
  - development
  - golang
  - documentation
aliases:
  - golang-doc
globs:
  - '**/*.go'
---

# Golangdocの掟

## 基本原則

- [ドキュメントコメントの掟](../doc-comment-01jpcvxfxgyqe2jprh9hgn6xq8.md)に準拠すること
  - ドキュメントコメントは英語で記述する。
  - 記述がないものは新規に追加する。
  - 既存のものでもガイドラインに従っていないものは是正する。
  - コードを見れば分かることは書かない（Why/Why notを中心に記載）

## ドキュメント規約

Go言語の公式ドキュメントに基づき、以下の規約に従うこと：。

- パッケージコメントは`package`句の直前に記述する。
- エクスポートされた識別子には必ずドキュメントを付ける。
- 最初の文は識別子名で始まる完全な文とする。
- ドキュメントはソースコードの解説ではなく、使用方法の説明とする。
- テストはドキュメントとしても機能する。

参考：[Go Doc Comments](https://go.dev/doc/comment)

## ドキュメントスタイル

### パッケージドキュメント

```go
// Package foo provides utilities for handling bar operations.
//
// The package implements various bar algorithms and data structures。
// optimized for specific use cases.
package foo。
```

- パッケージの目的と主な機能を説明する。
- 必要に応じて使用例を含める。
- 他のパッケージとの関連性を説明する。

### 型ドキュメント

```go
// User represents an authenticated user in the system.
// It contains both profile information and authentication details.
type User struct {。
    ID        string。
    Username  string。
    CreatedAt time.Time。
}
```

- 型の目的と責務を明確に説明する。
- フィールドの意味や制約を必要に応じて説明する。
- インタフェースの場合は期待される振る舞いを説明する。

### 関数・メソッドドキュメント

```go
// NewUser creates a new User instance with the given username.
// It returns an error if the username is invalid or already exists.
//
// The username must be:
// - Between 3 and 20 characters long。
// - Contain only alphanumeric characters and underscores。
// - Start with a letter。
func NewUser(username string) (*User, error)。
```

- 関数の目的を簡潔に説明する。
- 引数の要件と制約を列挙する。
- エラーが返される条件を明記する。
- 副作用がある場合は明示する。

### 定数・変数ドキュメント

```go
// MaxRetries is the maximum number of times an operation will be retried.
// This value can be overridden through environment variable MAX_RETRIES.
const MaxRetries = 3。

// DefaultTimeout is the default timeout duration for network operations.
var DefaultTimeout = 30 * time.Second。
```

- 定数・変数の目的と使用コンテキストを説明する。
- 設定可能な値の場合、その方法を説明する。
- デフォルト値の根拠を必要に応じて説明する。

## Examples の書き方

### 基本的な Example

```go
func ExampleUser_FullName() {。
    user := &User{
        FirstName: "John",
        LastName:  "Doe",
    }
    fmt.Println(user.FullName())。
    // Output: John Doe
}
```

### パッケージレベルの Example

```go
func Example() {。
    client := NewClient()
    users, err := client.ListUsers()
    if err != nil {。
        log.Fatal(err)。
    }
    for _, user := range users {
        fmt.Println(user.FullName())。
    }
}
```

### 複数の Example

```go
func ExampleUser_FullName_withMiddleName() {。
    user := &User{
        FirstName:  "John",
        MiddleName: "William",
        LastName:   "Doe",
    }
    fmt.Println(user.FullName())。
    // Output: John William Doe
}
```

## godoc 特殊な記法

### セクション区切り

```go
// User represents a system user.
//
// Authorization。
//
// Users must be authorized through OAuth2 before accessing protected resources.
//
// Rate Limiting。
//
// API calls are limited to 1000 requests per hour per user.
type User struct {}。
```

### リンクの記述

```go
// For more details, see https://example.com/api-docs
// See also: User.Authorize and User.Logout methods
```

## レビュー時の注意点

- ドキュメントが最新の実装を反映しているか。
- 全ての公開要素にドキュメントが付いているか。
- 説明が明確で具体的か。
- Exampleが実際に動作するか。
- 英語の文法や表現が適切か。

## 関連情報

- [Effective Go - Documentation](https://go.dev/doc/effective_go#commentary)
- [Go Doc Comments](https://go.dev/doc/comment)
- [Example tests in Go](https://pkg.go.dev/testing#hdr-Examples)
