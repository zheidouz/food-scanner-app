import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Alert, ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { getSecureApiKey, setSecureApiKey, hasSecureApiKey } from '../services/api';

export function ProfileScreen() {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const exists = await hasSecureApiKey();
    setHasKey(exists);
    if (exists) {
      const key = await getSecureApiKey();
      setApiKey(key || '');
    }
  };

  // Hidden developer mode: tap title 5 times
  const handleTitleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setShowApiKeyInput(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 3000);
  };

  const handleSaveApiKey = async () => {
    await setSecureApiKey(apiKey);
    setHasKey(apiKey.trim().length > 0);
    Alert.alert(
      hasKey ? 'API Key Updated' : 'API Key Removed',
      hasKey
        ? 'Your custom DeepSeek API key has been saved securely. It will be used for all future scans.'
        : 'API key has been removed. The app will use the server\'s default key.',
    );
  };

  const handleClearApiKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your custom API key? The server default will be used.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setApiKey('');
            await setSecureApiKey('');
            setHasKey(false);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleTitleTap}>
            <Text style={styles.headerTitle}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Personalization features coming soon.
          </Text>

          {/* API Key Section (hidden unless activated) */}
          {showApiKeyInput && (
            <View style={styles.apiKeySection}>
              <Text style={styles.sectionTitle}>🔑 Custom DeepSeek API Key</Text>
              <Text style={styles.sectionDesc}>
                Enter your own DeepSeek API key to use your own quota.
                {hasKey ? ' Key is currently set.' : ' No custom key set.'}
              </Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="sk-..."
                placeholderTextColor={theme.colors.textTertiary}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <View style={styles.apiKeyActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveApiKey}>
                  <Text style={styles.saveBtnText}>
                    {hasKey ? 'Update Key' : 'Save Key'}
                  </Text>
                </TouchableOpacity>
                {hasKey && (
                  <TouchableOpacity style={styles.removeBtn} onPress={handleClearApiKey}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Feature list */}
          <View style={styles.featureList}>
            <FeatureRow icon="🥜" text="Allergen Preferences" coming />
            <FeatureRow icon="🥗" text="Dietary Goals" coming />
            <FeatureRow icon="📊" text="Weekly Nutrition Summary" coming />
            <FeatureRow
              icon="🔑"
              text={`Custom API Key${hasKey ? ' (set)' : ''}`}
              onPress={() => setShowApiKeyInput(true)}
            />
          </View>

          <Text style={styles.versionText}>
            Food Scanner v1.0.0 — Tap title 5x for developer settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon, text, coming, onPress,
}: {
  icon: string;
  text: string;
  coming?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.featureRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
      {coming && (
        <View style={styles.comingBadge}>
          <Text style={styles.comingText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
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
  apiKeySection: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineLight,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  apiKeyInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.sm,
  },
  apiKeyActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  saveBtn: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  removeBtnText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    ...theme.typography.label,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
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
