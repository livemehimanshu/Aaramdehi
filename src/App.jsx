import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { useState, useEffect, lazy, Suspense } from 'react'
import { auth } from '../src/api/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

// Layouts
import Header from '../component/header/index.jsx'
import Footer from '../component/Footer/Footer.jsx'
import WhatsAppFloatingButton from '../component/WhatsAppFloatingButton.jsx'
import AaramdehiAIChat from '../component/AaramdehiAIChat.jsx'
import BlogEmailPopup from '../component/Pages/blog/BlogEmailPopup.jsx'
import VoiceNavigation from '../component/VoiceNavigation.jsx'
import AdminRoute from '../component/auth/AdminRoute.jsx'

const AdminLayout = lazy(() => import('../component/Admin/AdminLayout.jsx'))
const Sidebar = lazy(() => import('../component/sidebar/Sidebar.jsx'))

// Public Pages
const Home = lazy(() => import('../component/Pages/Home/index.jsx'))
const ProductListing = lazy(() => import('../component/Pages/productListing/index.jsx'))
const ProductDetailsPage = lazy(() => import('../component/Pages/productpage/ProductDetailsPage.jsx'))
const RoomProductsPage = lazy(() => import('../component/Pages/productListing/RoomProductsPage.jsx'))
const ComparePage = lazy(() => import('../component/Pages/ComparePage/index.jsx'))
const CategoriesPage = lazy(() => import('../component/Pages/CategoriesPage.jsx'))
const AboutUs = lazy(() => import('../component/Pages/AboutUs.jsx'))
const ContactUs = lazy(() => import('../component/Pages/ContactUs.jsx'))
const BlogList = lazy(() => import('../component/Pages/blog/blog.jsx').then((mod) => ({ default: mod.BlogList })))
const BlogDetail = lazy(() => import('../component/Pages/blog/blog.jsx').then((mod) => ({ default: mod.BlogDetail })))

// Auth & User Pages
const AccountSettings = lazy(() => import('../component/auth/AccountSettings.jsx'))
const ManageAddresses = lazy(() => import('../component/auth/ManageAddresses.jsx'))
const PanCardInfo = lazy(() => import('../component/pancard/PanCardInfo.jsx'))
const GiftCards = lazy(() => import('../component/giftcard/GiftCards.jsx'))
const MyCoupons = lazy(() => import('../component/giftcard/MyCoupons.jsx'))
const Wishlist = lazy(() => import('../component/WishlistDrawer/Wishlist.jsx'))
const MyOrders = lazy(() => import('../component/order/MyOrders.jsx'))
const OrderDetailsPage = lazy(() => import('../component/order/OrderDetailsPage.jsx'))
const AuthPage = lazy(() => import('../component/auth/AuthPage.jsx'))

