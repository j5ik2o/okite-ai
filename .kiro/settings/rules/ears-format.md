# EARS形式ガイドライン

## 概要
EARS（Easy Approach to Requirements Syntax）は、受け入れ条件を「条件 + 主語 + 応答」の構造で明確化するための書式である。  
受け入れ条件は `spec.json.language` で指定された言語に合わせて記述すること。

- `language: ja` の場合は日本語パターンを使用し、`When` や `shall` など英語キーワードを使わない。
- `language: en` の場合は英語パターンを使用する。
- 1つの受け入れ条件内で日本語と英語を混在させない。

## 日本語パターン（language: ja）

### 1. イベント駆動
- **パターン**: [イベント] が起きたとき、[システム] は [応答] しなければならない
- **用途**: 特定のイベントに反応する要件
- **例**: ボタンがクリックされたとき、チェックアウトサービスはカート内容を検証しなければならない

### 2. 状態駆動
- **パターン**: [前提] の間、[システム] は [応答] し続けなければならない
- **用途**: 状態や前提に依存する振る舞い
- **例**: 決済処理中の間、チェックアウトサービスはローディング表示を続けなければならない

### 3. 望ましくない振る舞い
- **パターン**: [条件] ならば、[システム] は [応答] しなければならない
- **用途**: エラーや失敗に対する応答
- **例**: 不正なカード番号が入力されたならば、システムはエラーメッセージを表示しなければならない

### 4. 任意機能
- **パターン**: [機能/オプション] を含む場合、[システム] は [応答] しなければならない
- **用途**: 任意機能に限定される要件
- **例**: サンルーフを含む場合、車両はサンルーフ操作パネルを備えなければならない

### 5. 常時
- **パターン**: [システム] は常に [応答] しなければならない
- **用途**: 常時成立する要件
- **例**: モバイル端末は常に100グラム未満でなければならない

### 結合パターン
- [前提] の間、[イベント] が起きたとき、[システム] は [応答] しなければならない
- [イベント] かつ [追加条件] のとき、[システム] は [応答] しなければならない

## 英語パターン（language: en）

### 1. Event-Driven
- **Pattern**: When [event], the [system] shall [response/action]

### 2. State-Driven
- **Pattern**: While [precondition], the [system] shall [response/action]

### 3. Unwanted Behavior
- **Pattern**: If [trigger], the [system] shall [response/action]

### 4. Optional Feature
- **Pattern**: Where [feature is included], the [system] shall [response/action]

### 5. Ubiquitous
- **Pattern**: The [system] shall [response/action]

### Combined
- While [precondition], when [event], the [system] shall [response/action]
- When [event] and [additional condition], the [system] shall [response/action]

## 主語の選び方
- **ソフトウェア**: 具体的なシステム/サービス名（例: 「Checkout Service」）
- **プロセス**: 担当チームや役割名（例: 「サポートチーム」）
- **非ソフトウェア**: 対象に応じた主語（例: 「マーケティング施策」）

## 品質基準
- 要件はテスト可能・検証可能であること。
- 1つの受け入れ条件は1つの振る舞いに絞ること。
- 口語や曖昧語を避け、観測可能な表現にすること。
