import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../theme';
import { HealthScoreGauge } from '../components/HealthScoreGauge';
import { NutriScoreBadge } from '../components/NutriScoreBadge';
import { NovaBadge } from '../components/NovaBadge';
import { GoodBadCard } from '../components/GoodBadCard';
import { ErrorState } from '../components/ErrorState';
import type { FoodProduct, FoodAnalysis } from '../../../shared/types';

interface Props {
  route: {
    params: {
      product: FoodProduct;
      analysis: FoodAnalysis;
      error?: string;
    };
  };
  navigation: any;
}

export function ResultScreen({ route, navigation }: Props) {
  const { product, analysis, error } = route.params;

  if (!product || !analysis) {
    return (
      <ErrorState
        title="Scan Failed"
        message={error || 'Could not analyze this product.'}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  const novaLabels: Record<number, string> = {
    1: 'Unprocessed',
    2: 'Culinary Ingredient',
    3: 'Processed',
    4: 'Ultra-Processed',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Header */}
        <View style={styles.productHeader}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
        </View>

        {/* Health Score Gauge */}
        <View style={styles.scoreSection}>
          <HealthScoreGauge score={analysis.healthScore} />
          <View style={styles.scoreBadges}>
            <NutriScoreBadge score={analysis.nutriScore} />
            <NovaBadge group={analysis.novaGroup} label={novaLabels[analysis.novaGroup]} />
          </View>
        </View>

        {/* Warning if AI analysis was partial */}
        {error && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Good vs Bad */}
        <View style={styles.goodBadSection}>
          <GoodBadCard
            type="good"
            title="The Good"
            items={analysis.goodPoints}
            emptyMessage="No positive highlights detected."
          />
          <GoodBadCard
            type="bad"
            title="The Bad"
            items={analysis.badPoints}
            emptyMessage="No red flags detected!"
          />
        </View>

        {/* Allergens */}
        {analysis.allergens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Allergens</Text>
            <View style={styles.tagContainer}>
              {analysis.allergens.map((allergen, i) => (
                <View key={i} style={styles.allergenTag}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additives */}
        {analysis.additives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Additives</Text>
            {analysis.additives.map((additive, i) => (
              <View key={i} style={styles.additiveRow}>
                <View style={styles.additiveHeader}>
                  <Text style={styles.additiveName}>
                    {additive.name}
                    {additive.eNumber ? ` (${additive.eNumber})` : ''}
                  </Text>
                  <View
                    style={[
                      styles.riskBadge,
                      additive.risk === 'high'
                        ? styles.riskHigh
                        : additive.risk === 'medium'
                        ? styles.riskMedium
                        : styles.riskLow,
                    ]}
                  >
                    <Text style={styles.riskText}>{additive.risk}</Text>
                  </View>
                </View>
                <Text style={styles.additiveDesc}>{additive.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Nutrition (per 100g)</Text>
          <View style={styles.nutritionGrid}>
            <NutritionRow label="Calories" value={`${product.nutrition.calories} kcal`} />
            <NutritionRow label="Protein" value={`${product.nutrition.protein}g`} />
            <NutritionRow label="Carbs" value={`${product.nutrition.carbohydrates}g`} />
            <NutritionRow label="Sugars" value={`${product.nutrition.sugars}g`} highlight={product.nutrition.sugars > 22.5} />
            <NutritionRow label="Fat" value={`${product.nutrition.fat}g`} />
            <NutritionRow label="Sat. Fat" value={`${product.nutrition.saturatedFat}g`} highlight={product.nutrition.saturatedFat > 5} />
            <NutritionRow label="Fiber" value={`${product.nutrition.fiber}g`} highlight={product.nutrition.fiber >= 6} />
            <NutritionRow label="Sodium" value={`${product.nutrition.sodium}mg`} highlight={product.nutrition.sodium > 600} />
          </View>
        </View>

        {/* Labels */}
        {product.labels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Labels</Text>
            <View style={styles.tagContainer}>
              {product.labels.map((label, i) => (
                <View key={i} style={styles.labelTag}>
                  <Text style={styles.labelText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.actionButtonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.nutritionRow, highlight && styles.nutritionRowHighlight]}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={[styles.nutritionValue, highlight && styles.nutritionValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  productHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  productImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    fontSize: 48,
  },
  productName: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  productBrand: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  scoreBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  warningText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '500',
  },
  goodBadSection: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  allergenTag: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  allergenText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
  },
  labelTag: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  labelText: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  additiveRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  additiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  additiveName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  additiveDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  riskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  riskHigh: {
    backgroundColor: '#FFEBEE',
  },
  riskMedium: {
    backgroundColor: '#FFF8E1',
  },
  riskLow: {
    backgroundColor: '#E8F5E9',
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nutritionGrid: {
    gap: 0,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  nutritionRowHighlight: {
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  nutritionLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  nutritionValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  nutritionValueHighlight: {
    color: theme.colors.error,
  },
  actions: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  actionButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
