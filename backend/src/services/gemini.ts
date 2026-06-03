import { geminiResponseSchema, type ValidatedGeminiResponse } from './geminiSchema';
import type { ScanError } from '@shared/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Analyze ingredients text using Google Gemini
 * Returns structured, validated JSON or an error
 */
export async function analyzeIngredients(
  ingredients: string,
  productName: string,
  customApiKey?: string
): Promise<{
  analysis: ValidatedGeminiResponse | null;
  error: ScanError | null;
}> {
  const apiKey = customApiKey || GEMINI_API_KEY;

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
          {
            parts: [{ text: prompt }],
          },
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

    // Extract JSON from the response (handles markdown-wrapped JSON)
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

    // Validate with zod schema
    const parsed = JSON.parse(jsonStr);
    const validation = geminiResponseSchema.safeParse(parsed);

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

function buildAnalysisPrompt(ingredients: string, productName: string): string {
  return `You are a food analysis expert. Analyze the following food product.

Product Name: "${productName}"
Ingredients: "${ingredients || 'No ingredients list available.'}"

Provide a comprehensive analysis in JSON format (NO markdown wrapping, NO code fences, just raw JSON):

{
  "novaGroup": <1|2|3|4>, // NOVA classification: 1=unprocessed, 2=culinary ingredient, 3=processed, 4=ultra-processed
  "healthScore": <0-100>, // Overall health score
  "nutriScore": <"A"|"B"|"C"|"D"|"E">, // Nutri-Score grade
  "goodPoints": [
    {
      "category": "nutrient"|"certification"|"ingredient"|"low-risk",
      "label": "Short label",
      "description": "Brief explanation"
    }
  ],
  "badPoints": [
    {
      "category": "additive"|"nutrient-flag"|"processing"|"allergen",
      "label": "Short label",
      "description": "Brief explanation",
      "severity": "low"|"medium"|"high"
    }
  ],
  "allergens": ["list", "of", "detected", "allergens"],
  "additives": [
    {
      "name": "Additive name",
      "eNumber": "E123" (optional),
      "risk": "low"|"medium"|"high",
      "description": "Brief description"
    }
  ]
}

Be objective and evidence-based. Highlight both positive and negative aspects.`;
}

/**
 * Extract JSON string from potentially markdown-wrapped LLM output
 */
function extractJson(text: string): string | null {
  // Try to find JSON between ```json and ``` markers
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to parse the whole text as JSON
  try {
    JSON.parse(text.trim());
    return text.trim();
  } catch {
    // Not valid JSON — try to find {...} or [{...}]
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return jsonMatch ? jsonMatch[1] : null;
  }
}
