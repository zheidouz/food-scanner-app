import type { NovaGroup, NutriScore, NutritionInfo, GoodPoint, BadPoint } from '../../../shared/types';

/**
 * Calculate Nutri-Score (A-E) based on Open Food Facts algorithm
 * Score range: -15 (best) to 40 (worst)
 */
export function calculateNutriScore(nutrition: NutritionInfo): NutriScore {
  // Negative points (unfavorable)
  const energyPoints = scoreEnergy(nutrition.calories);
  const sugarPoints = scoreNutrient(nutrition.sugars, 4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40);
  const satFatPoints = scoreNutrient(nutrition.saturatedFat, 1, 2, 3, 4, 5, 6, 7, 8, 10);
  const sodiumPoints = scoreNutrient(nutrition.sodium / 1000, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81);

  const N = energyPoints + sugarPoints + satFatPoints + sodiumPoints;

  // Positive points (favorable)
  const fiberPoints = scorePositive(nutrition.fiber, 0.9, 1.9, 2.8, 3.7, 4.7);
  const proteinPoints = scoreProtein(nutrition.protein);

  const C = fiberPoints + proteinPoints;

  const totalScore = N - C;

  // Map to Nutri-Score grade
  if (totalScore <= -1) return 'A';
  if (totalScore <= 2) return 'B';
  if (totalScore <= 10) return 'C';
  if (totalScore <= 18) return 'D';
  return 'E';
}

function scoreEnergy(kcal: number): number {
  if (kcal <= 335) return 0;
  if (kcal <= 670) return 1;
  if (kcal <= 1005) return 2;
  if (kcal <= 1340) return 3;
  if (kcal <= 1675) return 4;
  if (kcal <= 2010) return 5;
  if (kcal <= 2345) return 6;
  if (kcal <= 2680) return 7;
  if (kcal <= 3015) return 8;
  if (kcal <= 3350) return 9;
  return 10;
}

function scoreNutrient(value: number, ...thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return thresholds.length;
}

function scorePositive(value: number, ...thresholds: number[]): number {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) return i + 1;
  }
  return 0;
}

function scoreProtein(protein: number): number {
  if (protein >= 8) return 5;
  if (protein >= 6.4) return 4;
  if (protein >= 4.8) return 3;
  if (protein >= 3.2) return 2;
  if (protein >= 1.6) return 1;
  return 0;
}

/**
 * Determine NOVA group based on ingredients and categories
 * This is a simplified implementation — real NOVA requires full ingredient analysis
 * For Sprint 1, we rely on Gemini for NOVA and use nutrition-based fallback
 */
export function calculateNovaFromNutrition(nutrition: NutritionInfo): NovaGroup | null {
  // Ultra-processed indicators: high sugar + sat fat + sodium with low fiber
  const ultraProcessedIndicators = [
    nutrition.sugars > 15,
    nutrition.saturatedFat > 5,
    nutrition.sodium > 400,
    nutrition.fiber < 1,
  ];

  const highCount = ultraProcessedIndicators.filter(Boolean).length;

  if (highCount >= 3) return 4;  // Ultra-processed
  if (highCount === 2) return 3; // Processed
  if (highCount === 1) return 2; // Culinary ingredient
  return 1;                      // Unprocessed
}

/**
 * Calculate overall health score (0-100)
 * Combines Nutri-Score, NOVA, and specific nutrient flags
 */
export function calculateHealthScore(nutrition: NutritionInfo, novaGroup: NovaGroup, nutriScore: NutriScore): number {
  let score = 70; // Base score

  // Nutri-Score adjustment
  const nutriScores: Record<NutriScore, number> = { A: 15, B: 5, C: 0, D: -10, E: -20 };
  score += nutriScores[nutriScore];

  // NOVA adjustment
  const novaScores: Record<NovaGroup, number> = { 1: 10, 2: 5, 3: -5, 4: -15 };
  score += novaScores[novaGroup];

  // Individual nutrient penalties
  if (nutrition.sugars > 22.5) score -= 5;
  if (nutrition.saturatedFat > 5) score -= 5;
  if (nutrition.sodium > 600) score -= 5;

  // Individual nutrient bonuses
  if (nutrition.fiber >= 6) score += 5;
  if (nutrition.protein >= 12) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate good/bad points from nutrition data
 */
export function generateNutritionFlags(nutrition: NutritionInfo): {
  goodPoints: GoodPoint[];
  badPoints: BadPoint[];
} {
  const goodPoints: GoodPoint[] = [];
  const badPoints: BadPoint[] = [];

  // Good: high fiber
  if (nutrition.fiber >= 6) {
    goodPoints.push({
      category: 'nutrient',
      label: 'High Fiber',
      description: `Contains ${nutrition.fiber}g of fiber per 100g — excellent for digestive health.`,
    });
  } else if (nutrition.fiber >= 3) {
    goodPoints.push({
      category: 'nutrient',
      label: 'Source of Fiber',
      description: `Contains ${nutrition.fiber}g of fiber per 100g.`,
    });
  }

  // Good: high protein
  if (nutrition.protein >= 12) {
    goodPoints.push({
      category: 'nutrient',
      label: 'High Protein',
      description: `Contains ${nutrition.protein}g of protein per 100g — great for satiety.`,
    });
  }

  // Bad: high sugar
  if (nutrition.sugars > 22.5) {
    badPoints.push({
      category: 'nutrient-flag',
      label: 'High Sugar',
      description: `Contains ${nutrition.sugars}g of sugar per 100g (>22.5g is high).`,
      severity: 'high',
    });
  } else if (nutrition.sugars > 10) {
    badPoints.push({
      category: 'nutrient-flag',
      label: 'Moderate Sugar',
      description: `Contains ${nutrition.sugars}g of sugar per 100g.`,
      severity: 'medium',
    });
  }

  // Bad: high saturated fat
  if (nutrition.saturatedFat > 5) {
    badPoints.push({
      category: 'nutrient-flag',
      label: 'High Saturated Fat',
      description: `Contains ${nutrition.saturatedFat}g of saturated fat per 100g (>5g is high).`,
      severity: 'high',
    });
  }

  // Bad: high sodium
  if (nutrition.sodium > 600) {
    badPoints.push({
      category: 'nutrient-flag',
      label: 'High Sodium',
      description: `Contains ${nutrition.sodium}mg of sodium per 100g (>600mg is high).`,
      severity: 'high',
    });
  } else if (nutrition.sodium > 200) {
    badPoints.push({
      category: 'nutrient-flag',
      label: 'Moderate Sodium',
      description: `Contains ${nutrition.sodium}mg of sodium per 100g.`,
      severity: 'medium',
    });
  }

  return { goodPoints, badPoints };
}
