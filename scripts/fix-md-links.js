#!/usr/bin/env node

/**
 * Markdownファイル内の無効な相対リンクを修正するスクリプト
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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
 * ファイルが存在するかチェック（拡張子がない場合はmdをつけてチェック）
 * @param {string} filePath - チェックするファイルパス
 * @returns {string|null} - 存在する場合は実際のパス、存在しない場合はnull
 */
function fileExists(filePath) {
  // 既にmdで終わっているかチェック
  if (filePath.endsWith('.md')) {
    return fs.existsSync(filePath) ? filePath : null;
  }
  
  // .mdを追加して存在するかチェック
  const pathWithMd = filePath + '.md';
  return fs.existsSync(pathWithMd) ? pathWithMd : null;
}

/**
 * 相対リンクを絶対パスに解決
 * @param {string} linkPath - 相対リンクパス
 * @param {string} baseFilePath - 基準となるファイルパス
 * @returns {string|null} - 解決された絶対パス（存在する場合）またはnull
 */
function resolveRelativePath(linkPath, baseFilePath) {
  const baseDir = path.dirname(baseFilePath);
  
  // 相対パスを絶対パスに変換
  const resolvedPath = path.resolve(baseDir, linkPath);
  
  // ファイルが存在するかチェック
  return fileExists(resolvedPath);
}

/**
 * 現在のruleIdを含むリンクを修正
 * @param {string} linkPath - リンクパス
 * @returns {string} - 修正されたリンクパス
 */
function fixLinkWithRuleId(linkPath) {
  // -01で始まるruleId部分があるかチェック
  const ruleIdPattern = /-01[a-z0-9]{24}/;
  if (ruleIdPattern.test(linkPath)) {
    // ruleIdを小文字に変換
    return linkPath.replace(ruleIdPattern, (match) => match.toLowerCase());
  }
  return linkPath;
}

/**
 * Markdownファイルのリンクを修正
 * @param {string} filePath - Markdownファイルのパス
 * @returns {boolean} - 修正があったかどうか
 */
function fixMarkdownLinks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: markdownContent } = matter(content);
    
    // Markdownのリンクパターン: [表示テキスト](リンク)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let modified = false;
    let modifiedContent = markdownContent;
    
    // 各リンクをチェック
    while ((match = linkPattern.exec(markdownContent)) !== null) {
      const [fullMatch, linkText, linkPath] = match;
      
      // 外部リンクやアンカーリンクは無視
      if (linkPath.startsWith('http') || linkPath.startsWith('#')) {
        continue;
      }
      
      // リンクパスをruleIdの修正（小文字化）
      const fixedLinkPath = fixLinkWithRuleId(linkPath);
      
      // ファイルが存在するかチェック
      const resolvedPath = resolveRelativePath(fixedLinkPath, filePath);
      
      if (fixedLinkPath !== linkPath) {
        // リンクを修正
        const newLink = `[${linkText}](${fixedLinkPath})`;
        modifiedContent = modifiedContent.replace(fullMatch, newLink);
        console.log(`[修正] ${filePath}: ${linkPath} -> ${fixedLinkPath}`);
        modified = true;
      } else if (!resolvedPath) {
        // リンク先が存在しない場合、警告を表示
        console.warn(`[警告] ${filePath}: リンク ${linkPath} の参照先が見つかりません`);
      }
    }
    
    // 修正があった場合、ファイルに書き戻す
    if (modified) {
      const updatedContent = matter.stringify(modifiedContent, data);
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
  console.log('Markdownリンクの修正を開始します...');
  
  const mdFiles = findMarkdownFiles(DOCS_DIR);
  console.log(`${mdFiles.length} 個のMarkdownファイルが見つかりました`);
  
  let fixedCount = 0;
  
  for (const filePath of mdFiles) {
    if (fixMarkdownLinks(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`処理完了: ${fixedCount} 個のファイルのリンクを修正しました`);
}

// スクリプト実行
main(); 