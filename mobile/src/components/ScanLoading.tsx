import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../theme';

interface Props {
  message?: string;
}

export function ScanLoading({ message = 'Analyzing...' }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse the center circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animated dots
    const animateDot = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateDot(dot1Anim, 0);
    animateDot(dot2Anim, 200);
    animateDot(dot3Anim, 400);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Spinning food icons */}
        <View style={styles.ringContainer}>
          <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
            {['🥗', '🍎', '🥑', '🍊', '🥦', '🍇', '🥕', '🍋'].map((emoji, i) => {
              const angle = (i / 8) * 360;
              return (
                <View
                  key={i}
                  style={[
                    styles.emojiDot,
                    {
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateX: 55 },
                        { rotate: `${-angle}deg` },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
              );
            })}
          </Animated.View>
        </View>

        {/* Pulsing center */}
        <Animated.View
          style={[
            styles.centerCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.centerIcon}>🔍</Text>
        </Animated.View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          {[dot1Anim, dot2Anim, dot3Anim].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ring: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  centerCircle: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    top: 42,
    ...theme.shadows.md,
  },
  centerIcon: {
    fontSize: 24,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
