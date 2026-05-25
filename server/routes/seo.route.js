import { Router } from 'express';
import { findAll } from '../config/db.js';

const seoRouter = Router();

seoRouter.get('/sitemap.xml', async (req, res) => {
    try {
        const apiBase = process.env.FRONTEND_URL || "https://aaramdehi.com";
        
        // Fetch all data from Firebase
        const products = await findAll('products');
        const categories = await findAll('categories');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Static Pages
        const staticPages = ['', '/products', '/about', '/contact', '/login'];
        staticPages.forEach(page => {
            xml += `
            <url>
                <loc>${apiBase}${page}</loc>
                <changefreq>daily</changefreq>
                <priority>0.8</priority>
            </url>`;
        });

        // Dynamic Product Pages
        products.forEach(product => {
            xml += `
            <url>
                <loc>${apiBase}/product/${product._id || product.id}</loc>
                <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString()}</lastmod>
                <priority>0.9</priority>
            </url>`;
        });

        // Dynamic Category Pages
        categories.forEach(cat => {
            xml += `
            <url>
                <loc>${apiBase}/category/${cat.slug || cat.name.toLowerCase()}</loc>
                <priority>0.7</priority>
            </url>`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        res.status(500).send("Error generating sitemap");
    }
});

export default seoRouter;