import { aiResponseSchema, buildAnalysisPrompt, extractJson, type ValidatedAIResponse } from './schema';
import type { ScanError } from '../../../../shared/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getGeminiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}

/**
 * Analyze ingredients using Google Gemini (fallback provider)
 */
export async function analyzeWithGemini(
  ingredients: string,
  productName: string,
  customApiKey?: string
): Promise<{
  analysis: ValidatedAIResponse | null;
  error: ScanError | null;
}> {
  const apiKey = customApiKey || getGeminiKey();

  if (!apiKey) {
    return {
      analysis: null,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Gemini API key is not configured.',
      },
    };
  }

  const prompt = buildAnalysisPrompt(ingredients, productName);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: `Gemini API error: HTTP ${response.status}`,
        },
      };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Gemini returned an empty response.',
        },
      };
    }

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Could not parse Gemini response as JSON.',
        },
      };
    }

    const parsed = JSON.parse(jsonStr);
    const validation = aiResponseSchema.safeParse(parsed);

    if (!validation.success) {
      console.error('Gemini response validation failed:', validation.error.format());
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'AI response format was unexpected. Please try again.',
        },
      };
    }

    return { analysis: validation.data, error: null };
  } catch (err) {
    return {
      analysis: null,
      error: {
        code: 'ANALYSIS_FAILED',
        message: err instanceof Error ? err.message : 'Gemini request failed.',
      },
    };
  }
}
