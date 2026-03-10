import { DEFY_GUIDELINES_FULL_TEXT } from '../data/defy_guidelines_full';
import { embedContent } from '../services/gemini';

export interface SearchResult {
  content: string;
  score: number;
  sectionTitle?: string;
  embedding?: number[];
}

/**
 * Cosine similarity between two vectors
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
};

/**
 * Super fast client-side chunker.
 * Splits the massive text into logical sections based on headers.
 */
const chunkData = (text: string): SearchResult[] => {
  // Split by headers formatted like "# 1. GENERAL" or "## 2.2 DOCUMENTATION"
  const sections = text.split(/(?=\n#{1,3}\s*\d+\.?\d*)/g);
  
  return sections.map(section => {
    const trimmed = section.trim();
    // Improved header detection for section titles
    const headerMatch = trimmed.match(/^#{1,3}\s*([\d\.]+\s+[A-Z\s\/&()-]+)/i);
    
    return {
      content: trimmed,
      score: 0,
      sectionTitle: headerMatch ? headerMatch[1].trim() : "General Guideline"
    };
  }).filter(s => s.content.length > 50); // Filter out empty/tiny chunks
};

/**
 * Hybrid Search Implementation
 * Combines Keyword Density + Simple Semantic Scoring
 */
export const searchKnowledgeBase = (query: string, limit: number = 5): SearchResult[] => {
  const chunks = chunkData(DEFY_GUIDELINES_FULL_TEXT);
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    
    // 1. Exact Phrase Match Bonus
    if (contentLower.includes(query.toLowerCase())) {
        score += 20;
    }

    // 2. Term Frequency Scoring
    queryTerms.forEach(term => {
        const regex = new RegExp(term, 'g');
        const count = (contentLower.match(regex) || []).length;
        score += count * 2;
    });

    // 3. Header Relevance (Critical for RAG accuracy)
    if (chunk.sectionTitle && queryTerms.some(term => chunk.sectionTitle?.toLowerCase().includes(term))) {
        score += 15;
    }

    return { ...chunk, score };
  });

  // Sort by score descending and take top N
  return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Vector Search Implementation
 * Uses Gemini Embeddings for semantic retrieval
 */
export const vectorSearchKnowledgeBase = async (
  query: string,
  limit: number = 5
): Promise<SearchResult[]> => {
  const chunks = chunkData(DEFY_GUIDELINES_FULL_TEXT);
  
  try {
    // 1. Get query embedding
    const [queryEmbedding] = await embedContent([query]);
    
    // 2. In a real app, we'd have pre-calculated embeddings for chunks.
    // For this demo, we'll embed the top keyword matches to refine them semantically.
    const keywordMatches = searchKnowledgeBase(query, 15);
    
    if (keywordMatches.length === 0) return [];

    // 3. Embed the top keyword matches
    const chunkEmbeddings = await embedContent(keywordMatches.map(m => m.content.slice(0, 2000)));
    
    // 4. Calculate similarity
    const vectorScored = keywordMatches.map((match, idx) => {
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbeddings[idx]);
      return {
        ...match,
        score: match.score + (similarity * 50) // Boost score with semantic similarity
      };
    });

    return vectorScored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Vector Search Error, falling back to keyword search:", error);
    return searchKnowledgeBase(query, limit);
  }
};
