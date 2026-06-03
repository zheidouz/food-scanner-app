import { z } from 'zod';

// ========================================
// Zod schema for Gemini structured output
// This validates the LLM response before use
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

export const geminiResponseSchema = z.object({
  novaGroup: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  healthScore: z.number().int().min(0).max(100),
  nutriScore: z.enum(['A', 'B', 'C', 'D', 'E']),
  goodPoints: z.array(goodPointSchema).min(0).max(20),
  badPoints: z.array(badPointSchema).min(0).max(20),
  allergens: z.array(z.string()).min(0).max(30),
  additives: z.array(additiveInfoSchema).min(0).max(30),
});

export type ValidatedGeminiResponse = z.infer<typeof geminiResponseSchema>;
