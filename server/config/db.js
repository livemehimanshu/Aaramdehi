import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let serviceAccount;

// 1. Firebase Credentials Setup
if (process.env.FIREBASE_CONFIG_JSON) {
  console.log('✅ Using Firebase credentials from FIREBASE_CONFIG_JSON');
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
  } catch (e) {
    throw new Error("Invalid FIREBASE_CONFIG_JSON format");
  }
} else if (process.env.FIREBASE_PROJECT_ID) {
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } else {
    throw new Error("Firebase Admin SDK failed to initialize: No credentials found.");
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aaramdehi-91f82-default-rtdb.firebaseio.com/"
  });
}

export const db = admin.database();

// 2. Helper Functions (Saare EXPORTED hain)
export const findAll = async (collectionName) => {
  const snapshot = await db.ref(collectionName).once('value');
  const data = snapshot.val();
  return data ? Object.keys(data).map(key => ({ _id: key, ...data[key] })) : [];
};

export const findPaginated = async (collectionName, limit = 10, lastKey = null) => {
  let query = db.ref(collectionName).orderByKey().limitToFirst(parseInt(limit));
  if (lastKey) query = query.startAfter(lastKey);
  const snapshot = await query.once('value');
  const data = snapshot.val();
  if (!data) return { items: [], lastKey: null };
  const items = Object.keys(data).map(key => ({ _id: key, ...data[key] }));
  return { items, lastKey: items[items.length - 1]._id };
};

export const findById = async (collectionName, id) => {
  const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;
  const snapshot = await db.ref(`${collectionName}/${cleanId}`).once('value');
  const data = snapshot.val();
  return data ? { _id: cleanId, ...data } : null;
};

export const findByQuery = async (collectionName, property, value) => {
  const snapshot = await db.ref(collectionName).once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.keys(data)
    .filter(key => data[key][property] === value)
    .map(key => ({ _id: key, ...data[key] }));
};

export const create = async (collectionName, data) => {
  const newRef = db.ref(collectionName).push();
  const timestamp = new Date().toISOString();
  const record = { ...data, createdAt: timestamp, updatedAt: timestamp };
  await newRef.set(record);
  return { _id: newRef.key, ...record };
};

export const updateById = async (collectionName, id, updateData) => {
  const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;
  if (!cleanId) throw new Error("Invalid ID");
  const timestamp = new Date().toISOString();
  const updates = { ...updateData, updatedAt: timestamp };
  await db.ref(`${collectionName}/${cleanId}`).update(updates);
  const snapshot = await db.ref(`${collectionName}/${cleanId}`).once('value');
  return { _id: cleanId, ...snapshot.val() };
};

export const deleteById = async (collectionName, id) => {
  const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;
  await db.ref(`${collectionName}/${cleanId}`).remove();
  return { success: true };
};

export const deleteMany = async (collectionName, ids) => {
  const updates = {};
  ids.forEach(id => { updates[`${collectionName}/${id}`] = null; });
  await db.ref().update(updates);
  return { success: true };
};