// Admin Pages
const Dashboard = lazy(() => import('../component/Admin/pages/Dashboard.jsx'))
const Analytics = lazy(() => import('../component/Admin/pages/analytics.jsx'))
const AllProducts = lazy(() => import('../component/Admin/pages/AllProducts.jsx'))
const AddProduct = lazy(() => import('../component/Admin/pages/AddProduct.jsx'))
const EditProduct = lazy(() => import('../component/Admin/pages/EditProduct.jsx'))
const Categories = lazy(() => import('../component/Admin/pages/categories.jsx'))
const Inventory = lazy(() => import('../component/Admin/pages/inventory.jsx'))
const Orders = lazy(() => import('../component/Admin/pages/orders.jsx'))
const Payments = lazy(() => import('../component/Admin/pages/payments.jsx'))
const Refunds = lazy(() => import('../component/Admin/pages/refunds.jsx'))
const SeoOptimizer = lazy(() => import('../component/Admin/pages/ProductSeoEditor.jsx'))
const Coupons = lazy(() => import('../component/Admin/pages/coupons.jsx'))
const Newsletter = lazy(() => import('../component/Admin/pages/newsletter.jsx'))
const Users = lazy(() => import('../component/Admin/pages/users.jsx'))
const Reviews = lazy(() => import('../component/Admin/pages/reviews.jsx'))
const Settings = lazy(() => import('../component/Admin/pages/settings.jsx'))
const AiBlogger = lazy(() => import('../component/Admin/pages/ai-blogger.jsx'))
const SeoGlobal = lazy(() => import('../component/Admin/pages/seo-global.jsx'))
const Team = lazy(() => import('../component/Admin/pages/team.jsx'))
const FileManager = lazy(() => import('../component/Admin/component/filemanger/FileManager.jsx'))
const Appointments = lazy(() => import('../component/Admin/pages/appointment.jsx'))
const Shops = lazy(() => import('../component/Admin/pages/Shops.jsx'))
const Rooms = lazy(() => import('../component/Admin/pages/rooms.jsx'))
const BannerList = lazy(() => import('../component/Admin/pages/BannerList.jsx'))
const AddBanner = lazy(() => import('../component/Admin/pages/AddBanner.jsx'))
const EditBanner = lazy(() => import('../component/Admin/pages/EditBanner.jsx'))
const BehavioralAdsAdmin = lazy(() => import('../component/Admin/BehavioralAdsAdmin.jsx'))
const BehavioralAnalyticsDashboard = lazy(() => import('../component/Admin/BehavioralAnalyticsDashboard.jsx'))
const AnalyticsDashboard = lazy(() => import('../component/Admin/AnalyticsDashboard.jsx'))
const BehavioralInteractionLogs = lazy(() => import('../component/Admin/BehavioralInteractionLogs.jsx'))
const BlogsManagement = lazy(() => import('../component/Admin/pages/blogs.jsx'))
const EditBlog = lazy(() => import('../component/Admin/pages/EditBlog.jsx'))

// Checkout & Studio Pages
const CheckoutPage = lazy(() => import('../component/checkout/CheckoutPage.jsx'))
const PaymentPage = lazy(() => import('../component/payment/PaymentPage.jsx'))
const OrderSuccess = lazy(() => import('../component/Pages/OrderSuccess/OrderSuccess.jsx'))
const ARStudio = lazy(() => import('../component/Pages/ARStudio.jsx'))
const NotFound = lazy(() => import('../component/Pages/NotFound.jsx'))

