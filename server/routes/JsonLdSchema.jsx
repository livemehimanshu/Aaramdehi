import React from 'react';

const JsonLdSchema = ({ product }) => {
  if (!product) return null;

  const imageUrl = product.thumbnail || product.images?.[0]?.url || product.images?.[0];
  const stock = product.stock ?? product.quantity;
  const rating = product.rating || product.ratings?.average || 5;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;

  // ✅ Truncate product name to 150 characters (Google Search Console requirement)
  const truncatedName = String(product.name || '').substring(0, 150).trim();

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": truncatedName,
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
      "itemCondition": "https://schema.org/NewCondition",
      // ✅ Merchant shipping details (reduces Google Search Console warnings)
      "shippingDetails": {
        "@type": "ShippingDeliveryTime",
        "shippingRate": {
          "@type": "PriceSpecification",
          "priceCurrency": "INR",
          "price": "0"
        },
        "shippingDestination": {
          "@type": "DeliveryArea",
          "areaServed": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      // ✅ Merchant return policy (reduces Google Search Console warnings)
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
        "returnableByMerchant": true
      }
    },
    ...(reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "ratingCount": reviewCount,
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