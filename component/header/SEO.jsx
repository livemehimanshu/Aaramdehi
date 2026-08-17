import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Normalize URL for canonical tag (removes query params, trailing slashes, duplicates)
 * CRITICAL: Google requires explicit canonical tags to resolve "Duplicate without user-selected canonical" issues
 */
const getNormalizedUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    // Remove query parameters and trailing slash for clean canonical
    const normalized = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(/\/$/, '');
    return normalized;
  } catch {
    return url;
  }
};

/**
 * SEO Optimizer Component
 * @param {string} title - Page ka title
 * @param {string} description - Page ka description
 * @param {string} keywords - Keywords for search engines
 * @param {string} ogImage - Social media image
 * @param {string} path - Path/Route of current page (e.g. "/products")
 * @param {string} ogUrl - Custom Canonical URL override (REQUIRED for product pages)
 */
const SEO = ({ title, description, keywords, ogImage, path = '', ogUrl, schemaType, schemaData, noindex = false, is404 = false }) => {
  const siteName = "Aaramdehi - Comfort Redefined";
  const siteUrl = "https://www.aaramdehi.co.in";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Aaramdehi offers premium furniture and home decor. Redefine your comfort with our curated collection.";
  
  // ✅ SEO FIX: Add noindex for actual 404 pages
  const shouldNoindex = noindex || is404;

  // 🟢 EXPLICIT Canonical URL Construction (Removes Query Parameters & Trailing Slashes)
  // GOOGLE FIX: Explicit canonical tags resolve "Duplicate without user-selected canonical" errors
  let cleanCanonical = ogUrl;
  if (!cleanCanonical) {
    if (path) {
      const cleanPath = path.split('?')[0].replace(/\/$/, '');
      cleanCanonical = `${siteUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
    } else if (typeof window !== 'undefined') {
      const windowPath = window.location.pathname.replace(/\/$/, '');
      cleanCanonical = `${siteUrl}${windowPath}`;
    } else {
      cleanCanonical = siteUrl;
    }
  }
  
  // ✅ Normalize canonical URL to prevent duplicates
  cleanCanonical = getNormalizedUrl(cleanCanonical);

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      <meta name='keywords' content={keywords || "furniture, luxury bedding, home decor, Aaramdehi"} />
      {shouldNoindex ? (
        <meta name='robots' content='noindex,nofollow' />
      ) : (
        <meta name='robots' content='index,follow,max-snippet:-1,max-image-preview:large' />
      )}
      
      {/* 🟢 Fixed Canonical Tag for Google Search Console */}
      <link rel="canonical" href={cleanCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || "/logo.png"} />
      <meta property="og:url" content={cleanCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || "/logo.png"} />

      {/* JSON-LD Structured Data */}
      {schemaData && schemaType && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;