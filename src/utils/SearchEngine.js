import api from '../api/axiosInstance'; // Use same instance as authAndAdminApi

export function useProductSearch() {
  return async function(query) {
    const trimmedQuery = String(query || '').trim();
    if (!trimmedQuery) {
      return { results: [], latency: '0ms' };
    }

    const start = performance.now();
    try {
      // ✅ Call /api/products (which is proxied by Vite to localhost:8000)
      const response = await api.get('/products', {
        params: {
          search: trimmedQuery,
          limit: 8
        }
      });

      console.log(`🔍 SearchEngine Raw Output for "${trimmedQuery}":`, response?.data);
      // 🚨 ERROR CHECK: Detect if we got HTML instead of JSON
      if (typeof response?.data === 'string' && response.data.includes('<!doctype')) {
        console.error(`❌ CRITICAL: API returned HTML instead of JSON!`);
        console.error(`   Endpoint: /products?search=${trimmedQuery}`);
        console.error(`   Backend may not be running or route doesn't exist`);
        console.error(`   Check: Is backend on localhost:8000? Is /api/products route configured?`);
        return { results: [], latency: `${Math.round(performance.now() - start)}ms` };
      }
      // ✅ ROBUST EXTRACTION: Handle all possible nested formats
      let products = [];
      
      if (Array.isArray(response?.data?.data)) {
        products = response.data.data;
      } else if (Array.isArray(response?.data?.results)) {
        products = response.data.results;
      } else if (Array.isArray(response?.data)) {
        products = response.data;
      } else if (response?.data?.success && Array.isArray(response?.data?.data)) {
        products = response.data.data;
      }

      console.log(`🔍 Extracted products array (${products.length} items):`, products);
      
      // Use backend latency if provided, otherwise calculate client-side
      const backendLatency = response?.data?.latency_ms;
      const latency = backendLatency || `${Math.round(performance.now() - start)}ms`;

      const results = Array.isArray(products) ? products.map((item) => ({
        id: item.id || item._id || item?.productId || item?.slug,
        title: item.name || item.title || item.productName || 'Unknown Product',
        category: item.category || item.subCategory || '',
        sellingPrice: item.sellingPrice || item.price || 0,
        thumbnail: item.thumbnail || (item.images?.[0]?.url) || item.image || '',
      })) : [];

      console.log(`✅ SearchEngine results (${results.length} formatted items):`, results);
      return { results, latency };
    } catch (error) {
      console.error('❌ Search Engine error:', error);
      const latency = `${Math.round(performance.now() - start)}ms`;
      return { results: [], latency };
    }
  };
}

export default useProductSearch;
