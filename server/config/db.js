import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

/**
 * Initialize Firebase Admin SDK
 * Priority: 1. FIREBASE_CONFIG_JSON (Render) | 2. Individual ENV vars | 3. Local file
 */
let serviceAccount;

if (process.env.FIREBASE_CONFIG_JSON) {
  console.log('✅ Using Firebase credentials from FIREBASE_CONFIG_JSON');
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
  } catch (e) {
    console.error('❌ Error parsing FIREBASE_CONFIG_JSON:', e);
    throw new Error("Invalid FIREBASE_CONFIG_JSON format");
  }
} 
else if (process.env.FIREBASE_PROJECT_ID) {
  console.log('✅ Using Firebase credentials from individual environment variables');
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} 
else {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(keyPath)) {
    console.log('✅ Using Firebase credentials from serviceAccountKey.json');
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } else {
    throw new Error("Firebase Admin SDK failed to initialize: No credentials found in ENV or file.");
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aaramdehi-91f82-default-rtdb.firebaseio.com/"
  });
}

export const db = admin.database();

// Baaki sabhi functions (findAll, findById, etc.) niche yahan honge...
export const findAll = async (collectionName) => {
  const snapshot = await db.ref(collectionName).once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.keys(data).map(key => ({ _id: key, ...data[key] }));
};

export const findById = async (collectionName, id) => {
  const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;
  const snapshot = await db.ref(`${collectionName}/${cleanId}`).once('value');
  const data = snapshot.val();
  return data ? { _id: cleanId, ...data } : null;
};

export const create = async (collectionName, data) => {
  const newRef = db.ref(collectionName).push();
  const timestamp = new Date().toISOString();
  const record = { ...data, createdAt: timestamp, updatedAt: timestamp };
  await newRef.set(record);
  return { _id: newRef.key, ...record };
};

// (Aapke baaki helper functions yahan continue kar sakte hain)