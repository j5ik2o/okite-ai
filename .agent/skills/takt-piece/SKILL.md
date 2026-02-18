---
name: takt-piece
description: >
  TAKTピース（ワークフローYAML）の作成・カスタマイズスキル。Faceted Prompting
  （Persona/Policy/Instruction/Knowledge/Output Contract）に基づくファセット群の
  生成を含む。${OKITE_ROOT}/references/taktにあるtaktのソースコード・ドキュメント・ビルトインピース群を
  参照資料として活用する。ユーザーの要件をヒアリングし、movement構成、ルール設計、
  ファセットファイル生成を一括で行う。
  トリガー：「ピースを作りたい」「ワークフローを定義」「taktのピースを作成」
  「新しいtaktピースを作って」「takt piece」「ワークフローYAML」
---

# TAKT Piece Creator

TAKTピース（ワークフローYAML）とその関連ファセットファイルを作成する。

## 参照資料

taktのコードベースとドキュメントは `${OKITE_ROOT}/references/takt/` にある。必要に応じて以下を参照する。

> **`${OKITE_ROOT}` の解決**: okite-ai リポジトリのルートパス。okite-ai 直下では空文字、親プロジェクトのサブモジュールとして利用時は `.gitmodules` で確認（通常 `references/okite-ai`）。

| 資料 | パス | 用途 |
|------|------|------|
| YAMLスキーマ | `${OKITE_ROOT}/references/takt/builtins/skill/references/yaml-schema.md` | ピースYAMLの構造定義 |
| エンジン仕様 | `${OKITE_ROOT}/references/takt/builtins/skill/references/engine.md` | プロンプト構築・ルール評価の詳細 |
| Faceted Prompting | `${OKITE_ROOT}/references/takt/docs/faceted-prompting.ja.md` | 5ファセット設計の理論 |
| ビルトインピース | `${OKITE_ROOT}/references/takt/builtins/ja/pieces/` | 実例（default.yaml, expert.yaml等） |
| スタイルガイド | `${OKITE_ROOT}/references/takt/builtins/ja/STYLE_GUIDE.md` | ファセット記述規約 |
| ペルソナガイド | `${OKITE_ROOT}/references/takt/builtins/ja/PERSONA_STYLE_GUIDE.md` | ペルソナ記述規約 |
| ビルトインファセット | `${OKITE_ROOT}/references/takt/builtins/ja/{personas,policies,instructions,knowledge,output-contracts}/` | 既存ファセット例 |

**重要**: ピース作成前に `${OKITE_ROOT}/references/takt/builtins/ja/pieces/default.yaml` を読み、プロジェクトのパターンを把握する。

## ワークフロー

### Step 1: 要件ヒアリング

以下を確認する（不明な点はユーザーに質問）:

1. **目的**: このピースで何を達成するか
2. **ムーブメント構成**: どんなステップが必要か（plan→implement→review→supervise等）
3. **レビュー体制**: 並列レビューの有無、レビュアーの種類
4. **ループ制御**: 修正ループの有無と閾値
5. **出力先**: ピースとファセットの配置場所（デフォルト: `~/.takt/pieces/`）

### Step 2: ビルトイン参照

ビルトインピース（`${OKITE_ROOT}/references/takt/builtins/ja/pieces/`）から類似パターンを探す。

| ビルトイン | 構成 | 用途 |
|-----------|------|------|
| `default.yaml` | plan→implement→ai_review→reviewers(arch+qa)→supervise | 標準開発 |
| `expert.yaml` | plan→implement→ai_review→reviewers(arch+frontend+security+qa)→supervise | フルスタック |
| `default-mini.yaml` | plan→implement→supervise | 最小構成 |
| `review-only.yaml` | レビュー専用 | コードレビューのみ |

**再利用判断**: ビルトインのファセットで足りる場合はカスタムファセットを作らない。

### Step 3: ピースYAML作成

以下の構造でYAMLを作成する。

```yaml
name: piece-name
description: ピースの説明
max_movements: 30
initial_movement: plan

# セクションマップ（カスタムファセットがある場合のみ）
personas:
  custom-role: ../personas/custom-role.md
policies:
  custom-policy: ../policies/custom-policy.md
instructions:
  custom-step: ../instructions/custom-step.md
knowledge:
  domain: ../knowledge/domain.md
report_formats:
  custom-report: ../output-contracts/custom-report.md

movements:
  - name: plan
    edit: false
    persona: planner          # ビルトイン参照（bare name）
    knowledge: architecture
    instruction: plan
    output_contracts:
      report:
        - name: 00-plan.md
          format: plan
    rules:
      - condition: 要件が明確で実装可能
        next: implement
      - condition: 要件が不明確、情報不足
        next: ABORT

  - name: implement
    edit: true
    persona: coder
    policy: [coding, testing]
    session: refresh
    instruction: implement
    rules:
      - condition: 実装完了
        next: review
```

