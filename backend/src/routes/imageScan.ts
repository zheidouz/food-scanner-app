import { Router } from 'express';
import multer from 'multer';
import { analyzeIngredients } from '../services/ai';
import type { ScanResponse } from '../../../shared/types';
import { generateNutritionFlags } from '../services/scoring';
import type { NovaGroup, NutriScore } from '../../../shared/types';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export const imageScanRouter = Router();

// POST /api/scan/image — Analyze a food label from a photo
imageScanRouter.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'No image provided. Send a file as multipart/form-data with field name "image".',
        },
      });
    }

    const { labelText } = req.body;

    // If user provided label text (typed from the photo), use it
    // Otherwise, we'll analyze what we can (no OCR yet — Sprint 3)
    const ingredients = labelText?.trim() || 'Photo uploaded — no text extracted yet. OCR coming in Sprint 3.';

    // Get custom API key from header if provided
    const customApiKey = req.headers['x-deepseek-key'] as string | undefined;

    const result = await scanImage(ingredients, customApiKey);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Image analysis failed.',
      },
    });
  }
});

async function scanImage(
  ingredients: string,
  customApiKey?: string,
): Promise<ScanResponse> {
  // Analyze with DeepSeek using whatever text we have
  const { analysis: aiAnalysis, error: aiError } = await analyzeIngredients(
    ingredients,
    'Product from photo',
    customApiKey,
  );

  if (aiAnalysis) {
    return {
      success: true,
      product: {
        barcode: 'photo-scan',
        name: 'Product from Photo',
        brand: 'Scanned via image',
        ingredients,
        nutrition: { calories: 0, protein: 0, carbohydrates: 0, sugars: 0, fat: 0, saturatedFat: 0, fiber: 0, sodium: 0 },
        categories: [],
        labels: [],
      },
      analysis: aiAnalysis,
    };
  }

  // Fallback: minimal analysis
  const novaGroup: NovaGroup = 3;
  const nutriScore: NutriScore = 'C';
  const healthScore = 50;
  const { goodPoints, badPoints } = generateNutritionFlags({
    calories: 0, protein: 0, carbohydrates: 0, sugars: 0,
    fat: 0, saturatedFat: 0, fiber: 0, sodium: 0,
  });

  return {
    success: true,
    product: {
      barcode: 'photo-scan',
      name: 'Product from Photo',
      brand: 'Scanned via image',
      ingredients,
      nutrition: { calories: 0, protein: 0, carbohydrates: 0, sugars: 0, fat: 0, saturatedFat: 0, fiber: 0, sodium: 0 },
      categories: [],
      labels: [],
    },
    analysis: {
      healthScore,
      nutriScore,
      novaGroup,
      goodPoints,
      badPoints,
      allergens: [],
      additives: [],
    },
    error: aiError ? { code: 'ANALYSIS_FAILED', message: 'Could not analyze image content. Try typing the ingredients manually.', details: aiError.message } : undefined,
  };
}
