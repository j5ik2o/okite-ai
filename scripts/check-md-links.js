#!/usr/bin/env node

/**
 * Markdownファイル内のリンクをチェックするスクリプト
 * - 内部リンク(mdcリンク、相対パスリンク)の有効性をチェック
 * - 壊れたリンクや存在しないファイルへの参照を検出
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { glob } = require('glob');

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
  console.log('使用方法: node check-md-links.js [オプション]');
  console.log();
  console.log('オプション:');
  console.log('  -h, --help    このヘルプメッセージを表示');
  console.log('  -v, --verbose 詳細な出力を表示');
  console.log();
  console.log('説明:');
  console.log('  Markdownファイル内のリンクをチェックします。');
  console.log('  - 内部リンク(mdcリンク、相対パスリンク)の有効性をチェック');
  console.log('  - 壊れたリンクや存在しないファイルへの参照を検出');
}

// ログ出力関数
function logError(message) {
  console.log(`${colors.red}Error:${colors.reset} ${message}`);
  errors++;
}

function logWarning(message) {
  console.log(`${colors.yellow}Warning:${colors.reset} ${message}`);
  warnings++;
}

function logInfo(message) {
  if (verbose) {
    console.log(`${colors.green}Info:${colors.reset} ${message}`);
  }
}

// Markdownファイル内のリンクを抽出する関数
function extractLinks(content) {
  const links = [];
  
  // 内部リンク [テキスト](リンク) 形式
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];
    links.push({
      type: 'markdown',
      text: linkText,
      url: linkUrl,
      position: match.index
    });
  }
  
  // mdc形式 [テキスト](mdc:リンク)
  const mdcLinkRegex = /\[([^\]]+)\]\(mdc:([^)]+)\)/g;
  while ((match = mdcLinkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];
    links.push({
      type: 'mdc',
      text: linkText,
      url: linkUrl,
      position: match.index
    });
  }
  
  return links;
}

// ファイルの存在をチェックする関数
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// リンクをチェックする関数
async function checkLinks(filePath, mdFiles) {
  try {
    logInfo(`ファイルのリンクをチェック中: ${filePath}`);
    
    const content = await readFileAsync(filePath, 'utf8');
    const links = extractLinks(content);
    const fileDir = path.dirname(filePath);
    const projectRoot = path.resolve(__dirname, '..');
    
    if (links.length === 0) {
      logInfo(`${filePath} にリンクは見つかりませんでした`);
      return;
    }
    
    logInfo(`${filePath} 内に ${links.length} 個のリンクが見つかりました`);
    
    for (const link of links) {
      const { type, text, url } = link;
      
      // 外部リンク(httpで始まる)はスキップ
      if (url.startsWith('http://') || url.startsWith('https://')) {
        logInfo(`外部リンクをスキップ: ${url}`);
        continue;
      }
      
      // mdc形式のリンク
      if (type === 'mdc') {
        // .mdcファイルが存在するかチェック
        const targetFile = path.join(projectRoot, 'docs', `${url}.mdc`);
        const mdTargetFile = path.join(projectRoot, 'docs', `${url}.md`);
        
        if (await fileExists(targetFile) || await fileExists(mdTargetFile)) {
          logInfo(`有効なmdcリンク: ${url}`);
        } else {
          logError(`${filePath} 内の無効なmdcリンク: ${url} (リンクテキスト: ${text})`);
        }
        continue;
      }
      
      // 相対パスリンク
      if (!url.startsWith('#')) {  // アンカーリンクはスキップ
        // 相対パスを解決
        const targetPath = path.resolve(fileDir, url);
        
        // ファイルが存在するかチェック
        if (await fileExists(targetPath)) {
          logInfo(`有効な相対パスリンク: ${url}`);
        } else {
          // mdへの参照で.mdが省略されている場合をチェック
          if (!url.endsWith('.md') && !url.endsWith('.mdc')) {
            const mdTargetPath = `${targetPath}.md`;
            const mdcTargetPath = `${targetPath}.mdc`;
            
            if (await fileExists(mdTargetPath) || await fileExists(mdcTargetPath)) {
              logInfo(`有効な相対パスリンク(拡張子省略): ${url}`);
            } else {
              logError(`${filePath} 内の無効な相対パスリンク: ${url} (リンクテキスト: ${text})`);
            }
          } else {
            logError(`${filePath} 内の無効な相対パスリンク: ${url} (リンクテキスト: ${text})`);
          }
        }
      }
    }
  } catch (err) {
    logError(`${filePath} の処理中にエラーが発生しました: ${err.message}`);
  }
}

// メイン処理
async function main() {
  try {
    console.log('Markdownファイル内のリンクをチェックしています...');
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    
    // docs配下の全Markdownファイルを取得
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    // 各ファイルのリンクをチェック
    for (const file of mdFiles) {
      await checkLinks(file, mdFiles);
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