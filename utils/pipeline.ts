import { DEFY_GUIDELINES_FULL_TEXT } from '../data/defy_guidelines_full';

export interface IngestionStats {
  sectionsProcessed: number;
  totalRules: number;
  tokensEstimated: number;
  lastIngested: number;
}

export const ingestData = (): { context: string; stats: IngestionStats } => {
  // Process the full text
  const rawText = DEFY_GUIDELINES_FULL_TEXT;
  
  // Estimate stats based on the raw text structure
  const sections = rawText.split(/(?=\n\d+\.\d+)/g);
  const sectionCount = sections.length;
  
  // Rough rule estimation (lines starting with bullet points or dashes)
  const ruleCount = (rawText.match(/^[•\-]/gm) || []).length;

  // Simple token estimation (approx 4 chars per token)
  const tokensEstimated = Math.ceil(rawText.length / 4);

  return {
    context: rawText,
    stats: {
      sectionsProcessed: sectionCount,
      totalRules: ruleCount,
      tokensEstimated,
      lastIngested: Date.now(),
    },
  };
};
