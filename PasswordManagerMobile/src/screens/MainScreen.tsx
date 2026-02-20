import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import {
  getVaultsByUser,
  createVault,
  deleteVault,
  getEntriesByVault,
} from '../services/DatabaseService';
import VaultCard from '../components/VaultCard';
import { Vault, UserRole } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MainScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { db } = useDatabase();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vaultEntryCounts, setVaultEntryCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAddVault, setShowAddVault] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDesc, setNewVaultDesc] = useState('');

  const loadVaults = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const v = await getVaultsByUser(db, user.id);
      setVaults(v);
      const counts: Record<number, number> = {};
      await Promise.all(
        v.map(async (vault) => {
          const entries = await getEntriesByVault(db, vault.id, user.id);
          counts[vault.id] = entries.length;
        }),
      );
      setVaultEntryCounts(counts);
    } finally {
      setLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  const handleAddVault = async () => {
    if (!newVaultName.trim() || !user) return;
    await createVault(db, user.id, newVaultName.trim(), newVaultDesc.trim() || undefined);
    setNewVaultName('');
    setNewVaultDesc('');
    setShowAddVault(false);
    loadVaults();
  };

  const handleDeleteVault = (vault: Vault) => {
    Alert.alert(
      'Delete Vault',
      `Delete "${vault.name}"? All entries inside will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteVault(db, vault.id);
            loadVaults();
          },
        },
      ],
    );
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f0f23' : '#f1f5f9';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';

  const avatarColor = user?.avatarColor ?? '#6366f1';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: mutedColor }]}>Good day,</Text>
          <Text style={[styles.username, { color: textColor }]}>{user?.username}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: avatarColor }]}
            onPress={() =>
              Alert.alert('Account', user?.username ?? '', [
                { text: 'Settings', onPress: () => {} },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
          >
            <Text style={styles.avatarText}>
              {user?.username?.slice(0, 2).toUpperCase() ?? 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: cardBg }]}>
          <Ionicons name="folder" size={20} color="#6366f1" />
          <Text style={[styles.statValue, { color: textColor }]}>{vaults.length}</Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>Vaults</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBg }]}>
          <Ionicons name="key" size={20} color="#ec4899" />
          <Text style={[styles.statValue, { color: textColor }]}>
            {Object.values(vaultEntryCounts).reduce((a, b) => a + b, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>Entries</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBg }]}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={[styles.statValue, { color: textColor }]}>{user?.role}</Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>Role</Text>
        </View>
      </View>

      {/* Vaults */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Your Vaults</Text>
        {user?.role !== UserRole.Child && (
          <TouchableOpacity onPress={() => setShowAddVault(true)}>
            <Ionicons name="add-circle" size={28} color="#6366f1" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList
          data={vaults}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VaultCard
              vault={item}
              entryCount={vaultEntryCounts[item.id] ?? 0}
              onPress={() =>
                navigation.navigate('VaultDetail', {
                  vaultId: item.id,
                  vaultName: item.name,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={isDark ? '#334155' : '#cbd5e1'} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>No vaults yet</Text>
              <Text style={[styles.emptySubtext, { color: mutedColor }]}>
                Tap + to create your first vault
              </Text>
            </View>
          }
        />
      )}

      {/* Add Vault Modal */}
      <Modal visible={showAddVault} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>New Vault</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={newVaultName}
              onChangeText={setNewVaultName}
              placeholder="Vault name"
              placeholderTextColor={mutedColor}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={newVaultDesc}
              onChangeText={setNewVaultDesc}
              placeholder="Description (optional)"
              placeholderTextColor={mutedColor}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor }]}
                onPress={() => {
                  setNewVaultName('');
                  setNewVaultDesc('');
                  setShowAddVault(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: mutedColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleAddVault}
              >
                <Text style={styles.modalBtnTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 13 },
  username: { fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  loader: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptySubtext: { fontSize: 14, marginTop: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBtnPrimary: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
  modalBtnTextPrimary: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
