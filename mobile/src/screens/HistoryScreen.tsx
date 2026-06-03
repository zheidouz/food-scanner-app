import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getScanHistory, clearScanHistory, type StoredScan } from '../services/api';

export function HistoryScreen({ navigation }: any) {
  const [scans, setScans] = useState<StoredScan[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const data = await getScanHistory();
    setScans(data);
  };

  const handleClear = () => {
    Alert.alert('Clear History', 'Are you sure you want to clear all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearScanHistory();
          setScans([]);
        },
      },
    ]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.scoreExcellent;
    if (score >= 60) return theme.colors.scoreGood;
    if (score >= 40) return theme.colors.scoreFair;
    if (score >= 20) return theme.colors.scorePoor;
    return theme.colors.scoreBad;
  };

  const renderItem = ({ item }: { item: StoredScan }) => (
    <TouchableOpacity style={styles.scanItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.scanImage} />
      ) : (
        <View style={styles.scanImagePlaceholder}>
          <Text style={styles.placeholderEmoji}>🍽️</Text>
        </View>
      )}
      <View style={styles.scanInfo}>
        <Text style={styles.scanName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.scanBrand} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.scanDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.scoreContainer}>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: getScoreColor(item.healthScore) },
          ]}
        >
          <Text style={styles.scoreText}>{item.healthScore}</Text>
        </View>
        <Text style={styles.nutriScoreText}>{item.nutriScore}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Scans Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start scanning food products to build your history.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        {scans.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={scans.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  clearText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  scanImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  scanImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scanBrand: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scanDate: {
    ...theme.typography.label,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  nutriScoreText: {
    ...theme.typography.label,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
