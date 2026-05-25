import { findAll, findById, create, updateById, deleteById } from '../config/db.js';

const COLLECTION = 'shops';

/**
 * ✅ GET ALL SHOPS
 * Fetch all shops/stores with pagination and search
 */
export const getAllShops = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let shops = await findAll(COLLECTION);

    // Search filter
    if (search) {
      shops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(search.toLowerCase()) ||
        shop.owner?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedShops = shops.slice(skip, skip + parseInt(limit));

    return res.json({
      success: true,
      message: 'Shops fetched successfully',
      data: paginatedShops,
      pagination: {
        total: shops.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(shops.length / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ GET SHOP BY ID
 */
export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await findById(COLLECTION, id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    return res.json({
      success: true,
      message: 'Shop fetched successfully',
      data: shop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ CREATE SHOP
 */
export const createShop = async (req, res) => {
  try {
    const { name, owner, phone, address, city, state, pincode, balance = 0 } = req.body;

    // Validation
    if (!name || !owner) {
      return res.status(400).json({
        success: false,
        message: 'Name and Owner are required',
      });
    }

    const newShop = {
      name,
      owner,
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      balance: parseFloat(balance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const shopId = await create(COLLECTION, newShop);

    return res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: { _id: shopId, ...newShop },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ UPDATE SHOP
 */
export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, owner, phone, address, city, state, pincode, balance } = req.body;

    const shop = await findById(COLLECTION, id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    const updatedShop = {
      ...shop,
      name: name || shop.name,
      owner: owner || shop.owner,
      phone: phone !== undefined ? phone : shop.phone,
      address: address !== undefined ? address : shop.address,
      city: city !== undefined ? city : shop.city,
      state: state !== undefined ? state : shop.state,
      pincode: pincode !== undefined ? pincode : shop.pincode,
      balance: balance !== undefined ? parseFloat(balance) : shop.balance,
      updatedAt: new Date().toISOString(),
    };

    await updateById(COLLECTION, id, updatedShop);

    return res.json({
      success: true,
      message: 'Shop updated successfully',
      data: { _id: id, ...updatedShop },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ DELETE SHOP
 */
export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await findById(COLLECTION, id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    await deleteById(COLLECTION, id);

    return res.json({
      success: true,
      message: 'Shop deleted successfully',
      data: shop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ UPDATE SHOP BALANCE (Khata Adjustment)
 */
export const updateShopBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type = 'debit' } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const shop = await findById(COLLECTION, id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    const currentBalance = shop.balance || 0;
    const newBalance = type === 'credit'
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    const updatedShop = {
      ...shop,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    await updateById(COLLECTION, id, updatedShop);

    return res.json({
      success: true,
      message: `Balance ${type === 'credit' ? 'credited' : 'debited'} successfully`,
      data: { _id: id, ...updatedShop },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
