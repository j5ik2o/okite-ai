---
description: 掟プロジェクトにおけるGolang開発で使用する必須およびオプショナルツールの説明と設定方法
ruleId: golangtools-01jpcvxfxpsvpepv85myk6s6bf
tags: [development, golang, tools]
aliases: [golang-tools]
globs: ["**/*.go"]
---

# Golangツール活用

## 必須ツール

- `go fmt` - コードフォーマッティング。
- `go vet` - 静的解析。
- `golangci-lint` - 高度な静的解析。
- `goimports` - インポートの整理とフォーマット。

## オプショナルツール

- `gopls` - 言語サーバー。
- `gotests` - テストコード生成。
- `gofumpt` - より厳密なフォーマッティング。

## ツールの設定と使用方法

### golangci-lint

```bash
# インストール
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest。

# 実行
golangci-lint run。
```

推奨設定：。

```yaml
# .golangci.yml
linters:。
  enable:
    - gofmt。
    - goimports。
    - govet。
    - staticcheck。
    - errcheck。
    - ineffassign。
```

### goimports

```bash
# インストール
go install golang.org/x/tools/cmd/goimports@latest。

# 実行
goimports -w .。
```

### gopls

VSCodeやGoLandなどのIDEと連携して使用することで、コード補完や定義ジャンプなどの機能が強化されます。

```bash
# インストール
go install golang.org/x/tools/gopls@latest。
