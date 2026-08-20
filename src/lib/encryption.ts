import crypto from 'crypto';

// The algorithm used for envelope encryption
const ALGORITHM = 'aes-256-gcm';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a sensitive string using the Tenant's Data Encryption Key (DEK)
 * @param plaintext The raw string to encrypt (e.g. SSN)
 * @param dekBuffer The 32-byte Data Encryption Key for this specific tenant
 * @returns Object containing the ciphertext, IV, and AuthTag in hex format
 */
export function encryptData(plaintext: string, dekBuffer: Buffer): EncryptedPayload {
  if (dekBuffer.length !== 32) {
    throw new Error('Invalid DEK length. Must be 32 bytes for AES-256-GCM.');
  }

  // Generate a random 12-byte Initialization Vector
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv(ALGORITHM, dekBuffer, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts an encrypted payload using the Tenant's Data Encryption Key (DEK)
 * @param payload The stored payload containing ciphertext, iv, and authTag
 * @param dekBuffer The 32-byte Data Encryption Key for this specific tenant
 * @returns The original plaintext string
 */
export function decryptData(payload: EncryptedPayload, dekBuffer: Buffer): string {
  if (dekBuffer.length !== 32) {
    throw new Error('Invalid DEK length. Must be 32 bytes for AES-256-GCM.');
  }

  const ivBuffer = Buffer.from(payload.iv, 'hex');
  const authTagBuffer = Buffer.from(payload.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, dekBuffer, ivBuffer);
  decipher.setAuthTag(authTagBuffer);
  
  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a completely new 32-byte Data Encryption Key
 */
export function generateNewDEK(): Buffer {
  return crypto.randomBytes(32);
}
