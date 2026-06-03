import { z } from 'zod';

// ========================================
// Zod schema for AI structured output
// Validates LLM response before use (works for all providers)
// ========================================

const goodPointSchema = z.object({
  category: z.enum(['nutrient', 'certification', 'ingredient', 'low-risk']),
  label: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
});

const badPointSchema = z.object({
  category: z.enum(['additive', 'nutrient-flag', 'processing', 'allergen']),
  label: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  severity: z.enum(['low', 'medium', 'high']),
});

const additiveInfoSchema = z.object({
  name: z.string().min(1).max(100),
  eNumber: z.string().regex(/^E\d{3,4}$/).optional(),
  risk: z.enum(['low', 'medium', 'high']),
  description: z.string().min(1).max(300),
});

export const aiResponseSchema = z.object({
  novaGroup: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  healthScore: z.number().int().min(0).max(100),
  nutriScore: z.enum(['A', 'B', 'C', 'D', 'E']),
  goodPoints: z.array(goodPointSchema).min(0).max(20),
  badPoints: z.array(badPointSchema).min(0).max(20),
  allergens: z.array(z.string()).min(0).max(30),
  additives: z.array(additiveInfoSchema).min(0).max(30),
});

export type ValidatedAIResponse = z.infer<typeof aiResponseSchema>;

/**
 * Build the analysis prompt (provider-agnostic)
 */
export function buildAnalysisPrompt(ingredients: string, productName: string): string {
  return `You are a food analysis expert. Analyze the following food product.

Product Name: "${productName}"
Ingredients: "${ingredients || 'No ingredients list available.'}"

Provide a comprehensive analysis in JSON format (NO markdown wrapping, NO code fences, just raw JSON):

{
  "novaGroup": <1|2|3|4>,
  "healthScore": <0-100>,
  "nutriScore": <"A"|"B"|"C"|"D"|"E">,
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
export function extractJson(text: string): string | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  try {
    JSON.parse(text.trim());
    return text.trim();
  } catch {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return jsonMatch ? jsonMatch[1] : null;
  }
}
