import api from './axiosInstance';

export { api };

// Cache memory for optimizing redundant GET requests
const memoryCache = new Map();

/* ==========================================================================
   PRODUCTS API
   ========================================================================== */

export async function getAllProductsAPI(params = {}) {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (e) {
    console.error('❌ Products API Error:', e);
    return { success: false, data: [] };
  }
}

export async function createProductAPI(productData) {
  try {
    const res = await api.post('/products/create', productData);
    return res.data;
  } catch (e) {
    throw e;
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

export async function updateProductAPI(id, formData) {
  try {
    const res = await api.put(`/products/${id}`, formData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteProductAPI(id) {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function analyzeRoomAPI(params) {
  try {
    const res = await api.post('/products/analyze-room', params);
    return res.data;
  } catch (e) {
    console.error('❌ analyzeRoomAPI error:', e);
    return {
      success: false,
      message: e.response?.data?.message || e.message || 'Room analysis failed.'
    };
  }
}

export async function createProductReviewAPI(productId, reviewData) {
  try {
    const res = await api.post(`/products/${productId}/review`, reviewData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteProductReviewAPI(productId, reviewId) {
  try {
    const res = await api.delete(`/products/${productId}/review/${reviewId}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   CATEGORIES API
   ========================================================================== */

export async function getActiveCategoriesAPI() {
  try {
    if (memoryCache.has('active_categories')) return memoryCache.get('active_categories');

    const res = await api.get('/categories/active');
    const data = res.data;
    memoryCache.set('active_categories', data);
    return data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function getAllCategoriesAPI() {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function createCategoryAPI(categoryData) {
  try {
    const res = await api.post('/categories/create', categoryData);
    memoryCache.delete('active_categories');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateCategoryAPI(id, categoryData) {
  try {
    const res = await api.put(`/categories/${id}`, categoryData);
    memoryCache.delete('active_categories');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteCategoryAPI(id) {
  try {
    const res = await api.delete(`/categories/${id}`);
    memoryCache.delete('active_categories');
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   BANNERS API
   ========================================================================== */

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
    const res = await api.put(`/banners/${id}`, bannerData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteBannerAPI(id) {
  try {
    const res = await api.delete(`/banners/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   ORDERS & PAYMENT GATEWAY API
   ========================================================================== */

export async function placeOrderAPI(orderData) {
  try {
    const res = await api.post('/orders', orderData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getUserOrdersAPI() {
  try {
    const res = await api.get('/orders/my-orders');
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
    throw e;
  }
}

export async function getAllOrdersAdminAPI() {
  try {
    const res = await api.get('/orders');
    return res.data;
  } catch (e) {
    throw e;
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
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function createPaymentOrderAPI(amount) {
  try {
    const res = await api.post('/payments/razorpay/create-order', { amount });
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function verifyPaymentAPI(paymentDetails) {
  try {
    const res = await api.post('/payments/razorpay/verify', paymentDetails);
    return res.data;
  } catch (e) {
    throw e;
  }
}

// 💳 Admin Gateway Configuration API (Fixes 401 Error)
export async function getGatewayConfigAPI() {
  try {
    const res = await api.get('/payments/admin/gateway-config');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateGatewayConfigAPI(payload) {
  try {
    const res = await api.post('/payments/admin/gateway-config', payload);
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   REFUNDS & APPOINTMENTS API
   ========================================================================== */

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
    return { success: false, data: [] };
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

/* ==========================================================================
   COUPONS API
   ========================================================================== */

export async function validateCouponAPI(params) {
  try {
    const res = await api.post('/coupons/validate', params);
    return res.data;
  } catch (e) {
    return { success: false };
  }
}

export async function getAllCouponsAPI() {
  try {
    const res = await api.get('/coupons');
    return res.data;
  } catch (e) {
    return { success: false, data: [] };
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

export async function deleteCouponAPI(id) {
  try {
    const res = await api.delete(`/coupons/delete/${id}`);
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   AUTHENTICATION & USER API
   ========================================================================== */

export async function signupAPI(userData) {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function loginAPI(emailOrData, password) {
  const payload = typeof emailOrData === 'string' ? { email: emailOrData, password } : emailOrData;
  try {
    const res = await api.post('/auth/login', payload);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function verifyOTPAPI(email, otp) {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function forgotPasswordAPI(data) {
  try {
    const payload = typeof data === 'string' ? { email: data } : data;
    const res = await api.post('/auth/forgot-password', payload);
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function resetPasswordAPI(data) {
  try {
    const payload = typeof data === 'object' && data !== null ? data : {};
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  } catch (e) {
    throw e;
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

/* ==========================================================================
   NEWSLETTER API
   ========================================================================== */

export async function subscribeNewsletterAPI(email) {
  try {
    const res = await api.post('/newsletter/subscribe', { email });
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getNewsletterSubscribersAPI() {
  try {
    const res = await api.get('/newsletter/subscribers');
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function sendNewsletterAPI(payload) {
  try {
    const res = await api.post('/newsletter/send', payload);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

/* ==========================================================================
   SETTINGS, SEO, ANALYTICS & ROOMS API
   ========================================================================== */

export async function getSettingsAPI() {
  try {
    if (memoryCache.has('site_settings')) return memoryCache.get('site_settings');
    const res = await api.get('/settings/public');
    const data = res.data;
    memoryCache.set('site_settings', data);
    return data;
  } catch (e) {
    return { success: false, data: {} };
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

export async function getAnalyticsSummaryAPI() {
  try {
    const res = await api.get('/analytics/summary');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAdminStatsAPI() {
  try {
    const res = await api.get('/analytics/summary');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getAllRoomsAPI() {
  try {
    if (memoryCache.has('all_rooms')) return memoryCache.get('all_rooms');
    const res = await api.get('/rooms');
    const data = res.data;
    memoryCache.set('all_rooms', data);
    return data;
  } catch (e) {
    return { success: false, data: [] };
  }
}

export async function createRoomAPI(roomData) {
  try {
    const res = await api.post('/rooms/create', roomData);
    memoryCache.delete('all_rooms');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function updateRoomAPI(id, roomData) {
  try {
    const res = await api.put(`/rooms/${id}`, roomData);
    memoryCache.delete('all_rooms');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function deleteRoomAPI(id) {
  try {
    const res = await api.delete(`/rooms/${id}`);
    memoryCache.delete('all_rooms');
    return res.data;
  } catch (e) {
    throw e;
  }
}

/* ==========================================================================
   ADMIN SETTINGS API
   ========================================================================== */
export async function adminGetAllSettingsAPI() {
  try {
    const res = await api.get('/settings');
    return res.data;
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
}

export async function updateSettingAPI(key, value) {
  try {
    const upperKey = String(key).toUpperCase();
    const res = await api.put(`/settings/${upperKey}`, { value });
    return res.data;
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
}

export async function createSettingAPI(payload) {
  try {
    const res = await api.post('/settings/create', payload);
    return res.data;
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
}