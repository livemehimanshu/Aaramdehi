import { findAll } from '../server/config/db.js';
import { buildSitemapXml } from '../server/utils/sitemap.js';

const safeFindAll = async (collectionName) => {
  try {
    return await findAll(collectionName);
  } catch (error) {
    console.warn(`Sitemap fallback: unable to read ${collectionName}:`, error?.message || error);
    return [];
  }
};

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in';
    const [products, blogs] = await Promise.all([
      safeFindAll('products'),
      safeFindAll('blogs')
    ]);
    const xml = buildSitemapXml({ baseUrl, products, blogs });

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Vercel sitemap generation failed:', error);
    const fallbackXml = buildSitemapXml({
      baseUrl: process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in',
      products: [],
      blogs: []
    });
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(fallbackXml);
  }
}
