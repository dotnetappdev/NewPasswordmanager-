import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  generatePassword,
  evaluatePasswordStrength,
  DEFAULT_OPTIONS,
} from '../services/PasswordGeneratorService';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { PasswordGeneratorOptions } from '../types';

export default function PasswordGeneratorScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generatePassword(DEFAULT_OPTIONS),
  );
  const [copied, setCopied] = useState(false);

  const strengthResult = evaluatePasswordStrength(generatedPassword);

  const handleGenerate = useCallback(() => {
    setGeneratedPassword(generatePassword(options));
    setCopied(false);
  }, [options]);

  const handleCopy = () => {
    Clipboard.setString(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K],
  ) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: value };
      setGeneratedPassword(generatePassword(next));
      setCopied(false);
      return next;
    });
  };

  const bgColor = isDark ? '#0f0f23' : '#f8fafc';
  const cardBg = isDark ? '#1e1e3f' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#2d2d5f' : '#e2e8f0';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.screenTitle, { color: textColor }]}>Password Generator</Text>
      <Text style={[styles.screenSubtitle, { color: mutedColor }]}>
        Create strong, secure passwords
      </Text>

      {/* Generated Password Display */}
      <View style={[styles.passwordCard, { backgroundColor: cardBg }]}>
        <Text
          style={[styles.generatedPassword, { color: textColor }]}
          selectable
          numberOfLines={2}
        >
          {generatedPassword}
        </Text>
        <View style={styles.strengthContainer}>
          <PasswordStrengthBar result={strengthResult} />
        </View>
        <View style={styles.passwordActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor }]}
            onPress={handleCopy}
          >
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? '#10b981' : '#6366f1'}
            />
            <Text style={[styles.actionBtnText, { color: copied ? '#10b981' : '#6366f1' }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.generateBtn]}
            onPress={handleGenerate}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.generateBtnText}>Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Options */}
      <View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.optionsSectionTitle, { color: textColor }]}>Options</Text>

        {/* Length slider */}
        <View style={styles.lengthRow}>
          <Text style={[styles.optionLabel, { color: textColor }]}>Length</Text>
          <View style={[styles.lengthBadge, { backgroundColor: '#6366f122' }]}>
            <Text style={styles.lengthValue}>{options.length}</Text>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={8}
          maximumValue={64}
          step={1}
          value={options.length}
          onValueChange={(v) => updateOption('length', v)}
          minimumTrackTintColor="#6366f1"
          maximumTrackTintColor={isDark ? '#2d2d5f' : '#e2e8f0'}
          thumbTintColor="#6366f1"
        />
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: mutedColor }]}>8</Text>
          <Text style={[styles.sliderLabel, { color: mutedColor }]}>64</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Toggle options */}
        {(
          [
            { key: 'useUppercase', label: 'Uppercase (A-Z)', icon: 'text' },
            { key: 'useLowercase', label: 'Lowercase (a-z)', icon: 'text-outline' },
            { key: 'useNumbers', label: 'Numbers (0-9)', icon: 'calculator' },
            { key: 'useSpecial', label: 'Special (!@#$%)', icon: 'at' },
          ] as const
        ).map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={styles.toggleRow}
            onPress={() => updateOption(key, !options[key])}
          >
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: '#6366f122' }]}>
                <Ionicons name={icon} size={16} color="#6366f1" />
              </View>
              <Text style={[styles.toggleLabel, { color: textColor }]}>{label}</Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: options[key] ? '#6366f1' : isDark ? '#2d2d5f' : '#e2e8f0',
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: options[key] ? 20 : 2 }] },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* History/Info */}
      <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
        <Ionicons name="shield-checkmark" size={20} color="#10b981" />
        <Text style={[styles.infoText, { color: mutedColor }]}>
          Passwords are generated locally on your device and never transmitted.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  screenSubtitle: { fontSize: 14, marginBottom: 24 },
  passwordCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  generatedPassword: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
    minHeight: 52,
  },
  strengthContainer: { marginBottom: 16 },
  passwordActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  generateBtn: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  generateBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  optionsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionsSectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  lengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: { fontSize: 15, fontWeight: '500' },
  lengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lengthValue: { color: '#6366f1', fontWeight: '700', fontSize: 15 },
  slider: { width: '100%', height: 40 },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 4,
  },
  sliderLabel: { fontSize: 12 },
  divider: { height: 1, marginVertical: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { fontSize: 15 },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 20 },
});
