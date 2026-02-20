import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vault } from '../types';

interface VaultCardProps {
  vault: Vault;
  entryCount: number;
  onPress: () => void;
}

const VAULT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
];

function getVaultColor(id: number): string {
  return VAULT_COLORS[id % VAULT_COLORS.length];
}

export default function VaultCard({ vault, entryCount, onPress }: VaultCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const color = getVaultColor(vault.id);
  const iconName = (vault.iconName ?? 'folder') as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#1e1e3f' : '#fff' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
        <Ionicons name={iconName} size={28} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: isDark ? '#e2e8f0' : '#1e293b' }]} numberOfLines={1}>
          {vault.name}
        </Text>
        <Text style={[styles.count, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          {entryCount} {entryCount === 1 ? 'item' : 'items'}
        </Text>
        {vault.description ? (
          <Text
            style={[styles.description, { color: isDark ? '#64748b' : '#94a3b8' }]}
            numberOfLines={1}
          >
            {vault.description}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDark ? '#475569' : '#cbd5e1'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
});
