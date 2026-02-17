---
name: takt-facet
description: >
  TAKTファセット（Persona/Policy/Instruction/Knowledge/Output Contract）の
  個別作成・編集スキル。各ファセットのスタイルガイドに準拠した単体ファイルを生成する。
  references/taktにあるスタイルガイド・ビルトインファセット群を参照資料として活用し、
  ファセット種別の判断、テンプレート選択、品質チェックを行う。
  トリガー：「ペルソナを作りたい」「ポリシーを追加」「インストラクションを書く」
  「ナレッジを定義」「出力契約を作成」「ファセットを編集」「takt facet」
  「レビュアーのペルソナ」「コーディングポリシー」
---

# TAKT Facet Creator

TAKTの5種類のファセットファイルを個別に作成・編集する。

## 参照資料

ファセット作成時は `references/takt/builtins/ja/` の資料を参照する。

| 資料 | パス | 用途 |
|------|------|------|
| スタイルガイド総合 | `references/takt/builtins/ja/STYLE_GUIDE.md` | 各ファセットの位置づけ |
| ペルソナガイド | `references/takt/builtins/ja/PERSONA_STYLE_GUIDE.md` | ペルソナ記述規約 |
| ポリシーガイド | `references/takt/builtins/ja/POLICY_STYLE_GUIDE.md` | ポリシー記述規約 |
| インストラクションガイド | `references/takt/builtins/ja/INSTRUCTION_STYLE_GUIDE.md` | インストラクション記述規約 |
| 出力契約ガイド | `references/takt/builtins/ja/OUTPUT_CONTRACT_STYLE_GUIDE.md` | 出力契約記述規約 |
| Faceted Prompting | `references/takt/docs/faceted-prompting.ja.md` | 5ファセット設計の理論 |
| テンプレート | `references/takt/builtins/ja/templates/` | 各ファセットのテンプレート |
| ビルトインファセット | `references/takt/builtins/ja/{personas,policies,instructions,knowledge,output-contracts}/` | 既存ファセット例 |

**重要**: ファセット作成前に該当するスタイルガイドを必ず読む。

## ワークフロー

### Step 1: ファセット種別の判定

ユーザーの要件から、作成すべきファセット種別を判定する。

```
この内容は…
├── 特定エージェントのidentity・専門知識 → Persona
├── 複数エージェントが共有する行動規範 → Policy
├── ムーブメント固有の実行手順 → Instruction
├── 判断の前提となる参照情報 → Knowledge
└── エージェント出力の構造定義 → Output Contract
```

| ファセット | 配置先 | 対象 | キー判断 |
|-----------|--------|------|----------|
| Persona | system prompt | 1エージェント | 「この知識はこのエージェント固有か？」 |
| Policy | user message内 | 複数エージェント | 「複数エージェントが同じルールに従うか？」 |
| Instruction | Phase 1 message | 1ムーブメント | 「この手順はこのムーブメント固有か？」 |
| Knowledge | user message内 | 1+エージェント | 「判断の前提となる参照情報か？」 |
| Output Contract | Phase 2 message | 1レポート | 「後続が`{report:filename}`で参照するか？」 |

### Step 2: ビルトイン確認

同種のビルトインファセットを確認し、再利用できるか判断する。

| ファセット | ビルトイン例 |
|-----------|-------------|
| Persona | coder, planner, architecture-reviewer, qa-reviewer, supervisor, security-reviewer |
| Policy | coding, review, testing, qa, ai-antipattern |
| Instruction | plan, implement, review-arch, review-qa, supervise, fix |
| Knowledge | architecture, backend, cqrs-es, frontend, security |
| Output Contract | plan, architecture-review, ai-review, summary, validation |

**再利用判断**: ビルトインで足りる場合はカスタムファセットを作らない。

### Step 3: テンプレート選択と作成

#### Persona

テンプレート: `templates/personas/{simple,expert,character}.md`

| テンプレート | 用途 | 例 |
|------------|------|-----|
| `simple.md` | ドメイン知識なし | coder, planner |
| `expert.md` | ドメイン知識あり | architecture-reviewer |
| `character.md` | 固有の人格・口調 | melchior, balthasar |

```markdown
# {エージェント名}

{1-2文のロール定義。「あなたは〜です。」で始める}

## 役割の境界

**やること:**
- ...

**やらないこと:**
- ...（担当エージェント名を明記）

## 行動姿勢

- ...（3-8項目）

## ドメイン知識（expertのみ）

### {観点}
...
```

**サイズ目安**: simple 30-50行（上限100行）、expert 50-300行（上限550行）

