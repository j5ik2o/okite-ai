#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { promisify } from 'util';
import { isValidRuleId, extractFrontmatter } from './common';

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
function showHelp(): void {
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
function logError(message: string): void {
  console.log(`${colors.red}Error:${colors.reset} ${message}`);
  errors++;
}

function logWarning(message: string): void {
  console.log(`${colors.yellow}Warning:${colors.reset} ${message}`);
  warnings++;
}

function logInfo(message: string): void {
  if (verbose) {
    console.log(`${colors.green}Info:${colors.reset} ${message}`);
  }
}

// コメントアウトして使用しないが、将来使うかもしれないため残しておく
// function logDebug(message: string): void {
//   if (verbose) {
//     console.log(`Debug: ${message}`);
//   }
// }

// 禁止パターンをチェックする関数
async function checkForbiddenPatterns(docsDir: string): Promise<void> {
  logInfo('禁止パターンのチェックを開始します');
  
  // 禁止パターンのリスト
  const forbiddenPatterns = [
    '**/index.md',
    '**/mods.md',
    '**/README.md'
  ];
  
  // 各禁止パターンについてチェック
  for (const pattern of forbiddenPatterns) {
    const matches = await glob(`${docsDir}/${pattern}`);
    
    if (matches.length > 0) {
      for (const file of matches) {
        logError(`禁止されているファイル名: ${file}`);
      }
    } else {
      logInfo(`禁止パターン: ${pattern} - OK`);
    }
  }
  
  // ディレクトリと同名のファイルパターンをチェック
  const mdFiles = await glob(`${docsDir}/**/*.md`);
  for (const file of mdFiles) {
    const dirname = path.dirname(file);
    const basename = path.basename(file, '.md');
    
    if (basename === path.basename(dirname)) {
      logError(`ディレクトリと同名のファイル: ${file}`);
    }
  }
}

// ファイル命名規則をチェックする関数
async function checkFileNaming(docsDir: string): Promise<void> {
  logInfo('ファイル命名規則のチェックを開始します');
  
  const mdFiles = await glob(`${docsDir}/**/*.md`);
  
  for (const file of mdFiles) {
    const basename = path.basename(file, '.md');
    
    // ファイル名にruleIdが含まれているかチェック
    const ruleIdRegex = /-01[a-z0-9]{24}$/;
    if (!ruleIdRegex.test(basename)) {
      logError(`ファイル名にruleIDが含まれていません: ${file}`);
      continue;
    }
    
    // ruleIdの形式が正しいかチェック
    const potentialRuleId = basename.match(ruleIdRegex) 
      ? basename 
      : null;
    
    if (potentialRuleId && !isValidRuleId(potentialRuleId)) {
      logError(`不正なruleID形式: ${file}`);
      continue;
    }
    
    // ファイル内のフロントマターのruleIdとファイル名のruleIdが一致するかチェック
    try {
      const content = await readFileAsync(file, 'utf8');
      const frontmatter = extractFrontmatter(content);
      
      if (frontmatter && frontmatter.ruleId) {
        if (basename !== frontmatter.ruleId) {
          logError(`ファイル名(${basename})とフロントマターのruleId(${frontmatter.ruleId})が一致しません: ${file}`);
        } else {
          logInfo(`ファイル名とruleIdの一致を確認: ${file}`);
        }
      } else {
        logError(`フロントマターにruleIdがありません: ${file}`);
      }
    } catch (err) {
      logError(`ファイル読み込みエラー: ${file} - ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

// ディレクトリ構造をチェックする関数
async function checkDirectoryStructure(docsDir: string): Promise<void> {
  logInfo('ディレクトリ構造のチェックを開始します');
  
  const mdFiles = await glob(`${docsDir}/**/*.md`);
  const mdDirs = new Set<string>();
  
  // まず、すべてのMarkdownファイルを含むディレクトリを収集
  for (const file of mdFiles) {
    const dirname = path.dirname(file);
    mdDirs.add(dirname);
  }
  
  // 各ディレクトリに対応する親モジュールファイルが存在するかチェック
  for (const dir of mdDirs) {
    // ディレクトリがdocsディレクトリ自体である場合はスキップ
    if (dir === docsDir) {
      continue;
    }
    
    const parentDirName = path.basename(dir);
    const expectedParentFile = path.join(path.dirname(dir), `${parentDirName}.md`);
    
    // 期待される親ファイルが存在するかチェック
    try {
      await statAsync(expectedParentFile);
      logInfo(`親モジュールファイルが存在します: ${expectedParentFile}`);
    } catch (err) {
      logError(`親モジュールファイルが見つかりません: ${expectedParentFile} (${dir} に対応)`);
    }
  }
  
  // 各親モジュールファイルについて、対応するディレクトリが存在するかチェック
  const moduleFiles = await glob(`${docsDir}/**/*.md`);
  for (const file of moduleFiles) {
    const basename = path.basename(file, '.md');
    const dirname = path.dirname(file);
    
    // このファイルのベース名に対応するディレクトリが存在するかチェック
    const correspondingDir = path.join(dirname, basename);
    
    try {
      const stats = await statAsync(correspondingDir);
      if (stats.isDirectory()) {
        // このファイルの内容が、対応するディレクトリ内のモジュールへの参照や説明を含むかチェック
        try {
          const content = await readFileAsync(file, 'utf8');
          
          // ディレクトリ内のファイルリストを取得
          const childFiles = await glob(`${correspondingDir}/*.md`);
          const childBaseNames = childFiles.map(f => path.basename(f, '.md'));
          
          // 子モジュールへの参照が含まれているかチェック
          let referenceFound = false;
          for (const childBaseName of childBaseNames) {
            const regex = new RegExp(`\\[.*\\]\\(${childBaseName}\\.md\\)`, 'i');
            if (regex.test(content)) {
              referenceFound = true;
              break;
            }
          }
          
          if (!referenceFound && childFiles.length > 0) {
            logWarning(`親モジュールファイル ${file} が子モジュールへの参照を含んでいない可能性があります`);
          } else {
            logInfo(`親モジュールファイル ${file} から子モジュールへの参照を確認`);
          }
        } catch (err) {
          logError(`親モジュールファイル読み込みエラー: ${file} - ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (err) {
      // 対応するディレクトリが存在しなくても、それ自体はエラーではない
      logInfo(`${file} に対応するディレクトリは存在しません (これは正常です)`);
    }
  }
}

// メイン処理
async function main(): Promise<void> {
  try {
    console.log('掟ドキュメントの構造をチェックしています...');
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    const docsDir = path.join(projectRoot, 'docs');
    
    // 各チェックを実行
    await checkForbiddenPatterns(docsDir);
    await checkFileNaming(docsDir);
    await checkDirectoryStructure(docsDir);
    
    console.log('');
    console.log('チェック完了');
    console.log(`エラー: ${colors.red}${errors}${colors.reset}`);
    console.log(`警告: ${colors.yellow}${warnings}${colors.reset}`);
    
    // エラーがある場合は非ゼロの終了コードを返す
    if (errors > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 