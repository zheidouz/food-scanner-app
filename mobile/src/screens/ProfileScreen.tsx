import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>
          Personalization features coming in Sprint 2.
        </Text>
        <Text style={styles.description}>
          Soon you'll be able to set dietary preferences, allergies, and health
          goals to get tailored food recommendations.
        </Text>

        <View style={styles.featureList}>
          <FeatureRow icon="🥜" text="Allergen Preferences" coming />
          <FeatureRow icon="🥗" text="Dietary Goals" coming />
          <FeatureRow icon="📊" text="Weekly Nutrition Summary" coming />
          <FeatureRow icon="🔑" text="Custom API Key" coming />
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  text,
  coming,
}: {
  icon: string;
  text: string;
  coming?: boolean;
}) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
      {coming && (
        <View style={styles.comingBadge}>
          <Text style={styles.comingText}>Soon</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  avatarText: {
    fontSize: 36,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  featureList: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  featureText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  comingBadge: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  comingText: {
    ...theme.typography.label,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});
