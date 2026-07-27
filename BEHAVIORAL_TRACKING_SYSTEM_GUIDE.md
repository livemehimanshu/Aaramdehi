# 🎯 Enterprise Behavioral Tracking & Retargeting System
## Complete Implementation Guide

---

## 📋 Overview

This is a **production-ready** behavioral tracking and dynamic retargeting system that:

- ✅ Tracks user interactions (clicks, zoom, hover) with point system
- ✅ Evaluates rules dynamically based on intent score
- ✅ Displays personalized offers via sticky bars, pop-ups, or top banners
- ✅ Admin panel for full CRUD control of rules without coding
- ✅ Real-time analytics dashboard showing high-intent sessions
- ✅ Conversion tracking and KPI metrics
- ✅ Fully responsive design (desktop, tablet, mobile)
- ✅ Firebase Realtime Database integration

---

## 🗂️ Files Created

### Backend Files

#### Database & Utils
- **`server/utils/db-behavioral.js`** - Firebase helpers for:
  - CRUD operations on retargeting rules
  - User behavior tracking
  - Session evaluation against rules
  - Conversion metrics calculation

#### Controllers
- **`server/controllers/behavioralTrackingController.js`** - 8 main endpoints:
  - Create/Read/Update/Delete rules (admin only)
  - Track user behavior interactions
  - Evaluate sessions and trigger rules
  - Fetch high-intent sessions
  - Calculate conversion metrics

#### Routes
- **`server/routes/behavioralTrackingRoutes.js`** - All API routes:
  - Admin CRUD routes (protected with isAdmin middleware)
  - User tracking routes (protected with isAuthenticatedUser)
  - Analytics dashboard routes

#### Server Integration
- **`server/index.js`** - Added behavioral tracking router under `/api/analytics/`

### Frontend Files

#### Hooks
- **`src/hooks/useBehaviorTracking.js`** - Main tracking hook:
  - Initialize session on component mount
  - Track interactions with point system
  - Batch updates to backend (every 5 seconds)
  - Evaluate triggered rules
  - Mark sessions as converted/abandoned
  - Auto-detect hover (8+ seconds = +5 points)

- **`src/hooks/useExitIntent.js`** - Exit detection:
  - Detect mouse leaving top of page
  - Detect keyboard shortcuts (Alt+F4, Ctrl+W, ESC)
  - Trigger callback to show exit-intent modal

#### Admin Panel Components
- **`component/Admin/BehavioralAdsAdmin.jsx`** - Rule management:
  - Create new rules with full form validation
  - Edit existing rules
  - Delete rules with confirmation
  - Toggle rules active/inactive
  - Real-time rule list table
  - Customizable banner text and colors

- **`component/Admin/BehavioralAnalyticsDashboard.jsx`** - Real-time monitoring:
  - Live metrics cards (total, high-intent, conversions, abandoned)
  - Real-time session table showing user interactions
  - Session status tracking (active, high-intent, converted, abandoned)
  - Auto-refresh every 10 seconds
  - Manual refresh option

#### User-Facing Components
- **`component/slider/RetargetingBanners.jsx`** - 3 banner layouts:
  - **StickyBottomBanner** - Slide-up from bottom with copy-to-clipboard
  - **ExitIntentModal** - Centered modal with urgency messaging
  - **TopAnnouncementBanner** - Top banner with animated badge
  - RetargetingDisplayManager - Unified component to render correct layout

#### Documentation
- **`BEHAVIORAL_TRACKING_INTEGRATION_GUIDE.md`** - Step-by-step integration guide

---

## 🔌 API Endpoints

### Admin Rule Management (Protected with isAdmin)

```
POST   /api/analytics/admin/retargeting-rules
  Create new retargeting rule
  Body: { ruleName, category, scoreThreshold, discountCode, discountValue, bannerLayout, bannerText, bannerColor }

GET    /api/analytics/admin/retargeting-rules
  Fetch all rules
  Response: { success, count, rules: [...] }

GET    /api/analytics/admin/retargeting-rules/:ruleId
  Fetch single rule
  Response: { success, rule: {...} }

PUT    /api/analytics/admin/retargeting-rules/:ruleId
  Update rule
  Body: { ...fields to update... }

DELETE /api/analytics/admin/retargeting-rules/:ruleId
  Delete rule
  Response: { success, message: "Rule deleted successfully" }
```

### User Behavior Tracking (Protected with isAuthenticatedUser)

```
POST   /api/analytics/create-session
  Initialize tracking session
  Body: { userId, targetProductId, selectedColorVariant }
  Response: { success, sessionId }

POST   /api/analytics/track-behavior
  Track interaction and evaluate rules
  Body: { sessionId, userId, intendScore, targetProductId, selectedColorVariant, interaction }
  Response: { success, newScore, ruleTriggered, rule }

POST   /api/analytics/update-session-status
  Mark session as converted/abandoned (Admin)
  Body: { sessionId, status: "converted" | "abandoned" | "active" | "high_intent" }
```

