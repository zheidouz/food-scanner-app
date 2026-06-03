import type { NovaGroup, NutriScore } from '../../../shared/types';
import { calculateNutriScore, calculateNovaFromNutrition, calculateHealthScore, generateNutritionFlags } from '../services/scoring';
import { lookupProductCached } from '../services/openFoodFacts';
import { analyzeIngredients } from '../services/ai';
import type { FoodAnalysis, ScanResponse } from '../../../shared/types';

export async function handleScan(barcode: string, customApiKey?: string): Promise<ScanResponse> {
  // 1. Lookup product from Open Food Facts
  const { product, error: lookupError } = await lookupProductCached(barcode);
  if (lookupError || !product) {
    return { success: false, error: lookupError ?? { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } };
  }

  // 2. Analyze ingredients with AI (DeepSeek V4 Flash by default)
  const { analysis: aiAnalysis, error: aiError, provider } = await analyzeIngredients(
    product.ingredients,
    product.name,
    customApiKey
  );

  // 3. Compute fallback scores if AI fails
  const novaGroup: NovaGroup = aiAnalysis?.novaGroup ?? calculateNovaFromNutrition(product.nutrition) ?? 3;
  const nutriScore: NutriScore = aiAnalysis?.nutriScore ?? calculateNutriScore(product.nutrition);
  const healthScore = aiAnalysis?.healthScore ?? calculateHealthScore(product.nutrition, novaGroup, nutriScore);

  // 4. Combine AI good/bad points with nutrition-based flags
  const { goodPoints: nutritionGood, badPoints: nutritionBad } = generateNutritionFlags(product.nutrition);

  const goodPoints = [
    ...(aiAnalysis?.goodPoints ?? []),
    ...nutritionGood.filter(
      (ng) => !aiAnalysis?.goodPoints?.some((gp) => gp.label === ng.label)
    ),
  ];

  const badPoints = [
    ...(aiAnalysis?.badPoints ?? []),
    ...nutritionBad.filter(
      (nb) => !aiAnalysis?.badPoints?.some((bp) => bp.label === nb.label)
    ),
  ];

  // 5. Build the analysis
  const analysis: FoodAnalysis = {
    healthScore,
    nutriScore,
    novaGroup,
    goodPoints,
    badPoints,
    allergens: aiAnalysis?.allergens ?? [],
    additives: aiAnalysis?.additives ?? [],
  };

  return {
    success: true,
    product,
    analysis,
    error: aiError ? { code: 'ANALYSIS_FAILED', message: `AI analysis (${provider}) incomplete — using nutrition-based fallback.`, details: aiError.message } : undefined,
  };
}
