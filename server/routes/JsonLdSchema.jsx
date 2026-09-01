import React from 'react';

const JsonLdSchema = ({ product }) => {
  if (!product) return null;

  const imageUrl = product.thumbnail || product.images?.[0]?.url || product.images?.[0];
  const stock = product.stock ?? product.quantity;
  const rating = product.rating || product.ratings?.average || 5;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;

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
    },
    ...(rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "ratingCount": Math.max(reviewCount, 1),
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    ...(reviewCount > 0 && {
      "review": reviews.map((review) => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.userName || review.author || "Anonymous"
        },
        "datePublished": review.createdAt || new Date().toISOString(),
        "description": review.comment || review.text || "",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating || 5,
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    })
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default JsonLdSchema;