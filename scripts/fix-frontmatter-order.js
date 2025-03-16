#!/usr/bin/env node

/**
 * フロントマターの順序を修正するスクリプト
 * 期待される順序: description, ruleId, tags, aliases, globs
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

// 期待されるフロントマターの順序
const expectedOrder = ['description', 'ruleId', 'tags', 'aliases', 'globs'];

/**
 * フロントマターの順序を修正する関数
 * @param {string} content - ファイルの内容
 * @returns {string|null} - 修正後の内容、または修正できない場合はnull
 */
function fixFrontmatterOrder(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatterText = match[1];
  const frontmatterLines = frontmatterText.split('\n').filter(line => line.trim() !== '');
  const frontmatterMap = {};
  const otherLines = [];
  
  // フロントマターの各行を解析
  frontmatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      otherLines.push(line);
      return;
    }
    
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex).trim();
    
    if (expectedOrder.includes(key)) {
      frontmatterMap[key] = value;
    } else {
      otherLines.push(line);
    }
  });
  
  // 期待される順序に並べ替え
  let newFrontmatterText = '';
  
  expectedOrder.forEach(key => {
    if (frontmatterMap[key]) {
      newFrontmatterText += `${key}${frontmatterMap[key]}\n`;
    }
  });
  
  // その他の行を追加
  if (otherLines.length > 0) {
    newFrontmatterText += `${otherLines.join('\n')}\n`;
  }
  
  // 新しいフロントマターで置き換え
  return content.replace(frontmatterRegex, `---\n${newFrontmatterText}---\n\n`);
}

// メイン処理
async function main() {
  try {
    console.log('フロントマターの順序を修正します...');
    console.log('期待される順序: ' + expectedOrder.join(', '));
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const file of mdFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (!frontmatter) {
          console.log(`${colors.yellow}警告:${colors.reset} ${file} にフロントマターがありません。スキップします。`);
          skippedCount++;
          continue;
        }
        
        // フロントマターの順序をチェック
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
          // 順序が正しくない場合、修正
          const fixedContent = fixFrontmatterOrder(content);
          
          if (fixedContent) {
            await writeFileAsync(file, fixedContent, 'utf8');
            console.log(`${colors.green}修正:${colors.reset} ${file} のフロントマター順序を修正しました。`);
            console.log(`  修正前: ${actualOrder.join(', ')}`);
            console.log(`  修正後: ${expectedOrder.filter(key => frontmatter[key]).join(', ')}`);
            fixedCount++;
          } else {
            console.log(`${colors.red}エラー:${colors.reset} ${file} のフロントマター修正に失敗しました。`);
            skippedCount++;
          }
        } else {
          // 既に正しい順序の場合
          console.log(`${colors.green}一致:${colors.reset} ${file} のフロントマターは既に正しい順序です。`);
        }
      } catch (err) {
        console.error(`${colors.red}エラー:${colors.reset} ${file} の処理中にエラーが発生しました: ${err.message}`);
        skippedCount++;
      }
    }
    
    console.log('');
    console.log(`処理完了: ${fixedCount} ファイルのフロントマター順序を修正しました。${skippedCount} ファイルをスキップしました。`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 