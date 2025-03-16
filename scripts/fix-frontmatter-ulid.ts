#!/usr/bin/env ts-node

import * as fs from 'fs';
import { ulid } from 'ulidx';
import { glob } from 'glob';

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// ファイルのフロントマターを修正する関数
function fixFrontmatter(filePath: string): void {
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
            updatedFrontmatter += `ruleId: ${ulid().toLowerCase()}\n`;
            modified = true;
          } else {
            updatedFrontmatter += line + '\n';
          }
        }
        
        // 変更があった場合のみファイルを更新
        if (modified) {
          fs.writeFileSync(filePath, updatedFrontmatter + mainContent, 'utf8');
          console.log(`${colors.green}修正:${colors.reset} フロントマターのULIDを修正しました: ${filePath}`);
        } else {
          console.log(`${colors.yellow}スキップ:${colors.reset} 変更なし: ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}エラー (${filePath}):${colors.reset} ${error instanceof Error ? error.message : String(error)}`);
  }
}

// メイン処理
async function main(): Promise<void> {
  try {
    console.log('フロントマターのULIDを修正しています...');
    console.log('');
    
    // Markdownファイルを検索して処理
    const markdownFiles = await glob('docs/**/*.md');
    let fixedCount = 0;
    
    for (const file of markdownFiles) {
      fixFrontmatter(file);
      fixedCount++;
    }
    
    console.log('');
    console.log('処理完了');
    console.log(`処理したファイル数: ${fixedCount}`);
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 