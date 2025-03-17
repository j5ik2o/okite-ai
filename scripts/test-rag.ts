#!/usr/bin/env ts-node

/**
 * RAG (Retrieval Augmented Generation) をテストするためのスクリプト
 * 質問に対して関連するMarkdownファイルを検索して返します
 */

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MarkdownTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { ChatAnthropic } from "@langchain/anthropic";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama, OllamaEmbeddings  } from "@langchain/ollama";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { extractFrontmatter } from './common';

// 環境変数の読み込み
dotenv.config();

// 環境変数からAPIキーを取得
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'ollama'; // デフォルトはollama
const VECTOR_STORE_PATH = process.env.VECTOR_STORE_PATH || './vector-store'; // ベクトルストアの保存先

/**
 * 環境に基づいてLLMモデルを選択する関数
 * 明示的にモデルプロバイダーが指定されている場合はそれを使用し、
 * 指定がなく開発環境の場合はデフォルトでOllamaを使用
 */
function getModel() {
  // 明示的にモデルプロバイダーが指定されている場合
  if (process.env.MODEL_PROVIDER) {
    switch (MODEL_PROVIDER.toLowerCase()) {
      case 'openai':
        if (!OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is not set in the environment");
        }
        return new ChatOpenAI({
          apiKey: OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4o" // モデル名も環境変数で指定可能
        });
      case 'anthropic':
      case 'claude':
        if (!ANTHROPIC_API_KEY) {
          throw new Error("ANTHROPIC_API_KEY is not set in the environment");
        }
        return new ChatAnthropic({
          apiKey: ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307" // 最新のモデルに更新
        });
      case 'ollama':
        return new Ollama({
          baseUrl: OLLAMA_BASE_URL,
          model: OLLAMA_MODEL
        });
      default:
        throw new Error(`Unknown model provider: ${MODEL_PROVIDER}`);
    }
  }
  
  // モデルプロバイダーが指定されていない場合は環境に基づいて選択
  if (ENVIRONMENT === 'development') {
    return new Ollama({
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL
    });
  } else {
    // 本番環境ではデフォルトでClaudeを使用
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in the environment");
    }
    return new ChatAnthropic({
      apiKey: ANTHROPIC_API_KEY,
      model: "claude-3-haiku-20240307" // 最新のモデルに更新
    });
  }
}

/**
 * 環境に基づいて埋め込みモデルを選択する関数
 * 明示的にモデルプロバイダーが指定されている場合はそれを使用し、
 * 指定がなく開発環境の場合はデフォルトでOllamaを使用
 */
function getEmbeddings() {
  // 開発環境では常にOllamaを使用
  if (ENVIRONMENT === 'development') {
    return new OllamaEmbeddings({
      baseUrl: OLLAMA_BASE_URL,
      model: process.env.OLLAMA_EMBEDDING_MODEL || OLLAMA_MODEL
    });
  }
  
  // 本番環境では明示的にモデルプロバイダーが指定されている場合
  if (process.env.MODEL_PROVIDER) {
    switch (MODEL_PROVIDER.toLowerCase()) {
      case 'openai':
        if (!OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is not set in the environment");
        }
        return new OpenAIEmbeddings({
          apiKey: OPENAI_API_KEY,
          model: process.env.OPENAI_EMBEDDING_MODEL // 埋め込みモデルも環境変数で指定可能
        });
      case 'anthropic': // Anthropicは埋め込みをサポートしていないため、OpenAIを使用
      case 'claude': // Claudeも同様
        if (!OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is required for embeddings when using Claude. OPENAI_API_KEY is not set in the environment");
        }
        return new OpenAIEmbeddings({
          apiKey: OPENAI_API_KEY,
          model: process.env.OPENAI_EMBEDDING_MODEL // 埋め込みモデルも環境変数で指定可能
        });
      case 'ollama':
        return new OllamaEmbeddings({
          baseUrl: OLLAMA_BASE_URL,
          model: process.env.OLLAMA_EMBEDDING_MODEL || OLLAMA_MODEL // 埋め込み用のモデルを別途指定可能
        });
      default:
        throw new Error(`Unknown model provider for embeddings: ${MODEL_PROVIDER}`);
    }
  }
  
  // モデルプロバイダーが指定されていない場合は本番環境ではデフォルトでOpenAIを使用
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment");
  }
  return new OpenAIEmbeddings({
    apiKey: OPENAI_API_KEY
  });
}

/**
 * Markdownファイルからメタデータを抽出する関数
 * @param filePath ファイルパス
 * @returns メタデータオブジェクト
 */
function extractMetadata(filePath: string): Record<string, any> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);
    
    return {
      source: filePath,
      title: path.basename(filePath, '.md'),
      description: frontmatter?.description || '',
      tags: frontmatter?.tags || [],
      ruleId: frontmatter?.ruleId || '',
      aliases: frontmatter?.aliases || [],
      globs: frontmatter?.globs || []
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return {
      source: filePath,
      title: path.basename(filePath, '.md')
    };
  }
}

/**
 * カスタムMarkdownローダークラス
 * メタデータを含むドキュメントを読み込む
 */
class CustomMarkdownLoader extends TextLoader {
  private readonly sourcePath: string;

  constructor(filePath: string) {
    super(filePath);
    this.sourcePath = filePath;
  }

  async load(): Promise<Document[]> {
    const docs = await super.load();
    const metadata = extractMetadata(this.sourcePath);
    
    return docs.map(doc => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...metadata,
          ...doc.metadata
        }
      });
    });
  }
}

/**
 * RAGシステムを構築する関数
 * @returns 構築されたRAGチェーン
 */
