import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Slider from "react-slick";
import { 
  FiShoppingCart, FiMapPin, FiChevronRight, 
  FiTag, FiInfo, FiHeart 
} from 'react-icons/fi';
import { 
  BsThunderboltFill, BsShieldCheck, BsCashStack, 
  BsArrowCounterclockwise 
} from 'react-icons/bs';
import { AiFillStar } from 'react-icons/ai';

// Slider CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [product, setProduct] = useState(null);

  // आपकी थीम के कलर्स: Primary: #1e3a8a (Deep Blue), Secondary: #f59e0b (Amber/Gold)
  
  const ALL_PRODUCTS = [
    { 
      id: 1, 
      name: "Aaramdehi Luxury White Microfiber Pillow (Set of 2)", 
      price: 5949, 
      oldPrice: 8999, 
      discount: "33% OFF",
      rating: 4.2, 
      reviews: "2,450", 
      images: [
        "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90",
        "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/g/h/7/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgbvngwzsz.jpeg?q=90"
      ],
      highlights: ["Ultra Soft Microfiber", "Hypoallergenic Material", "Breathable Fabric", "Machine Washable"]
    }
    // अन्य प्रोडक्ट्स...
  ];

  useEffect(() => {
    const found = ALL_PRODUCTS.find(p => p.id === Number(id)) || ALL_PRODUCTS[0];
    setProduct(found);
    setSelectedImage(found.images[0]);
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return null;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans">
      <div className="container mx-auto p-4 lg:px-20">
        
        {/* Breadcrumb */}
        <nav className="text-[12px] text-gray-500 flex items-center gap-1 mb-4">
          Home <FiChevronRight/> Bedroom <FiChevronRight/> <span className="text-blue-900 font-semibold">Pillows</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 bg-white p-6 rounded-lg shadow-sm">
          
          {/* 1. LEFT: Image Gallery */}
          <div className="lg:w-[45%]">
            <div className="sticky top-10">
              <div className="border border-gray-100 rounded-lg overflow-hidden relative group bg-white">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-[500px] object-contain transition-transform duration-700 group-hover:scale-110"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-sm hover:text-red-500 transition-colors">
                  <FiHeart className="text-xl" />
                </button>
              </div>

              {/* Action Buttons with Aaramdehi Gold & Blue */}
              <div className="flex gap-4 mt-6">
                <button className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-bold py-4 rounded-md uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100">
                   <FiShoppingCart className="text-xl" /> Add to Cart
                </button>
                <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-md uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-100">
                   <BsThunderboltFill className="text-xl" /> Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* 2. RIGHT: Product Content */}
          <div className="lg:w-[55%] space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                 <div className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 font-bold">
                   {product.rating} <AiFillStar />
                 </div>
                 <span className="text-sm text-gray-400 font-medium">{product.reviews} Ratings</span>
                 <span className="text-blue-900 text-xs font-bold px-2 py-1 bg-blue-50 rounded">Aaramdehi Certified</span>
              </div>
            </div>

            {/* Price Info */}
            <div className="py-4 border-y border-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                <span className="text-gray-400 line-through text-xl font-light">₹{product.oldPrice.toLocaleString()}</span>
                <span className="text-amber-600 font-bold text-lg bg-amber-50 px-2 py-1 rounded">{product.discount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Free delivery and inclusive of all taxes</p>
            </div>

            {/* Offers Section */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2 underline decoration-amber-400">
                <FiTag className="text-amber-500" /> Exclusive Offers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border border-dashed border-blue-200 rounded-md bg-blue-50/30">
                  <p className="text-xs font-bold text-blue-900 uppercase">First Order</p>
                  <p className="text-[11px] text-gray-600 mt-1">Use code <span className="font-bold">WELCOME10</span> for extra 10% off.</p>
                </div>
                <div className="p-3 border border-dashed border-amber-200 rounded-md bg-amber-50/30">
                  <p className="text-xs font-bold text-amber-900 uppercase">Bank Offer</p>
                  <p className="text-[11px] text-gray-600 mt-1">Flat ₹500 off on UPI transactions above ₹2000.</p>
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <FiMapPin className="text-blue-900" /> Check Availability
              </div>
              <div className="flex items-center border-b-2 border-gray-200 focus-within:border-blue-900 transition-colors pb-1 w-full max-w-xs">
                <input type="text" placeholder="Enter Pincode" className="bg-transparent outline-none text-sm font-semibold text-gray-900 w-full" />
                <button className="text-blue-900 font-bold text-sm px-4">Check</button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-between items-center py-6 bg-gray-50 rounded-xl px-4 border border-gray-100">
               <div className="flex flex-col items-center gap-1">
                  <BsArrowCounterclockwise className="text-xl text-blue-900" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">10 Days Return</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <BsCashStack className="text-xl text-blue-900" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">COD Available</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <BsShieldCheck className="text-xl text-blue-900" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Premium Quality</span>
               </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Why choose Aaramdehi?</p>
              <div className="grid grid-cols-2 gap-y-3">
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    {h}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;