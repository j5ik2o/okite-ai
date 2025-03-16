#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { glob } = require('glob');
const { isValid: isValidULID } = require('ulidx');
const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);

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
  console.log('使用方法: node check-md-structure.js [オプション]');
  console.log();
  console.log('オプション:');
  console.log('  -h, --help    このヘルプメッセージを表示');
  console.log('  -v, --verbose 詳細な出力を表示');
  console.log();
  console.log('説明:');
  console.log('  掟ドキュメントの構造定義に基づきディレクトリ構造をチェックします。');
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

function logDebug(message) {
  if (verbose) {
    console.log(`Debug: ${message}`);
  }
}

// ruleIdの形式をチェックする関数
function isValidRuleId(ruleId) {
  // 接頭辞付きのULIDの場合（例: META-RULES-01JPBN8MMS2GDBH8HBK78E6F24）
  // 接頭辞を必須とする
  const regex = /^[A-Z0-9]+-[A-Z0-9]+-([0-9A-Z]{26})$/;
  const match = ruleId.match(regex);
  
  if (!match) {
    return false;
  }
  
  // ULIDの部分が有効かチェック
  const ulidPart = match[1];
  return isValidULID(ulidPart);
}

// 禁止されたファイル・ディレクトリパターンをチェックする関数
async function checkForbiddenPatterns(docsDir) {
  logInfo('禁止パターンのチェック中...');
  
  // index.md, mods.md, README.mdファイルのチェック
  for (const forbiddenFile of ['index.md', 'mods.md', 'README.md']) {
    const forbiddenFiles = await glob(`${docsDir}/**/${forbiddenFile}`, { ignore: ['**/.cursor/**', '**/.git/**'] });
    
    for (const file of forbiddenFiles) {
      logError(`Found forbidden ${forbiddenFile} file: ${file}`);
    }
  }
  
  // ${モジュール名}/${モジュール名}.mdパターンのチェック
  const allMdFiles = await glob(`${docsDir}/**/*.md`, { ignore: ['**/.cursor/**', '**/.git/**'] });
  
  for (const file of allMdFiles) {
    const dirName = path.basename(path.dirname(file));
    const fileName = path.basename(file, '.md');
    
    if (dirName === fileName) {
      logError(`Found forbidden pattern directory/same-name.md: ${file}`);
    }
  }
}

// ファイル命名規則をチェックする関数
async function checkFileNaming(docsDir) {
  logInfo('ファイル命名規則のチェック中...');
  
  // ${ruleId}.md パターンのチェック
  // ULIDフォーマットは01ARZ3NDEKTSV4RRFFQ69G5FAVなので長さ26の英数字
  const allMdFiles = await glob(`${docsDir}/**/*.md`, { ignore: ['**/.cursor/**', '**/.git/**'] });
  
  for (const file of allMdFiles) {
    const baseName = path.basename(file, '.md');
    // ルールIDかどうかをチェック（フォーマットはメタルールで定義）
    if (!isValidRuleId(baseName)) {
      logWarning(`File might not follow the naming convention \${ruleId}.md: ${file}`);
    }
  }
}

// ディレクトリ構造のチェック処理
async function checkDirectoryStructure(docsDir) {
  logInfo('ディレクトリ構造のチェック中...');
  
  // docsディレクトリが存在するか確認
  try {
    const stats = await statAsync(docsDir);
    if (!stats.isDirectory()) {
      logError(`Docs directory '${docsDir}' is not a directory`);
      return;
    }
  } catch (err) {
    logError(`Docs directory '${docsDir}' does not exist`);
    return;
  }
  
  logDebug(`Checking for module directories in ${docsDir}`);
  
  // モジュールディレクトリの存在と親モジュールの確認
  // モジュールディレクトリがある場合、同名の親モジュールファイルが存在すべき
  const moduleDirectories = [];
  
  // モジュールディレクトリの検索
  const dirs = await glob(`${docsDir}/*`, { ignore: ['**/.cursor/**', '**/.git/**'] });
  const moduleDirs = dirs.filter(dir => fs.statSync(dir).isDirectory());
  
  if (moduleDirs.length === 0) {
    logDebug(`No module directories found in ${docsDir}`);
  } else {
    logDebug(`Found directories: ${moduleDirs.join(', ')}`);
    
    // 各ディレクトリを処理
    for (const dir of moduleDirs) {
      const dirName = path.basename(dir);
      logDebug(`Processing directory: ${dirName}`);
      moduleDirectories.push(dirName);
      
      // 親モジュールファイル（同名のmdファイル）が存在するか確認
      const parentModule = path.join(docsDir, `${dirName}.md`);
      try {
        await statAsync(parentModule);
        logDebug(`Found parent module file: ${parentModule}`);
      } catch (err) {
        logWarning(`Module directory ${dirName} exists but parent module file ${parentModule} not found`);
      }
    }
  }
  
  // モジュールディレクトリのネスト確認（フラクタル構造のチェック）
  logDebug(`Checking nested module structure for ${moduleDirectories.length} directories`);
  for (const dir of moduleDirectories) {
    logInfo(`Checking module directory: ${dir}`);
    
    // サブディレクトリの検索
    const subDirs = await glob(`${docsDir}/${dir}/*`, { ignore: ['**/.cursor/**', '**/.git/**'] });
    const subModuleDirs = subDirs.filter(subDir => fs.statSync(subDir).isDirectory());
    
    if (subModuleDirs.length === 0) {
      logDebug(`No subdirectories found in ${dir}`);
    } else {
      logDebug(`Found subdirectories in ${dir}: ${subModuleDirs.join(', ')}`);
      
      // 各サブディレクトリを処理
      for (const subDir of subModuleDirs) {
        const subDirName = path.basename(subDir);
        logDebug(`Processing subdirectory: ${subDirName} in ${dir}`);
        
        // サブモジュールのディレクトリがある場合、その親モジュールファイルが存在すべき
        const submoduleFile = path.join(docsDir, dir, `${subDirName}.md`);
        try {
          await statAsync(submoduleFile);
          logDebug(`Found submodule file: ${submoduleFile}`);
        } catch (err) {
          logWarning(`Submodule directory ${subDirName} exists in ${dir} but parent submodule file ${submoduleFile} not found`);
        }
      }
    }
  }
  
  logInfo('ディレクトリ構造チェック完了');
}

// メイン処理
async function main() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const docsDir = path.join(projectRoot, 'docs');
    
    logInfo(`ドキュメント構造チェック開始: ${docsDir}`);
    
    // 禁止されたパターンのチェック
    await checkForbiddenPatterns(docsDir);
    logDebug('禁止パターンチェック完了');
    
    // ファイル命名規則のチェック
    await checkFileNaming(docsDir);
    logDebug('ファイル命名規則チェック完了');
    
    // ディレクトリ構造のチェック
    await checkDirectoryStructure(docsDir);
    logDebug('ディレクトリ構造チェック完了');
    
    // 全Markdownファイルのチェック
    logInfo('全Markdownファイルの確認中...');
    const allMdFiles = await glob(`${docsDir}/**/*.md`, { ignore: ['**/.cursor/**', '**/.git/**'] });
    for (const file of allMdFiles) {
      logInfo(`Checking file: ${file}`);
    }
    logDebug('全Markdownファイルチェック完了');
    
    // 結果の表示
    console.log('');
    if (errors === 0 && warnings === 0) {
      console.log(`${colors.green}All checks passed successfully!${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`Found ${colors.red}${errors} errors${colors.reset} and ${colors.yellow}${warnings} warnings${colors.reset}`);
      if (errors > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    }
  } catch (err) {
    console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 