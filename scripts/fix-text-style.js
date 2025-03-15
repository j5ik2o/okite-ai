#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');

// 文章のスタイルを修正する関数
function fixTextStyle(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 行ごとに処理
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // リスト項目の行と通常の段落を処理
      if ((/^\s*[*-]\s+.+$/.test(line) || /^[^#<>*-].*[^:]$/.test(line)) && 
          line.trim().length > 3) {
        
        // 文末が「。」で終わっていない場合、追加する（ただし、コードブロック、URLや特殊な記述は除外）
        if (!line.trim().endsWith('。') && 
            !line.trim().endsWith('）') && 
            !line.trim().endsWith('.)') && 
            !line.trim().endsWith('.') && 
            !line.includes('```') && 
            !line.includes('](') &&
            !line.includes('</') &&
            !line.includes('/>') &&
            !line.includes(':') &&
            !/\s*[*-]\s+`.+`\s*$/.test(line) &&
            !/^>\s+/.test(line) &&  // 引用行は除外
            !/^\s*$/.test(line)) {  // 空行は除外
          
          // 半角スペースで終わる場合は除去
          lines[i] = line.replace(/\s+$/, '') + '。';
          modified = true;
        }
        
        // 冗長な表現を修正
        const redundantPatterns = [
          { pattern: /([^\s]+)を行う/, replacement: '$1する' },
          { pattern: /することができる/, replacement: 'できる' },
          { pattern: /([^\s]+)を実行/, replacement: '$1する' },
          { pattern: /設定を行う/, replacement: '設定する' },
          { pattern: /検証を行う/, replacement: '検証する' },
          { pattern: /管理を行う/, replacement: '管理する' },
          { pattern: /実装を行う/, replacement: '実装する' },
          { pattern: /解析を行う/, replacement: '解析する' },
          { pattern: /確認を行う/, replacement: '確認する' }
        ];
        
        redundantPatterns.forEach(({ pattern, replacement }) => {
          if (pattern.test(line)) {
            lines[i] = lines[i].replace(pattern, replacement);
            modified = true;
          }
        });
      }
      
      // 見出し行の後の段落行を処理
      if (i > 0 && /^#+\s+.+$/.test(lines[i-1]) && 
          line.trim().length > 0 && 
          !line.startsWith('#') && 
          !line.startsWith('```') && 
          !line.includes('![') &&
          !/^\s*$/.test(line)) {
        
        if (!line.trim().endsWith('。') && 
            !line.trim().endsWith('）') && 
            !line.trim().endsWith('.)') && 
            !line.trim().endsWith('.') && 
            !line.includes('```') && 
            !line.includes('](') &&
            !line.includes(':')) {
          lines[i] = line.replace(/\s+$/, '') + '。';
          modified = true;
        }
      }
    }
    
    // 変更があった場合のみファイルを更新
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`スタイルを修正しました: ${filePath}`);
    }
  } catch (error) {
    console.error(`エラー (${filePath}): ${error.message}`);
  }
}

// Markdownファイルを検索して処理
const markdownFiles = glob.sync('docs/**/*.md');
markdownFiles.forEach(fixTextStyle);

console.log('テキストスタイルの修正が完了しました。'); 