function AppContent() {
  const location = useLocation()
  const [user, setUser] = useState(null)

  const safeParseJSON = (rawValue) => {
    if (typeof rawValue !== 'string' || !rawValue.trim() || rawValue === 'undefined' || rawValue === 'null') {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch (err) {
      console.warn('App.jsx: invalid JSON in localStorage userData', err, rawValue);
      return null;
    }
  };

  useEffect(() => {
    const savedUser = safeParseJSON(localStorage.getItem("userData"));
    if (savedUser) {
      setUser(savedUser);
    }

    const unsubscribe = auth ? onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    }) : null;
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', { credentials: 'include' });
    } finally {
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin')
  const hideHeaderRoutes = ['/order-success', '/login', '/signup', '/ar-studio']
  const shouldHideHeaderFooter = isAdminRoute || hideHeaderRoutes.some(route => location.pathname.startsWith(route))
  const isBlogRoute = location.pathname === '/blog' || location.pathname.startsWith('/blog/')

  const accountPaths = ['/account/profile', '/account/addresses', '/account/pan', '/orders', '/order-details', '/payments/giftcards', '/payments/upi', '/payments/cards', '/coupons', '/reviews', '/wishlist']
  const isAccountPage = accountPaths.some(path => location.pathname.startsWith(path))

  const PageWrapper = ({ title }) => (
    <div className="p-6 md:p-10 bg-white flex-1 shadow-sm rounded-[30px] min-h-[500px] border border-gray-100 flex flex-col justify-center items-center text-center">
      <h2 className="text-2xl font-black text-blue-900 mb-4 uppercase tracking-tighter">{title}</h2>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] max-w-xs leading-loose italic">Coming Soon: Premium {title} section for Aaramdehi comfort seekers.</p>
    </div>
  )

  return (
    <>
      {!shouldHideHeaderFooter && (
        <Header
          hideNav={isBlogRoute || location.pathname.startsWith('/checkout') || location.pathname.startsWith('/payment')}
        />
      )}
      {!shouldHideHeaderFooter && <WhatsAppFloatingButton />}
      {!shouldHideHeaderFooter && <AaramdehiAIChat />}
      {!shouldHideHeaderFooter && <VoiceNavigation />}
      {isBlogRoute && <BlogEmailPopup />}

      <main className={isAccountPage ? "bg-gray-100 min-h-screen pb-10" : ""}>
        <div className={isAccountPage ? "max-w-[1248px] mx-auto flex flex-col md:flex-row py-4 md:py-8 px-2 md:px-4 gap-0 md:gap-4" : ""}>
          {isAccountPage && (
            <div className="w-full md:w-80 flex-shrink-0 mb-4 md:mb-0">
              <Suspense fallback={<div className="p-4 text-xs text-gray-400">Loading...</div>}>
                <Sidebar user={user} handleLogout={handleLogout} isOpen={true} isStatic={true} />
              </Suspense>
            </div>
          )}

          <div className="flex-1 w-full overflow-hidden">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading page...</div>}>
              <Routes>
                {/* ADMIN ROUTES */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="analytics/dashboard" element={<AnalyticsDashboard />} />
                  <Route path="products" element={<AllProducts />} />
                  <Route path="add-product" element={<AddProduct />} />
                  <Route path="edit-product/:id" element={<EditProduct />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="refunds" element={<Refunds />} />
                  <Route path="seo-optimizer" element={<SeoOptimizer />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="newsletter" element={<Newsletter />} />
                  <Route path="users" element={<Users />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="ai-blogger" element={<AiBlogger />} />
                  <Route path="seo-global" element={<SeoGlobal />} />
                  <Route path="team" element={<Team />} />
                  <Route path="banner/add" element={<AddBanner />} />
                  <Route path="banner/edit/:id" element={<EditBanner />} />
                  <Route path="behavioral-ads" element={<BehavioralAdsAdmin />} />
                  <Route path="behavioral-analytics" element={<BehavioralAnalyticsDashboard />} />
                  <Route path="behavioral-logs" element={<BehavioralInteractionLogs />} />
                  <Route path="blogs" element={<BlogsManagement />} />
                  <Route path="edit-blog/:id" element={<EditBlog />} />
                  <Route path="interaction-logs" element={<BehavioralInteractionLogs />} />
                  <Route path="files" element={<FileManager />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="shops" element={<Shops />} />
                  <Route path="rooms" element={<Rooms />} />
                  <Route path="banners" element={<BannerList />} />
                  <Route path="edit-banner/:id" element={<EditBanner />} />
                </Route>

                {/* PUBLIC STANDARD ROUTES */}
                <Route path="/" element={<Home/>}/>
                <Route path="/product" element={<ProductListing/>}/>
                <Route path="/products" element={<ProductListing/>}/>
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/ar-studio" element={<ARStudio />} />
                <Route path="/shop-by-room/:slug" element={<RoomProductsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/login" element={<AuthPage />} /> 
                <Route path="/register" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/account/profile" element={<AccountSettings />} />
                <Route path="/account/addresses" element={<ManageAddresses />} />
                <Route path="/account/pan" element={<PanCardInfo />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/order-details/:id" element={<OrderDetailsPage />} />
                <Route path="/payments/giftcards" element={<GiftCards />} />
                <Route path="/payments/upi" element={<PageWrapper title="Saved UPI" />} />
                <Route path="/payments/cards" element={<PageWrapper title="Saved Cards" />} />
                <Route path="/coupons" element={<MyCoupons />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/reviews" element={<PageWrapper title="My Reviews & Ratings" />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />

                {/* DYNAMIC CLEAN PRODUCT SLUG ROUTE (e.g. /cotton-dori-cushion) */}
                <Route path="/:id" element={<ProductDetailsPage />} />

                {/* Keep this last so unknown URLs render the real not-found page. */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>

      {!shouldHideHeaderFooter && <Footer />}
    </>
  )
}

function App() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aaramdehi",
    "url": "https://www.aaramdehi.co.in",
    "logo": "https://www.aaramdehi.co.in/logo.png",
    "sameAs": [
      "https://www.instagram.com/aaramdehi",
      "https://www.facebook.com/aaramdehi"
    ]
  };

  return (
    <HelmetProvider>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  )
}

export default App