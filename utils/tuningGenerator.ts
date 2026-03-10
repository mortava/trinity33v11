import { DEFY_MATRICES_CLEAN } from '../data/Defy_Matrices_Clean';
import { DEFY_GUIDELINES_FULL_TEXT } from '../data/defy_guidelines_full';
import { LogicFile, TuningExample } from '../types';

/**
 * Generates a Logic File (Fine-Tuning Dataset) based on the Native Data.
 * This converts static matrices and text into Q&A pairs for model training.
 */
export const generateLogicFile = (): LogicFile => {
  const examples: TuningExample[] = [];

  // 1. Generate Logic from Matrices (High Precision)
  DEFY_MATRICES_CLEAN.matrices.forEach(matrix => {
    matrix.rows.forEach(row => {
      // Scenario 1: Max LTV Lookup
      if (row.fico_bucket && row.occupancy && row.max_ltv_purchase) {
        examples.push({
          instruction: `What is the Max LTV for a ${row.program} ${row.occupancy} purchase transaction with a FICO score of ${row.fico_bucket}?`,
          context: `Reference: ${matrix.title}. Program: ${row.program}. Occupancy: ${row.occupancy}. FICO: ${row.fico_bucket}.`,
          response: `According to the ${matrix.title}, for a ${row.program} ${row.occupancy} purchase with a FICO of ${row.fico_bucket}, the Max LTV is **${row.max_ltv_purchase}**.`,
          source: matrix.matrix_id
        });
      }

      // Scenario 2: Cash Out Limits
      if (row.max_ltv_cash_out && row.loan_amount_bucket) {
        examples.push({
          instruction: `Can I get a cash-out refinance for a ${row.program} on a ${row.occupancy} with a loan amount of ${row.loan_amount_bucket}?`,
          context: `Reference: ${matrix.title}. Program: ${row.program}. Loan Amount: ${row.loan_amount_bucket}.`,
          response: `Yes, under the ${row.program} program for a ${row.occupancy}, cash-out is permitted up to **${row.max_ltv_cash_out} LTV** for loan amounts between ${row.loan_amount_bucket}.`,
          source: matrix.matrix_id
        });
      }
      
      // Scenario 3: DSCR Specifics (if applicable)
      if (row.dscr_min) {
         examples.push({
          instruction: `What is the minimum DSCR required for ${row.program} with a FICO of ${row.min_credit_score || row.credit_score_bucket || 'N/A'}?`,
          context: `Reference: ${matrix.title}. Program: ${row.program}. FICO: ${row.min_credit_score || row.credit_score_bucket}.`,
          response: `The minimum DSCR required is **${row.dscr_min}** for this specific scenario.`,
          source: matrix.matrix_id
        });
      }
    });
  });

  // 2. Generate Logic from Guidelines (Text Chunking)
  // Handles markdown headers like "## 2.2 DOCUMENTATION"
  const sections = DEFY_GUIDELINES_FULL_TEXT.split(/(?=\n#{1,3}\s*\d+\.?\d*)/g);
  
  sections.forEach((section, index) => {
    const lines = section.trim().split('\n');
    const header = lines[0]?.replace(/^#+\s*/, '') || "General Guideline";
    const body = lines.slice(1).join('\n').trim();

    if (body.length > 50) {
      examples.push({
        instruction: `Summarize the guidelines regarding ${header}.`,
        context: section.substring(0, 500) + "...", 
        response: body, 
        source: `guideline-section-${index}`
      });
    }
  });

  return {
    meta: {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      totalExamples: examples.length
    },
    examples
  };
};