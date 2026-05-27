import { findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js";

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      const allSettings = await findAll('settings');
      const settings = allSettings.filter(s => s.category === category);
      return res.json({ success: true, data: settings });
    }

    const settings = await findAll('settings');

    return res.json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get setting by key
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const settingsList = await findAll('settings');
    const setting = settingsList.find(s => s.key === key.toUpperCase());

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Setting fetched successfully",
      data: setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create setting
export const createSetting = async (req, res) => {
  try {
    const { key, value, type, label, description, category, isEditable } =
      req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Key and value are required",
      });
    }

    // Check if key exists
    const existing = await findByQuery('settings', 'key', key.toUpperCase());
    if (existing && existing.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Setting with this key already exists",
        });
    }

    const settingData = {
      key: key.toUpperCase(),
      value,
      type: type || "string",
      label: label || key,
      description: description || "",
      category: category || "general",
      isEditable: isEditable !== false,
      defaultValue: value,
      updatedBy: req.user?._id || req.user?.id || req.userId,
    };

    const savedSetting = await create('settings', settingData);

    return res.status(201).json({
      success: true,
      message: "Setting created successfully",
      data: savedSetting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, label, description, isEditable, category } = req.body;

    const settingsList = await findAll('settings');
    const setting = settingsList.find(s => s.key === key.toUpperCase());

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    if (!setting.isEditable && value !== undefined) {
      return res.status(400).json({
        success: false,
        message: "This setting is not editable",
      });
    }

    if (value !== undefined) setting.value = value;
    if (label !== undefined) setting.label = label;
    if (description !== undefined) setting.description = description;
    if (isEditable !== undefined) setting.isEditable = isEditable;
    if (category !== undefined) setting.category = category;

    setting.updatedBy = req.userId || req.user?._id || req.user?.id;
    await updateById('settings', setting._id, setting);

    return res.json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete setting
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const settingsList = await findAll('settings');
    const setting = settingsList.find(s => s.key === key.toUpperCase());

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    await deleteById('settings', setting._id);

    return res.json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get settings by category
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const allSettings = await findAll('settings');
    const settings = allSettings.filter(s => s.category === category);

    if (!settings || settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No settings found for this category",
      });
    }

    await deleteById('settings', setting._id);

    return res.json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public settings endpoint - returns only settings with isPublic: true
export const getPublicSettings = async (req, res) => {
  try {
    const settingsList = await findAll('settings');
    const publicSettings = settingsList.filter(s => s.isPublic === true || s.isPublic === "true");

    // Convert array of settings into key -> value object for easier client consumption
    const data = {};
    publicSettings.forEach((s) => {
      if (s.key) data[s.key] = s.value;
    });

    return res.json({
      success: true,
      message: "Public settings fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk update settings
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Settings array is required",
      });
    }

    const updatedSettings = [];

    for (const settingData of settings) {
      const { key, value } = settingData;

      if (!key) continue;
      
      const settingsList = await findAll('settings');
      const setting = settingsList.find(s => s.key === key.toUpperCase());

      if (setting && setting.isEditable) {
        await updateById('settings', setting._id, {
          value,
          updatedBy: req.userId || req.user?._id || req.user?.id
        });
      }
    }

    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset setting to default
export const resetSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const settingsList = await findAll('settings');
    const setting = settingsList.find(s => s.key === key.toUpperCase());

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    if (!setting.defaultValue) {
      return res.status(400).json({
        success: false,
        message: "No default value available",
      });
    }

    const updated = await updateById('settings', setting._id, {
      value: setting.defaultValue,
      updatedBy: req.userId || req.user?._id || req.user?.id
    });

    return res.json({
      success: true,
      message: "Setting reset to default successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
