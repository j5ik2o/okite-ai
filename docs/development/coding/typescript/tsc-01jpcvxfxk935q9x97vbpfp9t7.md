---
description: tsc settingsに関するドキュメント
ruleId: tsc-01jpcvxfxk935q9x97vbpfp9t7
tags: ["development","coding","typescript"]
aliases: ["typescript-config", "tsconfig"]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

# TypeScript設定

## tsconfig.json

TypeScriptを使用して型安全性を確保するための設定例：。

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "lib": ["esnext"],
    "strict": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "downlevelIteration": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "docs", "coverage"]
}
```

主な設定項目の解説：。

- `target`: 出力するJavaScriptのバージョン（ES2019は現代的かつ広くサポートされている）
- `module` と `moduleResolution`: Node.js環境での最新のモジュール解決方式。
- `strict`: 厳格な型チェックを有効化。
- `experimentalDecorators`: デコレータを使用可能に。
- `paths`: エイリアス設定（`@/components/Button`のように短い参照パスが使用可能）
- `rootDir`: TypeScriptソースファイルの配置場所。