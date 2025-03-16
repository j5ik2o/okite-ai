/**
 * 掟ドキュメントの検証に関する共通関数を提供するモジュール
 */

const { isValid: isValidULID } = require('ulidx');

/**
 * ruleIdの形式をチェックする関数
 * @param {string} ruleId - 検証するruleId
 * @returns {boolean} - ruleIdが有効な形式ならtrue、そうでなければfalse
 */
function isValidRuleId(ruleId) {
  // 接頭辞-ulid形式（例: meta-01jpbn8mms2gdbh8hbk78e6f24）
  // 接頭辞は必須、大文字小文字は区別しない
  const regex = /^[A-Za-z0-9]+-([0-9A-Za-z]{26})$/;
  const match = ruleId.match(regex);
  
  if (!match) {
    return false;
  }
  
  // ULIDの部分が有効かチェック
  const ulidPart = match[1];
  return isValidULID(ulidPart.toUpperCase());
}

/**
 * 不正なglobsパターンをチェックする関数
 * @param {string} pattern - 検証するglobsパターン
 * @returns {boolean} - パターンが無効ならtrue、有効ならfalse
 */
function isInvalidGlobsPattern(pattern) {
  // ドキュメント自身または関連するMarkdownファイルを参照するパターンを検出
  if (pattern.includes('.md') || pattern.includes('docs/')) {
    // ソースコードパターンとして一般的な例外を許可
    if (pattern === '**/*.md.tmpl' || pattern === '**/*.mdx') {
      return false; // 有効なパターン
    }
    return true; // 無効なパターン
  }
  
  return false; // 有効なパターン
}

/**
 * フロントマターを抽出する関数
 * @param {string} content - Markdownファイルの内容
 * @returns {object|null} - 抽出されたフロントマターオブジェクト、または抽出できない場合はnull
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatterText = match[1];
  const frontmatter = {};
  
  // YAMLの簡易パーサー
  frontmatterText.split('\n').forEach(line => {
    if (line.trim() === '') return;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // 配列形式（[item1, item2]）を解析
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(item => 
        item.trim().replace(/^["']|["']$/g, '') // 引用符を削除
      ).filter(item => item !== '');
    }
    
    frontmatter[key] = value;
  });
  
  return frontmatter;
}

// エクスポート
module.exports = {
  isValidRuleId,
  isInvalidGlobsPattern,
  extractFrontmatter
}; 