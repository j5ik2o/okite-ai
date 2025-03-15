#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { monotonicFactory } = require('ulid');

// 単調増加するULIDを生成するファクトリ
const ulid = monotonicFactory();

// ファイルのフロントマターを修正する関数
function fixFrontmatter(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // フロントマターを持つファイルのみ処理
    if (content.startsWith('---')) {
      // フロントマターを抽出
      const endOfFrontmatter = content.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        const frontmatter = content.substring(0, endOfFrontmatter + 3);
        const mainContent = content.substring(endOfFrontmatter + 3);
        
        // ruleIdの行を見つける
        const lines = frontmatter.split('\n');
        let updatedFrontmatter = '';
        let modified = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // ruleIdの行を新しいULIDで置き換える
          if (line.startsWith('ruleId:')) {
            updatedFrontmatter += `ruleId: ${ulid()}\n`;
            modified = true;
          } else {
            updatedFrontmatter += line + '\n';
          }
        }
        
        // 変更があった場合のみファイルを更新
        if (modified) {
          fs.writeFileSync(filePath, updatedFrontmatter + mainContent, 'utf8');
          console.log(`フロントマターのULIDを修正しました: ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error(`エラー (${filePath}): ${error.message}`);
  }
}

// Markdownファイルを検索して処理
const markdownFiles = glob.sync('docs/**/*.md');
markdownFiles.forEach(fixFrontmatter);

// メタルールファイルは処理しない
// const metaRuleFiles = glob.sync('.cursor/rules/*.mdc');
// metaRuleFiles.forEach(fixFrontmatter);

console.log('ULIDの修正が完了しました。'); 