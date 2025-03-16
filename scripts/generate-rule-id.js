#!/usr/bin/env node

/**
 * ルールID生成ユーティリティ
 * 
 * 使い方:
 *   node generate-rule-id.js PREFIX1 PREFIX2
 * 
 * 例:
 *   node generate-rule-id.js META RULES
 *   => META-RULES-01H1NJ5NMGDXBFK97340PJMG8E
 */

const { ulid } = require('ulidx');

// コマンドライン引数を取得
const args = process.argv.slice(2);

// ヘルプメッセージを表示する関数
function showHelp() {
  console.log('使用方法: node generate-rule-id.js PREFIX1 PREFIX2');
  console.log();
  console.log('説明:');
  console.log('  掟ドキュメントのルールIDを生成します。');
  console.log('  PREFIX1-PREFIX2-ULIDの形式でルールIDが生成されます。');
  console.log();
  console.log('引数:');
  console.log('  PREFIX1    1つ目の接頭辞（必須）');
  console.log('  PREFIX2    2つ目の接頭辞（必須）');
  console.log();
  console.log('例:');
  console.log('  node generate-rule-id.js META RULES');
  console.log('  => META-RULES-01H1NJ5NMGDXBFK97340PJMG8E');
}

// ヘルプオプションのチェック
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// 引数の数をチェック
if (args.length < 2) {
  console.error('エラー: 引数が不足しています。');
  showHelp();
  process.exit(1);
}

// 接頭辞を取得
const prefix1 = args[0].toUpperCase();
const prefix2 = args[1].toUpperCase();

// ULIDを生成
const id = ulid();

// ルールIDを生成して出力
const ruleId = `${prefix1}-${prefix2}-${id}`;
console.log(ruleId); 