import { findAll, findById, create, updateById, deleteById, findByQuery } from '../config/db.js';

const COLLECTION = 'coupons';

// Get all coupons with filters
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;
    
    let coupons = await findAll(COLLECTION);

    if (isActive !== undefined) {
      const activeStatus = isActive === "true";
      coupons = coupons.filter(c => c.isActive === activeStatus);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      coupons = coupons.filter(c => c.code.toLowerCase().includes(searchLower));
    }

    // Sort by createdAt descending
    coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = coupons.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCoupons = coupons.slice(skip, skip + parseInt(limit));

    // Note: Population (createdBy, etc.) is removed as Firebase RTDB doesn't support 
    // join operations natively. We store/return the IDs instead.

    return res.json({
      success: true,
      message: "Coupons fetched successfully",
      data: paginatedCoupons,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await findById(COLLECTION, id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      success: true,
      message: "Coupon fetched successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      applicableTo,
      applicableProducts,
      applicableCategories,
      usageLimit,
      usagePerUser,
      startDate,
      expiryDate,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, and value are required",
      });
    }

    // Check if coupon code already exists
    const formattedCode = String(code).trim().toUpperCase();
    
    const existingCoupons = await findByQuery(COLLECTION, 'code', formattedCode);
    if (existingCoupons && existingCoupons.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Safe Date Parsing helper
    const safeISO = (dateStr, fallback) => {
      if (!dateStr) return fallback;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? fallback : d.toISOString();
    };

    const payload = {
      code: formattedCode,
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      applicableTo: applicableTo || "all",
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      usageLimit: (usageLimit === "" || usageLimit === null) ? null : Number(usageLimit),
      usagePerUser: Number(usagePerUser) || 1,
      usedCount: 0,
      usedBy: [],
      startDate: safeISO(startDate, new Date().toISOString()),
      expiryDate: safeISO(expiryDate, null),
      isActive: true,
      createdBy: req.userId || req.user?._id || req.user?.id || "SYSTEM_ADMIN", 
    };

    const coupon = await create(COLLECTION, payload);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error); // Log the full error for debugging
    return res.status(error.statusCode || 500).json({ // Use error.statusCode if available, otherwise 500
      success: false,
      message: error.message || "An unexpected error occurred during coupon creation.",
    });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      applicableTo,
      applicableProducts,
      applicableCategories,
      usageLimit,
      usagePerUser,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    const coupon = await findById(COLLECTION, id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const formattedCode = code ? String(code).trim().toUpperCase() : null;

    if (formattedCode && formattedCode !== coupon.code) {
      const existingCoupons = await findByQuery(COLLECTION, 'code', formattedCode);
      if (existingCoupons && existingCoupons.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
    }

    const updateData = {};
    if (formattedCode) updateData.code = formattedCode;
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined)
      updateData.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (applicableTo) updateData.applicableTo = applicableTo;
    if (applicableProducts) updateData.applicableProducts = applicableProducts;
    if (applicableCategories)
      updateData.applicableCategories = applicableCategories;
    if (usageLimit !== undefined) 
      updateData.usageLimit = (usageLimit === "" || usageLimit === null) ? null : Number(usageLimit);
    if (usagePerUser !== undefined) updateData.usagePerUser = Number(usagePerUser);
    if (startDate) updateData.startDate = new Date(startDate).toISOString();
    if (expiryDate) updateData.expiryDate = expiryDate ? new Date(expiryDate).toISOString() : null;
    if (isActive !== undefined) updateData.isActive = isActive === "true" || isActive === true;

    const modId = req.userId || req.user?._id || req.user?.id;
    if (modId) {
      updateData.lastModifiedBy = modId;
    }

    const updated = await updateById(COLLECTION, id, updateData);

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await findById(COLLECTION, id);

    if (coupon) {
      await deleteById(COLLECTION, id);
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Validate coupon code for checkout
export const validateCoupon = async (req, res) => {
  try {
    let { code, userId, orderAmount } = req.body;

    // Robustness check: If code is an object, the payload was likely wrapped incorrectly by the caller
    if (typeof code === 'object' && code !== null) {
      orderAmount = orderAmount || code.orderAmount;
      userId = userId || code.userId;
      code = code.code;
    }

    const amt = Number(orderAmount);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const searchCode = String(code).trim().toUpperCase();
    console.log(`[Coupon Validation] Checking code: "${searchCode}" for order amount: ₹${amt}`);

    // Fetch all coupons and find manually to ensure case-insensitive matching if direct query fails
    const allCoupons = await findAll(COLLECTION);
    const coupon = allCoupons.find(c => 
      c.code && String(c.code).trim().toUpperCase() === searchCode
    );

    if (!coupon) {
      console.warn(`[Coupon Validation] Failed: Coupon code "${searchCode}" not found in database.`);
      
      // Debugging ke liye terminal mein dikhayega ki DB mein kya hai
      const dbCodes = allCoupons.map(c => c.code || 'NO_CODE').join(', ');
      console.log(`[Coupon Validation] Debug - Available codes in Firebase: [${dbCodes}]`);
      
      return res.status(400).json({
        success: false,
        message: `Coupon "${searchCode}" exists nahi karta.`,
      });
    }

    // Check if coupon is active
    if (coupon.isActive === false || coupon.isActive === "false") {
      return res.status(400).json({
        success: false,
        message: "This coupon is no longer active",
      });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    // Check start date
    if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet valid",
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check user usage limit (Once per user logic)
    const effectiveUserId = userId || req.userId || req.user?._id;

    if (effectiveUserId) {
      let usedByArray = [];
      if (coupon.usedBy) {
        usedByArray = Array.isArray(coupon.usedBy) ? coupon.usedBy : Object.values(coupon.usedBy);
      }

      // Comparison ko robust banayein: check directly and inside objects
      const hasUsed = usedByArray.some(item => {
        const storedId = (typeof item === 'object' && item !== null) ? (item._id || item.userId || item.id) : item;
        return String(storedId) === String(effectiveUserId);
      });
      
      if (hasUsed) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon once!",
        });
      }
    }

    // Check minimum order amount
    if (amt < Number(coupon.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    const dValue = Number(coupon.discountValue || 0);
    if (coupon.discountType === "percentage") {
      discount = (amt * dValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discount = dValue;
    }

    return res.json({
      success: true,
      message: "Coupon is valid",
      data: {
        couponId: coupon._id,
        discountType: coupon.discountType,
        discountValue: dValue,
        discount: Math.round(discount),
        finalAmount: Math.round(amt - discount),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
