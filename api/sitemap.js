import { findAll } from '../server/config/db.js';
import { buildSitemapXml } from '../server/utils/sitemap.js';

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in';
    const products = await findAll('products');
    const categories = await findAll('categories');
    const blogs = await findAll('blogs');
    const xml = buildSitemapXml({ baseUrl, products, categories, blogs });

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Vercel sitemap generation failed:', error);
    res.status(500).send('Error generating sitemap');
  }
}
