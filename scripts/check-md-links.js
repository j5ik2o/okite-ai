#!/usr/bin/env node

/**
 * Markdownファイル内のリンク切れをチェックするスクリプト
 * 内部リンク（相対パス）と見出しへのリンク（アンカー）をチェックします
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { glob } = require('glob');
const { extractFrontmatter } = require('./check-md-common');

// 色の定義
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Markdownリンクを抽出する正規表現
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
// MarkdownのIDリンク（[text][id]）
const MARKDOWN_REF_LINK_REGEX = /\[([^\]]+)\]\[([^\]]+)\]/g;
// Markdown参照定義を抽出する正規表現
const MARKDOWN_REF_DEF_REGEX = /^\[([^\]]+)\]:\s*(.+)$/gm;
// ローカルリンクの接頭辞（mdc:など）
const LOCAL_LINK_PREFIX_REGEX = /^(mdc):/;
// 見出しを抽出する正規表現
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

/**
 * パスが存在するかチェックする
 * @param {string} filePath 
 * @returns {boolean}
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * リンクパスを正規化する
 * @param {string} linkPath 
 * @param {string} baseDir 
 * @returns {string}
 */
function normalizeLinkPath(linkPath, baseDir) {
  // mdc:などの接頭辞を削除
  linkPath = linkPath.replace(LOCAL_LINK_PREFIX_REGEX, '');
  
  // URLや絶対パスはそのまま返す
  if (linkPath.startsWith('http://') || linkPath.startsWith('https://') || linkPath.startsWith('/')) {
    return linkPath;
  }
  
  // 相対パスを解決
  return path.resolve(baseDir, linkPath);
}

/**
 * 見出しIDを正規化する
 * @param {string} headingText 
 * @returns {string}
 */
function normalizeHeadingId(headingText) {
  return headingText
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

/**
 * コンテンツから見出しを抽出する
 * @param {string} content 
 * @returns {string[]}
 */
function extractHeadings(content) {
  const headings = [];
  let match;
  
  while ((match = HEADING_REGEX.exec(content)) !== null) {
    const headingText = match[2];
    headings.push(normalizeHeadingId(headingText));
  }
  
  return headings;
}

/**
 * リンクがファイル内の見出しを参照しているかチェックする
 * @param {string} fragment 
 * @param {string} content 
 * @returns {boolean}
 */
function checkFragment(fragment, content) {
  if (!fragment) return true;
  
  const headings = extractHeadings(content);
  return headings.includes(fragment.slice(1)); // #を削除
}

/**
 * Markdownファイルのリンクをチェックする
 * @param {string} file 
 * @param {Map<string, string[]>} fileHeadingsMap 
 * @returns {Promise<{file: string, brokenLinks: Array<{link: string, text: string, error: string}>}>}
 */
async function checkMarkdownLinks(file, fileHeadingsMap) {
  const content = await readFileAsync(file, 'utf8');
  const brokenLinks = [];
  const baseDir = path.dirname(file);
  const projectRoot = path.resolve(__dirname, '..');
  
  // インラインリンクの抽出と検証
  let match;
  while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
    const linkText = match[1];
    let linkPath = match[2];
    
    // URLは検証対象外
    if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
      continue;
    }
    
    // フラグメント（#）があるかチェック
    const [pathPart, fragment] = linkPath.split('#');
    
    if (pathPart) {
      const normalizedPath = normalizeLinkPath(pathPart, baseDir);
      const relativeToRoot = path.relative(projectRoot, normalizedPath);
      
      // ファイルが存在するかチェック
      if (!fileExists(normalizedPath)) {
        brokenLinks.push({
          link: linkPath,
          text: linkText,
          error: `リンク先のファイルが存在しません: ${relativeToRoot}`
        });
        continue;
      }
      
      // フラグメントがある場合、対象ファイルの見出しをチェック
      if (fragment) {
        const targetContent = await readFileAsync(normalizedPath, 'utf8');
        if (!checkFragment(`#${fragment}`, targetContent)) {
          brokenLinks.push({
            link: linkPath,
            text: linkText,
            error: `リンク先のファイル内に見出し「#${fragment}」が存在しません: ${relativeToRoot}`
          });
        }
      }
    } else if (fragment) {
      // 同一ファイル内の見出しへのリンク
      if (!checkFragment(`#${fragment}`, content)) {
        brokenLinks.push({
          link: linkPath,
          text: linkText,
          error: `ファイル内に見出し「#${fragment}」が存在しません`
        });
      }
    }
  }
  
  // 参照リンクの抽出と検証
  // TODO: 参照リンクのチェックは必要に応じて実装
  
  return { file, brokenLinks };
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log(`${colors.blue}Markdownファイル内のリンクをチェックしています...${colors.reset}\n`);
    
    const projectRoot = path.resolve(__dirname, '..');
    const mdFiles = await glob(`${projectRoot}/docs/**/*.md`);
    
    console.log(`${colors.blue}${mdFiles.length}個のMarkdownファイルを検出しました${colors.reset}\n`);
    
    const results = [];
    let totalBrokenLinks = 0;
    
    // ファイルごとに見出しをキャッシュするマップ
    const fileHeadingsMap = new Map();
    
    for (const file of mdFiles) {
      const result = await checkMarkdownLinks(file, fileHeadingsMap);
      if (result.brokenLinks.length > 0) {
        results.push(result);
        totalBrokenLinks += result.brokenLinks.length;
      }
    }
    
    // 結果の出力
    if (results.length > 0) {
      console.log(`${colors.red}リンク切れが見つかりました:${colors.reset}\n`);
      
      for (const result of results) {
        const relativePath = path.relative(projectRoot, result.file);
        console.log(`${colors.yellow}ファイル:${colors.reset} ${relativePath}`);
        
        for (const brokenLink of result.brokenLinks) {
          console.log(`  - テキスト: 「${brokenLink.text}」`);
          console.log(`    リンク: ${brokenLink.link}`);
          console.log(`    ${colors.red}エラー:${colors.reset} ${brokenLink.error}`);
        }
        console.log('');
      }
      
      console.log(`${colors.red}合計 ${totalBrokenLinks} 個のリンク切れが見つかりました${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}リンク切れは見つかりませんでした！${colors.reset}`);
      process.exit(0);
    }
    
  } catch (err) {
    console.error(`${colors.red}エラー:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main(); 