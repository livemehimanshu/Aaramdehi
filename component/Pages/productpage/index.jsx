import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../header/SEO'; // SEO Component Import Kiya
import { getAllProductsAPI, validateCouponAPI } from '../../../src/api/authAndAdminApi';
import { BsLightningCharge } from 'react-icons/bs';
import toast from 'react-hot-toast'; // ✅ Import toast
import { FiShoppingCart } from 'react-icons/fi';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedThickness, setSelectedThickness] = useState('5 inch');

  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getAllProductsAPI();
        const found = res.data?.find(p => String(p._id || p.id) === String(id));
        if (found) {
          setProduct(found);
          setSelectedSize(found.sizes?.[0] || { label: 'Standard', price: found.sellingPrice || found.price });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return setCouponMessage({ type: 'error', text: 'Please enter a code' });
    try {
      const res = await validateCouponAPI(couponInput);
      if (res.success) {
        setAppliedDiscount(res.data.discount);
        setCouponMessage({ type: 'success', text: `Success! ${res.data.discount}% Discount Applied` });
      } else {
        setAppliedDiscount(0);
        setCouponMessage({ type: 'error', text: res.message || 'Invalid Coupon' });
      }
    } catch (err) {
      setCouponMessage({ type: 'error', text: 'Validation failed' });
    }
  };

  const finalPrice = useMemo(() => {
    const basePrice = selectedSize?.price || product?.sellingPrice || 0;
    return appliedDiscount > 0 ? basePrice - (basePrice * appliedDiscount / 100) : basePrice;
  }, [selectedSize, product, appliedDiscount]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-[5px] animate-pulse">Loading Product...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white">
      <SEO 
        title={product.name}
        description={product.description}
        keywords={product.tags?.join(', ')}
        ogImage={product.thumbnail}
        ogUrl={window.location.href}
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="sticky top-8">
            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border">
              <img src={product.thumbnail || (product.images?.[0]?.url)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnail Row */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images?.map((img, i) => (
                <div key={i} className="w-20 h-20 border rounded cursor-pointer hover:border-blue-500 shrink-0">
                   <img src={img.url || img} alt="thumb" className="w-full h-full object-cover" />
                </div>
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
            {appliedDiscount > 0 && <span className="text-gray-400 line-through text-lg">₹{selectedSize?.price?.toLocaleString()}</span>}
          </div>

          {/* ✅ COUPON INPUT SECTION */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Apply Coupon</p>
            <div className="flex gap-2">
              <input 
                type="text" value={couponInput}
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
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded font-bold ${selectedSize?.label === size.label ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-300'}`}
                >
                  {size.label}
                </button>
              )) || (
                <button className="px-4 py-2 border border-blue-600 text-blue-600 bg-blue-50 rounded font-bold">Standard</button>
              ))}
            </div>
          </div>

          {/* Delivery Check */}
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <p className="font-medium text-gray-700">Delivery Details</p>
            <div className="flex gap-2 mt-2">
              <input 
                type="text" 
                placeholder="Enter Pincode" 
                className="border p-2 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="text-blue-600 font-bold px-4">Check</button>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <button className="flex-1 bg-orange-500 text-white py-4 rounded font-bold text-lg shadow-md hover:bg-orange-600 transition">
              ADD TO CART
              ADD TO CART {/* ✅ Add to cart logic here */}
            </button>
            <button className="flex-1 bg-yellow-400 text-gray-900 py-4 rounded font-bold text-lg shadow-md hover:bg-yellow-500 transition">
              BUY NOW
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;