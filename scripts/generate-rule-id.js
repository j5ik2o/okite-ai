#!/usr/bin/env node

/**
 * ルールID生成ユーティリティ
 * 
 * 使い方:
 *   node generate-rule-id.js prefix
 * 
 * 例:
 *   node generate-rule-id.js ddd
 *   => ddd-01jpf07spf9d1wwnkcj4vyvt6h
 */

const { generateRuleId } = require('./common');

// コマンドライン引数を取得
const args = process.argv.slice(2);

// ヘルプメッセージを表示する関数
function showHelp() {
  console.log('使用方法: node generate-rule-id.js prefix');
  console.log();
  console.log('説明:');
  console.log('  掟ドキュメントのルールIDを生成します。');
  console.log('  prefix-ulidの形式でルールIDが生成されます。');
  console.log();
  console.log('引数:');
  console.log('  prefix    接頭辞（必須）');
  console.log();
  console.log('例:');
  console.log('  node generate-rule-id.js ddd');
  console.log('  => ddd-01jpf07spf9d1wwnkcj4vyvt6h');
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

// 接頭辞を取得
const prefix = args[0];

// ルールIDを生成して出力
const ruleId = generateRuleId(prefix);
console.log(ruleId); 