import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../theme';

interface Props {
  title: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info' | 'offline';
}

export function ErrorState({ title, message, onRetry, variant = 'error' }: Props) {
  const config = {
    error: {
      icon: '❌',
      bgColor: '#FFEBEE',
      borderColor: '#EF9A9A',
    },
    warning: {
      icon: '⚠️',
      bgColor: '#FFF8E1',
      borderColor: '#FFE082',
    },
    info: {
      icon: 'ℹ️',
      bgColor: '#E3F2FD',
      borderColor: '#90CAF9',
    },
    offline: {
      icon: '📡',
      bgColor: '#F3E5F5',
      borderColor: '#CE93D8',
    },
  };

  const c = config[variant];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.card, { backgroundColor: c.bgColor, borderColor: c.borderColor }]}>
        <Text style={styles.icon}>{c.icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    height: 48,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
