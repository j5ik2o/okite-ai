#!/usr/bin/env node

/**
 * ruleIdを修正するスクリプト
 * ULIDのみのruleIdに適切な接頭辞を追加します
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
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
    console.log('ruleIdの修正を開始します...');
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    let fixedCount = 0;
    
    for (const file of mdFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (!frontmatter || !frontmatter.ruleId) {
          console.log(`${colors.yellow}警告:${colors.reset} ${file} にruleIdがありません`);
          continue;
        }
        
        // ruleIdにプレフィックスがあるかチェック
        if (!frontmatter.ruleId.includes('-')) {
          // プレフィックスがない場合、ファイル名から推測
          const fileName = path.basename(file, '.md');
          const dirName = path.basename(path.dirname(file));
          let prefix;
          
          // ファイル名自体がruleIdの場合
          if (fileName === frontmatter.ruleId) {
            // ディレクトリ名からプレフィックスを取得
            prefix = dirName.split('/').pop().toLowerCase();
          } else {
            // ファイル名からプレフィックスを取得
            prefix = fileName.split('-')[0].toLowerCase();
            if (!prefix || prefix === frontmatter.ruleId) {
              // ファイル名から推測できない場合は親ディレクトリを使用
              prefix = dirName.toLowerCase();
            }
          }
          
          // プレフィックスが数字のみの場合は「doc」を追加
          if (/^\d+$/.test(prefix)) {
            prefix = 'doc';
          }
          
          // 新しいruleIdを作成
          const newRuleId = `${prefix}-${frontmatter.ruleId.toLowerCase()}`;
          
          // ruleIdを修正
          const newContent = content.replace(
            /ruleId:.*$/m,
            `ruleId: ${newRuleId}`
          );
          
          // 修正内容を保存
          await writeFileAsync(file, newContent, 'utf8');
          
          console.log(`${colors.green}修正:${colors.reset} ${file} のruleId を ${frontmatter.ruleId} から ${newRuleId} に変更しました`);
          fixedCount++;
        }
      } catch (err) {
        console.error(`${colors.red}エラー:${colors.reset} ${file} の処理中にエラーが発生しました: ${err.message}`);
      }
    }
    
    console.log('');
    console.log(`修正完了: ${fixedCount} ファイルを修正しました`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 