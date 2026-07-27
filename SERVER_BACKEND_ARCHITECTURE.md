# 🏗️ AARAMDEHI SERVER BACKEND ARCHITECTURE

## Overview
Express.js server (v5.2.1) with Firebase Realtime Database, JWT authentication, and comprehensive e-commerce features.

---

## 1. 🗄️ DATABASE & ORM

### Database Type
- **Primary**: Firebase Realtime Database (NoSQL)
- **No traditional ORM**: Uses Firebase Admin SDK directly
- **Alternative credentials**: Supports both service account JSON files and environment variable-based credentials

### Firebase Configuration
- **Location**: `server/config/db.js`
- **Initialization**:
  - Loads from `FIREBASE_CONFIG_JSON` environment variable (preferred)
  - Falls back to individual env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
  - Falls back to `serviceAccountKey.json` file
  - Default database URL: `https://aaramdehi-91f82-default-rtdb.firebaseio.com/`

### Key Collections
- `users` - User accounts and authentication
- `products` - Product catalog with variants and images
- `orders` - Order records
- `coupons` - Promotional codes
- `banners` - Homepage banners
- `categories` - Product categories
- `analytics` - User behavior tracking
- `rooms` - Room/space data
- `appointments` - Booking appointments
- `newsletter` - Email subscribers
- `team` - Team members
- `shops` - Vendor/shop information

---

## 2. 📦 EXPORTED DB HELPER FUNCTIONS

All functions in `server/config/db.js`:

```javascript
// Core CRUD Operations
findAll(collectionName)                    // Get all records
findById(collectionName, id)               // Get single record by ID
findByQuery(collectionName, property, value) // Query by property
findPaginated(collectionName, limit, lastKey) // Paginated results
create(collectionName, data)               // Create new record
updateById(collectionName, id, updateData) // Update record
deleteById(collectionName, id)             // Delete single record
deleteMany(collectionName, ids)            // Delete multiple records

// Auto-managed fields
// - createdAt (ISO timestamp on create)
// - updatedAt (ISO timestamp on create & update)
```

---

## 3. 🔐 AUTHENTICATION & MIDDLEWARE

### Middleware Stack
Located in `server/middleware/`:

| Middleware | Purpose | Location |
|-----------|---------|----------|
| `auth.middleware.js` | JWT token verification & user lookup | Core auth |
| `authMiddleware.js` | Alternative auth implementation | Legacy support |
| `multer.js` | File upload handling (images, 3D models) | File processing |
| `rateLimit.middleware.js` & `rateLimiters.js` | Rate limiting per endpoint | Security |
| `requestValidator.js` | Request body validation | Input validation |
| `securityHeaders.js` | OWASP security headers | Security headers |

### Authentication Flow
1. **Token Sources** (in order):
   - `Authorization: Bearer <token>` header
   - `accessToken` cookie
2. **Verification**: JWT verification against `SECRET_KEY_ACCESS_TOKEN`
3. **User Lookup**: Fetches user from `users` collection via decoded token ID
4. **Role Check**: Middleware checks `user.role` === `"ADMIN"` for protected endpoints

### Security Headers
- CSP (Content Security Policy)
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- HSTS (HTTP Strict-Transport-Security) in production
- Permissions-Policy restricting browser APIs

### Rate Limiters
- `authLimiter` - Authentication endpoints
- `passwordResetLimiter` - Password reset attempts
- `otpLimiter` - OTP verification attempts

---

## 4. 🎯 CONTROLLERS & ROUTES

