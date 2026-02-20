import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { User, UserRole } from '../types';
import { useColorScheme } from 'react-native';

interface AccountCardProps {
  user: User;
  onPress: (user: User) => void;
}

function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return '#6366f1';
    case UserRole.User:
      return '#ec4899';
    case UserRole.Child:
      return '#10b981';
    default:
      return '#6366f1';
  }
}

export default function AccountCard({ user, onPress }: AccountCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const avatarColor = user.avatarColor ?? getRoleColor(user.role);
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#1e1e3f' : '#fff' }]}
      onPress={() => onPress(user)}
      activeOpacity={0.8}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={[styles.username, { color: isDark ? '#e2e8f0' : '#1e293b' }]} numberOfLines={1}>
        {user.username}
      </Text>
      <View style={[styles.roleBadge, { backgroundColor: avatarColor + '33' }]}>
        <Text style={[styles.roleText, { color: avatarColor }]}>{user.role}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  initials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
