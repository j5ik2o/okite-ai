#!/usr/bin/env ts-node

/**
 * ファイル名をフロントマターのruleIdに合わせて変更するスクリプト
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { glob } from 'glob';
import { extractFrontmatter } from './common';

const readFileAsync = promisify(fs.readFile);
const renameAsync = promisify(fs.rename);

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// メイン処理
async function main(): Promise<void> {
  try {
    console.log('ファイル名をruleIdに合わせて修正します...');
    console.log('');
    
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const file of mdFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (!frontmatter || !frontmatter.ruleId) {
          console.log(`${colors.yellow}スキップ:${colors.reset} ${file} (フロントマターまたはruleIdがありません)`);
          skippedCount++;
          continue;
        }
        
        const dirname = path.dirname(file);
        const basename = path.basename(file, '.md');
        const ruleId = frontmatter.ruleId;
        
        if (basename !== ruleId) {
          // ファイル名とruleIdが異なる場合、ファイル名を変更
          const newFileName = `${ruleId}.md`;
          const newFilePath = path.join(dirname, newFileName);
          
          // 新しいファイルが既に存在しないかチェック
          if (fs.existsSync(newFilePath)) {
            console.log(`${colors.red}エラー:${colors.reset} ${file} の名前を変更できません。宛先のファイルが既に存在します: ${newFilePath}`);
            continue;
          }
          
          await renameAsync(file, newFilePath);
          console.log(`${colors.green}修正:${colors.reset} ${file} -> ${newFilePath}`);
          fixedCount++;
        } else {
          console.log(`${colors.green}OK:${colors.reset} ${file} (既にruleIdと一致しています)`);
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