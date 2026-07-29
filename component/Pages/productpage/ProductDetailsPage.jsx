import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { 
  FiHeart, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiArrowRight, FiX 
} from 'react-icons/fi';
import { getAllProductsAPI, getProductByIdAPI, validateCouponAPI, createProductReviewAPI, deleteProductReviewAPI } from '@/api/authAndAdminApi';
import { BsLightningCharge } from 'react-icons/bs';
import SEO from '../../header/SEO'; 
import { AiFillStar } from 'react-icons/ai';
import PopularProduct from '../../slider/PopularProducts'; 
import HomeBanner from '../../banneradds/HomeBanner';
import { addToRecentlyViewed } from '@/data/recentlyViewedUtils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/schemas/validationSchemas';
import { productDetailsData } from '@/data/productDetails';
import { useCart } from '@/hooks/useCart';
import { sanitizationUtils } from '@/utils/sanitizationUtils';
import useBehaviorTracking from '@/hooks/useBehaviorTracking';
import toast from 'react-hot-toast'; // ✅ Import Toast
import ProductPage from './ProductPage';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';

const PLACEHOLDER_IMAGE = "https://placehold.co/600x750?text=No+Image";

const parseVariantData = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeProductPayload = (found) => {
  const source = found?.data || found || {};
  const parsedColors = parseVariantData(source.colors || found?.colors);
  const parsedSizes = parseVariantData(source.sizes || found?.sizes);

  const normalizedColors = parsedColors.length
    ? parsedColors.map((color) => {
        if (typeof color === 'string') {
          return { name: color, images: [] };
        }
        return {
          ...color,
          name: color?.name || color?.label || color?.color || 'Variant',
          images: Array.isArray(color?.images) ? color.images : []
        };
      })
    : [];

  const normalizedSizes = parsedSizes.length
    ? parsedSizes.map((size) => {
        if (typeof size === 'string') {
          return { label: size, name: size, price: source.sellingPrice || source.price || 0, oldPrice: null };
        }
        return {
          ...size,
          label: size?.label || size?.name || size?.value || 'Standard',
          name: size?.name || size?.label || size?.value || 'Standard',
          price: size && (size.price !== undefined ? size.price : (size.amount !== undefined ? size.amount : (size.cost !== undefined ? size.cost : (source.sellingPrice || source.price || 0)))),
          oldPrice: size && (size.oldPrice !== undefined ? size.oldPrice : (size.mrp !== undefined ? size.mrp : null))
        };
      })
    : [{ label: 'Standard', name: 'Standard', price: source.sellingPrice || source.price || 0, oldPrice: null }];

  const normalizedImages = Array.isArray(source.images)
    ? source.images
    : (source.thumbnail ? [source.thumbnail] : []);

  return {
    id: source._id || source.id,
    brand: source.brand || 'Aaramdehi Luxe',
    name: source.name || source.title || 'Unnamed Product',
    description: source.description || 'Premium quality product.',
    images: normalizedImages,
    model3dUrl: source.model3dUrl || source.modelUrl || '',
    colors: normalizedColors,
    sizes: normalizedSizes,
    price: source.sellingPrice || source.price || 0,
    sellingPrice: source.sellingPrice || source.price || 0,
    mrp: source.mrp || source.originalPrice || source.price || 0,
    rating: source.ratings?.average || 5,
    reviews: [],
    category: source.category || '',
    tags: source.tags || []
  };
};

