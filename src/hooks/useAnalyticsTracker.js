import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../api/firebase';

const ANALYTICS_EVENTS_COLLECTION = 'analytics_events';

const getCurrentUserId = (userId) => userId || auth?.currentUser?.uid || 'guest';

/**
 * Records a normalized user event in Firestore.
 * The tracker is intentionally best-effort so analytics failures never block checkout.
 */
export const trackUserAction = async ({
  userId,
  productId = null,
  eventType,
  categoryId = null
} = {}) => {
  if (!firestore || !eventType) return null;

  return addDoc(collection(firestore, ANALYTICS_EVENTS_COLLECTION), {
    userId: getCurrentUserId(userId),
    productId: productId || null,
    eventType: String(eventType),
    categoryId: categoryId || null,
    timestamp: serverTimestamp()
  });
};

export const useAnalyticsTracker = (userId) => ({
  trackUserAction: (event) => trackUserAction({ ...event, userId: event?.userId || userId })
});

export default useAnalyticsTracker;
