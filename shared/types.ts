// Shared types between mobile and backend

// ========================================
// Food Product
// ========================================

export interface FoodProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  ingredients: string;
  nutrition: NutritionInfo;
  categories: string[];
  labels: string[]; // Organic, Vegan, etc.
}

export interface NutritionInfo {
  calories: number;       // kcal per 100g
  protein: number;        // g per 100g
  carbohydrates: number;  // g per 100g
  sugars: number;         // g per 100g
  fat: number;            // g per 100g
  saturatedFat: number;   // g per 100g
  fiber: number;          // g per 100g
  sodium: number;         // mg per 100g
  salt?: number;          // g per 100g
}

// ========================================
// Analysis Results
// ========================================

export type NovaGroup = 1 | 2 | 3 | 4;
// 1 = Unprocessed/minimally processed
// 2 = Culinary ingredients
// 3 = Processed foods
// 4 = Ultra-processed foods

export type NutriScore = 'A' | 'B' | 'C' | 'D' | 'E';

export interface FoodAnalysis {
  healthScore: number;           // 0-100
  nutriScore: NutriScore;
  novaGroup: NovaGroup;
  goodPoints: GoodPoint[];
  badPoints: BadPoint[];
  allergens: string[];
  additives: AdditiveInfo[];
}

export interface GoodPoint {
  category: 'nutrient' | 'certification' | 'ingredient' | 'low-risk';
  label: string;
  description: string;
}

export interface BadPoint {
  category: 'additive' | 'nutrient-flag' | 'processing' | 'allergen';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AdditiveInfo {
  name: string;
  eNumber?: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

// ========================================
// Gemini Response Schema
// ========================================

export interface GeminiAnalysisResponse {
  novaGroup: NovaGroup;
  healthScore: number;
  nutriScore: NutriScore;
  goodPoints: GoodPoint[];
  badPoints: BadPoint[];
  allergens: string[];
  additives: AdditiveInfo[];
}

// ========================================
// API
// ========================================

export interface ScanResponse {
  success: boolean;
  product?: FoodProduct;
  analysis?: FoodAnalysis;
  error?: ScanError;
}

export interface ScanError {
  code: 'BARCODE_NOT_FOUND' | 'PRODUCT_NOT_FOUND' | 'ANALYSIS_FAILED' | 'RATE_LIMITED' | 'UNKNOWN';
  message: string;
  details?: string;
}

// ========================================
// Scan History
// ========================================

export interface ScanRecord {
  id: string;
  timestamp: number;
  barcode: string;
  product: FoodProduct;
  analysis: FoodAnalysis;
}
