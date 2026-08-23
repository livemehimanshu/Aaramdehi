// server/routes/seo.route.js

import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';
import {
    getGlobalSeo,
    updateGlobalSeo,
    getSeoByType,
    updateSeoByType,
    getAllSeo,
    generateDynamicSitemap
} from '../controllers/seo.controller.js';

const seoRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const robotsTxtPath = path.join(__dirname, 'robots.txt');

// Global SEO Routes
seoRouter.get('/global', getGlobalSeo);
seoRouter.put('/global', isAuthenticatedUser, isAdmin, updateGlobalSeo);

// Specific Page/Type SEO Routes
seoRouter.get('/type/:type', getSeoByType);
seoRouter.put('/type/:type', isAuthenticatedUser, isAdmin, updateSeoByType);

// Fetch All SEO Data Route
seoRouter.get('/all', getAllSeo);

// Dynamic Sitemap Endpoint
seoRouter.get('/sitemap.xml', generateDynamicSitemap);


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