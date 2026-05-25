import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { 
  FiHeart, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiArrowRight, FiX 
} from 'react-icons/fi';
import { getAllProductsAPI, validateCouponAPI } from '../../../src/api/authAndAdminApi';
import { BsLightningCharge } from 'react-icons/bs';
import SEO from '../../header/SEO'; 
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import PopularProduct from '../../slider/PopularProducts'; 
import HomeBanner from '../../banneradds/HomeBanner';
import { addToRecentlyViewed } from '../../../src/data/recentlyViewedUtils';

// Temporary placeholders to prevent undefined errors during build
const productDetailsData = {}; 
const relatedItemsData = [];
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x750?text=No+Image";

const ProductDetailsPage = () => {
  const navigate = useNavigate(); 
  const { id } = useParams(); 

  // --- STATES ---
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(""); 
  const [selectedSize, setSelectedSize] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false); 
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });

  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '', code: '' });
  const [isValidating, setIsValidating] = useState(false);

  const relatedItems = relatedItemsData;

  // Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setQuantity(1);
        setShowReviewForm(false);

        if (productDetailsData[id]) {
          const data = productDetailsData[id];
          setProductData(data);
          setSelectedImage(data.images[0]?.url || data.images[0]);
          setSelectedSize(data.sizes[0]);
          setReviews(data.reviews || []);
        } else {
          const res = await getAllProductsAPI();
          const found = res.data?.find(p => String(p._id || p.id) === String(id));
          
          if (found) {
            const mappedData = {
              id: found._id,
              brand: found.brand || "Aaramdehi Luxe",
              name: found.name,
              description: found.description || "Premium quality product.",
              images: found.images?.length ? found.images : [found.thumbnail],
              sizes: found.sizes?.length 
                ? found.sizes.map(s => ({ ...s, oldPrice: s.oldPrice || null })) 
                : [{ 
                    label: 'Standard', 
                    price: found.sellingPrice || found.price, 
                    oldPrice: null 
                  }],
              rating: found.ratings?.average || 5,
              reviews: [],
              category: found.category || '', 
              tags: found.tags || []
            }; 
            setProductData(mappedData);
            setSelectedImage(mappedData.images[0]?.url || mappedData.images[0]);
            setSelectedSize(mappedData.sizes[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const isPresent = savedWishlist.some(item => String(item._id || item.id) === String(id));
    setWishlist(isPresent);

  }, [id]);

  useEffect(() => {
    if (productData) {
      addToRecentlyViewed({
        id: id,
        name: productData.name,
        brand: productData.brand,
        price: selectedSize?.price,
        image: selectedImage
      });
    }
  }, [productData, id, selectedSize, selectedImage]);

  const [selectedBundle, setSelectedBundle] = useState([101, 102]); 

  const bundleTotal = useMemo(() => {
    let total = selectedSize?.price || 0;
    relatedItems.forEach(item => {
      if (selectedBundle.includes(item.id)) total += item.price;
    });
    return total;
  }, [selectedBundle, selectedSize, relatedItems]);

  // Calculate Final Price after Coupon
  const finalPrice = useMemo(() => {
    const basePrice = selectedSize?.price || 0;
    if (appliedDiscount > 0) {
      return basePrice - (basePrice * appliedDiscount / 100);
    }
    return basePrice;
  }, [selectedSize, appliedDiscount]);

  // --- FUNCTIONALITY HANDLERS ---

  // Apply Coupon Function (Handles NaN fix & Object sync with backend)
  const handleApplyCoupon = async (codeFromModal) => {
    const codeToApply = codeFromModal || couponInput;
    if (!codeToApply) return setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
    
    try {
      setIsValidating(true);
      
      // Robust Price Parsing: Currency symbols aur commas ko handle karta hai
      const rawPrice = selectedSize?.price || productData?.sizes?.[0]?.price || 0;
      const amount = typeof rawPrice === 'string' 
        ? Number(rawPrice.replace(/[^0-9.-]+/g, "")) 
        : Number(rawPrice || 0);

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid product price detected.");
      }

      // Fix: Call API with object format like CheckoutPage
      const res = await validateCouponAPI({ code: codeToApply, orderAmount: amount });
      
      if (res.success) {
        setAppliedDiscount(res.data.discount);
        setCouponInput(codeToApply);
        setCouponMessage({ 
          type: 'success', 
          text: `Applied! You saved ₹${((amount * res.data.discount) / 100).toLocaleString()}`,
          code: codeToApply 
        });
        setIsCouponModalOpen(false); // Close modal on success
      } else {
        setAppliedDiscount(0);
        setCouponMessage({ type: 'error', text: res.message || 'Invalid Coupon Code', code: '' });
      }
    } catch (err) {
      setAppliedDiscount(0); // Reset discount on error
      setCouponMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Coupon validation failed. Please try again.', 
        code: '' 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setCouponInput("");
    setCouponMessage({ type: '', text: '', code: '' });
  };

  const handleToggleWishlist = () => {
    let wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    const productId = productData.id || id;
    const isPresent = wishlistItems.some(item => String(item._id || item.id) === String(productId));

    if (isPresent) {
      wishlistItems = wishlistItems.filter(item => String(item._id || item.id) !== String(productId));
      setWishlist(false);
    } else {
      wishlistItems.push({
        id: productId,
        name: productData.name,
        brand: productData.brand,
        price: finalPrice,
        image: selectedImage,
        rating: productData.rating
      });
      setWishlist(true);
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = productData.id || id;
    const isExist = cart.find(item => String(item._id || item.id) === String(productId));

    const productToAdd = {
      ...productData,
      id: productId,
      qty: quantity,
      price: finalPrice, 
      originalPrice: selectedSize?.price, 
      appliedCoupon: appliedDiscount > 0 ? couponInput : null,
      discountAmount: (selectedSize?.price || 0) - finalPrice,
      image: selectedImage,
      selectedSize: selectedSize?.label
    };

    if (isExist) {
      cart = cart.map(item => 
        String(item._id || item.id) === String(productId) ? { ...item, qty: item.qty + quantity } : item
      );
    } else {
      cart.push(productToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${productData.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const productKeywords = useMemo(() => {
    if (!productData) return '';
    const keywordsArray = [productData.name, productData.brand, productData.category, ...(productData.tags || [])];
    return keywordsArray.filter(Boolean).join(', ');
  }, [productData]);

  const toggleBundleItem = (id) => {
    if (id === productData.id) return;
    setSelectedBundle(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviews([{ ...newReview, id: Date.now(), date: "Today", helpful: 0 }, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ user: "", rating: 5, comment: "" });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-gray-400 animate-pulse">Loading Product Details...</div>;
  }

  if (!productData) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-700">Product not found.</p></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden relative">
      
      {productData && (
        <SEO
          title={productData.name}
          description={productData.description}
          keywords={productKeywords}
          ogImage={selectedImage}
          ogUrl={window.location.href}
        />
      )}

      {/* --- CONTENT CONTAINER --- */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-6 md:py-10">
        
        {/* PRODUCT TOP SECTION */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="lg:w-1/2 flex flex-col md:flex-row gap-4">
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto pb-2 shrink-0">
              {productData.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img.url || img} 
                  onClick={() => setSelectedImage(img.url || img)}
                  className={`w-16 h-20 md:w-20 md:h-24 border-2 rounded-xl cursor-pointer object-cover ${selectedImage === (img.url || img) ? 'border-blue-900 scale-105' : 'border-gray-100'}`} 
                  alt="thumbnail"
                />
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 bg-gray-50 rounded-[20px] md:rounded-[30px] h-[350px] md:h-[550px] flex items-center justify-center relative border border-gray-100">
              <img 
                src={selectedImage} 
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                className="max-h-[85%] object-contain mix-blend-multiply" 
                alt="product" />
              <button onClick={handleToggleWishlist} className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <FiHeart className={wishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-5">
            <div>
              <p className="text-blue-900 font-black text-[10px] uppercase tracking-[3px] mb-1">{productData.brand}</p>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{productData.name}</h1>
            </div>

            {/* Price Box with Robust Parsing Fix */}
            <div className="bg-blue-50/50 p-4 rounded-2xl w-fit flex items-center gap-4">
              <span className="text-3xl font-black text-blue-900">₹{finalPrice.toLocaleString()}</span>
              {appliedDiscount > 0 ? (
                <span className="text-gray-400 line-through text-sm font-bold italic">
                  ₹{Number(String(selectedSize?.price || 0).replace(/[^0-9.-]+/g, "")).toLocaleString()}
                </span>
              ) : (
                selectedSize?.oldPrice && (
                  <span className="text-gray-400 line-through text-sm font-bold italic">₹{selectedSize.oldPrice.toLocaleString()}</span>
                )
              )}
              {appliedDiscount > 0 && <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">Coupon Applied</span>}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed italic border-t pt-4">{productData.description}</p>

            {/* OFFERS & COUPONS PANEL */}
            <div className="pt-6 border-t mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Offers & Coupons</p>
                {appliedDiscount > 0 && (
                  <button onClick={handleRemoveCoupon} className="text-[10px] font-black text-rose-500 uppercase border-b-2 border-rose-500 pb-0.5">Remove</button>
                )}
              </div>
              
              {!appliedDiscount ? (
                <div 
                  onClick={() => setIsCouponModalOpen(true)}
                  className="group flex items-center justify-between p-4 border border-dashed border-red-200 rounded-2xl bg-red-50 cursor-pointer hover:bg-red-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                      <BsLightningCharge size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 uppercase">Best Offers & Coupons</p>
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">View available offers for you</p>
                    </div>
                  </div>
                  <FiArrowRight className="text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <FiCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase">'{couponMessage.code}' Applied</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">{couponMessage.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {couponMessage.type === 'error' && (
                <div className="mt-3 flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{couponMessage.text}</span>
                </div>
              )}
            </div>

            {/* Size & Qty Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-b pb-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Size</p>
                <div className="flex gap-2">
                  {productData.sizes.map((s) => (
                    <button key={s.label} onClick={() => setSelectedSize(s)} 
                      className={`flex-1 py-3 rounded-xl text-[11px] font-black border-2 ${selectedSize?.label === s.label ? 'bg-blue-900 text-white border-blue-900 shadow-lg' : 'bg-white text-gray-600 border-gray-100'}`}>
                      {s.label} <span className="block text-[8px] opacity-60">{s.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</p>
                <div className="flex items-center border-2 border-gray-100 rounded-xl h-[52px] bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="flex-1 h-full flex items-center justify-center border-r"><FiMinus/></button>
                  <span className="flex-1 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(quantity+1)} className="flex-1 h-full flex items-center justify-center border-l"><FiPlus/></button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95 transition-all">
                 <FiShoppingCart size={18}/> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 bg-blue-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                 <BsLightningCharge size={18}/> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* --- COMBO BUNDLE --- */}
        <div className="mt-20">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Frequently Bought Together</h2>
          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-8">
            <div className="flex items-center gap-4"> 
               <img src={productData.images[0]?.url || productData.images[0]} className="w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl border-2 border-blue-900 p-1" alt="primary product" />
               <FiPlus className="text-gray-300" />
               {relatedItems.map(item => (
                 <React.Fragment key={item.id}>
                    <img src={item.image} onClick={() => toggleBundleItem(item.id)}
                      className={`w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all ${selectedBundle.includes(item.id) ? 'opacity-100 ring-2 ring-blue-900' : 'opacity-30'}`} alt="bundle item" />
                    {item.id === 101 && <FiPlus className="text-gray-300" />}
                 </React.Fragment>
               ))}
            </div>
            <div className="w-full lg:pl-10 lg:border-l flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 tracking-widest mb-1 uppercase">Total Bundle</p>
                  <p className="text-4xl font-black text-blue-900">₹{bundleTotal.toLocaleString()}</p>
               </div>
               <button className="w-full md:w-auto bg-blue-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg active:scale-95">
                  Add Bundle to Cart
               </button>
            </div>
          </div>
        </div>

        {/* --- REVIEWS SECTION --- */}
        <div className="mt-20 border-t pt-16">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-6">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Happy Sleepers</h2>
              <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                <span className="text-5xl font-black text-blue-900">4.8</span>
                <div>
                   <div className="flex text-amber-400 text-lg"><AiFillStar/><AiFillStar/><AiFillStar/><AiFillStar/><AiFillStar/></div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{reviews.length} Verified Reviews</p>
                </div>
              </div>
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition-all">
                {showReviewForm ? "Cancel" : "Post a Review"}
              </button>
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="p-6 bg-white border-2 border-blue-50 rounded-3xl shadow-xl space-y-4">
                  <input type="text" placeholder="Your Name" required className="w-full p-3 bg-gray-50 rounded-xl" value={newReview.user} onChange={e => setNewReview({...newReview, user: e.target.value})} />
                  <textarea placeholder="Share your experience..." rows="3" required className="w-full p-3 bg-gray-50 rounded-xl" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}></textarea>
                  <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-[10px] uppercase">Post Review</button>
                </form>
              )}
            </div>
            <div className="lg:w-2/3 space-y-6">
              {reviews.map(rev => (
                <div key={rev.id} className="p-6 bg-gray-50/50 rounded-[25px] border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div><p className="font-black text-gray-900 uppercase">{rev.user}</p></div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase">{rev.date}</span>
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HomeBanner section="product" />
      </div>

      {/* --- FULL WIDTH TRENDING SECTION --- */}
      <div className="mt-24 bg-[#f8f9fb] py-20 w-full overflow-hidden border-t">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 mb-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">You Might<br/> Also Love</h2>
               <p className="text-blue-900 font-bold text-xs tracking-[4px] mt-4 uppercase">Handpicked for You</p>
             </div>
             <button onClick={() => navigate('/product')} className="group flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-4 transition-all">
               View All Products <FiArrowRight className="text-lg transition-transform" />
             </button>
           </div>
        </div>
        <div className="w-full"> 
          <PopularProduct />
        </div>
      </div>

      {/* --- COMPLETE DYNAMIC COUPON MODAL POPUP (FIXED) --- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-blue-900">
                <BsLightningCharge size={22} className="text-red-500" />
                <h3 className="text-lg font-black uppercase tracking-tight">Apply Coupon</h3>
              </div>
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Scrollable Content Container */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {/* MANUAL COUPON INPUT SECTION */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black outline-none focus:border-blue-900 transition-all"
                />
                <button 
                  onClick={() => handleApplyCoupon()}
                  disabled={isValidating || !couponInput}
                  className="bg-blue-900 text-white px-6 rounded-xl text-[10px] font-black uppercase hover:bg-black disabled:opacity-50 transition-all"
                >
                  {isValidating ? '...' : 'Apply'}
                </button>
              </div>

              {/* LIST OF AVAILABLE OFFERS */}
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Available Offers For You</p>
              
              {[
                { code: 'WELCOME50', desc: 'Get ₹50 flat discount on your first purchase.', discount: '₹50 OFF' },
                { code: 'LUXE10', desc: '10% discount on orders above ₹1000.', discount: '10% OFF' },
                { code: 'HIMANSHU', desc: 'Get custom active user discount offers.', discount: 'SPECIAL OFF' }
              ].map((offer) => (
                <div 
                  key={offer.code}
                  onClick={() => handleApplyCoupon(offer.code)} 
                  className="flex items-center justify-between p-4 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-900 hover:bg-blue-50/30 transition-all"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black tracking-wider text-gray-800">{offer.code}</span>
                    <p className="text-xs font-bold text-gray-600">{offer.desc}</p>
                  </div>
                  <span className="text-[10px] font-black text-blue-900 uppercase shrink-0 ml-4">{offer.discount}</span>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailsPage;