import React, { useState } from 'react';
import './ProductPage.css';
import { FiShare2, FiHeart, FiMapPin, FiInfo } from 'react-icons/fi';

const ProductPage = ({
  images = [
    'pillow-thumb1.jpg',
    'pillow-thumb2.jpg',
    'pillow-thumb3.jpg',
    'pillow-thumb4.jpg'
  ],
  brand = 'AARAMDEHI',
  title = 'WELLGIVER Microfibre Sleeping Pillow Pack of 1',
  subtitle = 'Stripes Microfiber Pillows, 41x61 cm, Soft & Fluffy (Grey)',
  price = 170,
  rating = 4.8,
  reviewsCount = 120,
  highlights = [
    'Crafted with high-density microfibre that mimics the soft, cloud-like feel of down feathers.',
    'Dust-mite resistant and perfect for sensitive skin or allergies.',
    'Adaptable design contours naturally to your neck and shoulders for painless sleep.',
    'Double-layer protective inner casing ensures long-term durability and airflow.'
  ],
  promoCode = 'AARAMDEHI10',
  promoLabel = 'BEST OFFER:',
  quantity,
  onQuantityChange,
  activeImg,
  onActiveImgChange,
  imageAlt,
  onAddToCart,
  onBuyNow,
  onOpenARStudio,
  onShare,
  onToggleWishlist,
  isInWishlist = false,
  model3dUrl,
  pincode,
  onPincodeChange,
  onCheckDelivery,
  deliveryStatus
}) => {
  const [internalQuantity, setInternalQuantity] = useState(1);
  const [internalActiveImg, setInternalActiveImg] = useState(images[0] || 'https://placehold.co/600x600?text=Product');

  const currentQuantity = typeof quantity === 'number' ? quantity : internalQuantity;
  const currentActiveImg = activeImg || internalActiveImg;

  const handleQuantityChange = (type) => {
    const nextQuantity = type === 'decrease' ? Math.max(1, currentQuantity - 1) : currentQuantity + 1;

    if (typeof onQuantityChange === 'function') {
      onQuantityChange(nextQuantity);
    } else {
      setInternalQuantity(nextQuantity);
    }
  };

  const handleImageSelect = (img) => {
    if (typeof onActiveImgChange === 'function') {
      onActiveImgChange(img);
    } else {
      setInternalActiveImg(img);
    }
  };

  const handleAddToCart = () => {
    if (typeof onAddToCart === 'function') {
      onAddToCart(currentQuantity);
    }
  };

  const handleBuyNow = () => {
    if (typeof onBuyNow === 'function') {
      onBuyNow(currentQuantity);
    }
  };

  return (
    <div className="product-container">
      <div className="product-gallery">
        <div className="thumbnails">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className={currentActiveImg === img ? 'active' : ''}
              onClick={() => handleImageSelect(img)}
            />
          ))}
        </div>
        <div className="main-image relative">
          <img src={currentActiveImg} alt={imageAlt || title} />
          {model3dUrl && (
            <div className="absolute left-4 top-4 rounded-full border border-amber-300/20 bg-black/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-amber-200 shadow-lg shadow-black/40">
              3D Available
            </div>
          )}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={onToggleWishlist} className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <FiHeart className={isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
            </button>
            <button onClick={onShare} className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform text-gray-500">
              <FiShare2 />
            </button>
          </div>
        </div>
      </div>

      <div className="product-details">
        <span className="brand-tag">{brand}</span>
        <h1 className="product-title">{title}</h1>
        <p className="product-subtitle">{subtitle}</p>

        <div className="rating-price-row">
          <div className="price">₹{price}</div>
          <div className="rating-badge">
            ★ {rating} <span className="review-count">({reviewsCount} Reviews)</span>
          </div>
        </div>

        <hr className="divider" />

        <div className="product-description">
          <h3>Product Highlights</h3>
          <ul>
            {highlights.map((highlight, index) => (
              <li key={index}>
                <strong>{index === 0 ? 'Premium Comfort:' : index === 1 ? 'Hypoallergenic & Safe:' : index === 2 ? 'Ergonomic Support:' : 'Breathable Inner Cover:'}</strong> {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery Check Section */}
        <div className="delivery-check-section py-4 border-y border-gray-50 my-4">
          <div className="flex items-center gap-2 mb-3">
            <FiMapPin className="text-blue-900" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Check Delivery Availability</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Pincode" 
              value={pincode}
              onChange={(e) => onPincodeChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-900 transition-all" 
            />
            <button onClick={onCheckDelivery} className="px-6 py-2.5 bg-[#1a365d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Check</button>
          </div>
          {deliveryStatus && <p className={`mt-2 text-[10px] font-bold uppercase ${deliveryStatus.includes('Available') ? 'text-emerald-600' : 'text-rose-500'}`}>{deliveryStatus}</p>}
        </div>

        <div className="promo-banner">
          🎁 <strong>{promoLabel}</strong> Get 10% OFF with code: <span className="code">{promoCode}</span>
        </div>

        <div className="purchase-actions">
          <div className="quantity-selector">
            <button type="button" className="qty-btn" onClick={() => handleQuantityChange('decrease')}>-</button>
            <input type="number" value={currentQuantity} readOnly aria-label="Quantity" />
            <button type="button" className="qty-btn" onClick={() => handleQuantityChange('increase')}>+</button>
          </div>

          <div className="cta-buttons">
            <button type="button" className="btn btn-secondary" onClick={handleAddToCart}>ADD TO CART</button>
            <button type="button" className="btn btn-primary" onClick={handleBuyNow}>BUY NOW</button>
            {model3dUrl && onOpenARStudio && (
              <button type="button" className="btn btn-outline bg-slate-950/80 border-amber-300/30 text-amber-200 hover:bg-slate-900 hover:border-amber-400" onClick={onOpenARStudio}>
                ✨ VIEW IN 360° AR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
