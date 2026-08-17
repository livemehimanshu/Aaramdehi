/**
 * Sitemap Validation Script
 * Purpose: Identify and fix broken product references in sitemap
 * Run: node server/scripts/validate-sitemap.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { findAll, findById, db } from '../config/db.js';

const COLLECTION = 'products';

async function validateSitemap() {
    console.log('🔍 Starting Sitemap Validation...\n');

    try {
        // 1. Get all products
        const allProducts = await findAll(COLLECTION);
        console.log(`✅ Found ${allProducts.length} products in database\n`);

        // 2. Categorize products
        const validProducts = allProducts.filter(p => {
            const hasSlug = p.slug && String(p.slug).trim();
            const hasName = p.name && String(p.name).trim();
            const hasTitle = p.title && String(p.title).trim();
            return hasSlug || hasName || hasTitle;
        });

        const orphanedProducts = allProducts.filter(p => {
            const hasSlug = p.slug && String(p.slug).trim();
            const hasName = p.name && String(p.name).trim();
            const hasTitle = p.title && String(p.title).trim();
            return !hasSlug && !hasName && !hasTitle;
        });

        console.log(`📊 Product Breakdown:`);
        console.log(`   - Valid products: ${validProducts.length}`);
        console.log(`   - Orphaned (no name/title/slug): ${orphanedProducts.length}\n`);

        // 3. Check for common 404 products
        const potentiallyDeletedIds = [
            '-OykFmf8Lf5qQhk0Ff9R', // From error logs
        ];

        console.log('🔎 Checking for known broken product IDs...');
        for (const id of potentiallyDeletedIds) {
            try {
                const product = await findById(COLLECTION, id);
                if (!product) {
                    console.log(`   ❌ ${id} - NOT FOUND (likely deleted)`);
                } else {
                    console.log(`   ✅ ${id} - Found: ${product.name || product.title}`);
                }
            } catch (err) {
                console.log(`   ⚠️  ${id} - Error checking: ${err.message}`);
            }
        }

        // 4. Generate recommendations
        console.log('\n📋 Recommendations:');
        console.log('   1. ✅ Regenerate sitemap via /api/sitemap.xml endpoint');
        console.log('   2. ✅ Resubmit sitemap in Google Search Console');
        console.log('   3. ✅ Check for products with missing slugs (orphaned)');
        if (orphanedProducts.length > 0) {
            console.log(`\n   ⚠️  Found ${orphanedProducts.length} orphaned products:`);
            orphanedProducts.slice(0, 5).forEach(p => {
                console.log(`      - ID: ${p._id} (no name/slug)`);
            });
        }

        console.log('\n✅ Sitemap validation complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

// Run validation
validateSitemap();
