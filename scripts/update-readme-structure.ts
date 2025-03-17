import * as fs from 'fs';
import * as path from 'path';
import { IllegalStateError } from './common';

interface DocFile {
  path: string;
  title: string;
  children: DocFile[];
}

/**
 * Markdownファイルからタイトルを抽出する
 * @param filePath ファイルパス
 * @returns タイトル文字列
 */
function extractTitleFromMarkdown(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Front matterを除外
    const contentWithoutFrontMatter = content.replace(/^---[\s\S]*?---/, '');
    
    // # で始まる最初の行を探す
    const titleMatch = contentWithoutFrontMatter.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // タイトルが見つからない場合は回復不能・致命的状況
    // 「状態としてありえない状況」に該当するため、IllegalStateErrorを投げる
    throw new IllegalStateError(`タイトルが見つかりません。ファイル: ${filePath}`);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    process.exit(1);
  }
}

/**
 * ディレクトリ構造を再帰的に解析する
 * @param basePath ベースパス
 * @param relativePath 相対パス
 * @returns DocFileオブジェクト
 */
function scanDirectory(basePath: string, relativePath: string = ''): DocFile[] {
  const fullPath = path.join(basePath, relativePath);
  const result: DocFile[] = [];
  
  // ディレクトリ内のファイルとディレクトリを取得
  const items = fs.readdirSync(fullPath);
  
  // まずはMDファイルを処理
  const mdFiles = items.filter(item => item.endsWith('.md'));
  
  for (const mdFile of mdFiles) {
    const mdPath = path.join(relativePath, mdFile);
    const fullMdPath = path.join(basePath, mdPath);
    const title = extractTitleFromMarkdown(fullMdPath);
    
    // 同名のディレクトリがあるか確認
    const dirName = mdFile.replace(/\.md$/, '').replace(/-[0-9a-z]{26}$/, '');
    const matchingDir = items.find(item => {
      const itemWithoutId = item.replace(/-[0-9a-z]{26}$/, '');
      return fs.statSync(path.join(fullPath, item)).isDirectory() && 
             (item === dirName || itemWithoutId === dirName);
    });
    
    if (matchingDir) {
      // 同名のディレクトリがある場合は、そのディレクトリの子として処理
      const children = scanDirectory(basePath, path.join(relativePath, matchingDir));
      result.push({
        path: mdPath,
        title,
        children
      });
    } else {
      // 同名のディレクトリがない場合は、単独のファイルとして処理
      result.push({
        path: mdPath,
        title,
        children: []
      });
    }
  }
  
  return result;
}

/**
 * DocFile構造をMarkdownリスト形式に変換する
 * @param docFiles DocFileの配列
 * @param indent インデントレベル
 * @returns Markdownリスト文字列
 */
function generateMarkdownList(docFiles: DocFile[], indent: number = 0): string {
  let result = '';
  const indentStr = '  '.repeat(indent);
  
  for (const docFile of docFiles) {
    result += `${indentStr}- [${docFile.title}](${docFile.path})\n`;
    
    if (docFile.children.length > 0) {
      result += generateMarkdownList(docFile.children, indent + 1);
    }
  }
  
  return result;
}

/**
 * README.mdを生成する
 */
function generateReadme() {
  try {
    // テンプレートを読み込む
    const templatePath = path.resolve(__dirname, '../README.md.tpl');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // docs.mdとdocsディレクトリを解析
    const docsPath = path.resolve(__dirname, '..');
    const rootDocFiles: DocFile[] = [];
    
    // docs.mdを処理
    const docsFilePath = path.join(docsPath, 'docs.md');
    if (fs.existsSync(docsFilePath)) {
      const docsTitle = extractTitleFromMarkdown(docsFilePath);
      const docsChildren = scanDirectory(docsPath, 'docs');
      
      rootDocFiles.push({
        path: 'docs.md',
        title: docsTitle,
        children: docsChildren
      });
    }
    
    // ディレクトリ構造をMarkdownリストに変換
    const dirStructure = generateMarkdownList(rootDocFiles);
    
    // テンプレートを置換
    const readme = template.replace('${DIR_STRUCTURE}', dirStructure);
    
    // README.mdを書き込む
    const readmePath = path.resolve(__dirname, '../README.md');
    fs.writeFileSync(readmePath, readme);
    
    console.log('README.md has been generated successfully!');
  } catch (error) {
    console.error('Error generating README.md:', error);
  }
}

// スクリプトを実行
generateReadme();

