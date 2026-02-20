import * as ExpoCrypto from 'expo-crypto';
import * as aesjs from 'aes-js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.substring(i, 2 + i), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function xorBuffers(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(a.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

// ---------------------------------------------------------------------------
// PBKDF2-SHA256 (pure JS using expo-crypto digestStringAsync for SHA-256)
// ---------------------------------------------------------------------------

async function hmacSha256(key: Uint8Array<ArrayBuffer>, data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const BLOCK_SIZE = 64;

  let actualKey = key;
  if (key.length > BLOCK_SIZE) {
    const digest = await ExpoCrypto.digestStringAsync(
      ExpoCrypto.CryptoDigestAlgorithm.SHA256,
      bytesToHex(key),
      { encoding: ExpoCrypto.CryptoEncoding.HEX },
    );
    actualKey = hexToBytes(digest);
  }

  const paddedKey = new Uint8Array(new ArrayBuffer(BLOCK_SIZE));
  paddedKey.set(actualKey);

  const ipad = new Uint8Array(new ArrayBuffer(BLOCK_SIZE + data.length));
  const opad = new Uint8Array(new ArrayBuffer(BLOCK_SIZE + 32));

  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }
  ipad.set(data, BLOCK_SIZE);

  const innerHex = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    bytesToHex(ipad),
    { encoding: ExpoCrypto.CryptoEncoding.HEX },
  );
  const innerBytes = hexToBytes(innerHex);
  opad.set(innerBytes, BLOCK_SIZE);

  const outerHex = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    bytesToHex(opad),
    { encoding: ExpoCrypto.CryptoEncoding.HEX },
  );
  return hexToBytes(outerHex);
}

async function pbkdf2Sha256(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
  keyLength: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const encoder = new TextEncoder();
  const passwordBytes = new Uint8Array(encoder.encode(password).buffer as ArrayBuffer);

  const hLen = 32; // SHA-256 output bytes
  const numBlocks = Math.ceil(keyLength / hLen);
  const derivedKey = new Uint8Array(new ArrayBuffer(numBlocks * hLen));

  for (let block = 1; block <= numBlocks; block++) {
    const blockNum = new Uint8Array(new ArrayBuffer(4));
    blockNum[0] = (block >>> 24) & 0xff;
    blockNum[1] = (block >>> 16) & 0xff;
    blockNum[2] = (block >>> 8) & 0xff;
    blockNum[3] = block & 0xff;

    const saltBuf = new ArrayBuffer(salt.length + 4);
    const saltBlock = new Uint8Array(saltBuf);
    saltBlock.set(salt);
    saltBlock.set(blockNum, salt.length);

    let u = await hmacSha256(passwordBytes, saltBlock);
    let result = new Uint8Array(new ArrayBuffer(u.byteLength));
    result.set(u);

    for (let i = 1; i < iterations; i++) {
      u = await hmacSha256(passwordBytes, u);
      result = xorBuffers(result, u);
    }

    derivedKey.set(result, (block - 1) * hLen);
  }

  return derivedKey.slice(0, keyLength) as Uint8Array<ArrayBuffer>;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateSalt(): Promise<string> {
  const bytes = new Uint8Array(ExpoCrypto.getRandomBytes(32).buffer as ArrayBuffer);
  return bytesToBase64(bytes);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const saltBytes = base64ToBytes(salt);
  const keyBytes = await pbkdf2Sha256(password, saltBytes, 10000, 32);
  return bytesToBase64(keyBytes);
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

/**
 * Derives a 32-byte AES key from the master password using PBKDF2.
 * The returned string is a hex-encoded key (64 chars) used for encryption.
 */
export async function deriveMasterKey(password: string, salt: string): Promise<string> {
  const saltBytes = base64ToBytes(salt);
  const keyBytes = await pbkdf2Sha256(password, saltBytes, 10000, 32);
  return bytesToHex(keyBytes);
}

/**
 * Encrypts plainText using AES-256-CBC with a random IV.
 * Output format (base64): [16-byte IV][ciphertext]
 */
export function encrypt(plainText: string, hexKey: string): string {
  const keyBytes = hexToBytes(hexKey);
  const iv = new Uint8Array(ExpoCrypto.getRandomBytes(16).buffer as ArrayBuffer);
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  // PKCS7 padding
  const blockSize = 16;
  const padLength = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + padLength);
  padded.set(data);
  for (let i = data.length; i < padded.length; i++) padded[i] = padLength;

  const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
  const encrypted = aesCbc.encrypt(padded);

  const result = new Uint8Array(16 + encrypted.length);
  result.set(iv);
  result.set(encrypted, 16);
  return bytesToBase64(result);
}

/**
 * Decrypts a base64 string produced by `encrypt`.
 */
export function decrypt(encryptedBase64: string, hexKey: string): string {
  const keyBytes = hexToBytes(hexKey);
  const combined = base64ToBytes(encryptedBase64);
  const iv = combined.slice(0, 16);
  const ciphertext = combined.slice(16);

  const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
  const decrypted = aesCbc.decrypt(ciphertext);

  // Remove PKCS7 padding
  const padLength = decrypted[decrypted.length - 1];
  const plainBytes = decrypted.slice(0, decrypted.length - padLength);
  const decoder = new TextDecoder();
  return decoder.decode(plainBytes);
}
