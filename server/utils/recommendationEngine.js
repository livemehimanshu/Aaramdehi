import { db } from '../config/db.js';

const RELATIONS_COLLECTION = 'product_relations';

const getProductId = (item) => String(item?.productId || item?.product || '').trim();

export const updateProductRelations = async (orderItems = []) => {
  const productIds = [...new Set(orderItems.map(getProductId).filter(Boolean))];
  if (productIds.length < 2) return;

  const updates = [];
  for (const productId of productIds) {
    for (const relatedProductId of productIds) {
      if (productId === relatedProductId) continue;

      const relationRef = db.ref(`${RELATIONS_COLLECTION}/${productId}/${relatedProductId}`);
      updates.push(relationRef.transaction((currentWeight) => Number(currentWeight || 0) + 1));
    }
  }

  await Promise.all(updates);
};
