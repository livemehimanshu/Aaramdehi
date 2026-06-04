import api from './axiosInstance';

export { api };

// ✅ Pro Cache: Prevent redundant network waterfalls
const memoryCache = new Map();

export async function getAllProductsAPI(params = {}) {
  try {
    console.log('🔍 Fetching products with params:', params); // ✅ DEBUG LOG
    const res = await api.get('/products', { params });
    console.log('✅ Products API Response:', res.data); // ✅ DEBUG LOG
    return res.data;
  } catch (e) {
    console.error('❌ Products API Error:', e);
    return { success: false, data: [] }
  }
}

export async function createProductAPI(productData) {
  try {
    // Let Axios handle the headers for FormData automatically
    const res = await api.post('/products/create', productData); 
    return res.data;
  } catch (e) {
    throw e; // Standard practice: Re-throw to allow component-level error handling
  }
}

export async function getProductByIdAPI(id) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getActiveCategoriesAPI() {
  try {
    if (memoryCache.has('active_categories')) return memoryCache.get('active_categories');
    
    const res = await api.get('/categories/active');
    const data = res.data;
    memoryCache.set('active_categories', data);
    return data;
  } catch (e) {
    return { success: false, data: [] } // ✅ Consistent error return
  }
}

export async function getAllCategoriesAPI() {
  try {
    // ✅ Corrected to match category.routes.js root handler
    const res = await api.get('/categories'); 
    return res.data;
  } catch (e) {
    return { success: false, data: [] }
  }
}

