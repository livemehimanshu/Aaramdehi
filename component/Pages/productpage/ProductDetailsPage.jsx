import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { 
  FiHeart, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiArrowRight, FiX 
} from 'react-icons/fi';
import { getAllProductsAPI, validateCouponAPI } from '@/api/authAndAdminApi';
import { BsLightningCharge } from 'react-icons/bs';
import SEO from '../../header/SEO'; 
import { AiFillStar } from 'react-icons/ai';
import PopularProduct from '../../slider/PopularProducts'; 
import HomeBanner from '../../banneradds/HomeBanner';
import { addToRecentlyViewed } from '@/data/recentlyViewedUtils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/schemas/validationSchemas';
import { productDetailsData, relatedItemsData } from '@/data/productDetails';
import { useCart } from '@/hooks/useCart';
import { sanitizationUtils } from '@/utils/sanitizationUtils';
import toast from 'react-hot-toast'; // ✅ Import Toast

const PLACEHOLDER_IMAGE = "https://placehold.co/600x750?text=No+Image";

const ProductDetailsPage = () => {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const { addToCart: addToCartContext, addToWishlist, isInWishlist } = useCart(); 

  // --- STATES ---
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE); 
  const [selectedSize, setSelectedSize] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false); 
  
  // ✅ Setup React Hook Form for Reviews
  const { register, handleSubmit, formState: { errors: reviewErrors }, reset: resetReview } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '', userName: '' }
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '', code: '' });
  const [isValidating, setIsValidating] = useState(false);

  const relatedItems = relatedItemsData;

  const parsePrice = (rawPrice) => {
    if (rawPrice == null) return 0;
    const numeric = typeof rawPrice === 'number'
      ? rawPrice
      : Number(String(rawPrice).replace(/[^0-9.-]+/g, ""));
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  // useEffect: Product data fetch karna
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setQuantity(1);
        setShowReviewForm(false);

        if (productDetailsData[id]) {
          const data = productDetailsData[id];
          setProductData(data);
          setSelectedImage((data.images[0]?.url || data.images[0]) || PLACEHOLDER_IMAGE);
          setSelectedSize(data.sizes[0]);
          setReviews(data.reviews || []);
        } else {
          // Performance Fix: Saare products download karne ke bajaye single product fetch karein
          // Note: Backend mein getProductById endpoint hona chahiye
          const res = await getAllProductsAPI({ limit: 1000 }); 
          const found = res.data?.find(p => String(p._id || p.id) === String(id));
          
          if (found) {
            const mappedData = {
              id: found._id,
              brand: found.brand || "Aaramdehi Luxe",
              name: found.name,
              description: found.description || "Premium quality product.",
              images: found.images?.length ? found.images : [found.thumbnail],
              sizes: found.sizes?.length 
                ? found.sizes.map(s => ({ ...s, oldPrice: null })) 
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
            setSelectedImage((mappedData.images[0]?.url || mappedData.images[0]) || PLACEHOLDER_IMAGE);
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
    let total = parsePrice(selectedSize?.price);
    relatedItems.forEach(item => {
      if (selectedBundle.includes(item.id)) total += parsePrice(item.price);
    });
    return total;
  }, [selectedBundle, selectedSize, relatedItems]);

  // Calculate Final Price after Coupon
  const finalPrice = useMemo(() => {
    const basePrice = parsePrice(selectedSize?.price);
    return Math.max(0, basePrice - appliedDiscount);
  }, [selectedSize, appliedDiscount]);

  // --- FUNCTIONALITY HANDLERS ---

  const handleApplyCoupon = async (codeFromModal) => {
    const codeToApply = codeFromModal || couponInput;
    if (!codeToApply) return setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });

    // Check if user is logged in (Once per user logic depends on userId)
    // Dono keys check karein taaki kisi bhi login system se kaam kare
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setCouponMessage({ type: 'error', text: 'Please login to apply coupons', code: '' });
      setIsCouponModalOpen(false);
      return;
    }
    
    try {
      setIsValidating(true);
      const amount = parsePrice(selectedSize?.price);

      // Get userId from localStorage to pass it to validation
      // JSON parsing safe banayein agar data na ho
      const rawUserData = localStorage.getItem('userData');
      const userData = rawUserData ? JSON.parse(rawUserData) : null;
      
      const userId = userData?._id || userData?.id;

      const res = await validateCouponAPI({ 
        code: codeToApply, 
        orderAmount: amount,
        userId: userId // Ab backend ko pata chalega kaun user hai
      });
      
      if (res.success) {
        setAppliedDiscount(res.data.discount);
        setCouponInput(codeToApply);
        setCouponMessage({ 
          type: 'success', 
          text: `Applied! You saved ₹${res.data.discount.toLocaleString()}`,
          code: codeToApply 
        });
        setIsCouponModalOpen(false); 
      } else {
        setAppliedDiscount(0);
        setCouponMessage({ type: 'error', text: res.message || 'Invalid Coupon Code', code: '' });
      }
    } catch (err) {
      setAppliedDiscount(0);
      // Backend se aane wale exact error message ko dikhane ke liye
      const errorMessage = err.response?.data?.message || err.message || 'Validation failed';
      setCouponMessage({ type: 'error', text: errorMessage, code: '' });
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
    const productId = productData.id || id;
    
    addToWishlist({
      id: productId,
      name: productData.name,
      brand: productData.brand,
      price: finalPrice,
      image: selectedImage,
      rating: productData.rating || 5
    });
  };

  const handleAddToCart = () => {
    const productId = productData.id || id;

    const productToAdd = {
      ...productData,
      id: productId,
      qty: quantity,
      price: finalPrice, 
      originalPrice: parsePrice(selectedSize?.price),
      appliedCoupon: appliedDiscount > 0 ? couponInput : null,
      discountAmount: appliedDiscount, // Assuming appliedDiscount is the amount saved, not percentage
      image: selectedImage,
      selectedSize: selectedSize?.label
    };

    addToCartContext(productToAdd, quantity);
    toast.success(`${sanitizationUtils.sanitizeText(productData.name)} added to cart!`); // ✅ Beautiful Toast
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

  const onReviewSubmit = (data) => {
    const newEntry = { user: data.userName, comment: data.comment, rating: data.rating, id: Date.now(), date: "Today" };
    setReviews([newEntry, ...reviews]);
    setShowReviewForm(false);
    resetReview();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-gray-400 animate-pulse">Loading Product Details...</div>;
  }

  if (!productData) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-700">Product not found.</p></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden relative">
      
      {/* SEO Component */}
      {productData && (
        <SEO
          title={productData.name}
          description={productData.description}
          keywords={productKeywords}
          ogImage={selectedImage || PLACEHOLDER_IMAGE}
          ogUrl={window.location.href}
        />
      )}

      {/* --- CONTENT CONTAINER --- */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-6 md:py-10">
        
        {/* PRODUCT TOP SECTION (Gallery + Info) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="lg:w-1/2 flex flex-col md:flex-row gap-4">
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto pb-2 shrink-0">
              {productData.images.map((img, i) => (
                <img 
                  key={i} 
                  src={(img?.url || img) || PLACEHOLDER_IMAGE} 
                  onClick={() => setSelectedImage((img?.url || img) || PLACEHOLDER_IMAGE)}
                  className={`w-16 h-20 md:w-20 md:h-24 border-2 rounded-xl cursor-pointer object-cover ${selectedImage === (img?.url || img) ? 'border-blue-900 scale-105' : 'border-gray-100'}`} 
                  alt="thumbnail"
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                />
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 bg-gray-50 rounded-[20px] md:rounded-[30px] h-[350px] md:h-[550px] flex items-center justify-center relative border border-gray-100">
              <img 
                src={selectedImage || PLACEHOLDER_IMAGE}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                className="max-h-[85%] object-contain mix-blend-multiply" 
                alt="product" />
              <button onClick={handleToggleWishlist} className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <FiHeart className={isInWishlist(productData?.id || id) ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-5">
            <div>
              <p className="text-blue-900 font-black text-[10px] uppercase tracking-[3px] mb-1">{productData.brand}</p>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{productData.name}</h1>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl w-fit flex items-center gap-4">
              <span className="text-3xl font-black text-blue-900">₹{Number(finalPrice || 0).toLocaleString()}</span>
              {appliedDiscount > 0 && selectedSize?.price ? (
                <span className="text-gray-400 line-through text-sm font-bold italic">
                  ₹{Number(String(selectedSize?.price || 0).replace(/[^0-9.-]+/g, "")).toLocaleString()}
                </span>
              ) : (
                selectedSize?.oldPrice && (
                  <span className="text-gray-400 line-through text-sm font-bold italic">₹{(selectedSize.oldPrice || 0).toLocaleString()}</span>
                )
              )}
              {appliedDiscount > 0 && <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">Coupon Applied</span>}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed italic border-t pt-4">{productData.description}</p>

            {/* PROFESSIONAL COUPON SECTION */}
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
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                 <FiShoppingCart size={18}/> Add to Cart {/* Removed duplicate text */}
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-blue-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
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
               <img src={productData.images[0]?.url || productData.images[0] || PLACEHOLDER_IMAGE} className="w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl border-2 border-blue-900 p-1" alt="primary product" />
               <FiPlus className="text-gray-300" />
               {relatedItems.map(item => (
                 <React.Fragment key={item.id}>
                    <img src={item.image || PLACEHOLDER_IMAGE} onClick={() => toggleBundleItem(item.id)}
                      className={`w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all ${selectedBundle.includes(item.id) ? 'opacity-100 ring-2 ring-blue-900' : 'opacity-30'}`} alt="bundle item" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }} />
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
                <form onSubmit={handleSubmit(onReviewSubmit)} className="p-6 bg-white border-2 border-blue-50 rounded-3xl shadow-xl space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      {...register('userName')}
                      className={`w-full p-3 bg-gray-50 rounded-xl outline-none border ${reviewErrors.userName ? 'border-red-500' : 'border-transparent'}`} 
                    />
                    {reviewErrors.userName && <p className="text-red-500 text-[10px] mt-1">{reviewErrors.userName.message}</p>}
                  </div>
                  <div>
                    <textarea 
                      placeholder="Share your experience..." 
                      rows="3" 
                      {...register('comment')}
                      className={`w-full p-3 bg-gray-50 rounded-xl outline-none border ${reviewErrors.comment ? 'border-red-500' : 'border-transparent'}`}
                    ></textarea>
                    {reviewErrors.comment && <p className="text-red-500 text-[10px] mt-1">{reviewErrors.comment.message}</p>}
                  </div>
                  <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform">Post Review</button>
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

        {/* PRODUCT Page Banner - Bottom Placement */}
        <HomeBanner section="product" />

      </div> {/* Container End */}

      {/* --- FULL WIDTH TRENDING SECTION --- */}
      <div className="mt-24 bg-[#f8f9fb] py-20 w-full overflow-hidden border-t">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 mb-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">You Might<br/> Also Love</h2>
               <p className="text-blue-900 font-bold text-xs tracking-[4px] mt-4 uppercase">Handpicked for You</p>
             </div>
             <button 
               onClick={() => navigate('/product')} 
               className="group flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-4 transition-all"
             >
               View All Products <FiArrowRight className="text-lg transition-transform" />
             </button>
           </div>
        </div>
        
        <div className="w-full"> 
          <PopularProduct />
        </div>
      </div>

      {/* --- DYNAMIC COUPON MODAL POPUP COMPONENT --- */}
      {isCouponModalOpen && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsCouponModalOpen(false)} // Bahar click karne par band hoga
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Modal ke andar click karne par band nahi hoga
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
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

            {/* Modal Content */}
            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  autoFocus // Modal khulte hi cursor yahan aa jayega
                  placeholder="Enter Coupon Code (e.g. WELCOME10)" 
                  value={couponInput} // Input field ki current value
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <button 
                  onClick={() => handleApplyCoupon()}
                  disabled={isValidating}
                  className="px-6 bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:bg-gray-300 transition-colors"
                >
                  {isValidating ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {/* Error Message inside Modal */}
              {couponMessage.type === 'error' && (
                <div className="mt-2 flex items-center gap-2 text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span className="text-[10px] font-black uppercase tracking-tight">{couponMessage.text}</span>
                </div>
              )}

              {/* Quick Available Offers / Examples */}
              <div className="pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Offers For You</p>
                <div className="space-y-2">
                  <div 
                    onClick={() => handleApplyCoupon("SAVE10")} 
                    className="flex items-center justify-between p-3 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-900 hover:bg-blue-50/30 transition-all"
                  >
                    <div>
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black tracking-wider text-gray-800">SAVE10</span>
                      <p className="text-xs font-bold text-gray-600 mt-1">Get 10% instant discount on your order.</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-900 uppercase">Tap to Apply</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailsPage;