import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import type { GoodPoint, BadPoint } from '../../../shared/types';

type CardType = 'good' | 'bad';

interface Props {
  type: CardType;
  title: string;
  items: (GoodPoint | BadPoint)[];
  emptyMessage: string;
}

export function GoodBadCard({ type, title, items, emptyMessage }: Props) {
  const isGood = type === 'good';
  const accentColor = isGood ? theme.colors.goodGreen : theme.colors.badRed;
  const bgColor = isGood ? '#E8F5E9' : '#FFEBEE';

  if (items.length === 0) {
    return (
      <View style={[styles.container, { borderLeftColor: accentColor }]}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderLeftColor: accentColor }]}>
      <Text style={[styles.title, { color: accentColor }]}>
        {title} ({items.length})
      </Text>
      {items.map((item, i) => (
        <View
          key={i}
          style={[styles.itemRow, (i + 1) < items.length && styles.itemBorder]}
        >
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {'severity' in item && item.severity && (
                <SeverityBadge severity={(item as BadPoint).severity} />
              )}
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: { bg: '#E8F5E9', text: '#2E7D32' },
    medium: { bg: '#FFF8E1', text: '#F57F17' },
    high: { bg: '#FFEBEE', text: '#C62828' },
  };

  const c = colors[severity];
  return (
    <View style={[styles.severityBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.severityText, { color: c.text }]}>{severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: theme.spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  itemDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  severityBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
