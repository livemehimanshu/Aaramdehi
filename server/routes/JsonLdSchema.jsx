import React from 'react';
import { Helmet } from 'react-helmet-async';

const JsonLdSchema = ({ product }) => {
  if (!product) return null;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.thumbnail || product.images?.[0]?.url,
    "description": product.description || product.shortDescription,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Aaramdehi"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.sellingPrice,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  const pageUrl = window.location.href;
  const imageUrl = product.thumbnail || product.images?.[0]?.url;

  return (
    <>
      <Helmet>
        <title>{product.name} | Aaramdehi Premium</title>
        <meta name="description" content={product.shortDescription || product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.shortDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </>
  );
};

export default JsonLdSchema;