### Analytics Dashboard (Protected with isAdmin)

```
GET    /api/analytics/high-intent-sessions?limit=50
  Fetch real-time high-intent sessions
  Response: { success, total, sessions: [...] }

GET    /api/analytics/conversion-metrics
  Get conversion KPIs
  Response: { success, metrics: { totalSessions, highIntentSessions, convertedSessions, abandonedSessions, conversionRate, highIntentRate } }

GET    /api/analytics/user-behavior/:userId
  Get behavior logs for specific user
  Response: { success, count, logs: [...] }
```

---

## 🎮 Point System

Users earn points when interacting with products:

| Interaction | Points | Triggered By |
|------------|--------|---|
| Image Click | +2 | User clicks on product image |
| Variant Switch | +2 | User selects color/size variant |
| Zoom Open | +4 | User opens image magnifier |
| Modal Open | +4 | User opens any product modal |
| Hover 8+ Seconds | +5 | User hovers on image for 8+ seconds |
| Page View | +1 | User views product page |

**Example Flow:**
1. User lands on pillow product (1 pt) → Total: 1
2. User clicks 3 product images (2 pts each) → Total: 7
3. User zooms into image (4 pts) → Total: 11
4. Admin set "High Intent Pillow Rule" threshold at 10 pts
5. **Rule triggers!** User sees: "Get 10% OFF - Code: PILLOW10" banner

---

## 📊 Admin Panel Features

### Behavioral Ads & Targeting Page
- Create rules with custom thresholds and offers
- Edit existing rules without developer help
- Delete rules with confirmation
- Toggle rules active/inactive (pause without deletion)
- Colorize banners with custom hex colors
- Customize banner text for different campaigns
- Choose banner layout for different user segments

### Analytics Dashboard
- **Real-time Metrics:**
  - Total user sessions
  - High-intent sessions count + percentage
  - Successful conversions + conversion rate
  - Abandoned sessions count
  
- **Live Session Table:**
  - Session ID, User ID, Intent Score
  - Product viewed, Coupon code issued
  - Current session status (active/converted/abandoned)
  - Last updated timestamp
  - Auto-refresh every 10 seconds

- **Export Ready:**
  - Table data is easily exportable
  - Metrics can be used for reporting

---

## 🚀 Frontend Integration

### In ProductDetailsPage.jsx

```jsx
// 1. Import hooks and components
import useBehaviorTracking from '@/hooks/useBehaviorTracking';
import useExitIntent from '@/hooks/useExitIntent';
import { RetargetingDisplayManager } from '@/component/slider/RetargetingBanners';

// 2. Initialize in component
const { trackInteraction, triggeredRule, markAsConverted } = useBehaviorTracking(productId, userId);
const [showBanner, setShowBanner] = useState(false);

// 3. Track interactions
const handleImageClick = (image) => {
  setSelectedImage(image);
  trackInteraction('image_click', 2); // +2 points
};

const handleZoom = () => {
  trackInteraction('zoom_open', 4); // +4 points
};

// 4. Track conversion
const handleAddToCart = async (...) => {
  // ... cart logic ...
  await markAsConverted(); // Mark session as converted
};

// 5. Show banner when rule triggers
useEffect(() => {
  if (triggeredRule) {
    setShowBanner(true);
  }
}, [triggeredRule]);

// 6. Render in JSX
return (
  <div>
    {/* ... product content ... */}
    
    {showBanner && triggeredRule && (
      <RetargetingDisplayManager
        rule={triggeredRule}
        productName={productData?.name}
        onClose={() => setShowBanner(false)}
      />
    )}
  </div>
);
```

---

## 📈 How It Works

### User Journey
```
1. User lands on product page
   → Session created with sessionId
   → Initial score: 0

2. User interacts with product
   → Image click (+2) → Score: 2
   → Zoom (+4) → Score: 6
   → Variant switch (+2) → Score: 8
   → Hover 8s (+5) → Score: 13

3. Score reaches threshold (e.g., 10)
   → Admin rule with threshold=10 triggered
   → Rule contains: coupon code, discount, banner layout

4. Corresponding offer displayed
   → Bottom sticky bar, exit modal, or top banner
   → User sees: "Get 10% OFF - Code: PILLOW10"

5. User actions
   Option A: Adds to cart → Session marked "converted"
   Option B: Leaves page → Session marked "abandoned"
   Option C: Takes no action → Session stays "active"

6. Admin monitoring
   → Dashboard shows real-time triggered sessions
   → Conversion rate calculated
   → Rule performance tracked
```

---

## 🔐 Security

- ✅ All admin endpoints require `isAdmin` middleware
- ✅ All user endpoints require `isAuthenticatedUser` middleware
- ✅ JWT tokens required for all requests
- ✅ Firebase Realtime DB with access rules
- ✅ Input validation on all endpoints
- ✅ Rate limiting on API routes
- ✅ CORS protection enabled

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full-featured admin tables
- Side-by-side banner preview
- Complete form layouts

