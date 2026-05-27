export function addToRecentlyViewed(item) {
  try {
    const key = 'recentlyViewed';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const id = item.id || item._id;
    const deduped = arr.filter(i => (i.id || i._id) !== id);
    deduped.unshift({ id, name: item.name, image: item.image || item.thumbnail, price: item.price || item.sellingPrice });
    localStorage.setItem(key, JSON.stringify(deduped.slice(0, 20)));
  } catch (e) {
    console.warn('recentlyViewedUtils:add error', e);
  }
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch (e) {
    return [];
  }
}
