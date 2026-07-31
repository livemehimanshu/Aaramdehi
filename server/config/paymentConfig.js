import crypto from 'crypto';
import { db } from './db.js'; // ✅ Database instance single place (db.js) se centralized import

// Encryption Configuration (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY in .env must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(keyHex, 'hex');
};

export const encryptSecret = (plainText) => {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptSecret = (cipherText) => {
  if (!cipherText) return '';
  const parts = cipherText.split(':');
  if (parts.length !== 3) throw new Error('Invalid cipher text format.');
  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
};

// In-Memory Cache (RAM)
let gatewayCache = {
  razorpay: null,
  cashfree: null
};

// Start Realtime Synchronization with Firebase
export const initGatewaySync = () => {
  const ref = db.ref('payment_gateways');

  ref.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      gatewayCache = { razorpay: null, cashfree: null };
      console.log('[Payment Gateway] Cache cleared - No configuration found in DB.');
      return;
    }

    if (data.razorpay) {
      try {
        gatewayCache.razorpay = {
          ...data.razorpay,
          key_secret: decryptSecret(data.razorpay.key_secret)
        };
        console.log(`[Payment Gateway] Razorpay synced (Mode: ${gatewayCache.razorpay.mode}).`);
      } catch (err) {
        console.error('[Payment Gateway] Razorpay decryption failed:', err.message);
      }
    }

    if (data.cashfree) {
      try {
        gatewayCache.cashfree = {
          ...data.cashfree,
          secret_key: decryptSecret(data.cashfree.secret_key)
        };
        console.log(`[Payment Gateway] Cashfree synced (Mode: ${gatewayCache.cashfree.mode}).`);
      } catch (err) {
        console.error('[Payment Gateway] Cashfree decryption failed:', err.message);
      }
    }
  });
};

// Alias export agar controller mein dusra naam expected ho
export const initPaymentGatewaySync = initGatewaySync;

export const getRazorpayCredentials = () => {
  if (!gatewayCache.razorpay || !gatewayCache.razorpay.is_active) {
    throw new Error('Razorpay gateway is inactive or not configured.');
  }
  return gatewayCache.razorpay;
};

export const getCashfreeCredentials = () => {
  if (!gatewayCache.cashfree || !gatewayCache.cashfree.is_active) {
    throw new Error('Cashfree gateway is inactive or not configured.');
  }
  return gatewayCache.cashfree;
};

// Controllers / external files ke safety ke liye re-export db
export { db };