### Tablet (768px - 1023px)
- Stacked form fields
- Scrollable tables
- Optimized banner display
- Touch-friendly buttons

### Mobile (< 768px)
- Single-column layouts
- Collapsible sections
- Full-width forms
- Mobile-optimized banners
- No hover effects (touch-based)

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Tracking
1. Go to any product page
2. Click 3 images (+2 each = 6 pts)
3. Check browser console - should see tracking logs
4. Open browser DevTools → Storage → SessionStorage
5. Look for `behavior_score_{productId}` to verify score

### Scenario 2: Rule Triggering
1. Admin creates rule with threshold=10
2. User clicks images and zooms to reach 10+ points
3. Check if correct banner appears
4. Verify coupon code matches rule
5. Check if session marked as "high_intent" in DB

### Scenario 3: Admin CRUD
1. Admin navigates to Behavioral Ads page
2. Create new rule with custom fields
3. Edit rule (change threshold or coupon)
4. Delete rule with confirmation
5. Toggle rule active/inactive
6. Verify changes immediately

### Scenario 4: Analytics Dashboard
1. Create multiple sessions with different scores
2. Go to Analytics Dashboard
3. Verify metrics cards show correct counts
4. Check real-time sessions table
5. Enable auto-refresh and watch for updates

### Scenario 5: Conversion Tracking
1. User reaches high-intent threshold
2. User adds product to cart
3. Check session status in dashboard → should be "converted"
4. Verify conversion rate increased
5. Check DB directly to confirm status

---

## 📚 Database Schema

### Firebase Collections

#### `retargeting_rules/`
```json
{
  "{ruleId}": {
    "ruleId": "abc123...",
    "ruleName": "High Intent Pillow Retargeting",
    "category": "global",
    "scoreThreshold": 10,
    "discountCode": "PILLOW10",
    "discountValue": "₹150 OFF",
    "bannerLayout": "sticky-bottom",
    "bannerText": "Get ₹150 OFF on Pillows - Code: PILLOW10",
    "bannerColor": "#FF6B6B",
    "isActive": true,
    "createdAt": "2026-07-27T10:30:00Z",
    "updatedAt": "2026-07-27T10:30:00Z"
  }
}
```

#### `user_behavior_logs/`
```json
{
  "{sessionId}": {
    "sessionId": "session_123456...",
    "userId": "user789...",
    "intendScore": 13,
    "targetProductId": "pillow-memory-foam",
    "selectedColorVariant": "white",
    "interactions": [
      {
        "type": "image_click",
        "points": 2,
        "timestamp": "2026-07-27T10:32:00Z"
      },
      {
        "type": "zoom_open",
        "points": 4,
        "timestamp": "2026-07-27T10:33:00Z"
      }
    ],
    "triggeredRuleId": "abc123...",
    "couponCode": "PILLOW10",
    "status": "high_intent",
    "createdAt": "2026-07-27T10:30:00Z",
    "updatedAt": "2026-07-27T10:33:00Z"
  }
}
```

---

## 🚨 Troubleshooting

### Issue: Tracking not working
**Solution:** 
- Check if `useBehaviorTracking` hook is initialized with correct `productId`
- Verify sessionId is created - check localStorage
- Confirm JWT token exists in localStorage
- Check browser console for errors

### Issue: Rule not triggering
**Solution:**
- Verify rule is marked as `isActive: true`
- Check if score reaches threshold
- Confirm rule category matches product
- Check Admin panel - rule should be in list

### Issue: Banner not showing
**Solution:**
- Check if `triggeredRule` is not null
- Verify `RetargetingDisplayManager` is rendered
- Check CSS not hidden by other styles
- Try in incognito mode (avoid cache)

### Issue: Admin can't create rules
**Solution:**
- Verify user is marked as ADMIN in database
- Check JWT token is valid
- Confirm all required fields filled in form
- Check network tab for API errors

---

## 📞 Support & Next Steps

### Immediate Next Steps
1. ✅ Run backend migration if needed
2. ✅ Integrate hooks into ProductDetailsPage
3. ✅ Test tracking on local environment
4. ✅ Create initial rules in admin panel
5. ✅ Deploy to production

### Future Enhancements
- Add WebSocket for real-time rule updates
- Implement A/B testing for different banners
- Add segment-based targeting (device, location, etc.)
- Email notifications for high-intent users
- Automated rule suggestions based on data
- Dark mode for admin panel
- Multi-language support for banners

---

## 📝 License & Credits

This is a production-ready system built with:
- React.js (Frontend)
- Express.js (Backend)
- Firebase Realtime Database
- React Icons
- React Hot Toast

Ready to deploy! 🚀

---

**Last Updated:** July 27, 2026
**Version:** 1.0.0 (Production Ready)
