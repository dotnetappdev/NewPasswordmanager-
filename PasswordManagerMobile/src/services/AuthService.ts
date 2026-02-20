import * as SecureStore from 'expo-secure-store';
import { DB, getUserByUsername, createUser, updateUserLastLogin, updateUserPassword } from './DatabaseService';
import { generateSalt, hashPassword, verifyPassword, deriveMasterKey } from './EncryptionService';
import { User, UserRole } from '../types';

const MASTER_KEY_PREFIX = 'masterKey_';

export interface LoginResult {
  success: boolean;
  user?: User;
  masterKey?: string;
  error?: string;
}

export async function login(db: DB, username: string, password: string): Promise<LoginResult> {
  try {
    const user = await getUserByUsername(db, username);
    if (!user) {
      return { success: false, error: 'Account not found' };
    }

    const valid = await verifyPassword(password, user.salt, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Incorrect password' };
    }

    const masterKey = await deriveMasterKey(password, user.salt);
    await updateUserLastLogin(db, user.id);

    // Store master key securely (session only, will be cleared on logout)
    await SecureStore.setItemAsync(`${MASTER_KEY_PREFIX}${user.id}`, masterKey);

    return { success: true, user, masterKey };
  } catch (err) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function register(
  db: DB,
  username: string,
  password: string,
  role: UserRole = UserRole.User,
  avatarColor?: string,
): Promise<LoginResult> {
  try {
    // Check username already taken
    const existing = await getUserByUsername(db, username);
    if (existing) {
      return { success: false, error: 'Username already taken' };
    }

    if (username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    const salt = await generateSalt();
    const hash = await hashPassword(password, salt);
    const userId = await createUser(db, username.trim(), hash, salt, role, avatarColor);
    const masterKey = await deriveMasterKey(password, salt);

    await SecureStore.setItemAsync(`${MASTER_KEY_PREFIX}${userId}`, masterKey);

    const user: User = {
      id: userId,
      username: username.trim(),
      passwordHash: hash,
      salt,
      role,
      avatarColor,
      createdAt: new Date().toISOString(),
    };

    return { success: true, user, masterKey };
  } catch (err) {
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function logout(userId: number): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${MASTER_KEY_PREFIX}${userId}`);
  } catch {
    // Ignore errors on logout
  }
}

export async function changeMasterPassword(
  db: DB,
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string; newMasterKey?: string }> {
  const valid = await verifyPassword(currentPassword, user.salt, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return { success: false, error: passwordError };
  }

  const newSalt = await generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);
  const newMasterKey = await deriveMasterKey(newPassword, newSalt);

  await updateUserPassword(db, user.id, newHash, newSalt);

  await SecureStore.setItemAsync(`${MASTER_KEY_PREFIX}${user.id}`, newMasterKey);

  return { success: true, newMasterKey };
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}
