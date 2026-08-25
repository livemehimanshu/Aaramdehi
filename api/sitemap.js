import { buildFallbackSitemapXml, buildSitemapXml } from '../server/utils/sitemap.js';

const safeFindAll = async (findAll, collectionName) => {
  try {
    return await findAll(collectionName);
  } catch (error) {
    console.warn(`Sitemap fallback: unable to read ${collectionName}:`, error?.message || error);
    return [];
  }
};

const hasFirebaseCredentials = () => Boolean(
  process.env.FIREBASE_CONFIG_JSON ||
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
);

const fetchBackendSitemap = async () => {
  const backendUrl = (process.env.BACKEND_URL || 'https://aaramdehi.onrender.com').replace(/\/$/, '');
  const response = await fetch(`${backendUrl}/api/sitemap`, {
    signal: AbortSignal.timeout(8000),
    headers: { accept: 'application/xml' }
  });
  const xml = await response.text();
  if (!response.ok || !xml.includes('<urlset')) {
    throw new Error(`Backend sitemap request failed (${response.status})`);
  }
  return xml;
};

export default async function handler(req, res) {
  const baseUrl = process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in';
  const sendXml = (xml, status = 200) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(status).send(xml);
  };

  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    if (req.method === 'HEAD') return sendXml('', 200);
    if (!hasFirebaseCredentials()) {
      try {
        return sendXml(await fetchBackendSitemap());
      } catch (error) {
        console.warn('Sitemap backend data unavailable; serving fallback sitemap:', error?.message || error);
        return sendXml(buildFallbackSitemapXml(baseUrl));
      }
    }

    const { findAll } = await import('../server/config/db.js');
    const [products, blogs] = await Promise.all([
      safeFindAll(findAll, 'products'),
      safeFindAll(findAll, 'blogs')
    ]);
    const xml = buildSitemapXml({ baseUrl, products, blogs });
    return sendXml(xml);
  } catch (error) {
    console.warn('Vercel sitemap data fetch failed. Serving fallback sitemap:', error?.message || error);
    return sendXml(buildFallbackSitemapXml(baseUrl));
  }
}
