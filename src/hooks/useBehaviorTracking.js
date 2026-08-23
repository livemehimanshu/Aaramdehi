/**
 * useBehaviorTracking Hook
 * Tracks user interactions (image clicks, zoom, hover) and manages intent scoring
 * 
 * Usage in ProductDetailsPage:
 * const { trackInteraction, sessionId } = useBehaviorTracking(productId);
 * 
 * trackInteraction('image_click', 2); // +2 points for image click
 * trackInteraction('zoom_open', 4);  // +4 points for zoom
 * trackInteraction('hover_8s', 5);   // +5 points for 8+ seconds hover
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

const INTERACTION_POINTS = {
  'image_click': 2,
  'variant_switch': 2,
  'zoom_open': 4,
  'modal_open': 4,
  'hover_8s': 5,
  'page_view': 1
};

const BATCH_INTERVAL_MS = 5000; // Batch updates every 5 seconds
const HOVER_THRESHOLD_MS = 8000; // 8 seconds

const useBehaviorTracking = (productId, userId, options = {}) => {
  const targetType = options.targetType || 'product';
  const targetContentId = options.targetContentId || productId;
  const [sessionId, setSessionId] = useState(null);
  const [intendScore, setIntendScore] = useState(0);
  const [triggeredRule, setTriggeredRule] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const interactionQueueRef = useRef([]);
  const hoverTimerRef = useRef(null);
  const batchTimerRef = useRef(null);
  const lastHoverElementRef = useRef(null);

  /**
   * Initialize tracking session
   */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const currentUserId = userId || localStorage.getItem('userId') || sessionStorage.getItem('behavior_guest_id') || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('behavior_guest_id', currentUserId);

        // Check if session already exists in sessionStorage
        const existingSessionId = sessionStorage.getItem(`behavior_session_${targetType}_${targetContentId}`);
        if (existingSessionId) {
          setSessionId(existingSessionId);
          setIsTracking(true);
          return;
        }

        const response = await api.post('/analytics/create-session', {
          userId: currentUserId,
          targetProductId: targetType === 'product' ? targetContentId : null,
          targetType,
          targetContentId,
          selectedColorVariant: null
        });

        const data = response.data;
        
        if (data.success) {
          setSessionId(data.sessionId);
          sessionStorage.setItem(`behavior_session_${targetType}_${targetContentId}`, data.sessionId);
          sessionStorage.setItem(`behavior_score_${productId}`, JSON.stringify({
            score: 0,
            interactions: []
          }));
          setIsTracking(true);
        }
      } catch (error) {
        console.error('Error initializing tracking session:', error);
      }
    };

    initializeSession();

    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, [productId, userId, targetType, targetContentId]);

  /**
   * Batch send interactions to backend
   */
  const flushBatchToBackend = useCallback(async () => {
    if (interactionQueueRef.current.length === 0 || !sessionId) return;

    try {
      const interactions = interactionQueueRef.current;
      interactionQueueRef.current = [];
      const currentUserId = userId || localStorage.getItem('userId') || sessionStorage.getItem('behavior_guest_id') || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('behavior_guest_id', currentUserId);

      for (const interaction of interactions) {
        const response = await api.post('/analytics/track-behavior', {
          sessionId,
          userId: currentUserId,
          intendScore,
          targetProductId: targetType === 'product' ? targetContentId : null,
          targetType,
          targetContentId,
          selectedColorVariant: localStorage.getItem(`variant_${productId}`),
          interaction
        });

        const data = response.data;

        if (data.success) {
          // Update score
          setIntendScore(data.newScore);
          
          // Check if rule was triggered
          if (data.ruleTriggered && data.rule) {
            setTriggeredRule(data.rule);
            
            // Show toast notification
            toast.success(
              `🎉 High-Intent Offer! Get ${data.rule.discountValue} - Code: ${data.rule.discountCode}`,
              { duration: 5000 }
            );
            
            // Store triggered rule in sessionStorage
            sessionStorage.setItem(
              `triggered_rule_${productId}`,
              JSON.stringify(data.rule)
            );
          }
        }
      }
    } catch (error) {
      console.error('Error flushing batch to backend:', error);
    }
  }, [sessionId, intendScore, productId, targetType, targetContentId]);

  /**
   * Start batch timer
   */
  useEffect(() => {
    if (sessionId && isTracking) {
      batchTimerRef.current = setInterval(flushBatchToBackend, BATCH_INTERVAL_MS);
    }

    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, [sessionId, isTracking, flushBatchToBackend]);

  /**
   * Track interaction
   */
  const trackInteraction = useCallback((interactionType, customPoints = null) => {
    if (!sessionId || !isTracking) return;

    const points = customPoints || INTERACTION_POINTS[interactionType] || 1;

    // Add to queue
    interactionQueueRef.current.push({
      type: interactionType,
      points,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        location: window.location.pathname
      }
    });

    // Update local score
    setIntendScore(prev => prev + points);

    // Store in sessionStorage
    const key = `behavior_score_${productId}`;
    const existing = JSON.parse(sessionStorage.getItem(key) || '{"score":0,"interactions":[]}');
    existing.score += points;
    existing.interactions.push({
      type: interactionType,
      points,
      timestamp: new Date().toISOString()
    });
    sessionStorage.setItem(key, JSON.stringify(existing));

    // If queue is getting large, flush immediately
    if (interactionQueueRef.current.length >= 5) {
      flushBatchToBackend();
    }
  }, [sessionId, isTracking, productId, flushBatchToBackend]);

  /**
   * Track hover with 8-second threshold
   */
  const trackHoverElement = useCallback((element) => {
    if (!sessionId || !isTracking) return;

    const handleMouseEnter = () => {
      lastHoverElementRef.current = element;
      
      hoverTimerRef.current = setTimeout(() => {
        // Only track if still hovering the same element
        if (lastHoverElementRef.current === element) {
          trackInteraction('hover_8s', 5);
        }
      }, HOVER_THRESHOLD_MS);
    };

    const handleMouseLeave = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      lastHoverElementRef.current = null;
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [sessionId, isTracking, trackInteraction]);

  /**
   * Get current triggered rule
   */
  const getTriggeredRule = useCallback(() => {
    if (triggeredRule) return triggeredRule;

    const stored = sessionStorage.getItem(`triggered_rule_${productId}`);
    return stored ? JSON.parse(stored) : null;
  }, [triggeredRule, productId]);

  /**
   * Mark session as converted
   */
  const markAsConverted = useCallback(async () => {
    try {
      await api.post('/analytics/update-session-status', {
        sessionId,
        status: 'converted'
      });

      sessionStorage.setItem(`behavior_status_${productId}`, 'converted');
    } catch (error) {
      console.error('Error marking session as converted:', error);
    }
  }, [sessionId, productId]);

  /**
   * Mark session as abandoned
   */
  const markAsAbandoned = useCallback(async () => {
    try {
      await api.post('/analytics/update-session-status', {
        sessionId,
        status: 'abandoned'
      });

      sessionStorage.setItem(`behavior_status_${productId}`, 'abandoned');
    } catch (error) {
      console.error('Error marking session as abandoned:', error);
    }
  }, [sessionId, productId]);

  return {
    sessionId,
    intendScore,
    triggeredRule: getTriggeredRule(),
    isTracking,
    trackInteraction,
    trackHoverElement,
    markAsConverted,
    markAsAbandoned,
    INTERACTION_POINTS
  };
};

export default useBehaviorTracking;
