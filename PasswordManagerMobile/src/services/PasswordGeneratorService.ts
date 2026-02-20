import * as ExpoCrypto from 'expo-crypto';
import { PasswordGeneratorOptions, PasswordStrength, PasswordStrengthResult } from '../types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordGeneratorOptions): string {
  const { length, useUppercase, useLowercase, useNumbers, useSpecial } = options;

  let charset = '';
  const required: string[] = [];

  if (useUppercase) {
    charset += UPPERCASE;
    required.push(UPPERCASE[randomInt(UPPERCASE.length)]);
  }
  if (useLowercase) {
    charset += LOWERCASE;
    required.push(LOWERCASE[randomInt(LOWERCASE.length)]);
  }
  if (useNumbers) {
    charset += NUMBERS;
    required.push(NUMBERS[randomInt(NUMBERS.length)]);
  }
  if (useSpecial) {
    charset += SPECIAL;
    required.push(SPECIAL[randomInt(SPECIAL.length)]);
  }

  if (!charset) {
    charset = LOWERCASE + NUMBERS;
  }

  // Fill remaining characters
  const remaining = length - required.length;
  const passwordChars: string[] = [...required];
  for (let i = 0; i < remaining; i++) {
    passwordChars.push(charset[randomInt(charset.length)]);
  }

  // Shuffle
  return shuffle(passwordChars).join('');
}

function randomInt(max: number): number {
  const rawBytes = ExpoCrypto.getRandomBytes(4);
  const bytes = new Uint8Array(rawBytes.buffer as ArrayBuffer);
  const value = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  return Math.abs(value) % max;
}

function shuffle(arr: string[]): string[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: PasswordStrength.VeryWeak, label: 'None', color: '#94a3b8' };
  }

  let score = 0;

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score--; // repeated chars
  if (/^[a-z]+$/.test(password) || /^[0-9]+$/.test(password)) score--; // single class

  score = Math.max(0, Math.min(8, score));

  if (score <= 2) return { score: PasswordStrength.VeryWeak, label: 'Very Weak', color: '#ef4444' };
  if (score <= 3) return { score: PasswordStrength.Weak, label: 'Weak', color: '#f97316' };
  if (score <= 5) return { score: PasswordStrength.Fair, label: 'Fair', color: '#eab308' };
  if (score <= 6) return { score: PasswordStrength.Strong, label: 'Strong', color: '#22c55e' };
  return { score: PasswordStrength.VeryStrong, label: 'Very Strong', color: '#10b981' };
}

export const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  useUppercase: true,
  useLowercase: true,
  useNumbers: true,
  useSpecial: true,
};
