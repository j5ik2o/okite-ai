#!/usr/bin/env node

/**
 * ファイル名をフロントマターのruleIdに合わせて変更するスクリプト
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const renameAsync = promisify(fs.rename);
const { glob } = require('glob');
const { extractFrontmatter } = require('./check-md-common');

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// メイン処理
async function main() {
  try {
    console.log('ファイル名をruleIdに合わせて修正します...');
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const file of mdFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (!frontmatter || !frontmatter.ruleId) {
          console.log(`${colors.yellow}警告:${colors.reset} ${file} にruleIdがありません。スキップします。`);
          skippedCount++;
          continue;
        }
        
        const baseName = path.basename(file, '.md');
        
        // ファイル名とruleIdが一致しているかチェック
        if (baseName.toLowerCase() !== frontmatter.ruleId.toLowerCase()) {
          const dirName = path.dirname(file);
          const newFileName = `${dirName}/${frontmatter.ruleId}.md`;
          
          // 既に同名ファイルが存在する場合はエラー
          if (fs.existsSync(newFileName)) {
            console.log(`${colors.red}エラー:${colors.reset} ${newFileName} が既に存在します。${file} のリネームをスキップします。`);
            skippedCount++;
            continue;
          }
          
          // ファイルをリネーム
          await renameAsync(file, newFileName);
          console.log(`${colors.green}修正:${colors.reset} ${file} を ${newFileName} にリネームしました。`);
          fixedCount++;
        } else {
          // 既に一致している場合
          // console.log(`${colors.green}一致:${colors.reset} ${file} はすでにruleIdと一致しています。`);
        }
      } catch (err) {
        console.error(`${colors.red}エラー:${colors.reset} ${file} の処理中にエラーが発生しました: ${err.message}`);
        skippedCount++;
      }
    }
    
    console.log('');
    console.log(`処理完了: ${fixedCount} ファイルを修正しました。${skippedCount} ファイルをスキップしました。`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 