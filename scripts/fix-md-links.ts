#!/usr/bin/env ts-node

/**
 * Markdownファイル内の無効な相対リンクを修正するスクリプト
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

// 色の定義（ロギング用）
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * ディレクトリ内のMarkdownファイルを再帰的に探索
 * @param {string} dir - 探索するディレクトリ
 * @returns {string[]} - Markdownファイルのパスリスト
 */
function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
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
function fileExists(filePath: string): string | null {
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
function resolveRelativePath(linkPath: string, baseFilePath: string): string | null {
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
function fixLinkWithRuleId(linkPath: string): string {
  // アンダースコアをハイフンに変換
  let fixedPath = linkPath.replace(/_/g, '-');
  
  // -01で始まるruleId部分があるかチェック
  const ruleIdPattern = /-01[a-z0-9]{24}/;
  if (ruleIdPattern.test(fixedPath)) {
    // ruleIdを小文字に変換
    return fixedPath.replace(ruleIdPattern, (match) => match.toLowerCase());
  }
  return fixedPath;
}

/**
 * 無効なリンクパスに対して、正しいパスを探す
 * @param {string} linkPath - 相対リンクパス
 * @param {string} baseFilePath - 基準となるファイルのパス
 * @returns {string|null} - 修正されたパス、または修正できなければnull
 */
function findCorrectPath(linkPath: string, baseFilePath: string): string | null {
  // リンク先のファイル名部分（拡張子なし）を取得
  const parsedPath = path.parse(linkPath);
  const fileName = parsedPath.name;
  
  // ruleIdパターンを含むかチェック
  const ruleIdPattern = /-01[a-z0-9]{24}$/;
  const hasRuleId = ruleIdPattern.test(fileName);
  
  // ruleIdを含まない場合は、対応するruleIdを持つファイルを探す
  if (!hasRuleId) {
    // プロジェクトルート基準で探索
    const projectRoot = path.resolve(__dirname, '..');
    const searchPattern = `${projectRoot}/docs/**/${fileName}-01*.md`;
    
    try {
      const matches = glob.sync(searchPattern);
      if (matches.length > 0) {
        // 相対パスに変換
        const relativePath = path.relative(path.dirname(baseFilePath), matches[0]);
        return relativePath.replace(/\\/g, '/'); // Windowsのパス区切り文字を修正
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`検索中にエラー: ${error.message}`);
      }
    }
  }
  
  // ディレクトリ階層の問題を修正
  // 例: development/coding/golang.md → development/coding/golang-01*.md
  // const baseDirRelativeToDocsDir = path.relative(
  //   DOCS_DIR,
  //   path.dirname(baseFilePath)
  // );
  
  // リンクを分解
  const linkDirectories = parsedPath.dir.split('/').filter(part => part !== '');
  const linkTarget = fileName;
  
  // 基準パスからさかのぼりながら、リンク先に合致するファイルを探す
  let currentDir = path.dirname(baseFilePath);
  
  // まず現在のディレクトリ内を探す
  const searchPatternInCurrentDir = `${currentDir}/${linkTarget}-01*.md`;
  try {
    const matchesInCurrentDir = glob.sync(searchPatternInCurrentDir);
    if (matchesInCurrentDir.length > 0) {
      // 相対パスに変換
      const relativePath = path.relative(path.dirname(baseFilePath), matchesInCurrentDir[0]);
      return relativePath.replace(/\\/g, '/');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`現在のディレクトリ検索中にエラー: ${error.message}`);
    }
  }
  
  // リンクディレクトリの階層に基づいて検索
  if (linkDirectories.length > 0) {
    let searchBase = currentDir;
    const searchPatternWithDirs = `${searchBase}/${linkDirectories.join('/')}/${linkTarget}-01*.md`;
    
    try {
      const matchesWithDirs = glob.sync(searchPatternWithDirs);
      if (matchesWithDirs.length > 0) {
        // 相対パスに変換
        const relativePath = path.relative(path.dirname(baseFilePath), matchesWithDirs[0]);
        return relativePath.replace(/\\/g, '/');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`ディレクトリ階層検索中にエラー: ${error.message}`);
      }
    }
  }
  
  // ドキュメントルート全体を検索する
  const globalSearchPattern = `${DOCS_DIR}/**/${linkTarget}-01*.md`;
  try {
    const globalMatches = glob.sync(globalSearchPattern);
    if (globalMatches.length > 0) {
      // 相対パスに変換
      const relativePath = path.relative(path.dirname(baseFilePath), globalMatches[0]);
      return relativePath.replace(/\\/g, '/');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`グローバル検索中にエラー: ${error.message}`);
    }
  }
  
  return null;
}

/**
 * ファイルから最初の見出しを抽出する関数
 * @param {string} filePath - Markdownファイルのパス
 * @returns {string|null} - 見出しテキスト、または見出しがなければnull
 */
function extractFirstHeading(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // 正規表現でMarkdownの一番最初の見出し(# で始まる行)を抽出
    const headingMatch = content.match(/^#\s+(.*?)$/m);
    if (headingMatch && headingMatch[1]) {
      return headingMatch[1].trim();
    }
    return null;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${colors.red}エラー:${colors.reset} ${filePath} から見出しを抽出中にエラーが発生しました: ${err.message}`);
    }
    return null;
  }
}

/**
 * Markdownファイルのリンクを修正
 * @param {string} filePath - Markdownファイルのパス
 * @returns {boolean} - 修正があったかどうか
 */
function fixMarkdownLinks(filePath: string): boolean {
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
        console.log(`${colors.green}[修正]${colors.reset} ${filePath}: ${linkPath} -> ${fixedLinkPath} (ruleId小文字化)`);
        modified = true;
      } else if (!resolvedPath) {
        // リンク先が存在しない場合、正しいパスを探して修正を試みる
        const correctedPath = findCorrectPath(linkPath, filePath);
        
        if (correctedPath) {
          // 修正したパスでリンクを更新
          const newLink = `[${linkText}](${correctedPath})`;
          modifiedContent = modifiedContent.replace(fullMatch, newLink);
          console.log(`${colors.green}[修正]${colors.reset} ${filePath}: ${linkPath} -> ${correctedPath} (パス補正)`);
          modified = true;
        } else {
          // 修正できなかった場合は警告
          console.warn(`${colors.yellow}[警告]${colors.reset} ${filePath}: リンク ${linkPath} の参照先が見つかりません`);
        }
      } else {
        // ファイルが存在する場合、リンクテキストが対象ファイルの見出しと一致するかチェック
        // resolvedPathはフルパスなので、そのまま使う
        const heading = extractFirstHeading(resolvedPath);
        
        if (heading && linkText !== heading) {
          // リンクテキストが見出しと一致しない場合、修正
          const newLink = `[${heading}](${fixedLinkPath})`;
          modifiedContent = modifiedContent.replace(fullMatch, newLink);
          console.log(`${colors.blue}[修正]${colors.reset} ${filePath}: リンクテキスト "${linkText}" -> "${heading}" (見出し一致)`);
          modified = true;
        }
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
    if (error instanceof Error) {
      console.error(`${colors.red}[エラー]${colors.reset} ${filePath} の処理中にエラーが発生しました:`, error);
    }
    return false;
  }
}

/**
 * メイン処理
 */
function main(): void {
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