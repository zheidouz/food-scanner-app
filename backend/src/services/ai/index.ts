import { analyzeWithDeepSeek } from './deepseek';
import { analyzeWithGemini } from './gemini';
import type { ValidatedAIResponse } from './schema';
import type { ScanError } from '../../../../shared/types';

export type AIProvider = 'deepseek' | 'gemini';

/**
 * Analyze food ingredients using the configured AI provider.
 * Supports custom API keys via the customApiKey parameter.
 */
export async function analyzeIngredients(
  ingredients: string,
  productName: string,
  customApiKey?: string
): Promise<{
  analysis: ValidatedAIResponse | null;
  error: ScanError | null;
  provider: AIProvider;
}> {
  const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase() as AIProvider;

  if (provider === 'deepseek') {
    const result = await analyzeWithDeepSeek(ingredients, productName, customApiKey);
    return { ...result, provider: 'deepseek' };
  }

  // Gemini fallback — pass custom key if provided
  const result = await analyzeWithGemini(ingredients, productName, customApiKey);
  return { ...result, provider: 'gemini' };
}