export async function getAllBannersAPI() {
  try {
    const res = await api.get('/banners');
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function getActiveBannersAPI() {
  try {
    const res = await api.get('/banners/active');
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function getBannerByIdAPI(id) {
  try {
    const res = await api.get(`/banners/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function createBannerAPI(bannerData) {
  try {
    const res = await api.post('/banners/create', bannerData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateBannerAPI(id, bannerData) {
  try {
    const res = await api.put(`/banners/update/${id}`, bannerData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteBannerAPI(id) {
  try {
    const res = await api.delete(`/banners/delete/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getSettingsAPI() {
  try {
    if (memoryCache.has('site_settings')) return memoryCache.get('site_settings');

    // Use the public settings endpoint so frontend doesn't require admin auth
    const res = await api.get('/settings/public');
    const data = res.data;
    memoryCache.set('site_settings', data);
    return data;
  } catch (e) {
    return { success: false, data: {} };
  }
}

export async function validateCouponAPI(params) {
  try {
    // ✅ Changed to POST because backend coupon.controller.js expects data in req.body
    const res = await api.post('/coupons/validate', params);
    return res.data;
  } catch (e) {
    return { success: false }
  }
}

export async function getAdminDetailsAPI() {
  try {
    const res = await api.get('/user/details');
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function deleteCouponAPI(id) {
  try {
    const res = await api.delete(`/coupons/delete/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function createCouponAPI(couponData) {
  try {
    const res = await api.post('/coupons/create', couponData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function placeOrderAPI(orderData) {
  try {
    const res = await api.post('/orders', orderData); // Standardized REST POST
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getUserOrdersAPI() {
  try {
    const res = await api.get('/orders/me'); // Standardized REST GET
    return res.data;
  } catch (e) {
    return { success: false, data: [], message: e.message };
  }
}

export async function getOrderDetailsAPI(orderId) {
  try {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  } catch (e) {
    // If API returns 404, we want to know why
    throw e;
  }
}

export async function getAllOrdersAdminAPI() {
  try {
    const res = await api.get('/orders'); 
    return res.data;
  } catch (e) {
    throw e; // Re-throw ताकि component का catch block इसे handle कर सके
  }
}

export async function getShopOrdersAPI(shopId) {
  try {
    const res = await api.get(`/orders/shop/${shopId}`);
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function updateOrderStatusAPI(orderId, status) {
  try {
    const res = await api.patch(`/orders/${orderId}/status`, { status }); // Standardized PATCH for partial updates
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAllRefundsAPI() {
  try {
    const res = await api.get('/refunds');
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function updateRefundStatusAPI(id, status) {
  try {
    const res = await api.patch(`/refunds/${id}`, { status });
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAllAppointmentsAPI() {
  try {
    const res = await api.get('/appointments');
    return res.data;
  } catch (e) {
    return { success: false, data: [] }
  }
}

export async function deleteAppointmentAPI(id) {
  try {
    const res = await api.delete(`/appointments/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function confirmAppointmentAPI(id) {
  try {
    const res = await api.put(`/appointments/${id}/confirm`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getGlobalSeoAPI() {
  try {
    const res = await api.get('/seo/global');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateGlobalSeoAPI(payload) {
  try {
    const res = await api.put('/seo/global', payload);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAllCouponsAPI() {
  try {
    const res = await api.get('/coupons');
    return res.data;
  } catch (e) {
    return { success: false, data: [] }
  }
}

export async function deleteCategoryAPI(id) {
  try {
    // ✅ Standardized REST path to match backend router and resolve 404 error
    const res = await api.delete(`/categories/${id}`);
    memoryCache.delete('active_categories'); // ✅ कैटेगरी डिलीट होने पर कैशे साफ़ करें
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateCategoryAPI(id, categoryData) {
  try {
    const res = await api.put(`/categories/${id}`, categoryData);
    memoryCache.delete('active_categories'); // कैशे साफ़ करें ताकि फ्रंटएंड पर नया डेटा दिखे
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function createCategoryAPI(categoryData) {
  try {
    // Ensure we use the exact route defined in category.routes.js
    const res = await api.post('/categories/create', categoryData);
    memoryCache.delete('active_categories'); // ✅ नई कैटेगरी बनने पर कैशे साफ़ करें
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function verifyOTPAPI(email, otp) {
  try {
    // Send both email and otp as an object
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  } catch (e) {
    throw e; // ✅ Error ko throw karein
  }
}

export async function loginAPI(emailOrData, password) {
  const payload = typeof emailOrData === 'string' ? { email: emailOrData, password } : emailOrData;
  try {
    const res = await api.post('/auth/login', payload);
    return res.data;
  } catch (e) {
    // ✅ Re-throw error so caller's catch block can inspect e.response
    throw e;
  }
}

export async function signupAPI(userData) {
  try {
    // Backend standard convention 'register' use karta hai
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (e) {
    throw e; // ✅ Error ko throw karein taaki calling component ka catch block use handle kar sake
  }
}

export async function forgotPasswordAPI(data) {
  try {
    const payload = typeof data === 'string' ? { email: data } : data;
    const res = await api.post('/auth/forgot-password', payload);
    return res.data;
  } catch (e) {
    throw e; // ✅ Error ko throw karein
  }
}

export async function resetPasswordAPI(data) {
  try {
    const payload = typeof data === 'object' && data !== null ? data : {};
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  } catch (e) {
    throw e; // ✅ Error ko throw karein
  }
}

export async function deleteProductAPI(id) {
  try {
    // ✅ Standardized REST path: /api/products/:id
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateProductAPI(id, formData) {
  try {
    // ✅ Standardized REST path: /api/products/:id
    const res = await api.put(`/products/${id}`, formData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAnalyticsSummaryAPI() {
  try {
    // ✅ Match analytics.route.js
    const res = await api.get('/analytics/summary');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAdminStatsAPI() {
  try {
    // ✅ Match analytics.route.js (Dashboard usually needs the summary)
    const res = await api.get('/analytics/summary'); 
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAllRoomsAPI() {
  try {
    if (memoryCache.has('all_rooms')) return memoryCache.get('all_rooms');
    const res = await api.get('/room');
    const data = res.data;
    memoryCache.set('all_rooms', data);
    return data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function createRoomAPI(roomData) {
  try {
    const res = await api.post('/room/create', roomData);
    memoryCache.delete('all_rooms'); // ✅ नया रूम बनाने के बाद कैशे क्लियर करें
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteRoomAPI(id) {
  try {
    const res = await api.delete(`/room/${id}`);
    memoryCache.delete('all_rooms'); // ✅ रूम डिलीट करने के बाद कैशे क्लियर करें
    return res.data;
  } catch (e) {
    throw e;
  }
}
