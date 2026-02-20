// User roles
export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Child = 'Child',
}

// Entry types
export enum EntryType {
  Login = 'Login',
  CreditCard = 'CreditCard',
  Passkey = 'Passkey',
  SecureNote = 'SecureNote',
  CustomFile = 'CustomFile',
}

// Database entities
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  avatarColor?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Vault {
  id: number;
  userId: number;
  name: string;
  description?: string;
  iconName?: string;
  createdAt: string;
}

export interface PasswordEntry {
  id: number;
  title: string;
  type: EntryType;
  vaultId: number;
  createdAt: string;
  modifiedAt?: string;
  isFavorite: boolean;
  category?: string;
  notes?: string;

  // Login fields
  username?: string;
  email?: string;
  encryptedPassword?: string;
  url?: string;

  // CreditCard fields
  cardholderName?: string;
  encryptedCardNumber?: string;
  expiryDate?: string;
  encryptedCvv?: string;

  // CustomFile fields
  fileName?: string;
  fileData?: string;

  // Passkey fields
  relyingPartyId?: string;
  relyingPartyName?: string;
  userHandle?: string;
  credentialId?: string;
  publicKeyPem?: string;
  encryptedPrivateKey?: string;
  counter?: number;
}

export interface AccessRestriction {
  id: number;
  userId: number;
  passwordEntryId: number;
  createdAt: string;
}

// Navigation param types
export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Main: undefined;
  VaultDetail: { vaultId: number; vaultName: string };
  EntryDetail: { entryId: number };
  AddEditEntry: { vaultId: number; entryId?: number };
};

export type MainTabParamList = {
  VaultList: undefined;
  PasswordGenerator: undefined;
  Settings: undefined;
};

// Auth context types
export interface AuthState {
  user: User | null;
  masterKey: string | null;
  isAuthenticated: boolean;
}

// Password generator options
export interface PasswordGeneratorOptions {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSpecial: boolean;
}

// Password strength levels
export enum PasswordStrength {
  VeryWeak = 0,
  Weak = 1,
  Fair = 2,
  Strong = 3,
  VeryStrong = 4,
}

export interface PasswordStrengthResult {
  score: PasswordStrength;
  label: string;
  color: string;
}
