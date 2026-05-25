/**
 * 🛡️ Request Validation Middleware
 * Validates all incoming requests for security
 */

// Store recent submissions to prevent double-submit
const submissionCache = new Map();

/**
 * Validate incoming request
 * - Checks content-type
 * - Validates request size
 * - Checks required headers
 * - Validates JSON format
 */
export const validateRequest = (req, res, next) => {
  // 1. Skip validation for GET requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  // 2. Validate Content-Type for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
        error: true
      });
    }

    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type must be application/json',
        error: true
      });
    }
  }

  // 3. Check request size
  const contentLength = req.headers['content-length'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && parseInt(contentLength) > MAX_SIZE) {
    return res.status(413).json({
      success: false,
      message: `Request payload too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`,
      error: true
    });
  }

  // 4. Check for required security headers
  const userAgent = req.headers['user-agent'];
  const host = req.headers['host'];

  if (!userAgent) {
    return res.status(400).json({
      success: false,
      message: 'Missing User-Agent header',
      error: true
    });
  }

  if (!host) {
    return res.status(400).json({
      success: false,
      message: 'Missing Host header',
      error: true
    });
  }

  // 5. Validate JSON format (if body exists)
  if (req.body && typeof req.body === 'object') {
    try {
      // Body already parsed by express.json()
      if (Object.keys(req.body).length === 0 && req.method !== 'DELETE') {
        // Empty body might be okay for some endpoints
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request body',
        error: true
      });
    }
  }

  next();
};

/**
 * Prevent double submission attacks
 * Checks if the same request was just submitted
 */
export const preventDoubleSubmission = (req, res, next) => {
  // Only apply to state-changing requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Generate submission key
  const submissionKey = generateSubmissionKey(req);

  // Check if already submitted
  const lastSubmission = submissionCache.get(submissionKey);

  if (lastSubmission && Date.now() - lastSubmission < 1000) {
    // Same request within 1 second
    return res.status(429).json({
      success: false,
      message: 'Duplicate request detected. Please wait before retrying.',
      error: true
    });
  }

  // Record this submission
  submissionCache.set(submissionKey, Date.now());

  // Cleanup old entries every 1000 submissions
  if (submissionCache.size > 1000) {
    // Remove oldest entries
    const entriesToDelete = Array.from(submissionCache.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 500)
      .map(entry => entry[0]);

    entriesToDelete.forEach(key => submissionCache.delete(key));
  }

  next();
};

/**
 * Validate request body structure
 * Ensures required fields are present
 */
export const validateRequestBody = (requiredFields = []) => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const missingFields = [];

      for (const field of requiredFields) {
        if (!req.body[field] || 
            (typeof req.body[field] === 'string' && !req.body[field].trim())) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: true,
          missingFields
        });
      }
    }

    next();
  };
};

/**
 * Validate request parameters
 */
export const validateRequestParams = (schema = {}) => {
  return (req, res, next) => {
    const errors = {};

    for (const [param, rules] of Object.entries(schema)) {
      const value = req.params[param];

      // Check required
      if (rules.required && !value) {
        errors[param] = `${param} is required`;
        continue;
      }

      // Check type
      if (value && rules.type) {
        const actualType = typeof value;
        if (actualType !== rules.type) {
          errors[param] = `${param} must be ${rules.type}, got ${actualType}`;
          continue;
        }
      }

      // Check pattern (regex)
      if (value && rules.pattern) {
        if (!rules.pattern.test(value)) {
          errors[param] = `${param} format is invalid`;
          continue;
        }
      }

      // Check length
      if (value && rules.minLength && value.length < rules.minLength) {
        errors[param] = `${param} must be at least ${rules.minLength} characters`;
        continue;
      }

      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors[param] = `${param} must be at most ${rules.maxLength} characters`;
        continue;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        error: true,
        errors
      });
    }

    next();
  };
};

/**
 * Rate limit by body field (email, phone, etc)
 */
export const rateLimitByField = (field, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const fieldValue = req.body[field];

    if (!fieldValue) {
      return next();
    }

    const key = `${field}:${fieldValue}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: `Too many attempts for ${field}. Please try again later.`,
        error: true
      });
    }

    recentAttempts.push(now);
    attempts.set(key, recentAttempts);

    next();
  };
};

/**
 * Sanitize request body
 */
export const sanitizeRequestBody = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Validate API version
 */
export const validateApiVersion = (supportedVersions = ['1.0']) => {
  return (req, res, next) => {
    const version = req.headers['x-api-version'] || '1.0';

    if (!supportedVersions.includes(version)) {
      return res.status(400).json({
        success: false,
        message: `API version ${version} is not supported`,
        error: true,
        supportedVersions
      });
    }

    req.apiVersion = version;
    next();
  };
};

/**
 * Helper function: Generate submission key
 */
function generateSubmissionKey(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const method = req.method;
  const path = req.path;
  const bodyHash = req.body ? JSON.stringify(req.body) : '';

  return `${ip}:${method}:${path}:${bodyHash}`;
}

/**
 * Helper function: Sanitize object
 */
function sanitizeObject(obj) {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper function: Sanitize string
 */
function sanitizeString(input) {
  return input
    .replace(/[<>]/g, '')
    .replace(/script/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export default {
  validateRequest,
  preventDoubleSubmission,
  validateRequestBody,
  validateRequestParams,
  rateLimitByField,
  sanitizeRequestBody,
  validateApiVersion
};
