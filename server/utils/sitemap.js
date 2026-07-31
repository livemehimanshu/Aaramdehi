const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeBaseUrl = (baseUrl) => String(baseUrl || 'https://www.aaramdehi.co.in').replace(/\/$/, '');

export const buildSitemapXml = ({ baseUrl, products = [], categories = [] }) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/products', changefreq: 'weekly', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.8' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' },
    { path: '/ar-studio', changefreq: 'monthly', priority: '0.7' },
    { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticPages.forEach(({ path, changefreq, priority }) => {
    xml += `
      <url>
        <loc>${escapeXml(`${normalizedBaseUrl}${path}`)}</loc>
        <changefreq>${escapeXml(changefreq)}</changefreq>
        <priority>${escapeXml(priority)}</priority>
      </url>`;
  });

  products.forEach((product) => {
    const productId = product?.slug || product?._id || product?.id;
    if (!productId) return;

    const productPath = `/product/${encodeURIComponent(productId)}`;
    const lastmod = product?.updatedAt || product?.createdAt || new Date().toISOString();

    xml += `
      <url>
        <loc>${escapeXml(`${normalizedBaseUrl}${productPath}`)}</loc>
        <lastmod>${escapeXml(lastmod)}</lastmod>
        <priority>0.9</priority>
      </url>`;
  });

  categories.forEach((category) => {
    const categorySlug = category?.slug || category?.name;
    if (!categorySlug) return;

    const categoryPath = `/categories#${encodeURIComponent(String(categorySlug))}`;
    xml += `
      <url>
        <loc>${escapeXml(`${normalizedBaseUrl}${categoryPath}`)}</loc>
        <priority>0.7</priority>
      </url>`;
  });

  xml += `
</urlset>`;

  return xml;
};
