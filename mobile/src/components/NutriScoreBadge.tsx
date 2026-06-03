import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import type { NutriScore } from '../../../shared/types';

interface Props {
  score: NutriScore;
  size?: 'small' | 'large';
}

const scoreColors: Record<NutriScore, string> = {
  A: theme.colors.nutriA,
  B: theme.colors.nutriB,
  C: theme.colors.nutriC,
  D: theme.colors.nutriD,
  E: theme.colors.nutriE,
};

const scoreLabels: Record<NutriScore, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Fair',
  D: 'Poor',
  E: 'Very Poor',
};

export function NutriScoreBadge({ score, size = 'large' }: Props) {
  const color = scoreColors[score];
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, { backgroundColor: color }, isLarge ? styles.large : styles.small]}>
      <Text style={[styles.letter, isLarge ? styles.letterLarge : styles.letterSmall]}>
        {score}
      </Text>
      {isLarge && <Text style={styles.label}>{scoreLabels[score]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  large: {
    width: 72,
    height: 72,
    padding: 4,
  },
  small: {
    width: 32,
    height: 32,
  },
  letter: {
    fontWeight: '800',
    color: '#fff',
  },
  letterLarge: {
    fontSize: 32,
    lineHeight: 36,
  },
  letterSmall: {
    fontSize: 18,
    lineHeight: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
    marginTop: -2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
