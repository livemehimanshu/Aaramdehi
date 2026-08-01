// server/utils/sitemap.js

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const normalizeBaseUrl = (baseUrl) =>
  String(baseUrl || 'https://www.aaramdehi.co.in').replace(/\/$/, '');

export const buildSitemapXml = ({ baseUrl, products = [], categories = [] }) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  // 1. Primary Static Pages
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/products', changefreq: 'weekly', priority: '0.9' },
    { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
    { path: '/contact-us', changefreq: 'monthly', priority: '0.7' },
    { path: '/ar-studio', changefreq: 'monthly', priority: '0.7' },
    { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Append Static Pages
  staticPages.forEach(({ path, changefreq, priority }) => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${normalizedBaseUrl}${path}`)}</loc>\n`;
    xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
    xml += `    <priority>${escapeXml(priority)}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Append Dynamic Category URLs
  categories.forEach((category) => {
    const categorySlug = category?.slug || category?.name || category?._id;
    if (!categorySlug) return;

    const categoryPath = `/products?category=${encodeURIComponent(String(categorySlug))}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${normalizedBaseUrl}${categoryPath}`)}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. Append Dynamic Product URLs
  products.forEach((product) => {
    const productId = product?.slug || product?._id || product?.id;
    if (!productId) return;

    const productPath = `/products/${encodeURIComponent(productId)}`;
    const lastmod = product?.updatedAt || product?.createdAt || new Date().toISOString();

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${normalizedBaseUrl}${productPath}`)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return xml;
};