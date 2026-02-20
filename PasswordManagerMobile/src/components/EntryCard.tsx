import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordEntry, EntryType } from '../types';

interface EntryCardProps {
  entry: PasswordEntry;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

function getEntryIcon(type: EntryType): { name: keyof typeof Ionicons.glyphMap; color: string } {
  switch (type) {
    case EntryType.Login:
      return { name: 'key', color: '#6366f1' };
    case EntryType.CreditCard:
      return { name: 'card', color: '#ec4899' };
    case EntryType.SecureNote:
      return { name: 'document-text', color: '#f59e0b' };
    case EntryType.CustomFile:
      return { name: 'attach', color: '#10b981' };
    case EntryType.Passkey:
      return { name: 'finger-print', color: '#8b5cf6' };
    default:
      return { name: 'lock-closed', color: '#6366f1' };
  }
}

export default function EntryCard({ entry, onPress, onFavoriteToggle }: EntryCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { name: iconName, color: iconColor } = getEntryIcon(entry.type);

  const subtitle =
    entry.username ?? entry.email ?? entry.cardholderName ?? entry.relyingPartyName ?? entry.type;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#1e1e3f' : '#fff' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#e2e8f0' : '#1e293b' }]} numberOfLines={1}>
          {entry.title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={onFavoriteToggle} style={styles.favoriteBtn} hitSlop={8}>
        <Ionicons
          name={entry.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={entry.isFavorite ? '#ef4444' : isDark ? '#475569' : '#cbd5e1'}
        />
      </TouchableOpacity>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDark ? '#475569' : '#cbd5e1'}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  favoriteBtn: {
    padding: 4,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
});
