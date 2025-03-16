#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { isValidRuleId, extractFrontmatter } = require('./common');

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// エラー/警告カウンター
let errors = 0;
let warnings = 0;

// コマンドライン引数の解析
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('ファイルパスを指定してください');
  process.exit(1);
}
const filePath = args[0];

// フロントマターをチェックする関数
async function checkFrontmatter(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);
    let hasIssues = false;
    const errorMsgs = [];
    const warningMsgs = [];
    
    if (!frontmatter) {
      errorMsgs.push('フロントマターがありません');
      hasIssues = true;
    } else {
      // description フィールドのチェック
      if (!frontmatter.description) {
        errorMsgs.push('description フィールドがありません');
        hasIssues = true;
      }
      
      // ruleId フィールドのチェック
      if (!frontmatter.ruleId) {
        errorMsgs.push('ruleId フィールドがありません');
        hasIssues = true;
      } else {
        // ruleIdの形式をチェック - 接頭辞を必須とする
        if (!isValidRuleId(frontmatter.ruleId)) {
          errorMsgs.push('ruleIdの形式が不正です。接頭辞-ulid形式で、接頭辞および全体が小文字である必要があります');
          hasIssues = true;
        }
      }
      
      // tags フィールドのチェック
      if (!frontmatter.tags) {
        errorMsgs.push('tags フィールドがありません');
        hasIssues = true;
      } else if (Array.isArray(frontmatter.tags) && frontmatter.tags.length === 0) {
        warningMsgs.push('tags が空です。最低1つのタグが必要です');
        warnings++;
      }
      
      // globs フィールドのチェック
      if (!frontmatter.globs) {
        errorMsgs.push('globs フィールドがありません');
        hasIssues = true;
      } else if (Array.isArray(frontmatter.globs)) {
        if (frontmatter.globs.length === 0) {
          warningMsgs.push('globs が空です。少なくとも1つのパターンが必要です');
          warnings++;
        }
      }
    }
    
    // エラー/警告メッセージの表示
    if (hasIssues || warningMsgs.length > 0) {
      console.log(`ファイル: ${filePath}`);
      
      for (const msg of errorMsgs) {
        console.log(`  ${colors.red}エラー:${colors.reset} ${msg}`);
        errors++;
      }
      
      for (const msg of warningMsgs) {
        console.log(`  ${colors.yellow}警告:${colors.reset} ${msg}`);
      }
      
      console.log('');
    } else {
      console.log(`${colors.green}✓${colors.reset} ${filePath}: フロントマターは有効です`);
    }
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${filePath} の読み込み中にエラーが発生しました: ${err.message}`);
    errors++;
  }
}

// メイン処理
async function main() {
  try {
    console.log('Markdownファイルのフロントマターをチェックしています...');
    console.log('');
    
    await checkFrontmatter(filePath);
    
    console.log('');
    console.log('チェック完了');
    console.log(`エラー: ${colors.red}${errors}${colors.reset}`);
    console.log(`警告: ${colors.yellow}${warnings}${colors.reset}`);
    
    // エラーがある場合は非ゼロの終了コードを返す
    if (errors > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// ヘルプメッセージを表示
function showHelp() {
  console.log('使用方法: node check-single-file.js <ファイルパス> [オプション]');
  console.log();
  console.log('オプション:');
  console.log('  -h, --help    このヘルプメッセージを表示');
  console.log('  -v, --verbose 詳細な出力を表示');
  console.log();
  console.log('説明:');
  console.log('  指定されたMarkdownファイルのフロントマターをチェックします。');
  console.log('  必須フィールド: description, ruleId, tags, globs');
  console.log('  - descriptionの存在');
  console.log('  - ruleIdの形式(接頭辞-ulid)、接頭辞および全体が小文字であること');
  console.log('  - tagsの存在(最低1つ以上)');
  console.log('  - globsの存在と内容の妥当性検証（禁止パターンの有無）');
  console.log();
  console.log('例:');
  console.log('  node check-single-file.js docs/meta-rules.md');
  console.log('  node check-single-file.js docs/meta-rules.md -v');
}

// スクリプト実行
main(); 