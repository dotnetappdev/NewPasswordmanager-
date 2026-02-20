import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers } from '../services/DatabaseService';
import { useDatabase } from '../context/DatabaseContext';
import AccountCard from '../components/AccountCard';
import { User } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { db } = useDatabase();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const all = await getAllUsers(db);
      setUsers(all);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSelectUser = (user: User) => {
    navigation.navigate('CreateAccount' as any, { selectedUser: user } as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#0f0f23' : '#f8fafc' }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f23' : '#f8fafc'}
      />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#6366f1" />
        </View>
        <Text style={[styles.appName, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>
          Password Manager
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Select your account to continue
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <AccountCard user={item} onPress={handleSelectUser} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={64}
                color={isDark ? '#334155' : '#cbd5e1'}
              />
              <Text style={[styles.emptyText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                No accounts yet
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateAccount')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Create New Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#6366f122',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
  },
  loader: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
