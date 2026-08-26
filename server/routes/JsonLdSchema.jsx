import React from 'react';

const JsonLdSchema = ({ product }) => {
  if (!product) return null;

  const imageUrl = product.thumbnail || product.images?.[0]?.url || product.images?.[0];
  const stock = product.stock ?? product.quantity;
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": imageUrl ? [imageUrl] : undefined,
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
      "availability": stock == null || Number(stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default JsonLdSchema;