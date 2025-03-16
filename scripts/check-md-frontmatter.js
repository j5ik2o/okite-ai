#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { glob } = require('glob');
const { isValid: isValidULID } = require('ulidx');

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
  showHelp();
  process.exit(0);
}

// ヘルプメッセージを表示する関数
function showHelp() {
  console.log('使用方法: node check-md-frontmatter.js [オプション]');
  console.log();
  console.log('オプション:');
  console.log('  -h, --help    このヘルプメッセージを表示');
  console.log('  -v, --verbose 詳細な出力を表示');
  console.log();
  console.log('説明:');
  console.log('  Markdownファイルのフロントマターをチェックします。');
  console.log('  必須フィールド: description, ruleId, tags, globs');
  console.log('  - descriptionの存在');
  console.log('  - ruleIdの形式(接頭辞-接頭辞-ULID)');
  console.log('  - tagsの存在(最低1つ以上)');
  console.log('  - globsの存在と内容の妥当性検証（ドキュメント自身を参照するパターンを禁止）');
}

// ruleIdの形式をチェックする関数
function isValidRuleId(ruleId) {
  // 接頭辞付きのULIDの場合（例: META-01JPBN8MMS2GDBH8HBK78E6F24）
  // 接頭辞を必須とする
  const regex = /^[A-Z0-9]+-([0-9A-Z]{26})$/;
  const match = ruleId.match(regex);
  
  if (!match) {
    return false;
  }
  
  // ULIDの部分が有効かチェック (ulidxのisValid関数を使用)
  const ulidPart = match[1];
  return isValidULID(ulidPart);
}

// 不正なglobsパターンをチェックする関数
function isInvalidGlobsPattern(pattern) {
  // ドキュメント自身または関連するMarkdownファイルを参照するパターンを検出
  if (pattern.includes('.md') || pattern.includes('docs/')) {
    // ソースコードパターンとして一般的な例外を許可
    if (pattern === '**/*.md.tmpl' || pattern === '**/*.mdx') {
      return false; // 有効なパターン
    }
    return true; // 無効なパターン
  }
  
  return false; // 有効なパターン
}

// フロントマターを抽出する関数
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatterText = match[1];
  const frontmatter = {};
  
  // YAMLの簡易パーサー
  frontmatterText.split('\n').forEach(line => {
    if (line.trim() === '') return;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // 配列形式（[item1, item2]）を解析
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(item => 
        item.trim().replace(/^["']|["']$/g, '') // 引用符を削除
      ).filter(item => item !== '');
    }
    
    frontmatter[key] = value;
  });
  
  return frontmatter;
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
          errorMsgs.push(`ruleId ${frontmatter.ruleId} は有効な形式ではありません。接頭辞-接頭辞-ULID形式が必要です`);
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
    
    // .cursor/rules配下の全mdcファイルをチェック（存在する場合）
    const mdcPath = `${projectRoot}/.cursor/rules`;
    if (fs.existsSync(mdcPath)) {
      const mdcFiles = await glob(`${mdcPath}/**/*.mdc`);
      for (const file of mdcFiles) {
        await checkFrontmatter(file);
      }
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