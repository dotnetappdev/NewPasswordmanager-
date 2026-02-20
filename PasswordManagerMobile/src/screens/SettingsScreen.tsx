import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { changeMasterPassword } from '../services/AuthService';
import { getDatabaseInfo } from '../services/DatabaseService';
import { UserRole } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, masterKey, signOut, updateUser, updateMasterKey } = useAuth();
  const { db } = useDatabase();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [dbInfo, setDbInfo] = useState<{
    userCount: number;
    vaultCount: number;
    entryCount: number;
  } | null>(null);
  const [loadingDbInfo, setLoadingDbInfo] = useState(false);

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f0f23' : '#f1f5f9';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';
  const dangerColor = '#ef4444';

  const handleChangeMasterPassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmNew) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmNew) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const result = await changeMasterPassword(db, user, currentPassword, newPassword);
      if (result.success && result.newMasterKey) {
        updateMasterKey(result.newMasterKey);
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNew('');
        Alert.alert(
          'Success',
          'Master password changed. Note: Previously encrypted entries will need to be re-encrypted manually.',
        );
      } else {
        Alert.alert('Error', result.error ?? 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleViewDbInfo = async () => {
    setLoadingDbInfo(true);
    try {
      const info = await getDatabaseInfo(db);
      setDbInfo(info);
      setShowDbInfo(true);
    } finally {
      setLoadingDbInfo(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: textColor }]}>Settings</Text>

        {/* User Profile */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.profileHeader}>
            <View
              style={[styles.profileAvatar, { backgroundColor: user?.avatarColor ?? '#6366f1' }]}
            >
              <Text style={styles.profileAvatarText}>
                {user?.username?.slice(0, 2).toUpperCase() ?? 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>{user?.username}</Text>
              <View style={[styles.roleBadge, { backgroundColor: (user?.avatarColor ?? '#6366f1') + '22' }]}>
                <Text style={[styles.roleText, { color: user?.avatarColor ?? '#6366f1' }]}>
                  {user?.role}
                </Text>
              </View>
            </View>
          </View>
          {user?.lastLoginAt ? (
            <Text style={[styles.lastLogin, { color: mutedColor }]}>
              Last login: {new Date(user.lastLoginAt).toLocaleString()}
            </Text>
          ) : null}
          {user?.createdAt ? (
            <Text style={[styles.lastLogin, { color: mutedColor }]}>
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        {/* Security */}
        <Text style={[styles.sectionTitle, { color: mutedColor }]}>Security</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {/* Change Master Password */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#6366f122' }]}>
                <Ionicons name="key" size={18} color="#6366f1" />
              </View>
              <Text style={[styles.settingLabel, { color: textColor }]}>Change Master Password</Text>
            </View>
            <Ionicons
              name={showChangePassword ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={mutedColor}
            />
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.expandedSection}>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: mutedColor }]}>Current Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current master password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: mutedColor }]}>New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New master password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: mutedColor }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={confirmNew}
                  onChangeText={setConfirmNew}
                  placeholder="Confirm new password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, changingPassword && { opacity: 0.7 }]}
                onPress={handleChangeMasterPassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Database */}
        <Text style={[styles.sectionTitle, { color: mutedColor }]}>Database</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleViewDbInfo}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#10b98122' }]}>
                <Ionicons name="server" size={18} color="#10b981" />
              </View>
              <Text style={[styles.settingLabel, { color: textColor }]}>Database Info</Text>
            </View>
            {loadingDbInfo ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={mutedColor} />
            )}
          </TouchableOpacity>

          {showDbInfo && dbInfo && (
            <View style={styles.expandedSection}>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.dbInfoGrid}>
                <DbInfoItem label="Users" value={String(dbInfo.userCount)} color="#6366f1" />
                <DbInfoItem label="Vaults" value={String(dbInfo.vaultCount)} color="#ec4899" />
                <DbInfoItem label="Entries" value={String(dbInfo.entryCount)} color="#10b981" />
              </View>
              <View style={[styles.dbInfoNote, { backgroundColor: isDark ? '#0f0f23' : '#f8fafc' }]}>
                <Ionicons name="lock-closed" size={14} color="#6366f1" />
                <Text style={[styles.dbInfoNoteText, { color: mutedColor }]}>
                  SQLite database stored locally with AES-256-CBC encryption
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Admin section */}
        {user?.role === UserRole.Admin && (
          <>
            <Text style={[styles.sectionTitle, { color: mutedColor }]}>Administration</Text>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={[styles.infoRow, { backgroundColor: isDark ? '#0f0f23' : '#f8fafc' }]}>
                <Ionicons name="shield" size={20} color="#6366f1" />
                <Text style={[styles.infoText, { color: textColor }]}>
                  As Admin, you can manage user access restrictions from each entry's detail screen.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* About */}
        <Text style={[styles.sectionTitle, { color: mutedColor }]}>About</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.aboutRow}>
            <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
            <View style={styles.aboutInfo}>
              <Text style={[styles.appName, { color: textColor }]}>Password Manager</Text>
              <Text style={[styles.appVersion, { color: mutedColor }]}>Version 1.0.0</Text>
              <Text style={[styles.appDesc, { color: mutedColor }]}>
                Completely offline • AES-256-CBC • PBKDF2-SHA256
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: dangerColor }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={dangerColor} />
          <Text style={[styles.logoutBtnText, { color: dangerColor }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DbInfoItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[dbItemStyles.item, { backgroundColor: color + '11' }]}>
      <Text style={[dbItemStyles.value, { color }]}>{value}</Text>
      <Text style={[dbItemStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const dbItemStyles = StyleSheet.create({
  item: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 12, marginTop: 2, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  screenTitle: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  roleText: { fontSize: 12, fontWeight: '600' },
  lastLogin: { fontSize: 12, marginTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  expandedSection: { marginTop: 12 },
  divider: { height: 1, marginBottom: 12 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dbInfoGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dbInfoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    padding: 10,
  },
  dbInfoNoteText: { fontSize: 12, flex: 1 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  aboutInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '700' },
  appVersion: { fontSize: 13, marginTop: 2 },
  appDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    marginTop: 24,
  },
  logoutBtnText: { fontSize: 16, fontWeight: '700' },
});
