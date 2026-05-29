import api from '../utils/authUtils';

// ✅ Pro Cache: Prevent redundant network waterfalls
const memoryCache = new Map();

export async function getAllProductsAPI(params = {}) {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (e) {
    return { success: false, data: [] }
  }
}

export async function getProductByIdAPI(id) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
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
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function createBannerAPI(bannerData) {
  try {
    const res = await api.post('/banners/create', bannerData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function updateBannerAPI(id, bannerData) {
  try {
    const res = await api.put(`/banners/update/${id}`, bannerData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function deleteBannerAPI(id) {
  try {
    const res = await api.delete(`/banners/delete/${id}`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
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
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function createCouponAPI(couponData) {
  try {
    const res = await api.post('/coupons/create', couponData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function placeOrderAPI(orderData) {
  try {
    const res = await api.post('/order/create', orderData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getUserOrdersAPI() {
  try {
    const res = await api.get('/order/my-orders');
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getOrderDetailsAPI(orderId) {
  try {
    const res = await api.get(`/order/${orderId}`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
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
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function confirmAppointmentAPI(id) {
  try {
    const res = await api.put(`/appointments/${id}/confirm`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getGlobalSeoAPI() {
  try {
    const res = await api.get('/seo/global');
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function updateGlobalSeoAPI(payload) {
  try {
    const res = await api.put('/seo/global', payload);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
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
    const res = await api.delete(`/categories/delete/${id}`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function createCategoryAPI(categoryData) {
  try {
    const res = await api.post('/categories/create', categoryData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function updateProductAPI(id, productData) {
  try {
    const res = await api.put(`/products/update/${id}`, productData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function verifyOTPAPI(email, otp) {
  try {
    // Send both email and otp as an object
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function loginAPI(emailOrData, password) {
  const payload = typeof emailOrData === 'string' ? { email: emailOrData, password } : emailOrData;
  try {
    const res = await api.post('/auth/login', payload);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function signupAPI(userData) {
  try {
    // Backend standard convention 'register' use karta hai
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function forgotPasswordAPI(data) {
  try {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function resetPasswordAPI(data) {
  try {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function deleteProductAPI(id) {
  try {
    const res = await api.delete(`/products/delete/${id}`);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getAnalyticsSummaryAPI() {
  try {
    // ✅ Match analytics.route.js
    const res = await api.get('/analytics/summary');
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function getAdminStatsAPI() {
  try {
    // ✅ Match analytics.route.js (Dashboard usually needs the summary)
    const res = await api.get('/analytics/summary'); 
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}

export async function createProductAPI(productData) {
  try {
    const res = await api.post('/products/create', productData);
    return res.data;
  } catch (e) {
    return e.response?.data || { success: false, message: e.message };
  }
}
