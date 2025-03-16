#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { isValidRuleId, generateRuleIdFromPath } from './common';

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// ファイルパスに基づいてglobs属性を生成
function generateGlobs(filePath: string): string {
  // ファイルパスからカテゴリを推測
  if (filePath.includes('/golang/')) {
    return '["**/*.go"]';
  } else if (filePath.includes('/rust/')) {
    return '["**/*.rs"]';
  } else if (filePath.includes('/scala/')) {
    return '["**/*.scala"]';
  } else if (filePath.includes('/typescript/')) {
    return '["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]';
  } else {
    // デフォルトは複数の言語をカバー
    return '["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.go", "**/*.rs", "**/*.scala"]';
  }
}

// ファイルパスからタグを生成
function generateTags(filePath: string): string {
  const tags: string[] = [];
  
  // ディレクトリ構造からタグを抽出
  const parts = filePath.split('/');
  parts.forEach(part => {
    if (part && !part.includes('.') && part !== 'docs') {
      tags.push(part);
    }
  });
  
  // 少なくとも1つのタグを確保
  if (tags.length === 0) {
    tags.push('documentation');
  }
  
  return JSON.stringify(tags);
}

// ファイルにフロントマターを追加または更新
function updateFrontmatter(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent: string;
    
    // フロントマターを検出するための正規表現
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const hasFrontmatter = frontmatterRegex.test(content);
    
    if (hasFrontmatter) {
      // 既存のフロントマターを更新
      newContent = content.replace(frontmatterRegex, (_match, frontmatterContent) => {
        // 既存のプロパティを抽出
        const descriptionMatch = frontmatterContent.match(/description:\s*(.*?)(?:\n|$)/);
        const ruleIdMatch = frontmatterContent.match(/ruleId:\s*(.*?)(?:\n|$)/);
        const tagsMatch = frontmatterContent.match(/tags:\s*(.*?)(?:\n|$)/);
        const aliasesMatch = frontmatterContent.match(/aliases:\s*(.*?)(?:\n|$)/);
        const globsMatch = frontmatterContent.match(/globs:\s*(.*?)(?:\n|$)/);
        
        // 値を取得または生成
        const description = descriptionMatch ? descriptionMatch[1].trim() : '自動生成された説明';
        let ruleId = ruleIdMatch ? ruleIdMatch[1].trim() : '';
        
        // ruleIdの検証と生成
        if (!ruleId || !isValidRuleId(ruleId)) {
          ruleId = generateRuleIdFromPath(filePath, content);
        }
        
        const tags = tagsMatch ? tagsMatch[1].trim() : generateTags(filePath);
        const aliases = aliasesMatch ? aliasesMatch[1].trim() : '[]';
        const globs = globsMatch ? globsMatch[1].trim() : generateGlobs(filePath);
        
        // 新しいフロントマターを生成
        return `---
description: ${description}
ruleId: ${ruleId}
tags: ${tags}
aliases: ${aliases}
globs: ${globs}
---\n\n`;
      });
    } else {
      // フロントマターがない場合は追加
      const ruleId = generateRuleIdFromPath(filePath, content);
      const tags = generateTags(filePath);
      const globs = generateGlobs(filePath);
      
      const defaultFrontmatter = `---
description: 自動生成された説明
ruleId: ${ruleId}
tags: ${tags}
aliases: []
globs: ${globs}
---\n\n`;
      
      newContent = defaultFrontmatter + content;
    }
    
    // ファイルに書き込み
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`${colors.green}修正:${colors.reset} フロントマターを更新しました: ${filePath}`);
  } catch (error) {
    console.error(`${colors.red}エラー:${colors.reset} ${filePath} の処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// メイン処理
async function main(): Promise<void> {
  try {
    console.log('フロントマターを修正しています...');
    console.log('');
    
    // Markdownファイルを探索
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    let processedCount = 0;
    
    // 各ファイルを処理
    for (const file of mdFiles) {
      updateFrontmatter(file);
      processedCount++;
    }
    
    console.log('');
    console.log('処理完了');
    console.log(`処理したファイル数: ${processedCount}`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 