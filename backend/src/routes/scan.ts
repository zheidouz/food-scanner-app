import { Router } from 'express';
import { handleScan } from '../services/scanService';

export const scanRouter = Router();

// POST /api/scan — Scan a product by barcode (preferred)
scanRouter.post('/', async (req, res) => {
  const { barcode } = req.body;

  if (!barcode || typeof barcode !== 'string' || barcode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BARCODE_NOT_FOUND',
        message: 'A valid barcode is required.',
      },
    });
  }

  const sanitizedBarcode = barcode.trim();
  const customApiKey = req.headers['x-deepseek-key'] as string | undefined;
  const result = await handleScan(sanitizedBarcode, customApiKey);

  if (!result.success) {
    return res.status(result.error?.code === 'RATE_LIMITED' ? 429 : 404).json(result);
  }

  return res.json(result);
});

// GET /api/scan — Returns JSON error (catches /api/scan/ with no barcode)
scanRouter.get('/', (_req, res) => {
  return res.status(400).json({
    success: false,
    error: {
      code: 'BARCODE_NOT_FOUND',
      message: 'A valid barcode is required. Use GET /api/scan/:barcode',
    },
  });
});

// GET /api/scan/:barcode — Scan a product by barcode (convenience)
scanRouter.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || barcode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BARCODE_NOT_FOUND',
        message: 'A valid barcode is required.',
      },
    });
  }

  const customApiKey = req.headers['x-deepseek-key'] as string | undefined;
  const result = await handleScan(barcode.trim(), customApiKey);

  if (!result.success) {
    return res.status(result.error?.code === 'RATE_LIMITED' ? 429 : 404).json(result);
  }

  return res.json(result);
});
