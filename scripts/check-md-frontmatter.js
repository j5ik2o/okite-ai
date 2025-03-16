#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { glob } = require('glob');
const { isValidRuleId, isInvalidGlobsPattern, extractFrontmatter } = require('./common');

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
let verbose = false;
const args = process.argv.slice(2);
if (args.includes('-v') || args.includes('--verbose')) {
  verbose = true;
}
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
使用方法: node check-md-frontmatter.js [options]

オプション:
  -h, --help    このヘルプメッセージを表示
  -v, --verbose 詳細な出力を表示

説明:
  このスクリプトはMarkdownファイルのフロントマターをチェックします。
  以下のルールに従って検証を行います:
  
  1. 各Markdownファイルは以下の必須フィールドを含むフロントマターが必要:
     - description: ドキュメントの説明
     - ruleId: 接頭辞-ulid形式、接頭辞は必須、すべて小文字であること
     - tags: 少なくとも1つのタグ
     - globs: 少なくとも1つのglobパターン
  
  2. フィールドの順序は以下である必要があります:
     - description
     - ruleId
     - tags
     - globs
     - (その他のフィールド)
`);
  process.exit(0);
}

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
      // フロントマターの順序をチェック
      const expectedOrder = ['description', 'ruleId', 'tags', 'aliases', 'globs'];
      const frontmatterText = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)[1];
      const frontmatterLines = frontmatterText.split('\n').filter(line => line.trim() !== '');
      const actualOrder = [];
      
      // 実際のフロントマターから順序を抽出
      frontmatterLines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim();
          if (expectedOrder.includes(key) && !actualOrder.includes(key)) {
            actualOrder.push(key);
          }
        }
      });
      
      // 順序が正しいかチェック
      let orderCorrect = true;
      let lastIndex = -1;
      
      for (const key of actualOrder) {
        const currentIndex = expectedOrder.indexOf(key);
        if (currentIndex <= lastIndex) {
          orderCorrect = false;
          break;
        }
        lastIndex = currentIndex;
      }
      
      if (!orderCorrect) {
        errorMsgs.push(`フロントマターの順序が正しくありません。期待される順序: ${expectedOrder.join(', ')}, 実際: ${actualOrder.join(', ')}`);
        hasIssues = true;
      }
      
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
          errorMsgs.push(`ruleId ${frontmatter.ruleId} は有効な形式ではありません。接頭辞-ulid形式で接頭辞および全体が小文字である必要があります`);
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
        } else {
          // 各globsパターンをチェック
          for (const pattern of frontmatter.globs) {
            if (isInvalidGlobsPattern(pattern)) {
              errorMsgs.push(`globs パターン '${pattern}' はドキュメントファイル自身またはMarkdownファイルを参照しています。ソースコードファイルパターンを指定してください`);
              hasIssues = true;
            }
          }
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
    } else if (verbose) {
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
    
    const projectRoot = path.resolve(__dirname, '..');
    
    // docs配下の全Markdownファイルをチェック
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    for (const file of mdFiles) {
      await checkFrontmatter(file);
    }
    
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

// スクリプト実行
main(); 