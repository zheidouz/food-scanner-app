import type { NovaGroup, NutriScore } from '../../../shared/types';
import { calculateNutriScore, calculateNovaFromNutrition, calculateHealthScore, generateNutritionFlags } from '../services/scoring';
import { lookupProductCached } from '../services/openFoodFacts';
import { analyzeIngredients } from '../services/gemini';
import type { FoodAnalysis, ScanResponse } from '../../../shared/types';

export async function handleScan(barcode: string): Promise<ScanResponse> {
  // 1. Lookup product from Open Food Facts
  const { product, error: lookupError } = await lookupProductCached(barcode);
  if (lookupError || !product) {
    return { success: false, error: lookupError ?? { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } };
  }

  // 2. Analyze ingredients with Gemini
  const { analysis: geminiAnalysis, error: geminiError } = await analyzeIngredients(
    product.ingredients,
    product.name
  );

  // 3. Compute fallback scores if Gemini fails
  const novaGroup: NovaGroup = geminiAnalysis?.novaGroup ?? calculateNovaFromNutrition(product.nutrition) ?? 3;
  const nutriScore: NutriScore = geminiAnalysis?.nutriScore ?? calculateNutriScore(product.nutrition);
  const healthScore = geminiAnalysis?.healthScore ?? calculateHealthScore(product.nutrition, novaGroup, nutriScore);

  // 4. Combine Gemini good/bad points with nutrition-based flags
  const { goodPoints: nutritionGood, badPoints: nutritionBad } = generateNutritionFlags(product.nutrition);

  const goodPoints = [
    ...(geminiAnalysis?.goodPoints ?? []),
    ...nutritionGood.filter(
      (ng) => !geminiAnalysis?.goodPoints?.some((gp) => gp.label === ng.label)
    ),
  ];

  const badPoints = [
    ...(geminiAnalysis?.badPoints ?? []),
    ...nutritionBad.filter(
      (nb) => !geminiAnalysis?.badPoints?.some((bp) => bp.label === nb.label)
    ),
  ];

  // 5. Build the analysis
  const analysis: FoodAnalysis = {
    healthScore,
    nutriScore,
    novaGroup,
    goodPoints,
    badPoints,
    allergens: geminiAnalysis?.allergens ?? [],
    additives: geminiAnalysis?.additives ?? [],
  };

  return {
    success: true,
    product,
    analysis,
    error: geminiError ? { code: 'ANALYSIS_FAILED', message: 'AI analysis incomplete — using nutrition-based fallback.', details: geminiError.message } : undefined,
  };
}
