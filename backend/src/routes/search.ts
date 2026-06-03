import { Router } from 'express';
import type { FoodProduct, NutritionInfo } from '../../../shared/types';

const OFF_API_BASE = process.env.OPEN_FOOD_FACTS_API_URL || 'https://world.openfoodfacts.org';

export const searchRouter = Router();

interface OffSearchResult {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    'saturated-fat_100g'?: number;
    fiber_100g?: number;
    sodium_100g?: number;
  };
}

// GET /api/search?q=coca&page_size=10
searchRouter.get('/', async (req, res) => {
  const query = (req.query.q as string || '').trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      results: [],
      error: { code: 'SEARCH_EMPTY', message: 'Search query is required.' },
    });
  }

  const pageSize = Math.min(parseInt(req.query.page_size as string) || 10, 50);

  try {
    const url = `${OFF_API_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=${pageSize}&json=1`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        results: [],
        error: { code: 'SEARCH_FAILED', message: `Open Food Facts returned HTTP ${response.status}` },
      });
    }

    const data = await response.json();
    const products: OffSearchResult[] = data.products || [];

    const results = products.map((p: OffSearchResult) => {
      const nutriments = p.nutriments || {};
      const nutrition: NutritionInfo = {
        calories: nutriments['energy-kcal_100g'] ?? 0,
        protein: nutriments.proteins_100g ?? 0,
        carbohydrates: nutriments.carbohydrates_100g ?? 0,
        sugars: nutriments.sugars_100g ?? 0,
        fat: nutriments.fat_100g ?? 0,
        saturatedFat: nutriments['saturated-fat_100g'] ?? 0,
        fiber: nutriments.fiber_100g ?? 0,
        sodium: nutriments.sodium_100g ?? 0,
      };

      return {
        barcode: p.code,
        name: p.product_name || 'Unknown Product',
        brand: p.brands || 'Unknown Brand',
        imageUrl: p.image_url,
        nutrition,
      };
    });

    return res.json({ success: true, results, total: data.count || results.length });
  } catch (err) {
    return res.status(500).json({
      success: false,
      results: [],
      error: { code: 'SEARCH_FAILED', message: err instanceof Error ? err.message : 'Search request failed.' },
    });
  }
});
