import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { login, register } from '../services/AuthService';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;
type RouteParams = RouteProp<{ CreateAccount: { selectedUser?: User } }, 'CreateAccount'>;

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444',
];

export default function CreateAccountScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { db } = useDatabase();
  const { signIn } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const selectedUser = route.params?.selectedUser;
  const isLoginMode = !!selectedUser;

  const [username, setUsername] = useState(selectedUser?.username ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(selectedUser?.avatarColor ?? AVATAR_COLORS[0]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((has) => {
      if (has) LocalAuthentication.isEnrolledAsync().then(setBiometricAvailable);
    });
  }, []);

  const handleBiometricLogin = async () => {
    if (!selectedUser) return;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login as ${selectedUser.username}`,
      fallbackLabel: 'Use password',
    });
    if (result.success) {
      // Biometric confirmed: need to retrieve stored key
      // For demo, prompt password after biometric succeeds
      Alert.alert('Biometric Auth', 'Please enter your master password to decrypt vault data.');
    }
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!isLoginMode) {
      if (!username.trim()) {
        Alert.alert('Error', 'Please enter a username');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      let result;
      if (isLoginMode) {
        result = await login(db, selectedUser!.username, password);
      } else {
        result = await register(db, username, password, UserRole.User, selectedColor);
      }

      if (result.success && result.user && result.masterKey) {
        signIn(result.user, result.masterKey);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        Alert.alert('Error', result.error ?? 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f0f23' : '#f1f5f9';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';

  const initials = isLoginMode
    ? selectedUser!.username.slice(0, 2).toUpperCase()
    : username.slice(0, 2).toUpperCase() || '??';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: selectedColor }]}>
              <Text style={styles.initials}>{initials}</Text>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              {isLoginMode ? `Welcome back, ${selectedUser!.username}` : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              {isLoginMode
                ? 'Enter your master password'
                : 'Set up your secure password manager'}
            </Text>

            {/* Username (register only) */}
            {!isLoginMode && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: mutedColor }]}>Username</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: mutedColor }]}>Master Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { backgroundColor: inputBg, color: textColor, borderColor },
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter master password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={[styles.eyeBtn, { backgroundColor: inputBg, borderColor }]}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={mutedColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password (register only) */}
            {!isLoginMode && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: mutedColor }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm master password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Avatar color picker (register only) */}
            {!isLoginMode && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: mutedColor }]}>Avatar Color</Text>
                <View style={styles.colorRow}>
                  {AVATAR_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        selectedColor === c && styles.colorDotSelected,
                      ]}
                      onPress={() => setSelectedColor(c)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Register password hint */}
            {!isLoginMode && (
              <View style={[styles.hintBox, { backgroundColor: isDark ? '#1a1a3a' : '#f1f5f9' }]}>
                <Ionicons name="information-circle" size={16} color="#6366f1" />
                <Text style={[styles.hintText, { color: mutedColor }]}>
                  Password must be at least 8 characters with 1 uppercase and 1 number
                </Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name={isLoginMode ? 'log-in' : 'person-add'} size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>
                    {isLoginMode ? 'Unlock Vault' : 'Create Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Biometric login */}
            {isLoginMode && biometricAvailable && (
              <TouchableOpacity
                style={[styles.biometricBtn, { borderColor }]}
                onPress={handleBiometricLogin}
              >
                <Ionicons name="finger-print" size={20} color="#6366f1" />
                <Text style={[styles.biometricText, { color: '#6366f1' }]}>
                  Use Biometrics
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  backBtn: {
    marginBottom: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initials: { color: '#fff', fontSize: 28, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  fieldGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    width: '100%',
  },
  passwordRow: { flexDirection: 'row', gap: 8 },
  passwordInput: { flex: 1 },
  eyeBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  hintText: { fontSize: 13, flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    gap: 8,
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    width: '100%',
    gap: 8,
    marginTop: 12,
  },
  biometricText: { fontSize: 15, fontWeight: '600' },
});