async function buildRAGSystem() {
  console.log("RAGシステムを構築中...");
  
  // 埋め込みモデルの取得
  const embeddings = getEmbeddings();
  
  // ベクトルストアの存在確認
  let vectorStore;
  const vectorStorePath = `${VECTOR_STORE_PATH}/${ENVIRONMENT}-${MODEL_PROVIDER}`;
  
  try {
    // 既存のベクトルストアを読み込む
    console.log(`既存のベクトルストアを読み込み中... (${vectorStorePath})`);
    vectorStore = await HNSWLib.load(vectorStorePath, embeddings);
    console.log("既存のベクトルストアを読み込みました");
  } catch (error) {
    console.log("既存のベクトルストアが見つからないか、読み込めませんでした。新しく作成します。");
    
    // ドキュメントローダーの作成
    const loader = new DirectoryLoader(
      "docs",
      {
        ".md": (path) => new CustomMarkdownLoader(path)
      }
    );
    
    console.log("ドキュメントを読み込み中...");
    const docs = await loader.load();
    console.log(`${docs.length}個のドキュメントを読み込みました`);
    
    // テキストスプリッターの作成
    const splitter = new MarkdownTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    
    console.log("ドキュメントを分割中...");
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`${splitDocs.length}個のチャンクに分割しました`);
    
    // ベクトルストアの構築
    console.log("ベクトルストアを構築中...");
    vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
    
    // ベクトルストアの保存
    console.log(`ベクトルストアを保存中... (${vectorStorePath})`);
    await vectorStore.save(vectorStorePath);
    console.log("ベクトルストアを保存しました");
  }
  
  // リトリーバーの作成
  const retriever = vectorStore.asRetriever({
    k: 5 // 上位5件の関連ドキュメントを取得
  });
  
  // モデルの取得
  const model = getModel();
  
  // 日本語で回答するためのプロンプトテンプレート
  const promptTemplate = PromptTemplate.fromTemplate(`
あなたは親切なAIアシスタントです。以下の質問に対して、提供されたコンテキストを使用して日本語で回答してください。
回答は簡潔かつ正確に、日本語で提供してください。

コンテキスト:
{context}

質問: {query}

回答:
  `);
  
  // 最新のAPIを使用したチェーンの構築
  const chain = RunnableSequence.from([
    {
      // 入力を適切な形式に変換
      context: async (input: { query: string }) => {
        const docs = await retriever.getRelevantDocuments(input.query);
        return docs.map(doc => doc.pageContent).join("\n\n");
      },
      query: (input: { query: string }) => input.query,
    },
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);
  
  console.log("RAGシステムの構築が完了しました");
  return { chain, vectorStore };
}

/**
 * 質問に対して関連するドキュメントを検索する関数
 * @param question 質問
 * @param vectorStore ベクトルストア
 * @returns 関連ドキュメントの配列
 */
async function searchRelevantDocuments(question: string, vectorStore: HNSWLib) {
  console.log(`質問「${question}」に関連するドキュメントを検索中...`);
  
  const documents = await vectorStore.similaritySearch(question, 5);
  
  return documents.map(doc => {
    const metadata = doc.metadata;
    return {
      source: metadata.source,
      title: metadata.title || path.basename(metadata.source, '.md'),
      description: metadata.description || '',
      tags: metadata.tags || [],
      ruleId: metadata.ruleId || '',
      content: doc.pageContent.substring(0, 300) + '...' // 最初の300文字だけを表示
    };
  });
}

/**
 * メイン関数
 */
async function main() {
  try {
    // コマンドライン引数から質問を取得
    const question = process.argv[2];
    const forceUpdate = process.argv.includes('--force-update') || process.argv.includes('-f');
    
    if (!question) {
      console.log("使用方法: ts-node scripts/test-rag.ts \"あなたの質問\" [--force-update|-f]");
      console.log("  --force-update, -f: ベクトルストアを強制的に更新します");
      return;
    }
    
    // 環境情報の表示
    console.log(`環境: ${ENVIRONMENT}`);
    console.log(`モデルプロバイダー: ${MODEL_PROVIDER}`);
    if (ENVIRONMENT === 'development' || MODEL_PROVIDER === 'ollama') {
      console.log(`OllamaベースURL: ${OLLAMA_BASE_URL}`);
      console.log(`Ollamaモデル: ${OLLAMA_MODEL}`);
    }
    
    // ベクトルストアのパスを表示
    const vectorStorePath = `${VECTOR_STORE_PATH}/${ENVIRONMENT}-${MODEL_PROVIDER}`;
    console.log(`ベクトルストアパス: ${vectorStorePath}`);
    
    // 強制更新の場合、ベクトルストアを削除
    if (forceUpdate) {
      console.log("ベクトルストアを強制的に更新します");
      try {
        if (fs.existsSync(vectorStorePath)) {
          fs.rmSync(vectorStorePath, { recursive: true, force: true });
          console.log("既存のベクトルストアを削除しました");
        }
      } catch (error) {
        console.error("ベクトルストアの削除中にエラーが発生しました:", error);
      }
    }
    
    // RAGシステムの構築
    const { chain, vectorStore } = await buildRAGSystem();
    
    // 関連ドキュメントの検索
    const relevantDocs = await searchRelevantDocuments(question, vectorStore);
    
    console.log("\n関連ドキュメント:");
    relevantDocs.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.title}`);
      console.log(`   ソース: ${doc.source}`);
      console.log(`   説明: ${doc.description}`);
      console.log(`   タグ: ${doc.tags.join(', ')}`);
      console.log(`   抜粋: ${doc.content}`);
    });
    
    // 質問に対する回答の生成
    console.log("\n質問に対する回答を生成中...");
    const response = await chain.invoke({
      query: question
    });
    
    console.log("\n回答:");
    console.log(response);
    
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

// スクリプトの実行
main().catch(console.error); 