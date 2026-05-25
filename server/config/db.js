import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

/**
 * Initialize Firebase Admin SDK
 * Supports local serviceAccountKey.json or Vercel Environment Variables
 */
let serviceAccount;

// Check environment variables first (for production/Vercel)
if (process.env.FIREBASE_PROJECT_ID) {
  console.log('✅ Using Firebase credentials from environment variables');
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Try to load from serviceAccountKey.json
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(keyPath)) {
    console.log('✅ Using Firebase credentials from serviceAccountKey.json');
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } else {
    console.warn(`
⚠️  WARNING: Firebase credentials file not found!
    
Missing file: ${keyPath}

📋 How to fix:
   1. Go to: https://console.firebase.google.com/
   2. Select project: aaramdehi-91f82
   3. Settings (⚙️) → Project Settings
   4. Service Accounts tab
   5. "Generate New Private Key"
   6. Save as: server/config/serviceAccountKey.json

📝 For now, using dummy credentials (development only)
    `);
    
    throw new Error("Firebase Admin SDK failed to initialize: serviceAccountKey.json was not found or is invalid. App cannot start without a valid private key.");
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aaramdehi-91f82-default-rtdb.firebaseio.com/"
  });
}

export const db = admin.database();

/**
 * Helper function: GET ALL (Equivalent to Model.find())
 * Maps Firebase keys to _id to maintain frontend compatibility.
 * @param {string} collectionName - The path in the RTDB (e.g., 'products', 'banners')
 */
export const findAll = async (collectionName) => {
  try {
    const snapshot = await db.ref(collectionName).once('value');
    const data = snapshot.val();
    if (!data) return [];
    
    // Convert the object of objects into an array, injecting the key as _id
    return Object.keys(data).map(key => ({
      _id: key,
      ...data[key]
    }));
  } catch (error) {
    console.error(`Firebase Error (findAll ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: GET PAGINATED
 * Efficiently fetches data with limit and ordering for large datasets.
 */
export const findPaginated = async (collectionName, limit = 10, lastKey = null) => {
  try {
    let query = db.ref(collectionName).orderByKey().limitToFirst(parseInt(limit));
    
    if (lastKey) {
      query = query.startAfter(lastKey);
    }

    const snapshot = await query.once('value');
    const data = snapshot.val();
    if (!data) return { items: [], lastKey: null };

    const items = Object.keys(data).map(key => ({ _id: key, ...data[key] }));
    const newLastKey = items.length > 0 ? items[items.length - 1]._id : null;

    return { items, lastKey: newLastKey };
  } catch (error) {
    console.error(`Firebase Error (findPaginated ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: GET BY ID (Equivalent to Model.findById(id))
 * @param {string} collectionName - The path in the RTDB
 * @param {string} id - The unique key of the record
 */
export const findById = async (collectionName, id) => {
  try {
    // Extract ID string if an object was passed
    const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;
    
    if (!cleanId || typeof cleanId !== 'string') {
      console.warn(`⚠️ Invalid ID passed to findById (${collectionName}):`, id);
      return null;
    }

    const snapshot = await db.ref(`${collectionName}/${cleanId}`).once('value');
    const data = snapshot.val();
    if (!data) return null;
    
    return { _id: cleanId, ...data };
  } catch (error) {
    console.error(`Firebase Error (findById ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: FIND BY QUERY (Equivalent to Model.find({property: value}))
 * Filters records based on a property value
 * @param {string} collectionName - The path in the RTDB
 * @param {string} property - The property to filter by
 * @param {any} value - The value to match
 */
export const findByQuery = async (collectionName, property, value) => {
  try {
    const snapshot = await db.ref(collectionName).once('value');
    const data = snapshot.val();
    if (!data) return [];
    
    const results = Object.keys(data)
      .filter(key => data[key][property] === value)
      .map(key => ({
        _id: key,
        ...data[key]
      }));
    
    return results;
  } catch (error) {
    console.error(`Firebase Error (findByQuery ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: POST (Equivalent to new Model(data).save())
 * @param {string} collectionName - The path in the RTDB
 * @param {Object} data - The data object to save (Cloudinary URLs supported)
 */
export const create = async (collectionName, data) => {
  try {
    const newRef = db.ref(collectionName).push();
    const timestamp = new Date().toISOString();
    const record = { ...data, createdAt: timestamp, updatedAt: timestamp };
    await newRef.set(record);
    return { _id: newRef.key, ...record };
  } catch (error) {
    console.error(`Firebase Error (create ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: UPDATE (Equivalent to Model.findByIdAndUpdate(id, data))
 * @param {string} collectionName - The path in the RTDB
 * @param {string} id - The unique key of the record
 * @param {Object} updateData - The data to update
 */
export const updateById = async (collectionName, id, updateData) => {
  try {
    const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;

    if (!cleanId || typeof cleanId !== 'string') {
      throw new Error(`Cannot update: Invalid ID provided for ${collectionName}`);
    }

    const timestamp = new Date().toISOString();
    const updates = { ...updateData, updatedAt: timestamp };
    await db.ref(`${collectionName}/${cleanId}`).update(updates);
    
    const snapshot = await db.ref(`${collectionName}/${cleanId}`).once('value');
    return { _id: cleanId, ...snapshot.val() };
  } catch (error) {
    console.error(`Firebase Error (updateById ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: DELETE (Equivalent to Model.findByIdAndDelete(id))
 * @param {string} collectionName - The path in the RTDB
 * @param {string} id - The unique key of the record
 */
export const deleteById = async (collectionName, id) => {
  try {
    const cleanId = (id && typeof id === 'object') ? (id._id || id.id) : id;

    if (!cleanId || typeof cleanId !== 'string') {
      throw new Error(`Cannot delete: Invalid ID provided for ${collectionName}`);
    }

    await db.ref(`${collectionName}/${cleanId}`).remove();
    return { success: true, message: `Deleted ${cleanId} from ${collectionName}` };
  } catch (error) {
    console.error(`Firebase Error (deleteById ${collectionName}):`, error);
    throw error;
  }
};

/**
 * Helper function: BATCH DELETE (Delete multiple records)
 * @param {string} collectionName - The path in the RTDB
 * @param {Array<string>} ids - Array of IDs to delete
 */
export const deleteMany = async (collectionName, ids) => {
  try {
    const updates = {};
    ids.forEach(id => {
      updates[`${collectionName}/${id}`] = null;
    });
    await db.ref().update(updates);
    return { success: true, deletedCount: ids.length };
  } catch (error) {
    console.error(`Firebase Error (deleteMany ${collectionName}):`, error);
    throw error;
  }
};