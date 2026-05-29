import api from './authUtils'; // Use default export consistently

export function useProductSearch() {
  return async function(query) {
    const trimmedQuery = String(query || '').trim();
    if (!trimmedQuery) {
      return { results: [], latency: '0ms' };
    }

    const start = performance.now();
    try {
      const response = await api.get('/products', {
        params: {
          search: trimmedQuery,
          limit: 8
        }
      });

      const latency = `${Math.round(performance.now() - start)}ms`;
      // API structure ke hisaab se data extract karein
      const products = response?.data?.data || response?.data || [];
      const results = products.map((item) => ({
        id: item.id || item._id || item?.productId || item?.slug,
        title: item.name || item.title || item.productName || 'Unknown Product',
        category: item.category || item.subCategory || '',
        sellingPrice: item.sellingPrice || item.price || 0,
        thumbnail: item.thumbnail || (item.images?.[0]?.url) || item.image || '',
      }));

      return { results, latency };
    } catch (error) {
      console.error('Search Engine error:', error);
      const latency = `${Math.round(performance.now() - start)}ms`;
      return { results: [], latency };
    }
  };
}

export default useProductSearch;
