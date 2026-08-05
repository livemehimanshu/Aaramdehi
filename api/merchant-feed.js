// api/merchant-feed.js
import { findAll } from '../server/config/db.js';
import { buildMerchantFeedXml } from '../server/utils/merchantFeed.js';

export default async function handler(req, res) {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in';
    const products = await findAll('products');
    const xml = buildMerchantFeedXml({ baseUrl, products });

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Merchant feed generation error:', error);
    res.status(500).send('Error generating merchant feed');
  }
}
