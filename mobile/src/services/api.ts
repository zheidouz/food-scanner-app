import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// For local development with Expo: use your computer's IP
// For production: use your deployed backend URL
export const API_BASE_URL = 'http://localhost:3001/api';

const SCAN_HISTORY_KEY = 'scan_history';

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
    existing.unshift(scan); // Add to front
    // Keep max 100 scans
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
