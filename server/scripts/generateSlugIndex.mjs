import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { findAll, db } from '../config/db.js';

// Load env from server folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const slugify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const buildIndex = async ({ dryRun = true, force = false } = {}) => {
  console.log('Fetching all products...');
  const all = await findAll('products');
  console.log(`Found ${all.length} products`);

  const updates = {};
  for (const p of all) {
    const slug = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name || p.title || p.productName || p._id);
    if (!slug) continue;
    const key = `slugs/${slug}`;
    if (!force) {
      const existing = (await db.ref(key).once('value')).val();
      if (existing) {
        // skip existing mapping
        continue;
      }
    }
    updates[key] = p._id || p.id;
  }

  const keys = Object.keys(updates);
  console.log(`Prepared ${keys.length} slug mappings (${dryRun ? 'dry-run' : 'will write'})`);
  if (dryRun) return updates;

  // Write updates
  try {
    await db.ref().update(updates);
    console.log('Slug index updated successfully');
  } catch (err) {
    console.error('Failed to write slug index:', err.message || err);
    throw err;
  }
};

// CLI
(async () => {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const force = args.includes('--force');

  try {
    const result = await buildIndex({ dryRun, force });
    if (dryRun) {
      console.log('Dry run completed. Example mappings:');
      const sampleKeys = Object.keys(result).slice(0, 10);
      for (const k of sampleKeys) console.log(k, '=>', result[k]);
      console.log('\nTo apply mappings run: node server/scripts/generateSlugIndex.mjs --apply');
      if (!force) console.log('Use --force to overwrite existing mappings.');
    }
  } catch (err) {
    console.error('Error building slug index:', err.message || err);
    process.exit(1);
  }
})();
