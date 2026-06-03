import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  score: number; // 0–100
  size?: number;
}

export function HealthScoreGauge({ score, size = 200 }: Props) {
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;

  // Score to color mapping
  const getColor = (s: number) => {
    if (s >= 80) return theme.colors.scoreExcellent;
    if (s >= 60) return theme.colors.scoreGood;
    if (s >= 40) return theme.colors.scoreFair;
    if (s >= 20) return theme.colors.scorePoor;
    return theme.colors.scoreBad;
  };

  const color = getColor(score);
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <View style={styles.container}>
      <View style={[styles.gauge, { width: size, height: size }]}>
        {/* SVG-based circular gauge */}
        <View style={styles.gaugeContent}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={styles.labelText}>Health Score</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gauge: {
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    borderWidth: 6,
    borderColor: theme.colors.outlineLight,
  },
  gaugeContent: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -2,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
