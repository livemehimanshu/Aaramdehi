import { db, findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js";

const AI_CONFIG_KEYS = {
  AI_BLOGGER_GEMINI_API_KEY: 'geminiApiKey',
  AI_BLOGGER_MODEL: 'selectedModel',
  AI_BLOGGER_TONE: 'writingTone',
  AI_BLOGGER_MODE: 'publishingMode',
  AI_BLOGGER_AUTO_PUBLISH: 'autoPublishEnabled',
  AI_BLOGGER_FOCUS_KEYWORD: 'focusKeyword',
};

const syncAiConfig = async (key, value) => {
  const field = AI_CONFIG_KEYS[key.toUpperCase()];
  if (field) await db.ref(`admin_settings/ai_config/${field}`).set(value);
  await db.ref('admin_settings/ai_config/updatedAt').set(Date.now());
};

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
        const updatedSetting = await updateById('settings', existing[0]._id, {
          value,
          label: label || existing[0].label || key,
          description: description ?? existing[0].description ?? "",
          category: category || existing[0].category || "general",
          isEditable: isEditable !== false,
          updatedBy: req.user?._id || req.user?.id || req.userId,
        });
        await syncAiConfig(key, value);

        return res.status(200).json({
          success: true,
          message: "Setting updated successfully",
          data: updatedSetting,
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
    await syncAiConfig(settingData.key, value);

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
    await syncAiConfig(setting.key, setting.value);

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
    const whatsappSetting = settingsList.find((s) => s.key === 'AI_BLOGGER_WHATSAPP_NUMBER');
    if (whatsappSetting?.value) data.AI_BLOGGER_WHATSAPP_NUMBER = String(whatsappSetting.value).replace(/[^\d]/g, '');

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

let autoBlogRunning = false;

export const generateAutoBlog = async (req, res) => {
  if (autoBlogRunning) {
    return res.status(409).json({ success: false, message: 'An AI blog generation is already running.' });
  }

  const topic = String(req.body.topic || '').trim();
  const options = {
    focusKeyword: String(req.body.focusKeyword || '').trim(),
    language: String(req.body.language || 'English').trim(),
    categoryHint: String(req.body.categoryHint || '').trim(),
  };
  if (topic.length > 500) {
    return res.status(400).json({ success: false, message: 'Topic must be 500 characters or fewer.' });
  }

  autoBlogRunning = true;
  try {
    const { runAutomation } = await import('../scripts/autoBlogger.js');
    const result = await runAutomation({ topic, force: true, ...options });
    return res.status(201).json({ success: true, message: result?.status === 'Draft' ? 'AI blog generated and saved as draft.' : 'AI blog generated and published successfully.', data: result || null });
  } catch (error) {
    console.error('AI blog generation failed:', error);
    await db.ref('blog_logs').push({ topic, status: 'failed', mode: 'error', error: error.message, timestamp: Date.now() });
    return res.status(500).json({ success: false, message: error.message || 'AI blog generation failed.' });
  } finally {
    autoBlogRunning = false;
  }
};

export const getAiBlogQueue = async (req, res) => {
  try {
    const queue = await findAll('blog_queue');
    queue.sort((a, b) => new Date(a.publishAt || 0) - new Date(b.publishAt || 0));
    return res.json({ success: true, data: queue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAiBlogQueueItem = async (req, res) => {
  try {
    const topic = String(req.body.topic || '').trim();
    const focusKeyword = String(req.body.focusKeyword || '').trim();
    const language = String(req.body.language || 'English').trim();
    const publishAt = new Date(req.body.publishAt).toISOString();
    if (!topic || topic.length > 500 || Number.isNaN(new Date(publishAt).getTime())) {
      return res.status(400).json({ success: false, message: 'Valid topic and publish date are required.' });
    }
    const item = await create('blog_queue', { topic, focusKeyword, language, publishAt, status: 'pending', createdBy: req.userId });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Valid topic and publish date are required.' });
  }
};

const parseCsvLine = (line) => {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { cells.push(cell.trim()); cell = ''; }
    else cell += character;
  }
  cells.push(cell.trim());
  return cells;
};

export const bulkCreateAiBlogQueue = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required.' });
    const rows = req.file.buffer.toString('utf8').split(/\r?\n/).map((line) => parseCsvLine(line)).filter((cells) => cells.some(Boolean));
    const hasHeader = rows[0]?.[0]?.toLowerCase() === 'topic';
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const updates = {};
    dataRows.slice(0, 100).forEach(([topic, focusKeyword = '', language = 'English', publishAt = '']) => {
      const cleanTopic = String(topic || '').trim();
      if (!cleanTopic || cleanTopic.length > 500) return;
      const parsedPublishAt = publishAt ? new Date(publishAt) : new Date(Date.now() + 60000);
      if (Number.isNaN(parsedPublishAt.getTime())) return;
      const key = db.ref('blog_queue').push().key;
      updates[`blog_queue/${key}`] = { topic: cleanTopic, focusKeyword: String(focusKeyword).trim(), language: String(language).trim() || 'English', publishAt: parsedPublishAt.toISOString(), status: 'pending', createdBy: req.userId, createdAt: Date.now() };
    });
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'No valid topics found in CSV.' });
    await db.ref().update(updates);
    return res.status(201).json({ success: true, count: Object.keys(updates).length });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to parse CSV queue.' });
  }
};

export const deleteAiBlogQueueItem = async (req, res) => {
  try {
    await deleteById('blog_queue', req.params.id);
    return res.json({ success: true, message: 'Scheduled topic deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAiBlogLogs = async (req, res) => {
  try {
    const logs = await findAll('blog_logs');
    logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return res.json({ success: true, data: logs.slice(0, 30) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
