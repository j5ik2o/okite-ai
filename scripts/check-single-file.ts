#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { isValidRuleId, extractFrontmatter } from './common';

const readFileAsync = promisify(fs.readFile);

// これは単一のファイルに対する検証です
// 第一引数にファイルパスを指定してください
const filePath = process.argv[2];

if (!filePath) {
  console.error('エラー: ファイルパスを指定してください');
  process.exit(1);
}

// エラーと警告のカウント
let errors = 0;
let warnings = 0;

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

/**
 * 単一のMarkdownファイルをチェックする
 * @param {string} filePath - チェックするファイルのパス
 */
async function checkSingleFile(filePath: string): Promise<void> {
  try {
    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}エラー:${colors.reset} ファイル ${filePath} が見つかりません`);
      errors++;
      return;
    }

    // ファイル名から拡張子を除いた部分を取得
    const basename = path.basename(filePath, '.md');
    
    // ファイルの内容を読み込み
    const content = await readFileAsync(filePath, 'utf8');
    
    console.log(`ファイル名: ${basename}`);
    
    // フロントマターをチェック
    const frontmatter = extractFrontmatter(content);
    
    // フロントマターが存在するかチェック
    if (!frontmatter) {
      console.log(`${colors.red}エラー:${colors.reset} フロントマターが見つかりません`);
      errors++;
      return;
    }
    
    // description フィールドのチェック
    if (!frontmatter.description) {
      console.log(`${colors.red}エラー:${colors.reset} description フィールドがありません`);
      errors++;
    } else {
      console.log(`${colors.green}✓${colors.reset} description フィールドが存在します: ${frontmatter.description}`);
    }
    
    // ruleId フィールドのチェック
    if (!frontmatter.ruleId) {
      console.log(`${colors.red}エラー:${colors.reset} ruleId フィールドがありません`);
      errors++;
    } else {
      if (!isValidRuleId(frontmatter.ruleId)) {
        console.log(`${colors.red}エラー:${colors.reset} ruleId '${frontmatter.ruleId}' は有効な形式ではありません`);
        errors++;
      } else {
        console.log(`${colors.green}✓${colors.reset} ruleId フィールドは有効な形式です: ${frontmatter.ruleId}`);
      }
      
      // ファイル名とruleIdの一致チェック
      if (basename !== frontmatter.ruleId) {
        console.log(`${colors.red}エラー:${colors.reset} ファイル名(${basename})とruleId(${frontmatter.ruleId})が一致しません`);
        errors++;
      } else {
        console.log(`${colors.green}✓${colors.reset} ファイル名とruleIdが一致しています`);
      }
    }
    
    // tags フィールドのチェック
    if (!frontmatter.tags) {
      console.log(`${colors.red}エラー:${colors.reset} tags フィールドがありません`);
      errors++;
    } else if (Array.isArray(frontmatter.tags) && frontmatter.tags.length === 0) {
      console.log(`${colors.yellow}警告:${colors.reset} tags が空です。最低1つのタグが必要です`);
      warnings++;
    } else {
      console.log(`${colors.green}✓${colors.reset} tags フィールドが存在します: [${Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : frontmatter.tags}]`);
    }
    
    // globs フィールドのチェック
    if (!frontmatter.globs) {
      console.log(`${colors.red}エラー:${colors.reset} globs フィールドがありません`);
      errors++;
    } else if (Array.isArray(frontmatter.globs) && frontmatter.globs.length === 0) {
      console.log(`${colors.yellow}警告:${colors.reset} globs が空です。少なくとも1つのパターンが必要です`);
      warnings++;
    } else {
      console.log(`${colors.green}✓${colors.reset} globs フィールドが存在します: [${Array.isArray(frontmatter.globs) ? frontmatter.globs.join(', ') : frontmatter.globs}]`);
    }
    
    // ファイルの内容チェック
    // 見出しが存在するかチェック
    if (!content.match(/^#\s+/m)) {
      console.log(`${colors.red}エラー:${colors.reset} ドキュメントに見出し(# で始まる行)がありません`);
      errors++;
    } else {
      console.log(`${colors.green}✓${colors.reset} ドキュメントに見出しが存在します`);
    }
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ファイル読み込み中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
    errors++;
  }
}

// メイン処理
async function main(): Promise<void> {
  try {
    console.log(`ファイルのチェックを開始します: ${filePath}`);
    console.log('');
    
    await checkSingleFile(filePath);
    
    console.log('');
    console.log('チェック完了');
    console.log(`エラー: ${colors.red}${errors}${colors.reset}`);
    console.log(`警告: ${colors.yellow}${warnings}${colors.reset}`);
    
    // エラーがある場合は非ゼロの終了コードを返す
    if (errors > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// スクリプト実行
main();