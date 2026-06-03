import { aiResponseSchema, buildAnalysisPrompt, extractJson, type ValidatedAIResponse } from './schema';
import type { ScanError } from '../../../../shared/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat'; // DeepSeek V4 Flash

/**
 * Analyze ingredients using DeepSeek V4 Flash (OpenAI-compatible API)
 */
export async function analyzeWithDeepSeek(
  ingredients: string,
  productName: string,
): Promise<{
  analysis: ValidatedAIResponse | null;
  error: ScanError | null;
}> {
  if (!DEEPSEEK_API_KEY) {
    return {
      analysis: null,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'DeepSeek API key is not configured. Set DEEPSEEK_API_KEY in .env',
      },
    };
  }

  const prompt = buildAnalysisPrompt(ingredients, productName);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a food science expert. Always respond with valid JSON only, no markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: `DeepSeek API error: HTTP ${response.status}${errorBody ? ` — ${errorBody.slice(0, 200)}` : ''}`,
        },
      };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'DeepSeek returned an empty response.',
        },
      };
    }

    // Extract and validate JSON
    const jsonStr = extractJson(text);
    if (!jsonStr) {
      return {
        analysis: null,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Could not parse DeepSeek response as JSON.',
        },
      };
    }

    const parsed = JSON.parse(jsonStr);
    const validation = aiResponseSchema.safeParse(parsed);

    if (!validation.success) {
      console.error('DeepSeek response validation failed:', validation.error.format());
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
        message: err instanceof Error ? err.message : 'DeepSeek request failed.',
      },
    };
  }
}
