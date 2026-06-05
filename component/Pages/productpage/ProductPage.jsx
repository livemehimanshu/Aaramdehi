import React, { useState } from 'react';
import './ProductPage.css';

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
  onBuyNow
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
        <div className="main-image">
          <img src={currentActiveImg} alt={imageAlt || title} />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
