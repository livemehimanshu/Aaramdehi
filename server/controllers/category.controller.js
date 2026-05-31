import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";
import { findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js";
import slugify from 'slugify';

const COLLECTION = 'categories';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await findAll(COLLECTION);
    // ✅ Fix: Safe sorting to prevent crash if name is missing
    categories.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return res.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message,
    });
  }
};

// Get only active categories (for frontend display)
export const getActiveCategories = async (req, res) => {
  try {
    const categories = await findByQuery(COLLECTION, 'isActive', true);
    // ✅ Fix: Safe sorting to prevent crash if name is missing
    categories.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return res.json({
      success: true,
      message: 'Active categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching active categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching active categories',
      error: error.message,
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await findById(COLLECTION, id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.json({
      success: true,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: error.message,
    });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive, icon } = req.body;
    let finalIcon = icon; // डिफ़ॉल्ट रूप से इमोजी

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existingCategories = await findByQuery(COLLECTION, 'name', name);
    if (existingCategories.length > 0) {
      return res.status(409).json({ success: false, message: 'Category with this name already exists' });
    }

    // 🖼️ Robust image upload check
    const fileToUpload = req.file?.buffer || req.file?.path;
    if (fileToUpload) {
        const uploadResult = await uploadImageCloudinary(fileToUpload, "categories");
        if (uploadResult.success) {
            finalIcon = uploadResult.url;
        } else {
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }
    }

    const categoryData = {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      icon: finalIcon,
      isActive: isActive === 'true' || isActive === true,
    };

    const newCategory = await create(COLLECTION, categoryData);
    return res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating category', error: error.message });
  }
};

// Update an existing category
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, icon } = req.body;

    const category = await findById(COLLECTION, id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateData = {};

    // 🖼️ इमेज अपडेट लॉजिक (जो पहले मिसिंग था)
    const fileToUpload = req.file?.buffer || req.file?.path;
    if (fileToUpload) {
        const uploadResult = await uploadImageCloudinary(fileToUpload, "categories");
        if (uploadResult.success) {
            updateData.icon = uploadResult.url;
        }
    } else if (icon) {
        updateData.icon = icon;
    }

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    const updatedCategory = await updateById(COLLECTION, id, updateData);
    return res.json({ success: true, message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating category', error: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteById(COLLECTION, id);

    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting category', error: error.message });
  }
};