#### Parallel Movement 例

```yaml
  - name: reviewers
    parallel:
      - name: arch-review
        edit: false
        persona: architecture-reviewer
        policy: review
        instruction: review-arch
        output_contracts:
          report:
            - name: 05-architect-review.md
              format: architecture-review
        rules:
          - condition: approved
          - condition: needs_fix
      - name: qa-review
        edit: false
        persona: qa-reviewer
        policy: [review, qa]
        instruction: review-qa
        rules:
          - condition: approved
          - condition: needs_fix
    rules:
      - condition: all("approved")
        next: supervise
      - condition: any("needs_fix")
        next: fix
```

**注意**: サブステップの `rules` は結果分類用。`next` は無視され、親の `rules` が遷移先を決定する。

#### 設計判断ガイド

| 判断ポイント | 基準 |
|-------------|------|
| `edit: true/false` | コード変更するムーブメントのみtrue |
| `session: refresh` | 実装系ムーブメントで新規セッション開始 |
| `pass_previous_response: false` | レビュー結果を直接読ませたくない場合 |
| `required_permission_mode` | edit権限が必要な場合に `edit` を指定 |

#### ルール設計

| ルール種別 | 記法 | 使い分け |
|-----------|------|----------|
| テキスト条件 | `"条件文"` | Phase 3タグ判定（推奨） |
| AI判定 | `ai("条件")` | タグ判定が不適な場合 |
| 全一致 | `all("条件")` | parallelの親のみ |
| いずれか | `any("条件")` | parallelの親のみ |

特殊遷移先: `COMPLETE`（成功終了）、`ABORT`（失敗終了）

### Step 4: ファセットファイル作成

カスタムファセットが必要な場合、以下の規約で作成する。

#### ディレクトリ構造

```
~/.takt/
├── pieces/
│   └── my-piece.yaml
├── personas/
│   └── custom-role.md
├── policies/
│   └── custom-policy.md
├── instructions/
│   └── custom-step.md
├── knowledge/
│   └── domain.md
└── output-contracts/
    └── custom-report.md
```

#### ファセット作成規約

**Persona**: system promptに配置。identity + 専門性 + 境界。

```markdown
# {ロール名}

{1-2文のロール定義}

## 役割の境界

**やること:**
- ...

**やらないこと:**
- ...（担当エージェント名を明記）

## 行動姿勢

- ...
```

**Policy**: 複数ムーブメントで共有する行動規範。

```markdown
# {ポリシー名}

## 原則

| 原則 | 基準 |
|------|------|
| ... | REJECT / APPROVE 判定 |

## 禁止事項

- ...
```

**Instruction**: ムーブメント固有の手順。命令形で記述。`{task}`, `{previous_response}`は自動注入されるため不要。

**Knowledge**: 判断の前提となる参照情報。記述的（「こうなっている」）。

**Output Contract**: レポートの構造定義。

````markdown
```markdown
# {レポートタイトル}

## 結果: APPROVE / REJECT

## サマリー
{1-2文で要約}

## 詳細
| 観点 | 結果 | 備考 |
|------|------|------|
```
````

詳細なスタイル規約は `${OKITE_ROOT}/references/takt/builtins/ja/STYLE_GUIDE.md` を参照。

### Step 5: Loop Monitor（任意）

修正ループが想定される場合に設定する。

```yaml
loop_monitors:
  - cycle: [review, fix]
    threshold: 3
    judge:
      persona: supervisor
      instruction_template: |
        {cycle_count} 回のループが発生。進捗の有無を判断してください。
        レポート: {report:review-report.md}
      rules:
        - condition: 健全（進捗あり）
          next: review
        - condition: 非生産的（改善なし）
          next: supervise
```

### Step 6: 検証

作成したファイルの整合性を確認する:

- [ ] セクションマップのキーとムーブメント内の参照が一致
- [ ] セクションマップのパスが実際のファイル位置と一致（ピースYAMLからの相対パス）
- [ ] ビルトイン参照（bare name）とカスタム参照（セクションマップキー）が混在していないか
- [ ] `initial_movement` が `movements` 配列内に存在
- [ ] 全ムーブメントの `rules.next` が有効な遷移先（他のムーブメント名 or COMPLETE/ABORT）
- [ ] parallel ムーブメントの親ルールが `all()` / `any()` を使用
- [ ] parallel サブステップのルールに `next` がない（親が制御）
