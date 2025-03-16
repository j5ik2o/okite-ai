#!/usr/bin/env node

/**
 * ruleIdの形式を修正するスクリプト
 * 大文字を小文字に変換する
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { isValidRuleId } = require('./common');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * ディレクトリ内のMarkdownファイルを再帰的に探索
 * @param {string} dir - 探索するディレクトリ
 * @returns {string[]} - Markdownファイルのパスリスト
 */
function findMarkdownFiles(dir) {
  const results = [];
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
function fixRuleId(filePath) {
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
        console.log(`[修正] ${filePath}: ruleId ${currentRuleId} -> ${fixedRuleId}`);
      }
      
      // 修正後のフロントマターが有効かチェック
      if (!isValidRuleId(data.ruleId)) {
        console.warn(`[警告] ${filePath}: 修正後のruleId ${data.ruleId} が有効な形式ではありません`);
      }
    } else {
      console.warn(`[警告] ${filePath}: ruleIdがありません`);
    }
    
    // 修正があった場合、ファイルに書き戻す
    if (modified) {
      const updatedContent = matter.stringify(mdContent, data);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[エラー] ${filePath} の処理中にエラーが発生しました:`, error);
    return false;
  }
}

/**
 * メイン処理
 */
function main() {
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