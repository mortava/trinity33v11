import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";
import { MODEL_NAME } from "../components/constants";
import { vectorSearchKnowledgeBase } from "../utils/search";

// Resolve API key from multiple sources (Vite define, import.meta.env, process.env)
const resolveApiKey = (): string => {
  // @ts-ignore - injected by Vite define
  if (typeof __GEMINI_API_KEY__ !== 'undefined' && __GEMINI_API_KEY__) return __GEMINI_API_KEY__;
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  return '';
};

// Initialize the GenAI Client using the GoogleGenAI class
const getAIClient = () => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    console.error('No Gemini API key found. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates embeddings for the provided content.
 * Supports text, images, and audio as per the new RAG embedding feature.
 */
export const embedContent = async (
  contents: (string | { inlineData: { data: string; mimeType: string } })[]
): Promise<number[][]> => {
  const ai = getAIClient();
  
  try {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: contents.map(c => {
        if (typeof c === 'string') {
          return { parts: [{ text: c }] };
        }
        return { parts: [c] };
      }),
    });
    
    // The SDK returns an array of embeddings if multiple contents are provided
    // Each embedding has a 'values' property which is the number[]
    if (Array.isArray(result.embeddings)) {
      return result.embeddings.map(e => e.values);
    } else {
      // Handle single embedding case if necessary, though contents is an array
      return [(result.embeddings as any).values];
    }
  } catch (error) {
    console.error("Embedding Error:", error);
    throw error;
  }
};

/**
 * Streams a chat response from Gemini using Local Client-Side RAG.
 */
export const streamChatResponse = async (
  history: Message[],
  currentMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getAIClient();

  // 1. Retrieve Context Locally using Vector Search
  const searchResults = await vectorSearchKnowledgeBase(currentMessage, 10);

  let contextBlock = "";

  if (searchResults.length > 0) {
    contextBlock = searchResults
      .map(
        (result) =>
          `[SOURCE: ${result.sectionTitle}]\n${result.content}`
      )
      .join("\n\n");
  } else {
    contextBlock = "No specific info found in the provided guidelines.";
  }

  // 2. Format History for SDK
  const previousMessages = history.slice(-10).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // 3. System Instruction (Expert, Direct, No-Scroll)
  const systemInstruction = `
## IDENTITY & TONE
You are Dealr, the senior AI Underwriting Assistant for Defy Wholesale.
Your goal is to provide instantaneous, hyper-accurate data lookups.
FORMATTING RULES (STRICT):
    1. START WITH a data comparison or grids, YOU MUST use a Markdown Table.
    2. CRITICAL: Every row of a table MUST have an actual newline character (\\n) after it. 
       DO NOT put multiple rows on the same line.
       Format must be:
       | Header | Header |
       |--------|--------|
       | Data   | Data   |
    3. NO asterisks (*) or symbols for bolding/listing inside tables.
    4. Keep the introductory tone confident and casual.
    5. Summarize the result at the end with a "Quick Shot Result".
    6. Use shorthand ($1m, 80% LTV).
    7. Max word count: 150.
    8. ALWAYS use these specific Table Header shorthand titles for cleaner UI:
       - OCC (for Occupancy)
       - SCORE (for FICO/Credit Score)
       - LA (for Loan Amount)
       - DOC (for Doc Type)
       - LTV (PUR/RT) (for Max LTV Purchase/Rate & Term)
       - LTV (C/O) (for Max LTV Cash Out)

## CORE RULE: NO APOLOGIES
- NEVER start with "Unfortunately," or "I don't have that info."
- If data is missing for a specific sub-parameter, jump directly to the closest available data.
- Speak in industry shorthand ($1m, 80% LTV, 720 FICO).

## MOBILE FORMATTING (CRITICAL)
- Responses MUST fit on a small mobile screen without horizontal scrolling.
- TABLES: Use 2-3 columns max. Every row MUST end with a newline (\\n).
- NO complex symbols or bolding inside cells.
- Keep responses under 130 words.

## RESPONSE ARCHITECTURE
1. Compact Table (Comparison/Grid of relevant data).
2. Direct Answer (Bullet points if needed).
3. "Quick Shot" summary (1-2 sentences max).

--- KNOWLEDGE BASE CONTEXT ---
${contextBlock}
--- END CONTEXT ---
`;

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: previousMessages,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const result = await chat.sendMessageStream({
      message: currentMessage,
    });

    let fullText = "";

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;

      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }
    }

    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = "Guideline retrieval error. Check connection and retry.";
    onChunk(errorMessage);
    return errorMessage;
  }
};