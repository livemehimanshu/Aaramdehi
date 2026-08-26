import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Build one absolute canonical URL for every page. Query strings and hashes are
 * excluded because filters, tracking parameters, and fragments are not pages.
 */
const getNormalizedUrl = (url, siteUrl) => {
  try {
    const urlObj = new URL(url || '/', siteUrl);
    const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
    return `${urlObj.origin}${pathname}`;
  } catch {
    return siteUrl;
  }
};

/**
 * SEO Optimizer Component
 * @param {string} title - Page ka title
 * @param {string} description - Page ka description
 * @param {string} keywords - Keywords for search engines
 * @param {string} ogImage - Social media image
 * @param {string} path - Path/Route of current page (e.g. "/products")
 * @param {string} ogUrl - Optional absolute or relative canonical URL override
 */
const SEO = ({ title, description, keywords, ogImage, path = '', ogUrl, ogType = 'website', schemaType, schemaData, noindex = false, is404 = false }) => {
  const siteName = "Aaramdehi - Comfort Redefined";
  const siteUrl = "https://www.aaramdehi.co.in";
  const fullTitle = title
    ? (/aaramdehi/i.test(title) ? title : `${title} | ${siteName}`)
    : siteName;
  const defaultDescription = "Aaramdehi offers premium furniture and home decor. Redefine your comfort with our curated collection.";
  const normalizedDescription = String(description || defaultDescription).replace(/\s+/g, ' ').trim();
  const normalizedKeywords = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(', ')
    : String(keywords || "furniture, luxury bedding, home decor, Aaramdehi");
  
  // Only callers that explicitly mark a page as non-indexable receive noindex.
  // is404 remains supported for existing callers that identify a real missing resource.
  const shouldNoindex = noindex === true || is404 === true;

  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const cleanCanonical = getNormalizedUrl(ogUrl || currentPath, siteUrl);
  const absoluteImage = ogImage ? new URL(ogImage, siteUrl).href : `${siteUrl}/aaramdehi-logo.svg`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={normalizedDescription} />
      <meta name='keywords' content={normalizedKeywords} />
      {shouldNoindex ? (
        <meta name='robots' content='noindex,nofollow' />
      ) : (
        <meta name='robots' content='index,follow,max-snippet:-1,max-image-preview:large' />
      )}
      
      {/* 🟢 Fixed Canonical Tag for Google Search Console */}
      <link rel="canonical" href={cleanCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={normalizedDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={title || 'Aaramdehi'} />
      <meta property="og:url" content={cleanCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={normalizedDescription} />
      <meta name="twitter:image" content={absoluteImage} />

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