**禁止事項**:
- ポリシーの詳細ルール（コード例・テーブル）を転記（1行の行動指針はOK）
- ピース固有の概念（ムーブメント名、レポートファイル名）
- ツール固有のパス（`.takt/runs/`等）
- 実行手順

#### Policy

テンプレート: `templates/policies/policy.md`

```markdown
# {ポリシー名}

{1文の目的説明}

## 原則

| 原則 | 基準 |
|------|------|
| ... | ... |

## {ルールカテゴリ1}

{テーブル、コード例、箇条書きを自由に組み合わせ}
```

**サイズ目安**: 60-250行（上限300行）

**禁止事項**:
- 特定エージェント固有の知識
- ピース固有の概念、ツール固有のパス
- 実行手順

#### Instruction

テンプレート: `templates/instructions/{plan,implement,review,fix,supervise,...}.md`

```markdown
{目的宣言。1-2行、命令形}

**注意:** {条件付き注意事項（該当する場合）}

**やること:**
1. {手順1}
2. {手順2}
3. {手順3}

**必須出力（見出しを含める）**
## {出力セクション1}
- {内容}
## {出力セクション2}
- {内容}
```

**サイズ目安**: レビュー sub-step 5-12行、計画・修正 10-20行、実装・検証 30-50行

**禁止事項**:
- ペルソナの内容（専門知識、行動姿勢）
- ポリシーの内容（共有コーディング原則）
- 自動注入される変数（`{task}`, `{previous_response}`）の手動記述
- 他ムーブメント名の直接参照

**テンプレート変数**（使用可能）:
- `{iteration}`, `{max_movements}`, `{movement_iteration}`
- `{report_dir}`, `{report:filename}`, `{cycle_count}`

#### Knowledge

テンプレート: `templates/knowledge/knowledge.md`

```markdown
# {ドメイン名}知識

## {トピック1}

{概要。1-2文}

| 基準 | 判定 |
|------|------|
| ... | ... |

### {サブトピック}

{コード例で具体的に}

## {トピック2}

| パターン | 例 | 問題 |
|---------|-----|------|
| ... | `{コード}` | ... |

検証アプローチ:
1. {手順}
```

**特徴**: 記述的（「こうなっている」）。ポリシーの「WHY」を提供する。

#### Output Contract

テンプレート: `templates/reports/{plan,review,validation,summary,...}.md`

````markdown
```markdown
# {レポートタイトル}

## 結果: APPROVE / REJECT

## サマリー
{1-2文で結果を要約}

## 詳細
| 観点 | 結果 | 備考 |
|------|------|------|
```

**認知負荷軽減ルール:**
- APPROVE → サマリーのみ（5行以内）
- REJECT → 問題点を表形式で（30行以内）
````

**サイズ目安**: 10-25行（上限30行、認知負荷軽減ルール除く）

**ステータスパターン**: `APPROVE / REJECT`（二値）、`APPROVE / IMPROVE / REJECT`（三値）、`完了`（固定値）

**禁止事項**:
- 実行手順（インストラクションの責務）
- 判断基準の詳細（ペルソナ/インストラクションの責務）

### Step 4: 共通ルール適用

全ファセット共通のルールを確認する。

| ルール | 内容 |
|--------|------|
| 見出し深さ | `###` まで。`####` 以下は不可 |
| コード例 | 良い例/悪い例のペア。`// REJECT` `// OK` コメント |
| 文体 | ペルソナ・ポリシー・ナレッジ: 常体。インストラクション: 丁寧語（命令調） |
| ファイル命名 | `{name}.md`、ハイフン区切り、英語小文字 |
| 配置 | `~/.takt/{facet-type}/` または プロジェクト固有の場所 |

### Step 5: 検証

作成したファセットの品質を確認する。

**全ファセット共通:**
- [ ] `####` 以下のネストがないか
- [ ] ファイル命名規約に従っているか
- [ ] サイズ上限内か

**Persona:**
- [ ] ロール定義が1-2文か
- [ ] 「やること」「やらないこと」に担当エージェント名があるか
- [ ] ポリシーの詳細ルールが混入していないか
- [ ] ピース固有の概念がないか

**Policy:**
- [ ] 目的説明が1文か
- [ ] 原則テーブルがあるか
- [ ] 複数エージェントに適用可能か

**Instruction:**
- [ ] 冒頭が命令形か
- [ ] 自動注入変数を手動記述していないか
- [ ] ペルソナ/ポリシーの内容が混入していないか

**Knowledge:**
- [ ] 記述的（宣言的）な文体か
- [ ] テーブルとコード例で具体的か

**Output Contract:**
- [ ] ```markdownコードブロックで囲まれているか
- [ ] レビュー系にステータスと認知負荷軽減ルールがあるか
- [ ] 番号プレフィックスがファイル名にないか
