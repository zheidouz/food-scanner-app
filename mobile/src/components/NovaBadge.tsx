import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import type { NovaGroup } from '@shared/types';

interface Props {
  group: NovaGroup;
  label: string;
}

const novaColors: Record<NovaGroup, string> = {
  1: theme.colors.nutriA,
  2: theme.colors.nutriB,
  3: theme.colors.nutriC,
  4: theme.colors.nutriE,
};

export function NovaBadge({ group, label }: Props) {
  const color = novaColors[group];

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={[styles.novaText, { color }]}>NOVA {group}</Text>
      <Text style={[styles.labelText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 72,
  },
  novaText: {
    fontSize: 18,
    fontWeight: '800',
  },
  labelText: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
});
