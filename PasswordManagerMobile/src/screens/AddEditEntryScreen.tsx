import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { getEntryById, createEntry, updateEntry } from '../services/DatabaseService';
import { encrypt, decrypt } from '../services/EncryptionService';
import { generatePassword, evaluatePasswordStrength, DEFAULT_OPTIONS } from '../services/PasswordGeneratorService';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { PasswordEntry, EntryType } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'AddEditEntry'>;

const ENTRY_TYPES = Object.values(EntryType);

export default function AddEditEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { db } = useDatabase();
  const { masterKey } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const { vaultId, entryId } = route.params;
  const isEdit = !!entryId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Common fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntryType>(EntryType.Login);
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Login fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState('');

  // Credit card fields
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Passkey fields
  const [relyingPartyId, setRelyingPartyId] = useState('');
  const [relyingPartyName, setRelyingPartyName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [counter, setCounter] = useState('');

  // Secure Note / Custom File
  const [fileName, setFileName] = useState('');

  const strengthResult = evaluatePasswordStrength(password);

  // Load existing entry for editing
  useEffect(() => {
    if (!isEdit || !entryId) return;
    (async () => {
      const e = await getEntryById(db, entryId);
      if (!e) {
        setLoading(false);
        return;
      }
      const mk = masterKey ?? '';
      setTitle(e.title);
      setType(e.type);
      setCategory(e.category ?? '');
      setNotes(e.notes ?? '');
      setIsFavorite(e.isFavorite);
      setUsername(e.username ?? '');
      setEmail(e.email ?? '');
      if (e.encryptedPassword && mk) {
        try { setPassword(decrypt(e.encryptedPassword, mk)); } catch { setPassword(''); }
      }
      setUrl(e.url ?? '');
      setCardholderName(e.cardholderName ?? '');
      if (e.encryptedCardNumber && mk) {
        try { setCardNumber(decrypt(e.encryptedCardNumber, mk)); } catch { setCardNumber(''); }
      }
      setExpiryDate(e.expiryDate ?? '');
      if (e.encryptedCvv && mk) {
        try { setCvv(decrypt(e.encryptedCvv, mk)); } catch { setCvv(''); }
      }
      setRelyingPartyId(e.relyingPartyId ?? '');
      setRelyingPartyName(e.relyingPartyName ?? '');
      setUserHandle(e.userHandle ?? '');
      setCredentialId(e.credentialId ?? '');
      setCounter(e.counter !== undefined && e.counter !== null ? String(e.counter) : '');
      setFileName(e.fileName ?? '');
      setLoading(false);
    })();
  }, [db, entryId, isEdit, masterKey]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    const mk = masterKey ?? '';
    setSaving(true);
    try {
      const entryData: Omit<PasswordEntry, 'id'> = {
        title: title.trim(),
        type,
        vaultId,
        createdAt: new Date().toISOString(),
        isFavorite,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        encryptedPassword: password && mk ? encrypt(password, mk) : undefined,
        url: url.trim() || undefined,
        cardholderName: cardholderName.trim() || undefined,
        encryptedCardNumber: cardNumber && mk ? encrypt(cardNumber, mk) : undefined,
        expiryDate: expiryDate.trim() || undefined,
        encryptedCvv: cvv && mk ? encrypt(cvv, mk) : undefined,
        fileName: fileName.trim() || undefined,
        relyingPartyId: relyingPartyId.trim() || undefined,
        relyingPartyName: relyingPartyName.trim() || undefined,
        userHandle: userHandle.trim() || undefined,
        credentialId: credentialId.trim() || undefined,
        counter: counter.trim() ? parseInt(counter.trim(), 10) : undefined,
      };

      if (isEdit && entryId) {
        await updateEntry(db, { ...entryData, id: entryId });
      } else {
        await createEntry(db, entryData);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword(DEFAULT_OPTIONS);
    setPassword(generated);
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f0f23' : '#f1f5f9';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {isEdit ? 'Edit Entry' : 'New Entry'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Entry Type */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: mutedColor }]}>Entry Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {ENTRY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: type === t ? '#6366f1' : inputBg,
                      borderColor: type === t ? '#6366f1' : borderColor,
                    },
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[styles.typeChipText, { color: type === t ? '#fff' : mutedColor }]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Common Fields */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: mutedColor }]}>General</Text>

            <Field label="Title *" isDark={isDark}>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Entry title"
                placeholderTextColor={mutedColor}
              />
            </Field>

            <Field label="Category" isDark={isDark}>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Social, Work, Finance"
                placeholderTextColor={mutedColor}
              />
            </Field>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: textColor }]}>Favorite</Text>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                trackColor={{ false: borderColor, true: '#6366f1' }}
                thumbColor={isFavorite ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Login fields */}
          {type === EntryType.Login && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionLabel, { color: mutedColor }]}>Credentials</Text>
              <Field label="Username" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Email" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={mutedColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Password" isDark={isDark}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={mutedColor}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={[styles.iconBtn, { backgroundColor: inputBg, borderColor }]}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={mutedColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleGeneratePassword}
                    style={[styles.iconBtn, { backgroundColor: '#6366f122', borderColor: '#6366f1' }]}
                  >
                    <Ionicons name="refresh" size={18} color="#6366f1" />
                  </TouchableOpacity>
                </View>
                {password ? (
                  <View style={styles.strengthRow}>
                    <PasswordStrengthBar result={strengthResult} />
                  </View>
                ) : null}
              </Field>
              <Field label="URL" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://example.com"
                  placeholderTextColor={mutedColor}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </Field>
            </View>
          )}

          {/* Credit Card fields */}
          {type === EntryType.CreditCard && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionLabel, { color: mutedColor }]}>Card Details</Text>
              <Field label="Cardholder Name" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="Full name on card"
                  placeholderTextColor={mutedColor}
                />
              </Field>
              <Field label="Card Number" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={mutedColor}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </Field>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Field label="Expiry (MM/YY)" isDark={isDark}>
                    <TextInput
                      style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      placeholder="MM/YY"
                      placeholderTextColor={mutedColor}
                      maxLength={5}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={styles.halfField}>
                  <Field label="CVV" isDark={isDark}>
                    <TextInput
                      style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      placeholderTextColor={mutedColor}
                      maxLength={4}
                      keyboardType="number-pad"
                      secureTextEntry
                    />
                  </Field>
                </View>
              </View>
            </View>
          )}

          {/* Passkey fields */}
          {type === EntryType.Passkey && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionLabel, { color: mutedColor }]}>Passkey Details</Text>
              <Field label="Relying Party ID" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={relyingPartyId}
                  onChangeText={setRelyingPartyId}
                  placeholder="example.com"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Relying Party Name" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={relyingPartyName}
                  onChangeText={setRelyingPartyName}
                  placeholder="Example Service"
                  placeholderTextColor={mutedColor}
                />
              </Field>
              <Field label="User Handle" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={userHandle}
                  onChangeText={setUserHandle}
                  placeholder="User handle"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Credential ID" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={credentialId}
                  onChangeText={setCredentialId}
                  placeholder="Credential ID"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Counter" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={counter}
                  onChangeText={setCounter}
                  placeholder="0"
                  placeholderTextColor={mutedColor}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
          )}

          {/* Custom File */}
          {type === EntryType.CustomFile && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionLabel, { color: mutedColor }]}>File Details</Text>
              <Field label="File Name" isDark={isDark}>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={fileName}
                  onChangeText={setFileName}
                  placeholder="filename.txt"
                  placeholderTextColor={mutedColor}
                />
              </Field>
            </View>
          )}

          {/* Notes */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: mutedColor }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  isDark,
}: {
  label: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  typeRow: { marginBottom: -4 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  passwordRow: { flexDirection: 'row', gap: 8 },
  passwordInput: { flex: 1 },
  iconBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthRow: { marginTop: 8 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
});
