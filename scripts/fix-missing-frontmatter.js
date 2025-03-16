#!/usr/bin/env node

/**
 * 不足しているフロントマターを追加するスクリプト
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { generateRuleId } = require('./common');

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
 * Markdownファイルの最初の見出し（# ）を取得
 * @param {string} content - Markdownの内容
 * @returns {string|null} - 見出しのテキスト（なければnull）
 */
function extractFirstHeading(content) {
  const match = content.match(/^#\s+(.*?)\s*$/m);
  return match ? match[1] : null;
}

/**
 * ファイルパスからプレフィックスを取得
 * @param {string} filePath - ファイルパス
 * @returns {string} - プレフィックス
 */
function getPrefixFromPath(filePath) {
  // ディレクトリ構造からプレフィックスを推測
  const relativePath = path.relative(DOCS_DIR, filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts.length >= 2) {
    // サブディレクトリ内の場合、親ディレクトリ名を使用
    return parts[0].toLowerCase();
  } else {
    // トップレベルの場合、ファイル名から取得
    const fileName = path.basename(filePath, '.md');
    const parts = fileName.split('-');
    if (parts.length >= 2) {
      return parts[0].toLowerCase();
    }
  }
  
  // デフォルトのプレフィックス
  return 'doc';
}

/**
 * 不足しているフロントマターを追加
 * @param {string} filePath - Markdownファイルのパス
 * @returns {boolean} - 修正があったかどうか
 */
function addMissingFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: mdContent, isEmpty } = matter(content);
    
    // フロントマターがあるかチェック
    if (!isEmpty) {
      // フロントマターの必須項目をチェック
      const missingFields = [];
      
      if (!data.description) missingFields.push('description');
      if (!data.ruleId) missingFields.push('ruleId');
      if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) missingFields.push('tags');
      if (!data.globs || !Array.isArray(data.globs) || data.globs.length === 0) missingFields.push('globs');
      
      if (missingFields.length === 0) {
        return false; // 必須項目が揃っている
      }
      
      console.log(`[修正] ${filePath}: フロントマター不足 (${missingFields.join(', ')})`);
    } else {
      console.log(`[修正] ${filePath}: フロントマターなし`);
    }
    
    // 新しいフロントマターを作成
    const newData = { ...data };
    
    // 見出しから説明を取得（なければファイル名を使用）
    if (!newData.description) {
      const heading = extractFirstHeading(mdContent);
      if (heading) {
        newData.description = heading;
      } else {
        newData.description = path.basename(filePath, '.md');
      }
    }
    
    // ruleIdがなければ生成
    if (!newData.ruleId) {
      const fileName = path.basename(filePath, '.md');
      // ファイル名にruleIdが含まれているか確認
      const ruleIdMatch = fileName.match(/-01[a-z0-9]{24}/);
      
      if (ruleIdMatch) {
        // ファイル名からruleIdを抽出
        const prefix = getPrefixFromPath(filePath);
        const ulid = ruleIdMatch[0].substring(1); // -を除いたULID部分
        newData.ruleId = `${prefix}-${ulid}`;
      } else {
        // 完全に新しいruleIdを生成
        newData.ruleId = generateRuleId(getPrefixFromPath(filePath));
      }
    }
    
    // タグがなければディレクトリ構造から推測
    if (!newData.tags || !Array.isArray(newData.tags) || newData.tags.length === 0) {
      const relativePath = path.relative(DOCS_DIR, filePath);
      const parts = relativePath.split(path.sep);
      
      newData.tags = [];
      // 最初の2レベルのディレクトリをタグとして使用
      for (let i = 0; i < Math.min(parts.length - 1, 2); i++) {
        newData.tags.push(parts[i]);
      }
      
      // タグが空の場合、ファイル名の先頭部分を追加
      if (newData.tags.length === 0) {
        const fileName = path.basename(filePath, '.md');
        const prefix = fileName.split('-')[0];
        if (prefix) {
          newData.tags.push(prefix);
        } else {
          newData.tags.push('document');
        }
      }
    }
    
    // globsがなければディレクトリ構造から推測
    if (!newData.globs || !Array.isArray(newData.globs) || newData.globs.length === 0) {
      const relativePath = path.relative(DOCS_DIR, filePath);
      const parts = relativePath.split(path.sep);
      
      if (parts.length >= 2) {
        // サブディレクトリ内の場合
        newData.globs = [`**/${parts.slice(0, parts.length - 1).join('/')}/**`];
      } else {
        // トップレベルの場合
        const fileName = path.basename(filePath, '.md');
        const prefix = fileName.split('-')[0];
        if (prefix) {
          newData.globs = [`**/${prefix}/**`];
        } else {
          newData.globs = ['**/*.md'];
        }
      }
    }
    
    // 修正したフロントマターを適用
    const updatedContent = matter.stringify(mdContent, newData);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`[エラー] ${filePath} の処理中にエラーが発生しました:`, error);
    return false;
  }
}

/**
 * メイン処理
 */
function main() {
  console.log('不足しているフロントマターの追加を開始します...');
  
  const mdFiles = findMarkdownFiles(DOCS_DIR);
  console.log(`${mdFiles.length} 個のMarkdownファイルが見つかりました`);
  
  let fixedCount = 0;
  
  for (const filePath of mdFiles) {
    if (addMissingFrontmatter(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`処理完了: ${fixedCount} 個のファイルのフロントマターを修正しました`);
}

// スクリプト実行
main(); 