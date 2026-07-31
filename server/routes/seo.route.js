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

seoRouter.get('/global', getGlobalSeo);
seoRouter.put('/global', updateGlobalSeo);
seoRouter.get('/type/:type', getSeoByType);
seoRouter.put('/type/:type', updateSeoByType);
seoRouter.get('/all', getAllSeo);

seoRouter.get('/sitemap.xml', async (req, res) => {
    try {
        const apiBase = process.env.FRONTEND_URL || "https://www.aaramdehi.co.in";
        const products = await findAll('products');
        const categories = await findAll('categories');
        const xml = buildSitemapXml({ baseUrl: apiBase, products, categories });

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        res.status(500).send("Error generating sitemap");
    }
});

seoRouter.get('/robots.txt', (req, res) => {
    try {
        const robotsContent = readFileSync(robotsTxtPath, 'utf8');
        res.type('text/plain').send(robotsContent);
    } catch (error) {
        res.status(500).send('Unable to load robots.txt');
    }
});

export default seoRouter;