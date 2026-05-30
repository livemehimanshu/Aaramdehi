import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { auth } from '../src/api/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

// Layouts
import Header from '../component/header/index.jsx'
import Footer from '../component/Footer/Footer.jsx'
import AdminLayout from '../component/Admin/AdminLayout.jsx'
import Sidebar from '../component/sidebar/Sidebar.jsx'

// Public Pages
import Home from '../component/Pages/Home/index.jsx'
import ProductListing from '../component/Pages/productListing/index.jsx'
import ProductDetailsPage from '../component/Pages/productpage/ProductDetailsPage.jsx'
import ComparePage from '../component/Pages/ComparePage/index.jsx'
import { BlogList, BlogDetail } from '../component/Pages/blog/blog.jsx'

// Auth & User Pages
import AuthPage from '../component/Pages/Home/auth.jsx'
import AccountSettings from '../component/auth/AccountSettings.jsx'
import ManageAddresses from '../component/auth/ManageAddresses.jsx'
import PanCardInfo from '../component/pancard/PanCardInfo.jsx'
import GiftCards from '../component/giftcard/GiftCards.jsx'
import MyCoupons from '../component/giftcard/MyCoupons.jsx'
import Wishlist from '../component/WishlistDrawer/Wishlist.jsx'
import MyOrders from '../component/order/MyOrders.jsx'
import OrderDetailsPage from '../component/order/OrderDetailsPage.jsx'

// Admin Pages
import Dashboard from '../component/Admin/pages/Dashboard.jsx'
import Analytics from '../component/Admin/pages/analytics.jsx'
import AllProducts from '../component/Admin/pages/AllProducts.jsx'
import AddProduct from '../component/Admin/pages/add-product.jsx'
import EditProduct from '../component/Admin/pages/EditProduct.jsx'
import Categories from '../component/Admin/pages/categories.jsx'
import Inventory from '../component/Admin/pages/inventory.jsx'
import Orders from '../component/Admin/pages/orders.jsx'
import Payments from '../component/Admin/pages/payments.jsx'
import Refunds from '../component/Admin/pages/refunds.jsx'
import SeoOptimizer from '../component/Admin/pages/seo-optimizer.jsx'
import Coupons from '../component/Admin/pages/coupons.jsx'
import Newsletter from '../component/Admin/pages/newsletter.jsx'
import Users from '../component/Admin/pages/users.jsx'
import Reviews from '../component/Admin/pages/reviews.jsx'
import Settings from '../component/Admin/pages/settings.jsx'
import SeoGlobal from '../component/Admin/pages/seo-global.jsx'
import Team from '../component/Admin/pages/team.jsx'
import FileManager from '../component/Admin/component/filemanger/FileManager.jsx'
import Appointments from '../component/Admin/pages/appointment.jsx'
import Shops from '../component/Admin/pages/Shops.jsx'
// Checkout Pages
import CheckoutPage from '../component/checkout/CheckoutPage.jsx'
import PaymentPage from '../component/payment/PaymentPage.jsx'
import OrderSuccess from '../component/Pages/OrderSuccess/OrderSuccess.jsx'

function AppContent() {
  const location = useLocation()
  const [user, setUser] = useState(null)

  // Session Sync for Sidebar
  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    if (savedUser) setUser(JSON.parse(savedUser));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && !localStorage.getItem("accessToken")) {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isAdminRoute = location.pathname.startsWith('/admin')
  const hideHeaderRoutes = ['/order-success', '/login', '/signup']
  const shouldHideHeaderFooter = isAdminRoute || hideHeaderRoutes.some(route => location.pathname.startsWith(route))

  const accountPaths = ['/account/profile', '/account/addresses', '/account/pan', '/orders', '/order-details', '/payments/giftcards', '/payments/upi', '/payments/cards', '/coupons', '/reviews', '/wishlist']
  const isAccountPage = accountPaths.some(path => location.pathname.startsWith(path))

  const PageWrapper = ({ title }) => (
    <div className="md:ml-4 p-8 bg-white flex-1 shadow-sm rounded-sm min-h-[500px]">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-500 italic">Coming Soon: {title} section for Aaramdehi.</p>
    </div>
  )

  return (
    <>
      {!shouldHideHeaderFooter && <Header hideNav={location.pathname.startsWith('/checkout') || location.pathname.startsWith('/payment')} />}

      <main className={isAccountPage ? "bg-gray-100 min-h-screen pb-10" : ""}>
        <div className={isAccountPage ? "max-w-[1248px] mx-auto flex flex-col md:flex-row py-4 md:py-8 px-2 md:px-4 gap-0 md:gap-4" : ""}>
          {isAccountPage && (
            <div className="w-full md:w-80 flex-shrink-0 mb-4 md:mb-0">
              <Sidebar user={user} handleLogout={handleLogout} isOpen={true} isStatic={true} />
            </div>
          )}

          <div className="flex-1 w-full overflow-hidden">
            <Routes>
              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
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
                <Route path="seo-global" element={<SeoGlobal />} />
                <Route path="team" element={<Team />} />
                <Route path="files" element={<FileManager />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="shops" element={<Shops />} />
              </Route>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home/>}/>
              <Route path="/product" element={<ProductListing/>}/>
              <Route path="/products" element={<ProductListing/>}/>
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/login" element={<AuthPage />} />
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
            </Routes>
          </div>
        </div>
      </main>

      {!shouldHideHeaderFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  )
}

export default App
