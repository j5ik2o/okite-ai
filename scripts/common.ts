#!/usr/bin/env ts-node

/**
 * 掟ドキュメント関連の共通ユーティリティ関数を提供するモジュール
 */

import { ulid, isValid as isValidULID } from 'ulidx';
import * as path from 'path';

/**
 * 状態としてありえない状況を表すエラークラス
 * エラーハンドリングのルールに基づき、回復不能・致命的状況で使用する
 */
export class IllegalStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalStateError';
    
    // Errorオブジェクトのプロトタイプチェーンを正しく設定
    Object.setPrototypeOf(this, IllegalStateError.prototype);
  }
}

/**
 * ruleIdの形式をチェックする関数
 * @param {string} ruleId - 検証するruleId
 * @returns {boolean} - ruleIdが有効な形式ならtrue、そうでなければfalse
 */
export function isValidRuleId(ruleId: string): boolean {
  // 接頭辞-ulid形式（例: meta-01jpbn8mms2gdbh8hbk78e6f24）
  // 接頭辞は必須、小文字のみ許可
  // 接頭辞部分にはハイフンを含むことが可能
  const regex = /^[a-z0-9][a-z0-9-]*-([0-9a-z]{26})$/;
  const match = ruleId.match(regex);
  
  if (!match) {
    return false;
  }
  
  // ULIDの部分が有効かチェック
  const ulidPart = match[1];
  return isValidULID(ulidPart.toUpperCase());
}

/**
 * 指定されたプレフィックスでルールIDを生成する関数
 * @param {string} prefix - ルールIDの接頭辞
 * @returns {string} - 生成されたルールID (prefix-ULID形式)
 */
export function generateRuleId(prefix: string): string {
  // 接頭辞を小文字に変換
  const normalizedPrefix = prefix.toLowerCase();
  
  // ULIDを生成（小文字）
  const id = ulid().toLowerCase();
  
  // ルールIDを生成
  return `${normalizedPrefix}-${id}`;
}

/**
 * ファイルパスからプレフィックスを抽出してルールIDを生成する関数
 * @param {string} filePath - ファイルパス
 * @param {string} [content] - ファイルの内容（既存のruleIdをチェックするため、オプション）
 * @returns {string} - 生成されたルールID
 */
export function generateRuleIdFromPath(filePath: string, content?: string): string {
  // ファイル名を取得し、拡張子を除去
  const fileName = path.basename(filePath, '.md');
  
  // ファイル名が既に有効なruleId形式かチェック
  if (isValidRuleId(fileName)) {
    return fileName; // ファイル名をそのままruleIdとして使用
  }
  
  // ファイル名からプレフィックスを抽出（最初のハイフンまで、またはファイル名全体）
  let prefix = fileName;
  const hyphenIndex = fileName.indexOf('-');
  if (hyphenIndex > 0) {
    prefix = fileName.substring(0, hyphenIndex);
  }
  
  // 既存のruleIdをチェック（contentが提供されている場合）
  if (content) {
    const ruleIdMatch = content.match(/ruleId:\s*([^\n]+)/);
    if (ruleIdMatch && isValidRuleId(ruleIdMatch[1].trim())) {
      return ruleIdMatch[1].trim(); // 既存の有効なruleIdを使用
    }
  }
  
  // 新しいruleIdを生成
  return generateRuleId(prefix);
}

/**
 * 不正なglobsパターンをチェックする関数
 * @param {string} pattern - 検証するglobsパターン
 * @returns {boolean} - パターンが無効ならtrue、有効ならfalse
 */
export function isInvalidGlobsPattern(pattern: string): boolean {
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
 * フロントマター形式の定義
 */
export interface Frontmatter {
  description?: string;
  ruleId?: string;
  tags?: string[];
  aliases?: string[];
  globs?: string[];
  [key: string]: string | string[] | undefined;
}

/**
 * フロントマターを抽出する関数
 * @param {string} content - Markdownファイルの内容
 * @returns {object|null} - 抽出されたフロントマターオブジェクト、または抽出できない場合はnull
 */
export function extractFrontmatter(content: string): Frontmatter | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatterText = match[1];
  const frontmatter: Frontmatter = {};
  
  // YAMLの簡易パーサー
  frontmatterText.split('\n').forEach(line => {
    if (line.trim() === '') return;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    let value: string | string[] = line.slice(colonIndex + 1).trim();
    
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