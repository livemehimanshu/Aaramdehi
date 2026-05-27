import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Optimizer Component
 * @param {string} title - Page ka title
 * @param {string} description - Page ka description (SEO ke liye important)
 * @param {string} keywords - Keywords for search engines
 * @param {string} ogImage - Social media image
 * @param {string} ogUrl - Canonical URL
 */
const SEO = ({ title, description, keywords, ogImage, ogUrl }) => {
  const siteName = "Aaramdehi - Comfort Redefined";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Aaramdehi offers premium furniture and home decor. Redefine your comfort with our curated collection.";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      <meta name='keywords' content={keywords || "furniture, luxury bedding, home decor, Aaramdehi"} />
      <link rel="canonical" href={ogUrl || window.location.href} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || "/logo.png"} />
      <meta property="og:url" content={ogUrl || window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || "/logo.png"} />
    </Helmet>
  );
};

export default SEO;