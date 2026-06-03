import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { theme } from '../theme';
import { ScanLoading } from '../components/ScanLoading';
import type { ScanResponse } from '../../../shared/types';
import {
  API_BASE_URL, saveScanToHistory, getCachedProduct, cacheProduct,
  getSecureApiKey,
} from '../services/api';

type ScanMode = 'camera' | 'manual' | 'search';

interface SearchResult {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    sugars: number;
    fat: number;
    saturatedFat: number;
    fiber: number;
    sodium: number;
  };
}

export function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('camera');
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<any>(null);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Debounced search
  const handleSearchInput = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => performSearch(text.trim()), 400);
  }, []);

  const performSearch = async (query: string) => {
    setSearching(true);
    setError(null);
    try {
      const apiKey = await getSecureApiKey();
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-DeepSeek-Key'] = apiKey;

      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page_size=10`, { headers });
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSelect = async (item: SearchResult) => {
    // Scan the selected product via barcode
    await processBarcode(item.barcode);
  };

  // Photo upload
  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Access Needed',
        'We need access to your photo library to scan food labels from photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const image = result.assets[0];

    // Compress image client-side
    const compressed = await manipulateAsync(
      image.uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    setScanning(true);
    setError(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: compressed.uri,
        type: 'image/jpeg',
        name: 'label.jpg',
      } as any);

      const apiKey = await getSecureApiKey();
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-DeepSeek-Key'] = apiKey;

      const response = await fetch(`${API_BASE_URL}/scan/image`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data: ScanResponse = await response.json();

      if (!data.success || !data.product || !data.analysis) {
        setError(data.error?.message || 'Could not analyze image.');
        setScanning(false);
        return;
      }

      await saveScanToHistory({
        id: `photo-${Date.now()}`,
        timestamp: Date.now(),
        barcode: 'photo-scan',
        productName: data.product.name,
        brand: data.product.brand,
        healthScore: data.analysis.healthScore,
        nutriScore: data.analysis.nutriScore,
        imageUrl: image.uri,
      });

      navigation.navigate('Result', {
        product: data.product,
        analysis: data.analysis,
        error: data.error?.message,
      });
    } catch (err) {
      setError('Upload failed. Try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanning) return;
    setScanning(true);
    setError(null);

    // Haptic feedback on scan
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await processBarcode(data);
  };

  const handleManualSubmit = async () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) {
      setError('Please enter a barcode number');
      return;
    }
    setScanning(true);
    setError(null);
    await processBarcode(trimmed);
  };

  const processBarcode = async (barcode: string) => {
    try {
      const apiKey = await getSecureApiKey();
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-DeepSeek-Key'] = apiKey;

      const response = await fetch(`${API_BASE_URL}/scan/${barcode}`, { headers });
      const data: ScanResponse = await response.json();

      if (!data.success || !data.product || !data.analysis) {
        // Try offline cache before giving up
        const cached = await getCachedProduct(barcode);
        if (cached) {
          await saveScanToHistory({
            id: `${barcode}-${Date.now()}`,
            timestamp: Date.now(),
            barcode,
            productName: cached.product.name,
            brand: cached.product.brand,
            healthScore: cached.analysis.healthScore,
            nutriScore: cached.analysis.nutriScore,
            imageUrl: cached.product.imageUrl,
          });
          navigation.navigate('Result', {
            product: cached.product,
            analysis: cached.analysis,
            cached: true,
          });
          return;
        }
        setError(data.error?.message || 'Could not find product.');
        setScanning(false);
        return;
      }

      // Cache the result for offline use
      await cacheProduct(barcode, data.product, data.analysis);

      // Save to scan history
      await saveScanToHistory({
        id: `${barcode}-${Date.now()}`,
        timestamp: Date.now(),
        barcode,
        productName: data.product.name,
        brand: data.product.brand,
        healthScore: data.analysis.healthScore,
        nutriScore: data.analysis.nutriScore,
        imageUrl: data.product.imageUrl,
      });

      // Navigate to result screen
      navigation.navigate('Result', {
        product: data.product,
        analysis: data.analysis,
        error: data.error?.message,
      });
    } catch (err) {
      // Network error — try offline cache
      const cached = await getCachedProduct(barcode);
      if (cached) {
        await saveScanToHistory({
          id: `${barcode}-${Date.now()}`,
          timestamp: Date.now(),
          barcode,
          productName: cached.product.name,
          brand: cached.product.brand,
          healthScore: cached.analysis.healthScore,
          nutriScore: cached.analysis.nutriScore,
          imageUrl: cached.product.imageUrl,
        });
        navigation.navigate('Result', {
          product: cached.product,
          analysis: cached.analysis,
          cached: true,
        });
        return;
      }
      setError('Network error. Offline data not available for this product.');
    } finally {
      setScanning(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Food Scanner</Text>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Camera Access Needed</Text>
          <Text style={styles.subtitle}>
            We need camera access to scan food barcodes and labels.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => setMode('manual')}
          >
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>
              Enter Barcode Manually
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== CAMERA MODE ===== */}
      {mode === 'camera' ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Point camera at barcode</Text>
            </View>
          </CameraView>

          {scanning && <ScanLoading message="Scanning product..." />}

          {/* Bottom actions row */}
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.cameraActionBtn} onPress={handlePhotoUpload}>
              <Text style={styles.cameraActionIcon}>🖼️</Text>
              <Text style={styles.cameraActionLabel}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraActionBtn} onPress={() => setMode('manual')}>
              <Text style={styles.cameraActionIcon}>⌨️</Text>
              <Text style={styles.cameraActionLabel}>Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraActionBtn} onPress={() => setMode('search')}>
              <Text style={styles.cameraActionIcon}>🔍</Text>
              <Text style={styles.cameraActionLabel}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : mode === 'search' ? (
        /* ===== SEARCH MODE ===== */
        <View style={styles.manualContainer}>
          <Text style={styles.title}>Search Products</Text>
          <Text style={styles.subtitle}>
            Type a product name to find it in our database.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Coca-Cola, oatmeal..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchInput}
            returnKeyType="search"
            autoFocus
          />

          {searching && <ScanLoading message="Searching..." />}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.barcode}
              style={styles.searchResultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSearchSelect(item)}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.searchResultImage} />
                  ) : (
                    <View style={styles.searchResultImagePlaceholder}>
                      <Text style={styles.searchResultEmoji}>🍽️</Text>
                    </View>
                  )}
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.searchResultBrand} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <Text style={styles.searchResultCals}>
                      ~{item.nutrition.calories} kcal/100g
                    </Text>
                  </View>
                  <Text style={styles.searchResultArrow}>→</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <Text style={styles.noResults}>No products found. Try a different search.</Text>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => {
              setMode('camera');
              setError(null);
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>
              Use Camera
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ===== MANUAL BARCODE MODE ===== */
        <View style={styles.manualContainer}>
          <Text style={styles.title}>Enter Barcode</Text>
          <Text style={styles.subtitle}>
            Type the barcode number found on the product packaging.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. 5901234123457"
            placeholderTextColor={theme.colors.textTertiary}
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleManualSubmit}
            maxLength={13}
          />

          {scanning && <ScanLoading message="Searching barcode..." />}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, scanning && styles.buttonDisabled]}
            onPress={handleManualSubmit}
            disabled={scanning}
          >
            <Text style={styles.buttonText}>{scanning ? 'Searching...' : 'Scan Product'}</Text>
          </TouchableOpacity>

          <View style={styles.manualLinks}>
            <TouchableOpacity onPress={() => setMode('camera')}>
              <Text style={styles.linkText}>Use Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('search')}>
              <Text style={styles.linkText}>Search Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scanHint: {
    color: '#fff',
    fontSize: 16,
    marginTop: theme.spacing.lg,
    fontWeight: '500',
  },

  manualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraActionBtn: {
    alignItems: 'center',
    padding: 8,
  },
  cameraActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  cameraActionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchInput: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  searchResultsList: {
    width: '100%',
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchResultImage: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  searchResultImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  searchResultEmoji: {
    fontSize: 20,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  searchResultBrand: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchResultCals: {
    ...theme.typography.label,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  searchResultArrow: {
    fontSize: 20,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
  noResults: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  manualLinks: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: theme.spacing.md,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
