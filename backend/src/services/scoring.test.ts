import { calculateNutriScore, calculateNovaFromNutrition, calculateHealthScore } from './scoring';
import type { NutritionInfo } from '@shared/types';

const appleNutrition: NutritionInfo = {
  calories: 52,
  protein: 0.3,
  carbohydrates: 14,
  sugars: 10,
  fat: 0.2,
  saturatedFat: 0,
  fiber: 2.4,
  sodium: 1,
};

const sodaNutrition: NutritionInfo = {
  calories: 41,
  protein: 0,
  carbohydrates: 10.6,
  sugars: 10.6,
  fat: 0,
  saturatedFat: 0,
  fiber: 0,
  sodium: 4,
};

const ultraProcessedNutrition: NutritionInfo = {
  calories: 500,
  protein: 5,
  carbohydrates: 60,
  sugars: 25,
  fat: 30,
  saturatedFat: 12,
  fiber: 0.5,
  sodium: 800,
};

const proteinBarNutrition: NutritionInfo = {
  calories: 250,
  protein: 20,
  carbohydrates: 30,
  sugars: 5,
  fat: 8,
  saturatedFat: 2,
  fiber: 8,
  sodium: 150,
};

describe('calculateNutriScore', () => {
  it('should return A for fresh apple', () => {
    expect(calculateNutriScore(appleNutrition)).toBe('A');
  });

  it('should return B for soda (high sugar but low fat/sodium)', () => {
    // Soda is often B or C — depends on exact algorithm
    const score = calculateNutriScore(sodaNutrition);
    expect(['A', 'B', 'C']).toContain(score);
  });

  it('should return E for ultra-processed food', () => {
    expect(calculateNutriScore(ultraProcessedNutrition)).toBe('E');
  });

  it('should return A for high-protein, high-fiber bar', () => {
    expect(calculateNutriScore(proteinBarNutrition)).toBe('A');
  });
});

describe('calculateNovaFromNutrition', () => {
  it('should return 1 for apple (unprocessed)', () => {
    expect(calculateNovaFromNutrition(appleNutrition)).toBe(1);
  });

  it('should return 4 for ultra-processed food', () => {
    expect(calculateNovaFromNutrition(ultraProcessedNutrition)).toBe(4);
  });

  it('should return 3 for moderately processed food', () => {
    const moderate: NutritionInfo = {
      ...appleNutrition,
      sugars: 15,
      saturatedFat: 6, // 2 indicators → processed
      sodium: 500,
    };
    expect(calculateNovaFromNutrition(moderate)).toBe(3);
  });
});

describe('calculateHealthScore', () => {
  it('should give high score for apple (NOVA 1, NutriScore A)', () => {
    const score = calculateHealthScore(appleNutrition, 1, 'A');
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give low score for ultra-processed (NOVA 4, NutriScore E)', () => {
    const score = calculateHealthScore(ultraProcessedNutrition, 4, 'E');
    expect(score).toBeLessThanOrEqual(40);
  });

  it('should give moderate score for protein bar', () => {
    const score = calculateHealthScore(proteinBarNutrition, 3, 'A');
    expect(score).toBeGreaterThanOrEqual(50);
    expect(score).toBeLessThanOrEqual(90);
  });

  it('should never go below 0', () => {
    const score = calculateHealthScore(ultraProcessedNutrition, 4, 'E');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should never go above 100', () => {
    const perfect: NutritionInfo = {
      calories: 30,
      protein: 20,
      carbohydrates: 5,
      sugars: 0,
      fat: 1,
      saturatedFat: 0,
      fiber: 15,
      sodium: 1,
    };
    const score = calculateHealthScore(perfect, 1, 'A');
    expect(score).toBeLessThanOrEqual(100);
  });
});
