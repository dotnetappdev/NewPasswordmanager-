import * as SQLite from 'expo-sqlite';
import { User, UserRole, Vault, PasswordEntry, EntryType, AccessRestriction } from '../types';
import { generateSalt, hashPassword } from './EncryptionService';

export type DB = SQLite.SQLiteDatabase;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export async function initializeDatabase(db: DB): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      avatarColor TEXT,
      createdAt TEXT NOT NULL,
      lastLoginAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Vaults (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      iconName TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PasswordEntries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      vaultId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      modifiedAt TEXT,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      notes TEXT,
      username TEXT,
      email TEXT,
      encryptedPassword TEXT,
      url TEXT,
      cardholderName TEXT,
      encryptedCardNumber TEXT,
      expiryDate TEXT,
      encryptedCvv TEXT,
      fileName TEXT,
      fileData TEXT,
      relyingPartyId TEXT,
      relyingPartyName TEXT,
      userHandle TEXT,
      credentialId TEXT,
      publicKeyPem TEXT,
      encryptedPrivateKey TEXT,
      counter INTEGER,
      FOREIGN KEY (vaultId) REFERENCES Vaults(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AccessRestrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      passwordEntryId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, passwordEntryId),
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (passwordEntryId) REFERENCES PasswordEntries(id) ON DELETE CASCADE
    );
  `);

  await seedDatabase(db);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

async function seedDatabase(db: DB): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM Users',
  );
  if (existing && existing.count > 0) return;

  const now = new Date().toISOString();
  const avatarColors = ['#6366f1', '#ec4899', '#10b981'];
  const seedUsers = [
    { username: 'admin', password: 'Admin123!', role: UserRole.Admin, color: avatarColors[0] },
    { username: 'john', password: 'John123!', role: UserRole.User, color: avatarColors[1] },
    { username: 'sarah', password: 'Sarah123!', role: UserRole.Child, color: avatarColors[2] },
  ];

  for (const u of seedUsers) {
    const salt = await generateSalt();
    const hash = await hashPassword(u.password, salt);

    const result = await db.runAsync(
      `INSERT INTO Users (username, passwordHash, salt, role, avatarColor, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.username, hash, salt, u.role, u.color, now],
    );
    const userId = result.lastInsertRowId;

    // Create default vault
    const vaultResult = await db.runAsync(
      `INSERT INTO Vaults (userId, name, description, iconName, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, 'Personal', 'Personal passwords', 'person', now],
    );
    const vaultId = vaultResult.lastInsertRowId;

    // Create work vault for admin and john
    let workVaultId: number | null = null;
    if (u.role !== UserRole.Child) {
      const wv = await db.runAsync(
        `INSERT INTO Vaults (userId, name, description, iconName, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, 'Work', 'Work credentials', 'briefcase', now],
      );
      workVaultId = wv.lastInsertRowId;
    }

    // Seed entries for admin
    if (u.role === UserRole.Admin) {
      await db.runAsync(
        `INSERT INTO PasswordEntries
          (title, type, vaultId, createdAt, isFavorite, username, email, url, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'GitHub',
          EntryType.Login,
          vaultId,
          now,
          1,
          'admin_user',
          'admin@example.com',
          'https://github.com',
          'Development',
        ],
      );
      await db.runAsync(
        `INSERT INTO PasswordEntries
          (title, type, vaultId, createdAt, isFavorite, cardholderName, expiryDate, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Visa Card', EntryType.CreditCard, vaultId, now, 0, 'Admin User', '12/27', 'Finance'],
      );
      await db.runAsync(
        `INSERT INTO PasswordEntries
          (title, type, vaultId, createdAt, isFavorite, notes, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Server Credentials',
          EntryType.SecureNote,
          workVaultId ?? vaultId,
          now,
          0,
          'Production server: 192.168.1.1\nUser: deploy\nKey: ~/.ssh/prod_key',
          'Infrastructure',
        ],
      );
    }
  }
}

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------

export async function getAllUsers(db: DB): Promise<User[]> {
  return db.getAllAsync<User>('SELECT * FROM Users ORDER BY username ASC');
}

export async function getUserById(db: DB, id: number): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM Users WHERE id = ?', [id]);
}

export async function getUserByUsername(db: DB, username: string): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM Users WHERE username = ?', [username]);
}

export async function createUser(
  db: DB,
  username: string,
  passwordHash: string,
  salt: string,
  role: UserRole,
  avatarColor?: string,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO Users (username, passwordHash, salt, role, avatarColor, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, passwordHash, salt, role, avatarColor ?? '#6366f1', now],
  );
  return result.lastInsertRowId;
}

export async function updateUserLastLogin(db: DB, id: number): Promise<void> {
  await db.runAsync('UPDATE Users SET lastLoginAt = ? WHERE id = ?', [
    new Date().toISOString(),
    id,
  ]);
}

export async function updateUserPassword(
  db: DB,
  id: number,
  passwordHash: string,
  salt: string,
): Promise<void> {
  await db.runAsync('UPDATE Users SET passwordHash = ?, salt = ? WHERE id = ?', [
    passwordHash,
    salt,
    id,
  ]);
}

// ---------------------------------------------------------------------------
// Vault CRUD
// ---------------------------------------------------------------------------

export async function getVaultsByUser(db: DB, userId: number): Promise<Vault[]> {
  return db.getAllAsync<Vault>('SELECT * FROM Vaults WHERE userId = ? ORDER BY name ASC', [userId]);
}

export async function getVaultById(db: DB, id: number): Promise<Vault | null> {
  return db.getFirstAsync<Vault>('SELECT * FROM Vaults WHERE id = ?', [id]);
}

export async function createVault(
  db: DB,
  userId: number,
  name: string,
  description?: string,
  iconName?: string,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO Vaults (userId, name, description, iconName, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, name, description ?? null, iconName ?? 'folder', now],
  );
  return result.lastInsertRowId;
}

export async function updateVault(
  db: DB,
  id: number,
  name: string,
  description?: string,
): Promise<void> {
  await db.runAsync('UPDATE Vaults SET name = ?, description = ? WHERE id = ?', [
    name,
    description ?? null,
    id,
  ]);
}

export async function deleteVault(db: DB, id: number): Promise<void> {
  await db.runAsync('DELETE FROM Vaults WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// PasswordEntry CRUD
// ---------------------------------------------------------------------------

export async function getEntriesByVault(
  db: DB,
  vaultId: number,
  userId?: number,
): Promise<PasswordEntry[]> {
  if (userId !== undefined) {
    // Exclude entries restricted for this user
    return db.getAllAsync<PasswordEntry>(
      `SELECT * FROM PasswordEntries
       WHERE vaultId = ?
         AND id NOT IN (SELECT passwordEntryId FROM AccessRestrictions WHERE userId = ?)
       ORDER BY isFavorite DESC, title ASC`,
      [vaultId, userId],
    );
  }
  return db.getAllAsync<PasswordEntry>(
    'SELECT * FROM PasswordEntries WHERE vaultId = ? ORDER BY isFavorite DESC, title ASC',
    [vaultId],
  );
}

export async function getEntryById(db: DB, id: number): Promise<PasswordEntry | null> {
  return db.getFirstAsync<PasswordEntry>('SELECT * FROM PasswordEntries WHERE id = ?', [id]);
}

export async function getFavoriteEntries(
  db: DB,
  userId: number,
): Promise<PasswordEntry[]> {
  return db.getAllAsync<PasswordEntry>(
    `SELECT pe.* FROM PasswordEntries pe
     JOIN Vaults v ON pe.vaultId = v.id
     WHERE v.userId = ? AND pe.isFavorite = 1
       AND pe.id NOT IN (SELECT passwordEntryId FROM AccessRestrictions WHERE userId = ?)
     ORDER BY pe.title ASC`,
    [userId, userId],
  );
}

export async function searchEntries(
  db: DB,
  userId: number,
  query: string,
  type?: string,
): Promise<PasswordEntry[]> {
  const likeQuery = `%${query}%`;
  if (type && type !== 'All') {
    return db.getAllAsync<PasswordEntry>(
      `SELECT pe.* FROM PasswordEntries pe
       JOIN Vaults v ON pe.vaultId = v.id
       WHERE v.userId = ? AND pe.type = ?
         AND (pe.title LIKE ? OR pe.username LIKE ? OR pe.email LIKE ? OR pe.url LIKE ?)
         AND pe.id NOT IN (SELECT passwordEntryId FROM AccessRestrictions WHERE userId = ?)
       ORDER BY pe.title ASC`,
      [userId, type, likeQuery, likeQuery, likeQuery, likeQuery, userId],
    );
  }
  return db.getAllAsync<PasswordEntry>(
    `SELECT pe.* FROM PasswordEntries pe
     JOIN Vaults v ON pe.vaultId = v.id
     WHERE v.userId = ?
       AND (pe.title LIKE ? OR pe.username LIKE ? OR pe.email LIKE ? OR pe.url LIKE ?)
       AND pe.id NOT IN (SELECT passwordEntryId FROM AccessRestrictions WHERE userId = ?)
     ORDER BY pe.title ASC`,
    [userId, likeQuery, likeQuery, likeQuery, likeQuery, userId],
  );
}

export async function createEntry(db: DB, entry: Omit<PasswordEntry, 'id'>): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO PasswordEntries (
      title, type, vaultId, createdAt, modifiedAt, isFavorite, category, notes,
      username, email, encryptedPassword, url,
      cardholderName, encryptedCardNumber, expiryDate, encryptedCvv,
      fileName, fileData,
      relyingPartyId, relyingPartyName, userHandle, credentialId,
      publicKeyPem, encryptedPrivateKey, counter
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entry.title,
      entry.type,
      entry.vaultId,
      now,
      now,
      entry.isFavorite ? 1 : 0,
      entry.category ?? null,
      entry.notes ?? null,
      entry.username ?? null,
      entry.email ?? null,
      entry.encryptedPassword ?? null,
      entry.url ?? null,
      entry.cardholderName ?? null,
      entry.encryptedCardNumber ?? null,
      entry.expiryDate ?? null,
      entry.encryptedCvv ?? null,
      entry.fileName ?? null,
      entry.fileData ?? null,
      entry.relyingPartyId ?? null,
      entry.relyingPartyName ?? null,
      entry.userHandle ?? null,
      entry.credentialId ?? null,
      entry.publicKeyPem ?? null,
      entry.encryptedPrivateKey ?? null,
      entry.counter ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateEntry(db: DB, entry: PasswordEntry): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE PasswordEntries SET
      title=?, type=?, vaultId=?, modifiedAt=?, isFavorite=?, category=?, notes=?,
      username=?, email=?, encryptedPassword=?, url=?,
      cardholderName=?, encryptedCardNumber=?, expiryDate=?, encryptedCvv=?,
      fileName=?, fileData=?,
      relyingPartyId=?, relyingPartyName=?, userHandle=?, credentialId=?,
      publicKeyPem=?, encryptedPrivateKey=?, counter=?
     WHERE id=?`,
    [
      entry.title,
      entry.type,
      entry.vaultId,
      now,
      entry.isFavorite ? 1 : 0,
      entry.category ?? null,
      entry.notes ?? null,
      entry.username ?? null,
      entry.email ?? null,
      entry.encryptedPassword ?? null,
      entry.url ?? null,
      entry.cardholderName ?? null,
      entry.encryptedCardNumber ?? null,
      entry.expiryDate ?? null,
      entry.encryptedCvv ?? null,
      entry.fileName ?? null,
      entry.fileData ?? null,
      entry.relyingPartyId ?? null,
      entry.relyingPartyName ?? null,
      entry.userHandle ?? null,
      entry.credentialId ?? null,
      entry.publicKeyPem ?? null,
      entry.encryptedPrivateKey ?? null,
      entry.counter ?? null,
      entry.id,
    ],
  );
}

export async function toggleFavorite(db: DB, id: number, current: boolean): Promise<void> {
  await db.runAsync('UPDATE PasswordEntries SET isFavorite = ? WHERE id = ?', [
    current ? 0 : 1,
    id,
  ]);
}

export async function deleteEntry(db: DB, id: number): Promise<void> {
  await db.runAsync('DELETE FROM PasswordEntries WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Access Restrictions
// ---------------------------------------------------------------------------

export async function getAccessRestrictions(db: DB, userId: number): Promise<AccessRestriction[]> {
  return db.getAllAsync<AccessRestriction>(
    'SELECT * FROM AccessRestrictions WHERE userId = ?',
    [userId],
  );
}

export async function addAccessRestriction(
  db: DB,
  userId: number,
  passwordEntryId: number,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO AccessRestrictions (userId, passwordEntryId, createdAt)
     VALUES (?, ?, ?)`,
    [userId, passwordEntryId, now],
  );
}

export async function removeAccessRestriction(
  db: DB,
  userId: number,
  passwordEntryId: number,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM AccessRestrictions WHERE userId = ? AND passwordEntryId = ?',
    [userId, passwordEntryId],
  );
}

export async function getDatabaseInfo(db: DB): Promise<{
  userCount: number;
  vaultCount: number;
  entryCount: number;
}> {
  const [users, vaults, entries] = await Promise.all([
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Users'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Vaults'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM PasswordEntries'),
  ]);
  return {
    userCount: users?.count ?? 0,
    vaultCount: vaults?.count ?? 0,
    entryCount: entries?.count ?? 0,
  };
}
