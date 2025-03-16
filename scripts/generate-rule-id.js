#!/usr/bin/env node

/**
 * ルールID生成ユーティリティ
 * 
 * 使い方:
 *   node generate-rule-id.js PREFIX
 * 
 * 例:
 *   node generate-rule-id.js META
 *   => META-01H1NJ5NMGDXBFK97340PJMG8E
 */

const { ulid } = require('ulidx');

// コマンドライン引数を取得
const args = process.argv.slice(2);

// ヘルプメッセージを表示する関数
function showHelp() {
  console.log('使用方法: node generate-rule-id.js PREFIX');
  console.log();
  console.log('説明:');
  console.log('  掟ドキュメントのルールIDを生成します。');
  console.log('  PREFIX-ULIDの形式でルールIDが生成されます。');
  console.log();
  console.log('引数:');
  console.log('  PREFIX    接頭辞（必須）');
  console.log();
  console.log('例:');
  console.log('  node generate-rule-id.js META');
  console.log('  => META-01H1NJ5NMGDXBFK97340PJMG8E');
}

// ヘルプオプションのチェック
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// 引数の数をチェック
if (args.length < 1) {
  console.error('エラー: 引数が不足しています。接頭辞が必要です。');
  showHelp();
  process.exit(1);
}

// 接頭辞を取得して大文字に変換
const prefix = args[0].toUpperCase();

// ULIDを生成
const id = ulid();

// ルールIDを生成して出力
const ruleId = `${prefix}-${id}`;
console.log(ruleId); 