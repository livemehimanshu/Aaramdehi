/**
 * Behavioral Tracking & Retargeting Controller
 * Handles CRUD operations for rules and behavior analytics (ESM Version)
 */

import * as behavioralDB from '../utils/db-behavioral.js';

// ==================== RETARGETING RULES CRUD ====================

/**
 * POST /api/admin/retargeting-rules
 * Admin: Create new retargeting rule
 */
export const createRule = async (req, res) => {
  try {
    const { ruleName, category, scoreThreshold, discountCode, discountValue, bannerLayout, bannerText, bannerColor } = req.body;
    
    // Validate required fields
    if (!ruleName || !scoreThreshold || !discountCode || !discountValue || !bannerLayout) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ruleName, scoreThreshold, discountCode, discountValue, bannerLayout'
      });
    }
    
    const ruleData = {
      ruleName,
      category: category || 'global',
      scoreThreshold: Number(scoreThreshold),
      discountCode,
      discountValue,
      bannerLayout, // "sticky-bottom", "exit-intent", "top-announcement"
      bannerText: bannerText || `Get ${discountValue} on ${ruleName} - Code: ${discountCode}`,
      bannerColor: bannerColor || '#FF6B6B',
      isActive: true
    };
    
    const result = await behavioralDB.createRetargetingRule(ruleData);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(201).json({
      success: true,
      message: 'Retargeting rule created successfully',
      rule: result.rule
    });
  } catch (error) {
    console.error('Error in createRule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/admin/retargeting-rules
 * Admin: Fetch all retargeting rules
 */
export const getAllRules = async (req, res) => {
  try {
    const result = await behavioralDB.getAllRetargetingRules();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      count: result.rules ? result.rules.length : 0,
      rules: result.rules
    });
  } catch (error) {
    console.error('Error in getAllRules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/admin/retargeting-rules/:ruleId
 * Admin: Fetch single rule
 */
export const getRuleById = async (req, res) => {
  try {
    const { ruleId } = req.params;
    
    const result = await behavioralDB.getRetargetingRuleById(ruleId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json({
      success: true,
      rule: result.rule
    });
  } catch (error) {
    console.error('Error in getRuleById:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/admin/retargeting-rules/:ruleId
 * Admin: Update retargeting rule
 */
export const updateRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updateData = req.body;
    
    // Validate scoreThreshold if provided
    if (updateData.scoreThreshold) {
      updateData.scoreThreshold = Number(updateData.scoreThreshold);
    }
    
    const result = await behavioralDB.updateRetargetingRule(ruleId, updateData);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'Rule updated successfully',
      rule: result.rule
    });
  } catch (error) {
    console.error('Error in updateRule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/admin/retargeting-rules/:ruleId
 * Admin: Delete retargeting rule
 */
export const deleteRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    
    const result = await behavioralDB.deleteRetargetingRule(ruleId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== BEHAVIOR TRACKING ====================

/**
 * POST /api/analytics/track-behavior
 * User: Track user behavior interaction (image click, zoom, hover)
 */
export const trackBehavior = async (req, res) => {
  try {
    const { sessionId, userId, interaction } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, sessionId'
      });
    }
    
    // Update user behavior points
    const updateResult = await behavioralDB.updateBehaviorPoints(sessionId, {
      type: interaction?.type || 'interaction',
      points: interaction?.points || 1,
      metadata: interaction?.metadata || {}
    });
    
    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }
    
    // Evaluate rules against updated score
    const evaluationResult = await behavioralDB.evaluateSessionAgainstRules(sessionId);
    
    if (!evaluationResult.success) {
      return res.status(500).json(evaluationResult);
    }
    
    res.status(200).json({
      success: true,
      newScore: updateResult.newScore,
      ruleTriggered: evaluationResult.triggered,
      rule: evaluationResult.rule || null,
      message: evaluationResult.triggered 
        ? `High-intent session! Trigger: ${evaluationResult.rule.ruleName}`
        : 'Behavior tracked'
    });
  } catch (error) {
    console.error('Error in trackBehavior:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analytics/create-session
 * User: Initialize tracking session
 */
export const createSession = async (req, res) => {
  try {
    const { userId, targetProductId, selectedColorVariant } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }
    
    const sessionData = {
      userId,
      intendScore: 0,
      targetProductId: targetProductId || null,
      selectedColorVariant: selectedColorVariant || null,
      status: 'active'
    };
    
    const result = await behavioralDB.logUserBehavior(sessionData);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(201).json({
      success: true,
      message: 'Tracking session created',
      sessionId: result.sessionId
    });
  } catch (error) {
    console.error('Error in createSession:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/user-behavior/:userId
 * Admin: Fetch all behavior logs for a user
 */
export const getUserBehavior = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await behavioralDB.getUserBehaviorLogs(userId);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      count: result.logs ? result.logs.length : 0,
      logs: result.logs
    });
  } catch (error) {
    console.error('Error in getUserBehavior:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/high-intent-sessions
 * Admin Dashboard: Fetch all high-intent sessions
 */
export const getHighIntentSessions = async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    
    const result = await behavioralDB.getHighIntentSessions(Number(limit));
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      total: result.total,
      sessions: result.sessions
    });
  } catch (error) {
    console.error('Error in getHighIntentSessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/conversion-metrics
 * Admin Dashboard: Get conversion metrics and KPIs
 */
export const getConversionMetrics = async (req, res) => {
  try {
    const result = await behavioralDB.getConversionMetrics();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      metrics: result.metrics
    });
  } catch (error) {
    console.error('Error in getConversionMetrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/all-interactions
 * Admin Dashboard: Fetch all user interactions
 */
export const getAllInteractions = async (req, res) => {
  try {
    const result = await behavioralDB.getAllInteractions();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      total: result.total,
      interactions: result.interactions
    });
  } catch (error) {
    console.error('Error in getAllInteractions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analytics/update-session-status
 * Update session status
 */
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId, status } = req.body;
    
    if (!sessionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing sessionId or status'
      });
    }
    
    if (!['active', 'high_intent', 'converted', 'abandoned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, high_intent, converted, or abandoned'
      });
    }
    
    const result = await behavioralDB.updateSessionStatus(sessionId, { status });
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'Session status updated',
      status
    });
  } catch (error) {
    console.error('Error in updateSessionStatus:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};