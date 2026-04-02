import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation के लिए
import { 
  FiHeart, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiArrowRight 
} from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import PopularProduct from '../../slider/PopularProducts'; 
import allproduct from '../ProductListing/index';

const ProductDetailsPage = () => {
  const navigate = useNavigate(); // Navigation function

  // 1. DATA
  const productData = {
    id: "main-pillow-001",
    brand: "Aaramdehi Premium",
    name: "Luxury Microfiber Soft Pillow (Pack of 2)",
    description: "Experience ultimate comfort with Aaramdehi's signature microfiber pillows. Designed for back, side, and stomach sleepers with pure organic materials.",
    images: [
      "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90",
      "https://rukminim2.flixcart.com/image/1086/1086/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70"
    ],
    sizes: [
      { label: 'Standard', dimensions: '17" x 27"', price: 949, oldPrice: 1599 },
      { label: 'King', dimensions: '20" x 36"', price: 1249, oldPrice: 1999 }
    ]
  };

  const relatedItems = [
    { id: 101, name: "Cotton Pillow Cover (Pair)", price: 299, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow-covers/original-imahfzhgzff9ay8h.jpeg" },
    { id: 102, name: "Fragrant Mogra Spray", price: 150, image: "https://rukminim2.flixcart.com/image/612/612/k7f26kw0/air-freshner.jpeg" }
  ];

  // 2. STATES
  const [selectedImage, setSelectedImage] = useState(productData.images[0]);
  const [selectedSize, setSelectedSize] = useState(productData.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState([productData.id, 101, 102]);
  const [wishlist, setWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([
    { id: 1, user: "Mukul Bhardwaj", rating: 5, date: "24 March 2026", comment: "Quality is top-notch! The standard size fits perfectly.", helpful: 12 }
  ]);
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });

  // 3. HANDLERS
  const bundleTotal = useMemo(() => {
    let total = selectedSize.price;
    relatedItems.forEach(item => {
      if (selectedBundle.includes(item.id)) total += item.price;
    });
    return total;
  }, [selectedBundle, selectedSize]);

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

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- CONTENT CONTAINER --- */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-6 md:py-10">
        
        {/* PRODUCT TOP SECTION (Gallery + Info) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="lg:w-1/2 flex flex-col md:flex-row gap-4">
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto pb-2 shrink-0">
              {productData.images.map((img, i) => (
                <img 
                  key={i} src={img} onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 md:w-20 md:h-24 border-2 rounded-xl cursor-pointer object-cover ${selectedImage === img ? 'border-blue-900 scale-105' : 'border-gray-100'}`} 
                />
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 bg-gray-50 rounded-[20px] md:rounded-[30px] h-[350px] md:h-[550px] flex items-center justify-center relative border border-gray-100">
              <img src={selectedImage} className="max-h-[85%] object-contain mix-blend-multiply" alt="product" />
              <button onClick={() => setWishlist(!wishlist)} className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg">
                <FiHeart className={wishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-5">
            <div>
              <p className="text-blue-900 font-black text-[10px] uppercase tracking-[3px] mb-1">{productData.brand}</p>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{productData.name}</h1>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl w-fit flex items-center gap-4">
              <span className="text-3xl font-black text-blue-900">₹{selectedSize.price}</span>
              <span className="text-gray-400 line-through text-sm font-bold italic">₹{selectedSize.oldPrice}</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed italic border-t pt-4">{productData.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-b pb-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Size</p>
                <div className="flex gap-2">
                  {productData.sizes.map((s) => (
                    <button key={s.label} onClick={() => setSelectedSize(s)} 
                      className={`flex-1 py-3 rounded-xl text-[11px] font-black border-2 ${selectedSize.label === s.label ? 'bg-blue-900 text-white border-blue-900 shadow-lg' : 'bg-white text-gray-600 border-gray-100'}`}>
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
              <button className="flex-1 bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95 transition-all">
                 <FiShoppingCart size={18}/> Add to Cart
              </button>
              <button className="flex-1 bg-blue-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
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
               <img src={productData.images[0]} className="w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl border-2 border-blue-900 p-1" />
               <FiPlus className="text-gray-300" />
               {relatedItems.map(item => (
                 <React.Fragment key={item.id}>
                    <img src={item.image} onClick={() => toggleBundleItem(item.id)}
                      className={`w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all ${selectedBundle.includes(item.id) ? 'opacity-100 ring-2 ring-blue-900' : 'opacity-30'}`} />
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

      </div> {/* Container End */}

      {/* --- FULL WIDTH TRENDING SECTION --- */}
      <div className="mt-24 bg-[#f8f9fb] py-20 w-full overflow-hidden border-t">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 mb-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">You Might<br/> Also Love</h2>
               <p className="text-blue-900 font-bold text-xs tracking-[4px] mt-4 uppercase">Handpicked for You</p>
             </div>
             {/* --- WORKING VIEW ALL BUTTON --- */}
             <button 
               onClick={() => navigate('/product')} // यहाँ '/product' लिखें जो आपके App.js का route है
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

    </div>
  );
};

export default ProductDetailsPage;