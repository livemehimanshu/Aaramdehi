# 📋 QUICK REFERENCE: AARAMDEHI BACKEND

## Database Collections
| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | Authentication & profiles | email, password, role, isVerified |
| `products` | Product catalog | name, price, variants, images |
| `orders` | Order records | items, total, status, userId |
| `coupons` | Discount codes | code, discount, expiry |
| `categories` | Product categories | name, slug |
| `banners` | Promo banners | image, link, title |
| `analytics` | User tracking | userId, action, timestamp |
| `appointments` | Bookings | date, time, userId, status |
| `newsletter` | Email subscriptions | email |
| `rooms` | AR/space data | title, dimensions |
| `shops` | Vendor data | name, owner |
| `team` | Team members | name, role |
| `settings` | Global config | key, value |
| `refunds` | Refund records | orderId, amount, status |

## Routes by Feature

### Authentication `/api/auth`
- `POST /register` - New user signup
- `POST /login` - User login
- `POST /verify-email` - Email verification
- `POST /verify-otp` - OTP verification
- `POST /forgot-password` - Reset request
- `POST /reset-password` - Password reset
- `GET /me` 🔒 - Current user details

### Products `/api/products`
- `GET /` - List all products
- `GET /:id` - Single product
- `POST /create` 🔓 - Add product (admin)
- `PUT /:id` 🔓 - Update product (admin)
- `DELETE /:id` 🔓 - Delete product (admin)
- `GET /admin/stats` 🔓 - Dashboard stats (admin)
- `POST /analyze-room` - Room analysis
- `POST /:id/review` 🔒 - Add review
- `DELETE /:id/review/:reviewId` 🔓 - Delete review

### Other Routes
- `/api/user/*` 🔒 - User profile operations
- `/api/orders` 🔒 - Order management
- `/api/coupons` - Coupon operations
- `/api/categories` - Category browse
- `/api/banners` - Banner listings
- `/api/payments` - Payment processing
- `/api/appointments` - Booking system
- `/api/analytics` 🔒 - User analytics
- `/api/newsletter` - Email subscriptions
- `/api/rooms` - Room/space data
- `/api/shops` - Vendor data
- `/api/team` 🔓 - Team management
- `/api/refunds` 🔒 - Refund status
- `/api/seo` - SEO settings
- `/api/settings` 🔓 - App settings

**Legend**: 🔒=Auth Required, 🔓=Admin Only

## Middleware Checklist

| Middleware | When to Use |
|-----------|-----------|
| `isAuthenticatedUser` | Routes requiring login |
| `isAdmin` | Admin-only operations (add after auth) |
| `upload.any()` | File upload endpoints |
| `authLimiter` | Auth endpoints (auto-applied) |
| `passwordResetLimiter` | Password reset (auto-applied) |
| `validateRequestBody(['field1', 'field2'])` | Validate required fields |

## DB Helper Functions (Quick Syntax)

```javascript
import { findAll, findById, create, updateById, deleteById, findByQuery } from '../config/db.js';

// Query
const all = await findAll('users');
const user = await findById('users', userId);
const matches = await findByQuery('users', 'email', 'user@test.com');

// Modify
const newUser = await create('users', { name: 'John', email: 'john@test.com' });
await updateById('users', userId, { role: 'ADMIN' });
await deleteById('users', userId);
```

## Required Environment Variables

```env
# Essential
PORT=8000
SECRET_KEY_ACCESS_TOKEN=<hex>
SECRET_KEY_REFRESH_TOKEN=<hex>

# Firebase
FIREBASE_PROJECT_ID=aaramdehi-91f82
FIREBASE_PRIVATE_KEY=<key>
FIREBASE_CLIENT_EMAIL=<email>

# Email
EMAIL_USER=gmail@gmail.com
EMAIL_PASS=<app-password>

# Images
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

## File Upload Configuration

- **Multer**: Memory storage → Cloudinary
- **Max file size**: 5MB
- **Max files**: 100 per request
- **Allowed types**: `.jpg, .jpeg, .png, .webp, .glb, .gltf`
- **Usage**: `upload.any()` in route handler

## Common Patterns

### Adding a New Route
```javascript
// 1. Create controller
export const myController = async (req, res) => {
  try {
    const result = await findAll('myCollection');
    res.json({ success: true, data: result });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Add route
myRouter.get('/', myController);

// 3. Register in index.js
app.use('/api/myfeature', myRouter);
```

### Protected Admin Endpoint
```javascript
myRouter.post('/admin-action', isAuthenticatedUser, isAdmin, adminController);
```

### File Upload Endpoint
```javascript
myRouter.post('/upload', upload.any(), async (req, res) => {
  const files = req.files; // Array of uploaded files
  // Process files...
});
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 500 error on file upload | Use `upload.any()` not `upload.fields()` |
| "Route not found" | Add route to `index.js` with `/api` prefix |
| Auth middleware failing | Ensure `SECRET_KEY_ACCESS_TOKEN` env var is set |
| Firebase errors | Check `FIREBASE_PRIVATE_KEY` formatting (escape newlines) |
| Email not sending | Verify Gmail App Password (not regular password) |
| CORS errors | Check frontend URL in allowedCorsOrigins array |

## Health Check & Monitoring

```
GET /health    → { success, status, uptimeSeconds, timestamp }
GET /ping      → { success, message: 'pong' }
GET /          → { message: "Server is Active" }
```

---
**Last Updated**: 2026-07-27 | Backend v1.0
