import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import {
  getEntriesByVault,
  searchEntries,
  toggleFavorite,
  deleteEntry,
} from '../services/DatabaseService';
import EntryCard from '../components/EntryCard';
import { PasswordEntry, EntryType, UserRole } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'VaultDetail'>;

const FILTER_TYPES = ['All', ...Object.values(EntryType)];

export default function VaultDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { db } = useDatabase();
  const { user } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const { vaultId, vaultName } = route.params;
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const loadEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: PasswordEntry[];
      if (searchQuery.trim()) {
        data = await searchEntries(db, user.id, searchQuery.trim(), filterType);
        data = data.filter((e) => e.vaultId === vaultId);
      } else if (filterType !== 'All') {
        data = await getEntriesByVault(db, vaultId, user.id);
        data = data.filter((e) => e.type === filterType);
      } else {
        data = await getEntriesByVault(db, vaultId, user.id);
      }
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [db, user, vaultId, searchQuery, filterType]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries]),
  );

  const handleToggleFavorite = async (entry: PasswordEntry) => {
    await toggleFavorite(db, entry.id, entry.isFavorite);
    loadEntries();
  };

  const handleDeleteEntry = (entry: PasswordEntry) => {
    Alert.alert('Delete Entry', `Delete "${entry.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(db, entry.id);
          loadEntries();
        },
      },
    ]);
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e1e3f' : '#fff';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>{vaultName}</Text>
        {user?.role !== UserRole.Child && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditEntry', { vaultId })}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor }]}>
        <Ionicons name="search" size={18} color={mutedColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search entries..."
          placeholderTextColor={mutedColor}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={mutedColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTER_TYPES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContent}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filterType === item ? '#6366f1' : isDark ? '#1e1e3f' : '#fff',
                borderColor: filterType === item ? '#6366f1' : borderColor,
              },
            ]}
            onPress={() => setFilterType(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filterType === item ? '#fff' : mutedColor },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.filtersRow}
      />

      {/* Entry count */}
      <Text style={[styles.countText, { color: mutedColor }]}>
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
              onFavoriteToggle={() => handleToggleFavorite(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="lock-open-outline" size={64} color={isDark ? '#334155' : '#cbd5e1'} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                {searchQuery ? 'No matching entries' : 'No entries in this vault'}
              </Text>
              {!searchQuery && user?.role !== UserRole.Child && (
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => navigation.navigate('AddEditEntry', { vaultId })}
                >
                  <Text style={styles.emptyAddBtnText}>Add First Entry</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filtersRow: { marginBottom: 4 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  countText: { paddingHorizontal: 20, fontSize: 13, marginBottom: 4 },
  loader: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 12 },
  emptyAddBtn: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddBtnText: { color: '#fff', fontWeight: '700' },
});
