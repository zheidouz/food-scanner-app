import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { FoodProduct, FoodAnalysis } from '../../../shared/types';

// Change this to your backend URL
// For local development with Expo: use your computer's IP
// For production: use your deployed backend URL
export const API_BASE_URL = 'http://localhost:3001/api';

const SCAN_HISTORY_KEY = 'scan_history';
const PRODUCT_CACHE_PREFIX = 'product_cache_';
const PRODUCT_CACHE_INDEX = 'product_cache_index';
const PRODUCT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface StoredScan {
  id: string;
  timestamp: number;
  barcode: string;
  productName: string;
  brand: string;
  healthScore: number;
  nutriScore: string;
  imageUrl?: string;
}

/**
 * Save a scan to local history
 */
export async function saveScanToHistory(scan: StoredScan): Promise<void> {
  try {
    const existing = await getScanHistory();
    existing.unshift(scan);
    const trimmed = existing.slice(0, 100);
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save scan history:', err);
  }
}

/**
 * Get all scan history
 */
export async function getScanHistory(): Promise<StoredScan[]> {
  try {
    const data = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load scan history:', err);
    return [];
  }
}

/**
 * Clear scan history
 */
export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}

// ========================================
// Offline Product Cache
// ========================================

interface CachedProductData {
  product: FoodProduct;
  analysis: FoodAnalysis;
  cachedAt: number;
  barcode: string;
}

/**
 * Cache a scan result for offline access
 */
export async function cacheProduct(
  barcode: string,
  product: FoodProduct,
  analysis: FoodAnalysis
): Promise<void> {
  try {
    const data: CachedProductData = {
      product,
      analysis,
      cachedAt: Date.now(),
      barcode,
    };
    await AsyncStorage.setItem(`${PRODUCT_CACHE_PREFIX}${barcode}`, JSON.stringify(data));

    // Track in index for cleanup
    const index = await getCacheIndex();
    if (!index.includes(barcode)) {
      index.push(barcode);
      await AsyncStorage.setItem(PRODUCT_CACHE_INDEX, JSON.stringify(index));
    }
  } catch (err) {
    console.error('Failed to cache product:', err);
  }
}

/**
 * Get a cached product by barcode. Returns null if not cached or expired.
 */
export async function getCachedProduct(
  barcode: string
): Promise<{ product: FoodProduct; analysis: FoodAnalysis } | null> {
  try {
    const raw = await AsyncStorage.getItem(`${PRODUCT_CACHE_PREFIX}${barcode}`);
    if (!raw) return null;

    const data: CachedProductData = JSON.parse(raw);

    // Check TTL
    if (Date.now() - data.cachedAt > PRODUCT_CACHE_TTL_MS) {
      await AsyncStorage.removeItem(`${PRODUCT_CACHE_PREFIX}${barcode}`);
      return null;
    }

    return { product: data.product, analysis: data.analysis };
  } catch {
    return null;
  }
}

/**
 * Get all cached barcodes (for index display)
 */
async function getCacheIndex(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PRODUCT_CACHE_INDEX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all cached products
 */
export async function clearProductCache(): Promise<void> {
  try {
    const index = await getCacheIndex();
    const keys = index.map((barcode: string) => `${PRODUCT_CACHE_PREFIX}${barcode}`);
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
    }
    await AsyncStorage.removeItem(PRODUCT_CACHE_INDEX);
  } catch (err) {
    console.error('Failed to clear product cache:', err);
  }
}

// ========================================
// Secure API Key Storage
// ========================================

const SECURE_API_KEY_KEY = 'deepseek_api_key';

/**
 * Save DeepSeek API key to secure storage
 */
export async function setSecureApiKey(key: string): Promise<void> {
  try {
    if (key.trim()) {
      await SecureStore.setItemAsync(SECURE_API_KEY_KEY, key.trim());
    } else {
      await SecureStore.deleteItemAsync(SECURE_API_KEY_KEY);
    }
  } catch (err) {
    // Fallback to AsyncStorage if SecureStore unavailable
    console.warn('SecureStore unavailable, falling back to AsyncStorage:', err);
    if (key.trim()) {
      await AsyncStorage.setItem(SECURE_API_KEY_KEY, key.trim());
    } else {
      await AsyncStorage.removeItem(SECURE_API_KEY_KEY);
    }
  }
}

/**
 * Get DeepSeek API key from secure storage
 */
export async function getSecureApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_API_KEY_KEY);
  } catch {
    // Fallback to AsyncStorage
    try {
      return await AsyncStorage.getItem(SECURE_API_KEY_KEY);
    } catch {
      return null;
    }
  }
}

/**
 * Check if a custom API key is stored
 */
export async function hasSecureApiKey(): Promise<boolean> {
  const key = await getSecureApiKey();
  return key !== null && key.length > 0;
}