### Controllers (`server/controllers/`)
| Controller | Endpoints | Key Functions |
|-----------|-----------|---------------|
| **product.controller.js** | Products CRUD | Create/read/update/delete products, reviews, room analysis |
| **user.controller.js** | Auth & user profile | Register, login, verify email, forgot/reset password, user details |
| **order.controller.js** | Order management | Create orders, order history, order tracking, status updates |
| **payment.controller.js** | Payment processing | Initiate payments, verify transactions |
| **coupon.controller.js** | Coupon system | Create/apply coupons, validation |
| **banner.controller.js** | Homepage banners | Create/manage promotional banners |
| **category.controller.js** | Product categories | Browse/manage categories |
| **seo.controller.js** | SEO management | Meta tags, structured data (JSON-LD) |
| **analytics.controller.js** | User analytics | Track page views, user behavior |
| **appointment.controller.js** | Booking system | Create/manage appointments |
| **settings.controller.js** | App settings | Global configuration |
| **newsletter.controller.js** | Email subscriptions | Subscribe/unsubscribe |
| **refund.controller.js** | Refund processing | Handle refunds |
| **team.controller.js** | Team management | Team member CRUD |
| **shops.controller.js** | Multi-vendor support | Shop/vendor management |
| **room.controller.js** | Room/space data | Room management |

### Routes (`server/routes/`)
```
Public Routes (no auth required):
  GET  /api/auth/register
  POST /api/auth/login
  POST /api/auth/verify-email
  POST /api/auth/forgot-password
  POST /api/auth/reset-password
  GET  /api/products
  GET  /api/products/:id
  POST /api/products/analyze-room
  GET  /api/banners
  GET  /api/categories

Protected Routes (auth required):
  GET  /api/user/* (user profile)
  POST /api/products/create
  PUT  /api/products/:id
  DELETE /api/products/:id
  GET  /api/orders
  POST /api/orders
  GET  /api/coupons
  POST /api/coupons/apply

Admin-Only Routes (isAdmin middleware):
  GET  /api/products/admin/stats
  DELETE /api/products/:id
  POST /api/settings
```

---

## 5. 📤 FILE UPLOADS & IMAGE HANDLING

### Multer Configuration
- **Storage**: Memory-based (direct streaming to Cloudinary)
- **File types**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.glb`, `.gltf`
- **File size limit**: 5MB per file
- **Max files**: 100 files per request
- **Usage**: `upload.any()` accepts any field names (flexible variant handling)

### Image Processing
- **Service**: Cloudinary (cloud image hosting)
- **Env vars needed**:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- **Utilities**: `server/utils/uploadImageCloudinary.js`
  - Upload images to Cloudinary
  - Delete images from Cloudinary
  - Extract public IDs from URLs

### Product Image Structure
- Supports multiple images per product
- Supports color/variant-specific images
- 3D model support (`.glb`/`.gltf` files for AR)
- Normalized structure with `url`, `public_id`, `alt` fields

---

## 6. ⚙️ ENVIRONMENT CONFIGURATION

### Required Environment Variables

```env
# Server
PORT=8000
NODE_ENV=production|development
FRONTEND_URL=https://aaramdehi.vercel.app

# JWT Secrets (generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SECRET_KEY_ACCESS_TOKEN=<32-byte-hex>
SECRET_KEY_REFRESH_TOKEN=<32-byte-hex>

# Firebase
FIREBASE_PROJECT_ID=aaramdehi-91f82
FIREBASE_PRIVATE_KEY=<private-key-from-service-account>
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_DATABASE_URL=https://aaramdehi-91f82-default-rtdb.firebaseio.com/

# Email (Gmail with App Password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=<16-digit-app-password>

# Image Hosting (Cloudinary)
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Keep-Alive (for Render uptime monitoring)
KEEP_ALIVE_INTERVAL_MINUTES=11
KEEP_ALIVE_URL=http://127.0.0.1:8000/health
```

### Configuration Loading Order
1. `server/.env` (server-specific)
2. `../.env` (root-level, fallback)
3. Service account key file fallback

---

## 7. 🚀 ENTRY POINT & SERVER SETUP

### Main File: `server/index.js`

**Key Features**:
- Express.js v5.2.1 with ES modules
- CORS enabled for multiple origins:
  - `https://www.aaramdehi.co.in`
  - `https://aaramdehi.co.in`
  - `https://aaramdehi.vercel.app`
  - `https://aaramdehi-backend.onrender.com`
  - Local dev: `http://localhost:5173`
  
