// server/routes/seo.route.js

import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findAll } from '../config/db.js';
import { buildSitemapXml } from '../utils/sitemap.js';
import {
    getGlobalSeo,
    updateGlobalSeo,
    getSeoByType,
    updateSeoByType,
    getAllSeo
} from '../controllers/seo.controller.js';

const seoRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const robotsTxtPath = path.join(__dirname, 'robots.txt');

// Global SEO Routes
seoRouter.get('/global', getGlobalSeo);
seoRouter.put('/global', updateGlobalSeo);

// Specific Page/Type SEO Routes
seoRouter.get('/type/:type', getSeoByType);
seoRouter.put('/type/:type', updateSeoByType);

// Fetch All SEO Data Route
seoRouter.get('/all', getAllSeo);

const safeFindAll = async (collectionName) => {
    try {
        return await findAll(collectionName);
    } catch (error) {
        console.warn(`Sitemap fallback: unable to read ${collectionName}:`, error?.message || error);
        return [];
    }
};

// Dynamic Sitemap Endpoint
seoRouter.get('/sitemap.xml', async (req, res) => {
    try {
        const apiBase = process.env.FRONTEND_URL || "https://www.aaramdehi.co.in";
        const [products, categories, blogs] = await Promise.all([
            safeFindAll('products'),
            safeFindAll('categories'),
            safeFindAll('blogs')
        ]);
        const xml = buildSitemapXml({ baseUrl: apiBase, products, categories, blogs });

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("❌ Error generating sitemap:", error);
        const fallbackXml = buildSitemapXml({
            baseUrl: process.env.FRONTEND_URL || "https://www.aaramdehi.co.in",
            products: [],
            categories: [],
            blogs: []
        });
        res.header('Content-Type', 'application/xml');
        res.status(200).send(fallbackXml);
    }
});

// Robots.txt Endpoint
seoRouter.get('/robots.txt', (req, res) => {
    try {
        const robotsContent = readFileSync(robotsTxtPath, 'utf8');
        res.type('text/plain').send(robotsContent);
    } catch (error) {
        console.error("❌ Error reading robots.txt:", error);
        res.status(500).send('Unable to load robots.txt');
    }
});

export default seoRouter;