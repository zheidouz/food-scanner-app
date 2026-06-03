import type { FoodProduct, NutritionInfo, ScanError } from '@shared/types';

const OFF_API_BASE = process.env.OPEN_FOOD_FACTS_API_URL || 'https://world.openfoodfacts.org';

interface OffProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    ingredients_text?: string;
    ingredients_text_with_allergens?: string;
    labels_tags?: string[];
    categories_tags?: string[];
    nutriments?: {
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      sugars_100g?: number;
      fat_100g?: number;
      'saturated-fat_100g'?: number;
      fiber_100g?: number;
      sodium_100g?: number;
      salt_100g?: number;
    };
    nutriscore_grade?: string;
    nova_group?: number;
    allergens_tags?: string[];
    additives_tags?: string[];
  };
  status_verbose: string;
}

/**
 * Look up a product by barcode using Open Food Facts API
 */
export async function lookupProduct(barcode: string): Promise<{
  product: FoodProduct | null;
  error: ScanError | null;
}> {
  try {
    const url = `${OFF_API_BASE}/api/v0/product/${barcode}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        return {
          product: null,
          error: {
            code: 'RATE_LIMITED',
            message: 'Open Food Facts rate limit reached. Try again shortly.',
          },
        };
      }
      return {
        product: null,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `HTTP ${response.status}: Could not fetch product data.`,
        },
      };
    }

    const data: OffProduct = await response.json();

    // Open Food Facts returns status_verbose "product found" for valid products
    if (data.status_verbose !== 'product found' || !data.product) {
      return {
        product: null,
        error: {
          code: 'BARCODE_NOT_FOUND',
          message: `No product found for barcode ${barcode}.`,
        },
      };
    }

    const p = data.product;
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
      salt: nutriments.salt_100g,
    };

    const product: FoodProduct = {
      barcode: data.code || barcode,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      imageUrl: p.image_url,
      ingredients: p.ingredients_text || '',
      nutrition,
      categories: (p.categories_tags || []).map((t) => t.replace('en:', '')),
      labels: (p.labels_tags || []).map((t) => t.replace('en:', '')),
    };

    return { product, error: null };
  } catch (err) {
    return {
      product: null,
      error: {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      },
    };
  }
}

/**
 * Cache wrapper (in-memory) for Open Food Facts lookups
 * Simple TTL-based cache to reduce API calls
 */
const cache = new Map<string, { data: FoodProduct; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function lookupProductCached(barcode: string) {
  const cached = cache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { product: cached.data, error: null, cached: true };
  }

  const result = await lookupProduct(barcode);
  if (result.product) {
    cache.set(barcode, { data: result.product, timestamp: Date.now() });
  }
  return { ...result, cached: false };
}