const ProductDetailsPage = () => {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const { addToCart: addToCartContext, addToWishlist, isInWishlist } = useCart(); 
  
  // ✅ Initialize behavioral tracking
  const userId = localStorage.getItem('userId');
  const { trackInteraction, sessionId } = useBehaviorTracking(id, userId);

  // --- STATES ---
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE); 
  const [selectedSize, setSelectedSize] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false); 
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // ✅ Setup React Hook Form for Reviews
  const { register, handleSubmit, setValue, watch, formState: { errors: reviewErrors }, reset: resetReview } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '', userName: '' }
  });

  const ratingValue = watch('rating');
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '', code: '' });
  const [isValidating, setIsValidating] = useState(false);
  
  // Delivery Logic
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");

  const handleCheckDelivery = () => {
    if (pincode.length < 6) return setDeliveryStatus("❌ Invalid Pincode");
    // Mock delivery logic: usually you'd call an API here
    const isAvailable = pincode.startsWith('11') || pincode.startsWith('24') || pincode.startsWith('40'); 
    setDeliveryStatus(isAvailable ? "✅ Standard Delivery Available" : "⏳ Shipping takes 5-7 working days");
  };

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
          try {
            const res = await getProductByIdAPI(id);
            const found = res?.success ? (res.data || null) : null;

            if (found) {
              const parsedColors = parseVariantData(found.colors);
              const parsedSizes = parseVariantData(found.sizes);
              const normalizedColors = parsedColors.length
                ? parsedColors.map((color) => {
                    if (typeof color === 'string') {
                      return { name: color, images: [] };
                    }
                    return {
                      ...color,
                      name: color?.name || color?.label || color?.color || 'Variant',
                      images: Array.isArray(color?.images) ? color.images : []
                    };
                  })
                : [];
              const normalizedSizes = parsedSizes.length
                ? parsedSizes.map((size) => {
                    if (typeof size === 'string') {
                      return { label: size, name: size, price: found.sellingPrice || found.price, oldPrice: null };
                    }
                    return {
                      ...size,
                      label: size?.label || size?.name || size?.value || 'Standard',
                      name: size?.name || size?.label || size?.value || 'Standard',
                      price: size && (size.price !== undefined ? size.price : (size.amount !== undefined ? size.amount : (size.cost !== undefined ? size.cost : (found.sellingPrice || found.price)))),
                      oldPrice: size && (size.oldPrice !== undefined ? size.oldPrice : (size.mrp !== undefined ? size.mrp : null))
                    };
                  })
                : [{ label: 'Standard', name: 'Standard', price: found.sellingPrice || found.price, oldPrice: null }];
              const normalizedImages = Array.isArray(found.images)
                ? found.images
                : (found.thumbnail ? [found.thumbnail] : []);

              const mappedData = {
                id: found._id || found.id,
                brand: found.brand || "Aaramdehi Luxe",
                name: found.name || found.title || 'Unnamed Product',
                description: found.description || "Premium quality product.",
                images: normalizedImages,
                model3dUrl: found.model3dUrl || found.modelUrl || '',
                colors: normalizedColors,
                sizes: normalizedSizes,
                price: found.sellingPrice || found.price,
                sellingPrice: found.sellingPrice || found.price,
                mrp: found.mrp || found.originalPrice || found.price,
                rating: found.ratings?.average || found.rating || 5,
                reviews: Array.isArray(found.reviews) ? found.reviews : [],
                category: found.category || '',
                tags: found.tags || []
              };
              setProductData(mappedData);
              setSelectedImage((mappedData.images[0]?.url || mappedData.images[0]) || PLACEHOLDER_IMAGE);
              setSelectedSize(mappedData.sizes[0]);
              setReviews(mappedData.reviews);
            }
          } catch (err) {
            console.error('Fallback product fetch failed:', err);
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

  useEffect(() => {
    try {
      const rawUserData = localStorage.getItem('userData');
      const parsedUser = rawUserData ? JSON.parse(rawUserData) : null;
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase?.();
      const isAdmin = parsedUser?.role?.toUpperCase?.() === 'ADMIN' ||
        (parsedUser?.email && adminEmail && parsedUser.email.toLowerCase() === adminEmail);
      setIsAdminUser(Boolean(isAdmin));
    } catch {
      setIsAdminUser(false);
    }
  }, []);

  // Calculate Final Price after Coupon
  const finalPrice = useMemo(() => {
    const basePrice = selectedSize?.price != null
      ? parsePrice(selectedSize.price)
      : parsePrice(productData?.sellingPrice ?? productData?.price ?? 0);
    return Math.max(0, basePrice - appliedDiscount);
  }, [selectedSize, appliedDiscount, productData]);

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
      let userData = null;
      try {
        userData = rawUserData ? JSON.parse(rawUserData) : null;
      } catch (err) {
        console.warn('Invalid userData in localStorage:', err);
        userData = null;
      }
      
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: productData.name,
        text: `Check out ${productData.name} on Aaramdehi!`,
        url: url,
      }).catch(err => console.error('Error sharing', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToCart = (payload) => {
    const productId = productData.id || id;
    const normalizedPayload = payload || {};
    const selectedSizeValue = normalizedPayload.size || selectedSize;
    const selectedColorValue = normalizedPayload.color || productData.colors?.[0] || null;

    const productToAdd = {
      ...productData,
      ...normalizedPayload,
      id: productId,
      qty: quantity,
      quantity,
      price: finalPrice,
      originalPrice: parsePrice(selectedSizeValue?.price ?? selectedSize?.price),
      appliedCoupon: appliedDiscount > 0 ? couponInput : null,
      discountAmount: appliedDiscount,
      image: normalizedPayload.image || selectedImage,
      selectedSize: selectedSizeValue?.label || selectedSizeValue?.name || selectedSizeValue || selectedSize?.label || selectedSize?.name || selectedSize,
      color: selectedColorValue,
    };

    addToCartContext(productToAdd, quantity);
    toast.success(`${sanitizationUtils.sanitizeText(productData.name)} added to cart!`);
  };

  const handleBuyNow = (payload) => {
    handleAddToCart(payload);
    navigate('/checkout');
  };

  const handleOpenARStudio = () => {
    if (!productData) return;
    const productId = productData.id || productData._id || id;
    navigate(`/ar-studio?productId=${encodeURIComponent(productId)}`);
  };

  const productKeywords = useMemo(() => {
    if (!productData) return '';
    const keywordsArray = [productData.name, productData.brand, productData.category, ...(productData.tags || [])];
    return keywordsArray.filter(Boolean).join(', ');
  }, [productData]);

  const highlightItems = useMemo(() => {
    if (!productData?.description) {
      return [
        'Crafted for long-lasting comfort and support.',
        'Breathable materials keep you cool all night.',
        'Hypoallergenic design for sensitive skin.',
        'Lightweight and easy to maintain.'
      ];
    }

    const sentences = productData.description
      .split(/\.\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .map((sentence) => sentence.replace(/\.$/, ''));

    return sentences.length ? sentences : [
      'Crafted for long-lasting comfort and support.',
      'Breathable materials keep you cool all night.',
      'Hypoallergenic design for sensitive skin.',
      'Lightweight and easy to maintain.'
    ];
  }, [productData?.description]);

  const onReviewSubmit = async (data) => {
    if (!productData?.id) return;
    setReviewSubmitting(true);

    try {
      const res = await createProductReviewAPI(productData.id, data);
      const savedReview = res?.data;

      const newEntry = {
        id: savedReview?.id || savedReview?.userId || Date.now(),
        user: savedReview?.name || data.userName,
        name: savedReview?.name || data.userName,
        comment: savedReview?.comment || data.comment,
        rating: savedReview?.rating || data.rating,
        createdAt: savedReview?.createdAt || new Date().toISOString(),
        date: savedReview?.createdAt ? new Date(savedReview.createdAt).toLocaleDateString() : 'Today'
      };

      const updatedReviews = [newEntry, ...reviews];
      setReviews(updatedReviews);
      setProductData((prev) => prev ? {
        ...prev,
        rating: parseFloat((updatedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / updatedReviews.length).toFixed(1))
      } : prev);

      resetReview({ rating: 5, comment: '', userName: '' });
      setShowReviewForm(false);
      toast.success('Review posted successfully');
    } catch (err) {
      console.error('Review submission failed:', err);
      toast.error(err.response?.data?.message || 'Unable to post review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!productData?.id || !reviewId) return;

    try {
      const res = await deleteProductReviewAPI(productData.id, reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((rev) => String(rev.id) !== String(reviewId)));
        toast.success(res.message || 'Review deleted successfully');
      } else {
        toast.error(res.message || 'Unable to delete review');
      }
    } catch (err) {
      console.error('Delete review failed:', err);
      toast.error(err.response?.data?.message || 'Unable to delete review');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-gray-500 animate-pulse">Loading Product Details...</div>;
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
        <ProductPage
          product={productData}
          images={productData.images.map((img) => (img?.url || img) || PLACEHOLDER_IMAGE)}
          colors={productData.colors || []}
          sizes={productData.sizes || []}
          brand={productData.brand}
          title={productData.name}
          subtitle={productData.category || 'Premium Comfort Pillow'}
          price={Number(finalPrice || 0)}
          rating={productData.rating || 5}
          reviewsCount={reviews.length}
          highlights={highlightItems}
          quantity={quantity}
          onQuantityChange={setQuantity}
          activeImg={selectedImage}
          onActiveImgChange={setSelectedImage}
          imageAlt={productData.name}
          model3dUrl={productData.model3dUrl}
          trackInteraction={trackInteraction}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenARStudio={handleOpenARStudio}
          onShare={handleShare}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist(productData?.id || id)}
          sidebarPromo={
            <div className="space-y-3">
              {!appliedDiscount ? (
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  className="group w-full flex items-center justify-between p-4 border border-dashed border-red-200 rounded-2xl bg-red-50 hover:bg-red-100 transition-all"
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
                </button>
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
                <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{couponMessage.text}</span>
                </div>
              )}
            </div>
          }
        />

        {/* --- DYNAMIC FREQUENTLY BOUGHT TOGETHER --- */}
        <FrequentlyBoughtTogether 
            mainProduct={productData} 
            mainProductPrice={finalPrice} 
        />

        {/* --- REVIEWS SECTION --- */}
        <div className="mt-20 border-t pt-16">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-6">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Happy Sleepers</h2>
              <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                <span className="text-5xl font-black text-blue-900">4.8</span>
                <div>
                   <div className="flex text-amber-400 text-lg"><AiFillStar/><AiFillStar/><AiFillStar/><AiFillStar/><AiFillStar/></div>
                   <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">{reviews.length} Verified Reviews</p>
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Rating</label>
                    <select
                      {...register('rating', { valueAsNumber: true })}
                      className={`w-full p-3 bg-gray-50 rounded-xl outline-none border ${reviewErrors.rating ? 'border-red-500' : 'border-transparent'}`}
                      value={ratingValue}
                      onChange={(e) => setValue('rating', Number(e.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    {reviewErrors.rating && <p className="text-red-500 text-[10px] mt-1">{reviewErrors.rating.message}</p>}
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
                  <button type="submit" disabled={reviewSubmitting} className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform disabled:opacity-50">
                    {reviewSubmitting ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              )}
            </div>
            <div className="lg:w-2/3 space-y-6">
              {reviews.map(rev => (
                <div key={rev.id} className="p-6 bg-gray-50/50 rounded-[25px] border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div><p className="font-black text-gray-900 uppercase">{rev.user || rev.name || rev.userName || 'Customer'}</p></div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-300 uppercase">{rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : '')}</span>
                      {isAdminUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-rose-500 text-[10px] uppercase font-bold tracking-widest hover:text-rose-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
                className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
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
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Available Offers For You</p>
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