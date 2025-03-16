#!/usr/bin/env ts-node

/**
 * ruleIdの形式を修正するスクリプト
 * 大文字を小文字に変換する
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { isValidRuleId } from './common';

const DOCS_DIR = path.join(__dirname, '..', 'docs');

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

/**
 * ディレクトリ内のMarkdownファイルを再帰的に探索
 * @param {string} dir - 探索するディレクトリ
 * @returns {string[]} - Markdownファイルのパスリスト
 */
function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    // .cursorディレクトリは除外
    if (file === '.cursor') continue;
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  }
  
  return results;
}

/**
 * Markdownファイルのフロントマターを修正
 * @param {string} filePath - Markdownファイルのパス
 * @returns {boolean} - 修正があったかどうか
 */
function fixRuleId(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: mdContent } = matter(content);
    
    let modified = false;
    
    if (data.ruleId) {
      // 現在のruleIdを取得
      const currentRuleId = data.ruleId;
      
      // 小文字に変換
      const fixedRuleId = currentRuleId.toLowerCase();
      
      // ruleIdが修正されたかどうかを確認
      if (currentRuleId !== fixedRuleId) {
        data.ruleId = fixedRuleId;
        modified = true;
        console.log(`${colors.green}[修正]${colors.reset} ${filePath}: ruleId ${currentRuleId} -> ${fixedRuleId}`);
      }
      
      // 修正後のフロントマターが有効かチェック
      if (!isValidRuleId(data.ruleId)) {
        console.warn(`${colors.yellow}[警告]${colors.reset} ${filePath}: 修正後のruleId ${data.ruleId} が有効な形式ではありません`);
      }
    } else {
      console.warn(`${colors.yellow}[警告]${colors.reset} ${filePath}: ruleIdがありません`);
    }
    
    // 修正があった場合、ファイルに書き戻す
    if (modified) {
      const updatedContent = matter.stringify(mdContent, data);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`${colors.red}[エラー]${colors.reset} ${filePath} の処理中にエラーが発生しました:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * メイン処理
 */
function main(): void {
  console.log('ruleIdの修正を開始します...');
  
  const mdFiles = findMarkdownFiles(DOCS_DIR);
  console.log(`${mdFiles.length} 個のMarkdownファイルが見つかりました`);
  
  let fixedCount = 0;
  
  for (const filePath of mdFiles) {
    if (fixRuleId(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`処理完了: ${fixedCount} 個のファイルのruleIdを修正しました`);
}

// スクリプト実行
main(); 