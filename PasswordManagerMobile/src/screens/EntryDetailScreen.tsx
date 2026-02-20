import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Clipboard,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { getEntryById, deleteEntry, toggleFavorite } from '../services/DatabaseService';
import { decrypt } from '../services/EncryptionService';
import { PasswordEntry, EntryType, UserRole } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'EntryDetail'>;

interface SecretFieldProps {
  label: string;
  value: string;
  isEncrypted?: boolean;
  masterKey?: string;
  isDark: boolean;
}

function SecretField({ label, value, isEncrypted, masterKey, isDark }: SecretFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [decrypted, setDecrypted] = useState('');

  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const cardBg = isDark ? '#2d2d5f' : '#f8fafc';

  const handleReveal = () => {
    if (!revealed && isEncrypted && value && masterKey) {
      try {
        const plain = decrypt(value, masterKey);
        setDecrypted(plain);
      } catch {
        setDecrypted('Decryption failed');
      }
    }
    setRevealed(!revealed);
  };

  const displayValue = isEncrypted ? (revealed ? decrypted : '••••••••••') : value;

  const handleCopy = () => {
    const toCopy = isEncrypted ? (revealed ? decrypted : '') : value;
    if (!toCopy) {
      Alert.alert('Reveal first', 'Reveal the value before copying');
      return;
    }
    Clipboard.setString(toCopy);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  return (
    <View style={[styles.fieldRow, { backgroundColor: cardBg }]}>
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: mutedColor }]}>{label}</Text>
        <Text style={[styles.fieldValue, { color: textColor }]} selectable={!isEncrypted}>
          {displayValue}
        </Text>
      </View>
      <View style={styles.fieldActions}>
        {isEncrypted && (
          <TouchableOpacity onPress={handleReveal} style={styles.fieldActionBtn}>
            <Ionicons
              name={revealed ? 'eye-off' : 'eye'}
              size={18}
              color="#6366f1"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleCopy} style={styles.fieldActionBtn}>
          <Ionicons name="copy-outline" size={18} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EntryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { db } = useDatabase();
  const { user, masterKey } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const { entryId } = route.params;
  const [entry, setEntry] = useState<PasswordEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const e = await getEntryById(db, entryId);
      setEntry(e);
      setLoading(false);
    })();
  }, [db, entryId]);

  const handleDelete = () => {
    Alert.alert('Delete Entry', `Delete "${entry?.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(db, entryId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    await toggleFavorite(db, entry.id, entry.isFavorite);
    setEntry({ ...entry, isFavorite: !entry.isFavorite });
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <Text style={{ color: textColor }}>Entry not found</Text>
      </View>
    );
  }

  const canEdit = user?.role !== UserRole.Child;
  const mk = masterKey ?? '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {entry.title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
            <Ionicons
              name={entry.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={entry.isFavorite ? '#ef4444' : mutedColor}
            />
          </TouchableOpacity>
          {canEdit && (
            <>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AddEditEntry', {
                    vaultId: entry.vaultId,
                    entryId: entry.id,
                  })
                }
                style={styles.headerBtn}
              >
                <Ionicons name="pencil" size={20} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type badge */}
        <View style={styles.typeBadge}>
          <View style={styles.typeBadgeInner}>
            <Ionicons
              name={
                entry.type === EntryType.Login
                  ? 'key'
                  : entry.type === EntryType.CreditCard
                  ? 'card'
                  : entry.type === EntryType.SecureNote
                  ? 'document-text'
                  : entry.type === EntryType.Passkey
                  ? 'finger-print'
                  : 'attach'
              }
              size={32}
              color="#6366f1"
            />
          </View>
          <Text style={[styles.entryType, { color: mutedColor }]}>{entry.type}</Text>
        </View>

        {/* Category */}
        {entry.category ? (
          <View style={styles.categoryRow}>
            <Ionicons name="pricetag" size={14} color="#6366f1" />
            <Text style={[styles.categoryText, { color: '#6366f1' }]}>{entry.category}</Text>
          </View>
        ) : null}

        {/* Login fields */}
        {entry.type === EntryType.Login && (
          <View style={styles.section}>
            {entry.username ? (
              <SecretField label="Username" value={entry.username} isDark={isDark} />
            ) : null}
            {entry.email ? (
              <SecretField label="Email" value={entry.email} isDark={isDark} />
            ) : null}
            {entry.encryptedPassword ? (
              <SecretField
                label="Password"
                value={entry.encryptedPassword}
                isEncrypted
                masterKey={mk}
                isDark={isDark}
              />
            ) : null}
            {entry.url ? (
              <SecretField label="URL" value={entry.url} isDark={isDark} />
            ) : null}
          </View>
        )}

        {/* Credit Card fields */}
        {entry.type === EntryType.CreditCard && (
          <View style={styles.section}>
            {entry.cardholderName ? (
              <SecretField label="Cardholder" value={entry.cardholderName} isDark={isDark} />
            ) : null}
            {entry.encryptedCardNumber ? (
              <SecretField
                label="Card Number"
                value={entry.encryptedCardNumber}
                isEncrypted
                masterKey={mk}
                isDark={isDark}
              />
            ) : null}
            {entry.expiryDate ? (
              <SecretField label="Expiry" value={entry.expiryDate} isDark={isDark} />
            ) : null}
            {entry.encryptedCvv ? (
              <SecretField
                label="CVV"
                value={entry.encryptedCvv}
                isEncrypted
                masterKey={mk}
                isDark={isDark}
              />
            ) : null}
          </View>
        )}

        {/* Passkey fields */}
        {entry.type === EntryType.Passkey && (
          <View style={styles.section}>
            {entry.relyingPartyId ? (
              <SecretField label="Relying Party ID" value={entry.relyingPartyId} isDark={isDark} />
            ) : null}
            {entry.relyingPartyName ? (
              <SecretField label="Relying Party Name" value={entry.relyingPartyName} isDark={isDark} />
            ) : null}
            {entry.userHandle ? (
              <SecretField label="User Handle" value={entry.userHandle} isDark={isDark} />
            ) : null}
            {entry.credentialId ? (
              <SecretField label="Credential ID" value={entry.credentialId} isDark={isDark} />
            ) : null}
            {entry.counter !== undefined && entry.counter !== null ? (
              <SecretField label="Counter" value={String(entry.counter)} isDark={isDark} />
            ) : null}
            {entry.encryptedPrivateKey ? (
              <SecretField
                label="Private Key"
                value={entry.encryptedPrivateKey}
                isEncrypted
                masterKey={mk}
                isDark={isDark}
              />
            ) : null}
          </View>
        )}

        {/* Secure Note / Custom File */}
        {(entry.type === EntryType.SecureNote || entry.type === EntryType.CustomFile) && (
          <View style={styles.section}>
            {entry.fileName ? (
              <SecretField label="File Name" value={entry.fileName} isDark={isDark} />
            ) : null}
          </View>
        )}

        {/* Notes */}
        {entry.notes ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: mutedColor }]}>Notes</Text>
            <View
              style={[
                styles.notesBox,
                { backgroundColor: isDark ? '#2d2d5f' : '#f8fafc' },
              ]}
            >
              <Text style={[styles.notesText, { color: textColor }]}>{entry.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Timestamps */}
        <View style={styles.timestamps}>
          <Text style={[styles.timestampText, { color: mutedColor }]}>
            Created: {new Date(entry.createdAt).toLocaleDateString()}
          </Text>
          {entry.modifiedAt ? (
            <Text style={[styles.timestampText, { color: mutedColor }]}>
              Modified: {new Date(entry.modifiedAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8 },
  content: { padding: 20, paddingBottom: 48 },
  typeBadge: { alignItems: 'center', marginBottom: 16 },
  typeBadgeInner: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#6366f122',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  entryType: { fontSize: 14, fontWeight: '600' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  categoryText: { fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, marginBottom: 2 },
  fieldValue: { fontSize: 15, fontWeight: '500' },
  fieldActions: { flexDirection: 'row', gap: 4 },
  fieldActionBtn: { padding: 6 },
  notesBox: { borderRadius: 12, padding: 14 },
  notesText: { fontSize: 15, lineHeight: 22 },
  timestamps: { marginTop: 8, gap: 4 },
  timestampText: { fontSize: 12 },
});
