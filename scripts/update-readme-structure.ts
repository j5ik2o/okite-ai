import * as fs from 'fs';
import * as path from 'path';



/**
 * ディレクトリの説明を取得する
 * @param dirPath ディレクトリのパス
 * @returns ディレクトリの説明
 */
function getDirectoryDescription(dirPath: string): string {
  // ディレクトリ内のREADME.mdやindex.mdから説明を抽出する
  const possibleFiles = ['README.md', 'index.md'];
  
  for (const file of possibleFiles) {
    const filePath = path.join(dirPath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // フロントマターから説明を取得
      const descriptionMatch = content.match(/description:\s*(.+)/);
      if (descriptionMatch && descriptionMatch[1]) {
        return descriptionMatch[1].trim();
      }
      
      // 最初の見出しの次の行から説明を取得
      const firstHeadingMatch = content.match(/^#\s+.+\n\n(.+)/m);
      if (firstHeadingMatch && firstHeadingMatch[1]) {
        return firstHeadingMatch[1].trim();
      }
    }
  }
  
  // ディレクトリ名から説明を生成
  const dirName = path.basename(dirPath);
  return `${dirName}関連ドキュメント`;
}

/**
 * ファイルの説明を取得する
 * @param filePath ファイルのパス
 * @returns ファイルの説明
 */
function getFileDescription(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // フロントマターから説明を取得
    const descriptionMatch = content.match(/description:\s*(.+)/);
    if (descriptionMatch && descriptionMatch[1]) {
      return descriptionMatch[1].trim();
    }
    
    // 最初の見出しの次の行から説明を取得
    const firstHeadingMatch = content.match(/^#\s+(.+)/m);
    if (firstHeadingMatch && firstHeadingMatch[1]) {
      return firstHeadingMatch[1].trim();
    }
  } catch (error) {
    console.error(`ファイル ${filePath} の読み込み中にエラーが発生しました:`, error);
  }
  
  // ファイル名から説明を生成
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName.replace(/-/g, ' ');
}

/**
 * READMEを更新する
 */
/**
 * docsディレクトリとdocs.mdファイルのみを取得する関数
 * @param rootDir プロジェクトルートディレクトリ
 * @returns 文字列化された構造
 */
/**
 * docsディレクトリの構造を再帰的に取得し、ファイルをリンク形式で出力する関数
 * @param dir 対象ディレクトリのパス
 * @param rootDir プロジェクトルートディレクトリ
 * @param depth 現在の深さ
 * @param maxDepth 最大深さ
 * @returns ディレクトリ構造の文字列表現
 */
function getDocsDirectoryStructure(
  dir: string,
  rootDir: string,
  depth: number = 0,
  maxDepth: number = 3
): string {
  if (depth > maxDepth) return '';
  
  let result = '';
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    const indent = '  '.repeat(depth);
    if (stats.isDirectory()) {
      // ディレクトリの説明を取得
      const description = getDirectoryDescription(itemPath);
      result += `${indent}- \`${item}/\` - ${description}\n`;
      result += getDocsDirectoryStructure(itemPath, rootDir, depth + 1, maxDepth);
    } else {
      // ファイルの説明を取得
      const description = getFileDescription(itemPath);
      
      // 相対パスを生成
      const relativePath = path.relative(rootDir, itemPath);
      
      // リンク形式で出力
      result += `${indent}- [${description}](${relativePath})\n`;
    }
  }
  
  return result;
}

function getDocsStructure(rootDir: string): string {
  let result = '';
  
  // docs.mdファイルの処理
  const docsFilePath = path.join(rootDir, 'docs.md');
  if (fs.existsSync(docsFilePath)) {
    const description = getFileDescription(docsFilePath);
    result += `- [${description}](docs.md)\n`;
  }
  
  // docsディレクトリの処理
  const docsDir = path.join(rootDir, 'docs');
  if (fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()) {
    result += `- \`docs/\` - docs関連ドキュメント\n`;
    result += getDocsDirectoryStructure(docsDir, rootDir, 1, 3);
  }
  
  return result;
}

function updateReadme(): void {
  // TypeScriptコンパイル後のパスは dist/scripts になるので、
  // 正しくプロジェクトルートを取得する
  const projectRoot = path.resolve(__dirname, '../..');
  console.log(`プロジェクトルート: ${projectRoot}`);
  
  const readmePath = path.join(projectRoot, 'README.md');
  console.log(`README.mdのパス: ${readmePath}`);
  
  try {
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // 構造セクションを見つけて置換
    const structureRegex = /(## 構造\n\n)([\s\S]*?)(\n\n## )/;
    // docsディレクトリとdocs.mdファイルのみを取得
    const docsStructure = getDocsStructure(projectRoot);
    
    if (structureRegex.test(readme)) {
      const newReadme = readme.replace(structureRegex, `$1${docsStructure}\n\n$3`);
      fs.writeFileSync(readmePath, newReadme);
      console.log('README.mdの構造セクションを更新しました');
    } else {
      console.error('README.mdの構造セクションが見つかりませんでした');
    }
  } catch (error) {
    console.error(`README.mdの読み込み中にエラーが発生しました: ${error}`);
  }
}

// メイン処理
updateReadme();
