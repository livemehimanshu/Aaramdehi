import Settings from "../models/settings.model.js";

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    const settings = await Settings.find(filter)
      .populate("updatedBy", "name email")
      .sort({ category: 1, createdAt: -1 });

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
    const setting = await Settings.findOne({ key: key.toUpperCase() }).populate(
      "updatedBy",
      "name email"
    );

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

    // Check if setting already exists
    const existingSetting = await Settings.findOne({ key: key.toUpperCase() });
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: "Setting with this key already exists",
      });
    }

    const setting = new Settings({
      key: key.toUpperCase(),
      value,
      type: type || "string",
      label: label || key,
      description: description || "",
      category: category || "general",
      isEditable: isEditable !== false,
      defaultValue: value,
      updatedBy: req.user.id,
    });

    await setting.save();

    return res.status(201).json({
      success: true,
      message: "Setting created successfully",
      data: setting,
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

    const setting = await Settings.findOne({ key: key.toUpperCase() });

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

    setting.updatedBy = req.user.id;
    await setting.save();

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
    const setting = await Settings.findOneAndDelete({ key: key.toUpperCase() });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

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

    const settings = await Settings.find({ category }).populate(
      "updatedBy",
      "name email"
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No settings found for this category",
      });
    }

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

      const setting = await Settings.findOne({ key: key.toUpperCase() });

      if (setting && setting.isEditable) {
        setting.value = value;
        setting.updatedBy = req.user.id;
        await setting.save();
        updatedSettings.push(setting);
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
    const setting = await Settings.findOne({ key: key.toUpperCase() });

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

    setting.value = setting.defaultValue;
    setting.updatedBy = req.user.id;
    await setting.save();

    return res.json({
      success: true,
      message: "Setting reset to default successfully",
      data: setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
