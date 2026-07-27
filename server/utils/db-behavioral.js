/**
 * Firebase Behavioral Tracking Database Helpers
 * Manages retargeting rules, user behavior logs, and session tracking (ESM Version)
 */

import { db } from '../config/db.js';

/**
 * ===== BEHAVIORAL TRACKING DATA STRUCTURES =====
 * 
 * retargeting_rules/ - Admin-defined targeting rules
 * - {ruleId}:
 *   - ruleName: string
 *   - category: string | "global"
 *   - scoreThreshold: number
 *   - discountCode: string
 *   - discountValue: string (e.g., "₹150 OFF", "10% OFF")
 *   - bannerLayout: "sticky-bottom" | "exit-intent" | "top-announcement"
 *   - bannerText: string (customizable message)
 *   - bannerColor: string (hex code)
 *   - isActive: boolean
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 *
 * user_behavior_logs/ - Real-time user interaction tracking
 * - {sessionId}:
 *   - userId: string
 *   - sessionId: string
 *   - intendScore: number
 *   - targetProductId: string
 *   - selectedColorVariant: string
 *   - interactions: array of {type, timestamp, value}
 *   - triggeredRuleId: string (if high intent matched)
 *   - couponCode: string (issued coupon if triggered)
 *   - status: "active" | "converted" | "abandoned"
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 */

// ==================== RETARGETING RULES ====================

/**
 * CREATE: Add new retargeting rule
 */
