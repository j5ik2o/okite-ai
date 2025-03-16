#!/usr/bin/env ts-node

/**
 * フロントマターの順序を修正するスクリプト
 * 期待される順序: description, ruleId, tags, aliases, globs
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { glob } from 'glob';
import { extractFrontmatter } from './common';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

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
function fixFrontmatterOrder(content: string): string | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatterText = match[1];
  const frontmatterLines = frontmatterText.split('\n').filter(line => line.trim() !== '');
  
  // フロントマターのキーと値を抽出
  const frontmatterMap = new Map<string, string>();
  const otherLines: string[] = [];
  
  frontmatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      otherLines.push(line);
      return;
    }
    
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex).trim();
    
    if (expectedOrder.includes(key)) {
      frontmatterMap.set(key, value);
    } else {
      otherLines.push(line);
    }
  });
  
  // 期待される順序でフロントマターを再構築
  let newFrontmatterText = '';
  
  // 期待される順序のフィールドを追加
  for (const key of expectedOrder) {
    if (frontmatterMap.has(key)) {
      newFrontmatterText += `${key}${frontmatterMap.get(key)}\n`;
    }
  }
  
  // その他のフィールドを追加
  if (otherLines.length > 0) {
    newFrontmatterText += otherLines.join('\n') + '\n';
  }
  
  // 修正したフロントマターでコンテンツを置き換え
  const newContent = content.replace(frontmatterRegex, `---\n${newFrontmatterText}---\n\n`);
  
  return newContent;
}

// メイン処理
async function main(): Promise<void> {
  try {
    console.log('フロントマターの順序を修正します...');
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
          console.log(`${colors.yellow}スキップ:${colors.reset} ${file} (フロントマターがありません)`);
          skippedCount++;
          continue;
        }
        
        // フロントマターの順序が正しいかチェック
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        
        if (!frontmatterMatch) {
          console.log(`${colors.yellow}スキップ:${colors.reset} ${file} (フロントマターの形式が不正です)`);
          skippedCount++;
          continue;
        }
        
        const frontmatterText = frontmatterMatch[1];
        const frontmatterLines = frontmatterText.split('\n').filter(line => line.trim() !== '');
        const actualOrder: string[] = [];
        
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
          // フロントマターの順序を修正
          const fixedContent = fixFrontmatterOrder(content);
          
          if (fixedContent && fixedContent !== content) {
            await writeFileAsync(file, fixedContent, 'utf8');
            console.log(`${colors.green}修正:${colors.reset} ${file}`);
            fixedCount++;
          } else {
            console.log(`${colors.yellow}スキップ:${colors.reset} ${file} (修正できませんでした)`);
            skippedCount++;
          }
        } else {
          console.log(`${colors.green}OK:${colors.reset} ${file} (既に順序が正しいです)`);
          skippedCount++;
        }
      } catch (err) {
        console.error(`${colors.red}エラー:${colors.reset} ${file} の処理中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    console.log('');
    console.log('処理完了');
    console.log(`修正したファイル: ${fixedCount}`);
    console.log(`スキップしたファイル: ${skippedCount}`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 