// server/utils/merchantFeed.js

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const normalizeBaseUrl = (baseUrl) =>
  String(baseUrl || 'https://www.aaramdehi.co.in').replace(/\/$/, '');

export const buildMerchantFeedXml = ({ baseUrl, products = [] }) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const prodList = Array.isArray(products) ? products : Object.values(products || {});

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>Aaramdehi Products</title>\n`;
  xml += `    <link>${escapeXml(normalizedBaseUrl)}</link>\n`;
  xml += `    <description>Premium Cushions and Home Decor by Aaramdehi</description>\n`;

  prodList.forEach((product) => {
    // Basic validations to skip invalid products
    const productId = product?.slug || product?._id || product?.id;
    if (!productId || !product?.name || !product?.price) return;

    const productPath = `/products/${encodeURIComponent(String(productId))}`;
    const productUrl = `${normalizedBaseUrl}${productPath}`;
    
    // Fallback values
    const brand = product?.brand || 'Aaramdehi';
    const condition = 'new'; // Usually new for Aaramdehi
    const availability = (product.stock > 0 || product.inStock !== false) ? 'in_stock' : 'out_of_stock';
    const price = `${parseFloat(product.price).toFixed(2)} INR`;
    
    // Image handling
    let imageUrl = '';
    if (Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '');
    } else if (typeof product.image === 'string') {
      imageUrl = product.image;
    }
    
    // If no image, it's generally rejected by Google, but we still output it
    if (!imageUrl) imageUrl = `${normalizedBaseUrl}/logo.png`; 

    const description = product.description || product.name;

    xml += `    <item>\n`;
    xml += `      <g:id>${escapeXml(String(productId))}</g:id>\n`;
    xml += `      <g:title>${escapeXml(product.name)}</g:title>\n`;
    xml += `      <g:description>${escapeXml(description)}</g:description>\n`;
    xml += `      <g:link>${escapeXml(productUrl)}</g:link>\n`;
    xml += `      <g:image_link>${escapeXml(imageUrl)}</g:image_link>\n`;
    xml += `      <g:brand>${escapeXml(brand)}</g:brand>\n`;
    xml += `      <g:condition>${escapeXml(condition)}</g:condition>\n`;
    xml += `      <g:availability>${escapeXml(availability)}</g:availability>\n`;
    xml += `      <g:price>${escapeXml(price)}</g:price>\n`;
    
    // Optional additional images
    if (Array.isArray(product.images) && product.images.length > 1) {
        for(let i = 1; i < Math.min(product.images.length, 11); i++) {
            const extraImg = typeof product.images[i] === 'string' ? product.images[i] : (product.images[i].url || '');
            if(extraImg) {
                xml += `      <g:additional_image_link>${escapeXml(extraImg)}</g:additional_image_link>\n`;
            }
        }
    }

    // Optional Sales Price if discounted
    if (product.mrp && parseFloat(product.mrp) > parseFloat(product.price)) {
        xml += `      <g:sale_price>${escapeXml(price)}</g:sale_price>\n`;
        // if sale price exists, original price should be the MRP
        xml = xml.replace(`<g:price>${escapeXml(price)}</g:price>`, `<g:price>${escapeXml(`${parseFloat(product.mrp).toFixed(2)} INR`)}</g:price>`);
    }

    // Categories
    if (product.category) {
        xml += `      <g:product_type>${escapeXml(product.category)}</g:product_type>\n`;
    }

    xml += `    </item>\n`;
  });

  xml += `  </channel>\n`;
  xml += `</rss>`;

  return xml;
};
