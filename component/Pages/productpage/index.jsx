import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../header/SEO'; // SEO Component Import Kiya
import JsonLdSchema from '../../../server/routes/JsonLdSchema.jsx';
import { getProductByIdAPI, validateCouponAPI } from '../../../src/api/authAndAdminApi';
import { useCart } from '../../../src/context/CartContext';
import { BsLightningCharge } from 'react-icons/bs';
import toast from 'react-hot-toast'; // ✅ Import toast
import { FiShoppingCart } from 'react-icons/fi';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const res = await getProductByIdAPI(id);
        const found = res.data;
        if (found) {
          setProduct(found);
          setSelectedImage(found.thumbnail || found.images?.[0]?.url || found.images?.[0] || '');
          setSelectedSize(found.sizes?.[0] || { label: 'Standard', price: found.sellingPrice || found.price });
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setFetchError(err.response?.status === 404 ? '' : 'Unable to load this product. Please try again.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return setCouponMessage({ type: 'error', text: 'Please enter a code' });
    try {
      const res = await validateCouponAPI({ code: couponInput, orderAmount: selectedSize?.price || product?.sellingPrice || 0 });
      if (res.success) {
        setAppliedDiscount(res.data.discount);
        setCouponMessage({ type: 'success', text: `Success! ${res.data.discount}% Discount Applied` });
      } else {
        setAppliedDiscount(0);
        setCouponMessage({ type: 'error', text: res.message || 'Invalid Coupon' });
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Validation failed' });
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setAppliedDiscount(0);
    setCouponMessage({ type: '', text: '' });
  };

  const handleCheckPincode = () => {
    const normalizedPincode = pincode.trim();
    setPincodeMessage(/^\d{6}$/.test(normalizedPincode)
      ? 'Pincode format is valid. Delivery availability will be confirmed at checkout.'
      : 'Enter a valid 6-digit pincode.');
  };

  const finalPrice = useMemo(() => {
    const basePrice = selectedSize?.price || product?.sellingPrice || 0;
    return appliedDiscount > 0 ? basePrice - (basePrice * appliedDiscount / 100) : basePrice;
  }, [selectedSize, product, appliedDiscount]);

  const handleAddToCart = () => {
    const productId = product._id || product.id || id;
    addToCart({
      ...product,
      id: productId,
      _id: productId,
      quantity: 1,
      price: finalPrice,
      sellingPrice: finalPrice,
      originalPrice: selectedSize?.price || product.sellingPrice || product.price || 0,
      selectedSize: selectedSize?.label || 'Standard',
      appliedCoupon: appliedDiscount > 0 ? couponInput : null,
      discountAmount: appliedDiscount,
      image: product.thumbnail || product.images?.[0]?.url || product.image || '',
    });
    setIsCartOpen(true);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-[5px] animate-pulse">Loading Product...</div>;
  if (fetchError) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p role="alert">{fetchError}</p><button onClick={() => window.location.reload()} className="border px-4 py-2 rounded font-bold">Retry</button></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const productTitle = product.name;
  const productDescription = (product.shortDescription || product.description || `Shop ${product.name} at Aaramdehi for premium quality, comfort, and timeless style.`).replace(/\s+/g, ' ').trim();
  const productKeywords = [product.category, product.brand, product.name, 'Aaramdehi', 'furniture', 'home decor']
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white">
      <SEO 
        title={productTitle}
        description={productDescription}
        keywords={productKeywords}
        ogImage={product.thumbnail || '/aaramdehi-logo.svg'}
        ogUrl={window.location.href}
      />
      <JsonLdSchema product={product} />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="sticky top-8">
            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border">
              <img src={selectedImage || product.thumbnail || product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnail Row */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images?.map((img, i) => (
                 <button type="button" key={i} onClick={() => setSelectedImage(img.url || img)} aria-label={`View product image ${i + 1}`} className="w-20 h-20 border rounded cursor-pointer hover:border-blue-500 shrink-0">
                   <img src={img.url || img} alt="" loading="lazy" className="w-full h-full object-cover" />
                 </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2">
          <nav className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-widest">Home &gt; {product.category}</nav>
          <h1 className="text-2xl font-semibold text-gray-800">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded flex items-center">
              {product.ratings?.average || 5} ★
            </span>
            <span className="text-gray-500 text-sm font-medium">Verified Purchase</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-900">₹{finalPrice.toLocaleString()}</span>
            {appliedDiscount > 0 && <span className="text-gray-500 line-through text-lg">₹{selectedSize?.price?.toLocaleString()}</span>}
          </div>

          {/* ✅ COUPON INPUT SECTION */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label htmlFor="product-coupon" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Apply Coupon</label>
            <div className="flex gap-2">
              <input 
                id="product-coupon" type="text" value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-blue-900 transition-all"
              />
              <button onClick={handleApplyCoupon} className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-gray-900 transition-all">Apply</button>
            </div>
            {couponMessage.text && (
              <p className={`text-[10px] font-bold mt-2 uppercase ${couponMessage.type === 'error' ? 'text-rose-500' : 'text-emerald-600'}`}>{couponMessage.text}</p>
            )}
          </div>

          {/* Variants */}
          <div className="mt-6">
            <p className="font-medium mb-2">Size</p>
            <div className="flex gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size.label}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-2 border rounded font-bold ${selectedSize?.label === size.label ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-300'}`}
                >
                  {size.label}
                </button>
              )) || (
                <button type="button" className="px-4 py-2 border border-blue-600 text-blue-600 bg-blue-50 rounded font-bold">Standard</button>
              )}
            </div>
          </div>

          {/* Delivery Check */}
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <label htmlFor="product-pincode" className="font-medium text-gray-700">Delivery Details</label>
            <div className="flex gap-2 mt-2">
              <input 
                id="product-pincode" type="text" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Pincode" 
                className="border p-2 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={handleCheckPincode} className="text-blue-600 font-bold px-4">Check</button>
            </div>
            {pincodeMessage && <p role="status" className="text-xs mt-2 text-gray-600">{pincodeMessage}</p>}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-4 rounded font-bold text-lg shadow-md hover:bg-orange-600 transition">
              <FiShoppingCart className="mr-2 inline" />
              ADD TO CART
            </button>
            <button onClick={handleBuyNow} className="flex-1 bg-yellow-400 text-gray-900 py-4 rounded font-bold text-lg shadow-md hover:bg-yellow-500 transition">
              <BsLightningCharge className="mr-2 inline" />
              BUY NOW
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;