- Middleware Stack:
  - JSON parsing (10MB limit)
  - URL encoding
  - Cookie parsing
  - Morgan logging
  - Security headers
  - Helmet protection
  - Rate limiting
  
- API Prefix: `/api`

### Health Check Endpoints
```javascript
GET  /health        // Returns { success, status, uptimeSeconds, timestamp }
GET  /ping          // Simple { success, message: 'pong' }
GET  /              // { message: "Server is Active" }
```

### Error Handling
- 404 catch-all handler
- Global error middleware with detailed logging
- Development error stack traces (when `NODE_ENV=development`)
- JSON validation error responses

---

## 8. 🔧 UTILITY FUNCTIONS

Located in `server/utils/`:

| File | Purpose |
|------|---------|
| `uploadImageCloudinary.js` | Upload/delete images, extract public IDs |
| `generatedAccessToken.js` | Create JWT access tokens |
| `generatedRefreshToken.js` | Create JWT refresh tokens |
| `generatedOtp.js` | Generate 6-digit OTPs |
| `verifyEmailTemplate.js` | Email HTML template for verification |
| `forgotPasswordTemplate.js` | Email HTML template for password reset |
| `orderEmailTemplate.js` | Email HTML template for orders |
| `generateInvoicePDF.js` | Create PDF invoices |
| `sendEmail.js` | Email sending (Nodemailer) |
| `validation.js` | Input validation helpers |

---

## 9. 📊 ADDITIONAL CONFIGURATIONS

### External Services Integrated
- **Firebase Admin SDK**: Database & auth
- **Cloudinary**: Image hosting
- **Nodemailer**: Email sending via Gmail
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **sharp**: Image optimization (optional)
- **slugify**: URL-friendly strings

### Package Dependencies
```json
{
  "bcryptjs": "^3.0.3",
  "cloudinary": "^2.9.0",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "express-rate-limit": "^8.4.1",
  "firebase": "^12.13.0",
  "firebase-admin": "^13.9.0",
  "helmet": "^8.1.0",
  "jsonwebtoken": "^9.0.3",
  "morgan": "^1.10.1",
  "multer": "^2.1.1",
  "nodemailer": "^8.0.7",
  "sharp": "^0.33.5",
  "slugify": "^1.6.9"
}
```

---

## 10. 🎯 KEY ARCHITECTURAL DECISIONS

| Decision | Rationale |
|----------|-----------|
| **Firebase over MongoDB** | Real-time sync, integrated auth, Vercel-friendly |
| **JWT tokens** | Stateless auth, works with serverless |
| **Memory-based multer** | Direct streaming to Cloudinary (no disk write) |
| **Rate limiting** | DDoS protection on Render/Vercel |
| **Security headers** | OWASP compliance (CSP, HSTS, etc.) |
| **Email templates** | Branded user communications |
| **Cloudinary** | Serverless-friendly image optimization |

---

## 11. 📝 QUICK START FOR DEVELOPMENT

```bash
# Install dependencies
cd server
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Development (with auto-reload)
npm run dev

# Production
npm start

# Server runs on PORT (default 8000)
# Access at: http://localhost:8000
```

---

## 12. 🔍 NEXT STEPS FOR BUILDING

### Common Extension Points
1. **New features**: Add controller → add route → add to `index.js`
2. **New collections**: Use `findAll()`, `create()` patterns from `db.js`
3. **Protected endpoints**: Wrap with `isAuthenticatedUser`, optionally `isAdmin`
4. **File uploads**: Use `upload.any()` middleware
5. **Email notifications**: Use `sendEmail()` utility with custom templates

### Database Query Patterns
```javascript
// Fetch all
const items = await findAll('products');

// Find by ID
const item = await findById('products', productId);

// Query by property
const matches = await findByQuery('products', 'category', 'electronics');

// Create
const newItem = await create('products', { name: 'Item', price: 100 });

// Update
await updateById('products', id, { price: 150 });

// Delete
await deleteById('products', id);
```

---

Generated: 2026-07-27 | Backend Architecture v1.0
