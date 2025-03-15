#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ulid } = require('ulid');
const glob = require('glob');

// ULIDを生成する関数
function generateId(filePath) {
  // ULID形式: 26文字の英数字（Base32）
  return ulid();
}

// ファイルパスに基づいてglobs属性を生成
function generateGlobs(filePath) {
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
function generateTags(filePath) {
  const tags = [];
  
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
function updateFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent;
    
    // ファイル名から説明を抽出
    const fileName = path.basename(filePath, '.md');
    const description = fileName.split('-').join(' ') + 'に関するドキュメント';
    
    // フロントマターのテンプレート
    const frontmatterTemplate = `---
description: ${description}
ruleId: ${generateId(filePath)}
tags: ${generateTags(filePath)}
globs: ${generateGlobs(filePath)}
---

`;

    if (content.startsWith('---')) {
      // 既存のフロントマターを更新
      const endOfFrontmatter = content.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        const existingFrontmatter = content.substring(0, endOfFrontmatter + 3);
        const mainContent = content.substring(endOfFrontmatter + 3);
        
        // 既存のフロントマターをパース
        const frontmatterLines = existingFrontmatter.split('\n');
        let hasDescription = false;
        let hasRuleId = false;
        let hasTags = false;
        let hasGlobs = false;
        
        for (const line of frontmatterLines) {
          if (line.startsWith('description:')) hasDescription = true;
          if (line.startsWith('ruleId:')) hasRuleId = true;
          if (line.startsWith('tags:')) hasTags = true;
          if (line.startsWith('globs:')) hasGlobs = true;
        }
        
        // 不足しているフィールドを追加
        let updatedFrontmatter = existingFrontmatter;
        if (!hasDescription) {
          updatedFrontmatter = updatedFrontmatter.replace('---\n', `---\ndescription: ${description}\n`);
        }
        if (!hasRuleId) {
          updatedFrontmatter = updatedFrontmatter.replace('---\n', `---\nruleId: ${generateId(filePath)}\n`);
        }
        if (!hasTags) {
          updatedFrontmatter = updatedFrontmatter.replace('---\n', `---\ntags: ${generateTags(filePath)}\n`);
        }
        if (!hasGlobs) {
          updatedFrontmatter = updatedFrontmatter.replace('---\n', `---\nglobs: ${generateGlobs(filePath)}\n`);
        }
        
        newContent = updatedFrontmatter + mainContent;
      } else {
        // フロントマターの形式が正しくない場合は新しく作成
        newContent = frontmatterTemplate + content.substring(content.indexOf('---') + 3);
      }
    } else {
      // フロントマターがない場合は新しく追加
      newContent = frontmatterTemplate + content;
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`フロントマターを更新しました: ${filePath}`);
    
  } catch (error) {
    console.error(`エラー (${filePath}): ${error.message}`);
  }
}

// Markdownファイルを検索して処理
const markdownFiles = glob.sync('docs/**/*.md');
markdownFiles.forEach(updateFrontmatter); 