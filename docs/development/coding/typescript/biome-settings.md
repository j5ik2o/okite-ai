---
description: biome settingsに関するドキュメント
ruleId: 01JPCVXFXK935Q9X97VBPFP9T9
tags: ["development","coding","typescript"]
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
aliases: ["biome-config", "typescript-linting"]
---


# Biomeの設定

TypeScriptコードの品質を保つためのBiome設定例：。

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "files": {
    "maxSize": 2000000,
    "ignore": ["docs/**/*", "node_modules/**/*", "dist/**/*", ".obsidian/**/*", "coverage/**/*"]
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noConstAssign": "error",
        "useExhaustiveDependencies": "error"
      },
      "suspicious": {
        "noExplicitAny": "off",
        "noImplicitAnyLet": "off"
      },
      "complexity": {
        "noForEach": "off",
        "noStaticOnlyClass": "off"
      },
      "style": {
        "useConst": "error",
        "useSingleVarDeclarator": "off",
        "noUnusedTemplateLiteral": "off",
        "useTemplate": "off"
      }
    },
    "ignore": ["node_modules", "dist", "docs", "docs/**/*", ".obsidian/**/*", "coverage/**/*"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "ignore": ["node_modules", "dist", "docs"]
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  },
  "overrides": [
    {
      "include": ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
      "linter": {
        "rules": {
          "complexity": {
            "useLiteralKeys": "off"
          }
        }
      }
    }
  ]
}
```