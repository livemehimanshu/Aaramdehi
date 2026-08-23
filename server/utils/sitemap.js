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

export const buildSitemapXml = ({ baseUrl, products = [], blogs = [] }) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  // Normalize Firebase Array or Object responses safely
  const rawProdList = Array.isArray(products) ? products : Object.values(products || {});
  const blogList = Array.isArray(blogs) ? blogs : Object.values(blogs || {});

  // ✅ FILTER: Only include products with valid slugs/names (fixes 404 errors)
  const prodList = rawProdList.filter(product => {
    if (!product) return false;
    const hasValidId = product?.slug && String(product.slug).trim();
    const hasName = product?.name && String(product.name).trim();
    const isActive = product?.active !== false; // Exclude explicitly inactive products
    return (hasValidId || hasName) && isActive;
  });

  if (rawProdList.length > prodList.length) {
    const filtered = rawProdList.length - prodList.length;
    console.warn(`⚠️  Sitemap: Filtered out ${filtered} invalid/missing products`);
  }

  // 1. Primary Clean Static Pages (No trailing slashes or redirects)
  const staticPages = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: '/products', changefreq: 'weekly', priority: '0.9' },
    { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
    { path: '/contact-us', changefreq: 'monthly', priority: '0.7' },
    { path: '/ar-studio', changefreq: 'monthly', priority: '0.7' },
    { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  ];

  const locations = new Set();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const appendUrl = ({ path, lastmod, changefreq, priority }) => {
    const location = `${normalizedBaseUrl}${path}`;
    if (locations.has(location)) return;
    locations.add(location);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(location)}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
    xml += `    <priority>${escapeXml(priority)}</priority>\n`;
    xml += `  </url>\n`;
  };

  // Append static pages using their canonical paths.
  staticPages.forEach(appendUrl);

  // 2. Append Dynamic Product URLs. Product slugs are the preferred public IDs.
  prodList.forEach((product) => {
    const productId = product?.slug || product?._id || product?.id;
    if (!productId) return;

    const productPath = `/${encodeURIComponent(String(productId))}`;
    const lastmod = product?.updatedAt || product?.createdAt || new Date().toISOString();

    appendUrl({ path: productPath, lastmod, changefreq: 'weekly', priority: '0.9' });
  });

  // 3. Append published blog URLs.
  blogList.forEach((blog) => {
    if (blog.status !== 'Published') return; // Only include published blogs
    const blogSlug = blog?.slug || blog?._id || blog?.id;
    if (!blogSlug) return;

    const blogPath = `/blog/${encodeURIComponent(String(blogSlug))}`;
    const lastmod = blog?.updatedAt || blog?.publishedAt || blog?.createdAt || new Date().toISOString();

    appendUrl({ path: blogPath, lastmod, changefreq: 'weekly', priority: '0.8' });
  });

  xml += `</urlset>`;

  return xml;
};