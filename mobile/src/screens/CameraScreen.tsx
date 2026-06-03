import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { ScanLoading } from '../components/ScanLoading';
import type { ScanResponse } from '../../../shared/types';
import { API_BASE_URL, saveScanToHistory, getCachedProduct, cacheProduct } from '../services/api';

type ScanMode = 'camera' | 'manual';

export function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('camera');
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

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
      const response = await fetch(`${API_BASE_URL}/scan/${barcode}`);
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

          <TouchableOpacity
            style={styles.manualSwitch}
            onPress={() => setMode('manual')}
          >
            <Text style={styles.manualSwitchText}>Enter barcode manually</Text>
          </TouchableOpacity>
        </View>
      ) : (
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

          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => {
              setMode('camera');
              setError(null);
              setManualBarcode('');
            }}
          >
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>
              Use Camera
            </Text>
          </TouchableOpacity>
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
  manualSwitch: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: theme.borderRadius.full,
  },
  manualSwitchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  manualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
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
