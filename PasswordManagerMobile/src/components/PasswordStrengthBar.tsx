import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PasswordStrengthResult, PasswordStrength } from '../types';

interface PasswordStrengthBarProps {
  result: PasswordStrengthResult;
}

export default function PasswordStrengthBar({ result }: PasswordStrengthBarProps) {
  const segments = 5;
  const filledCount = result.score + 1;

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor:
                  i < filledCount ? result.color : '#e2e8f0',
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: result.color }]}>{result.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
});