export async function createRetargetingRule(ruleData) {
  try {
    const newRuleRef = db.ref('retargeting_rules').push();
    const ruleId = newRuleRef.key;
    
    const rule = {
      ...ruleData,
      ruleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: ruleData.isActive !== false
    };
    
    await newRuleRef.set(rule);
    return { success: true, ruleId, rule };
  } catch (error) {
    console.error('Error creating retargeting rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * READ: Get all retargeting rules
 */
export async function getAllRetargetingRules() {
  try {
    const snapshot = await db.ref('retargeting_rules').once('value');
    const rules = [];
    
    snapshot.forEach(childSnapshot => {
      rules.push(childSnapshot.val());
    });
    
    return { success: true, rules };
  } catch (error) {
    console.error('Error fetching retargeting rules:', error);
    return { success: false, error: error.message };
  }
}

/**
 * READ: Get single rule by ID
 */
export async function getRetargetingRuleById(ruleId) {
  try {
    const snapshot = await db.ref(`retargeting_rules/${ruleId}`).once('value');
    const rule = snapshot.val();
    
    if (!rule) {
      return { success: false, error: 'Rule not found' };
    }
    
    return { success: true, rule };
  } catch (error) {
    console.error('Error fetching rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE: Update existing rule
 */
export async function updateRetargetingRule(ruleId, updateData) {
  try {
    const snapshot = await db.ref(`retargeting_rules/${ruleId}`).once('value');
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Rule not found' };
    }
    
    const updated = {
      ...snapshot.val(),
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`retargeting_rules/${ruleId}`).set(updated);
    return { success: true, rule: updated };
  } catch (error) {
    console.error('Error updating rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * DELETE: Remove retargeting rule
 */
export async function deleteRetargetingRule(ruleId) {
  try {
    await db.ref(`retargeting_rules/${ruleId}`).remove();
    return { success: true, message: 'Rule deleted successfully' };
  } catch (error) {
    console.error('Error deleting rule:', error);
    return { success: false, error: error.message };
  }
}

// ==================== USER BEHAVIOR TRACKING ====================

/**
 * CREATE: Log user behavior interaction
 */
export async function logUserBehavior(sessionData) {
  try {
    const sessionId = sessionData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logRef = db.ref(`user_behavior_logs/${sessionId}`);
    
    const log = {
      ...sessionData,
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interactions: sessionData.interactions || []
    };
    
    await logRef.set(log);
    return { success: true, sessionId, log };
  } catch (error) {
    console.error('Error logging behavior:', error);
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE: Track interaction point update
 */
export async function updateBehaviorPoints(sessionId, interaction) {
  try {
    const snapshot = await db.ref(`user_behavior_logs/${sessionId}`).once('value');
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Session not found' };
    }
    
    const currentLog = snapshot.val();
    const interactions = currentLog.interactions || [];
    
    interactions.push({
      type: interaction.type, // 'image_click', 'zoom', 'hover_8s'
      points: interaction.points,
      timestamp: new Date().toISOString(),
      metadata: interaction.metadata || {}
    });
    
    const newScore = (currentLog.intendScore || 0) + interaction.points;
    
    const updated = {
      ...currentLog,
      intendScore: newScore,
      interactions,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`user_behavior_logs/${sessionId}`).set(updated);
    return { success: true, sessionId, newScore, interactions };
  } catch (error) {
    console.error('Error updating behavior points:', error);
    return { success: false, error: error.message };
  }
}

/**
 * READ: Get behavior logs for a user
 */
export async function getUserBehaviorLogs(userId) {
  try {
    const snapshot = await db.ref('user_behavior_logs').orderByChild('userId').equalTo(userId).once('value');
    const logs = [];
    
    snapshot.forEach(childSnapshot => {
      logs.push(childSnapshot.val());
    });
    
    return { success: true, logs };
  } catch (error) {
    console.error('Error fetching user behavior logs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * READ: Get session behavior
 */
export async function getSessionBehavior(sessionId) {
  try {
    const snapshot = await db.ref(`user_behavior_logs/${sessionId}`).once('value');
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Session not found' };
    }
    
    return { success: true, session: snapshot.val() };
  } catch (error) {
    console.error('Error fetching session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE: Change the status of an existing behavioral session
 */
export async function updateSessionStatus(sessionId, updateData) {
  try {
    const snapshot = await db.ref(`user_behavior_logs/${sessionId}`).once('value');

    if (!snapshot.exists()) {
      return { success: false, error: 'Session not found' };
    }

    const updated = {
      ...snapshot.val(),
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await db.ref(`user_behavior_logs/${sessionId}`).set(updated);
    return { success: true, session: updated };
  } catch (error) {
    console.error('Error updating session status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * EVALUATE: Check if session qualifies for any active rules
 */
export async function evaluateSessionAgainstRules(sessionId) {
  try {
    const sessionResult = await getSessionBehavior(sessionId);
    if (!sessionResult.success) {
      return { success: false, error: 'Session not found' };
    }
    
    const session = sessionResult.session;
    const rulesResult = await getAllRetargetingRules();
    
    if (!rulesResult.success) {
      return { success: false, error: 'Could not fetch rules' };
    }
    
    const matchedRules = [];
    
    for (const rule of rulesResult.rules) {
      if (!rule.isActive) continue;
      
      // Check if rule matches category/product
      const categoryMatches = rule.category === 'global' || rule.category === session.selectedColorVariant;
      
      // Check if score threshold met
      const scoreMatches = session.intendScore >= rule.scoreThreshold;
      
      if (categoryMatches && scoreMatches) {
        matchedRules.push(rule);
      }
    }
    
    // Trigger the highest priority rule (first matched)
    if (matchedRules.length > 0) {
      const triggeredRule = matchedRules[0];
      
      // Update session with triggered rule
      await db.ref(`user_behavior_logs/${sessionId}`).update({
        triggeredRuleId: triggeredRule.ruleId,
        couponCode: triggeredRule.discountCode,
        status: 'high_intent',
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        triggered: true,
        rule: triggeredRule,
        session: { sessionId, intendScore: session.intendScore }
      };
    }
    
    return {
      success: true,
      triggered: false,
      message: 'No matching rules for current score'
    };
  } catch (error) {
    console.error('Error evaluating session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ANALYTICS: Get high-intent sessions for dashboard
 */
export async function getHighIntentSessions(limit = 50) {
  try {
    const snapshot = await db.ref('user_behavior_logs').once('value');
    const sessions = [];
    
    snapshot.forEach(childSnapshot => {
      const session = childSnapshot.val();
      if (session.status === 'high_intent' || session.triggeredRuleId) {
        sessions.push(session);
      }
    });
    
    // Sort by most recent and limit
    sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return { success: true, sessions: sessions.slice(0, limit), total: sessions.length };
  } catch (error) {
    console.error('Error fetching high-intent sessions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ANALYTICS: Get conversion metrics
 */
export async function getConversionMetrics() {
  try {
    const snapshot = await db.ref('user_behavior_logs').once('value');
    const sessions = [];
    
    snapshot.forEach(childSnapshot => {
      sessions.push(childSnapshot.val());
    });
    
    const totalSessions = sessions.length;
    const highIntentSessions = sessions.filter(s => s.status === 'high_intent').length;
    const convertedSessions = sessions.filter(s => s.status === 'converted').length;
    const abandonedSessions = sessions.filter(s => s.status === 'abandoned').length;
    
    return {
      success: true,
      metrics: {
        totalSessions,
        highIntentSessions,
        convertedSessions,
        abandonedSessions,
        conversionRate: totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(2) + '%' : '0%',
        highIntentRate: totalSessions > 0 ? ((highIntentSessions / totalSessions) * 100).toFixed(2) + '%' : '0%'
      }
    };
  } catch (error) {
    console.error('Error getting conversion metrics:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ANALYTICS: Get all interactions from all sessions (for detailed logging)
 */
export async function getAllInteractions(limit = 1000) {
  try {
    const snapshot = await db.ref('user_behavior_logs').once('value');
    const allSessions = [];
    
    snapshot.forEach(childSnapshot => {
      allSessions.push(childSnapshot.val());
    });
    
    // Sort by most recent first
    allSessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return { success: true, interactions: allSessions.slice(0, limit), total: allSessions.length };
  } catch (error) {
    console.error('Error fetching all interactions:', error);
    return { success: false, error: error.message };
  }
}