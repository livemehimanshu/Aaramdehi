import React from 'react';
import { FiTruck, FiRotateCcw, FiShield, FiGift, FiHeadphones } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterestP } from 'react-icons/fa';

const NewsletterFooter = () => {
  return (
    <div className="bg-[#1A365D] text-white border-t border-gray-100">
      
      {/* 1. Premium Service Badges Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 border-b border-white/10 pb-16">
          <ServiceItem icon={<FiTruck />} title="Free Shipping" desc="For all Orders Over $100" />
          <ServiceItem icon={<FiRotateCcw />} title="30 Days Returns" desc="For an Exchange Product" />
          <ServiceItem icon={<FiShield />} title="Secured Payment" desc="Payment Cards Accepted" />
          <ServiceItem icon={<FiGift />} title="Special Gifts" desc="Our First Product Order" />
          <ServiceItem icon={<FiHeadphones />} title="Support 24/7" desc="Contact us Anytime" />
        </div>

        {/* 2. Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          
          {/* Brand & Contact Info */}
          <div className="space-y-6">
            <h3 className="text-[20px] font-serif tracking-tight">AARAMDEHI</h3>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              Discover premium furniture and home decor designed for comfort and elegance.
            </p>
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">sales@aaramdehi.com</p>
              <p className="text-[#FAF9F6] text-lg font-semibold tracking-wide">(+91) 9876-543-210</p>
            </div>
            <div className="flex items-center gap-4 mt-6">
               <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#1A365D] transition-all duration-300 cursor-pointer"><FaFacebookF size={14} /></div>
               <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#1A365D] transition-all duration-300 cursor-pointer"><FaTwitter size={14} /></div>
               <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#1A365D] transition-all duration-300 cursor-pointer"><FaInstagram size={14} /></div>
               <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#1A365D] transition-all duration-300 cursor-pointer"><FaYoutube size={14} /></div>
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-base font-semibold text-white mb-8 tracking-wide uppercase text-[12px]">Products</h3>
            <ul className="space-y-4 text-white/70 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors duration-300">New Arrivals</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Best Sellers</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Special Offers</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Shop by Room</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Gift Cards</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Compare Products</li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base font-semibold text-white mb-8 tracking-wide uppercase text-[12px]">Company</h3>
            <ul className="space-y-4 text-white/70 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors duration-300">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Contact Us</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Shipping & Returns</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Size Guide</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Careers</li>
              <li className="hover:text-white cursor-pointer transition-colors duration-300">Press</li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4 tracking-wide">Newsletter</h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed font-light">
              Subscribe to get special offers and updates on new collections.
            </p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/50 focus:bg-white/20 transition-all rounded-lg"
              />
              <button className="bg-white text-[#1A365D] font-semibold text-xs px-8 py-3 uppercase tracking-widest hover:bg-[#FAF9F6] transition-colors w-full rounded-lg shadow-lg">
                Subscribe
              </button>
              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" className="mt-1 accent-white" id="terms" />
                <label htmlFor="terms" className="text-white/60 text-xs leading-tight">
                  I agree to the terms and conditions and the privacy policy
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Premium Bottom Bar */}
      <div className="bg-black/20 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm tracking-wide">© 2026 - AaramDehi. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-white/60 text-xs tracking-wider uppercase">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Service Items
const ServiceItem = ({ icon, title, desc }) => (
  <div className="flex items-center gap-4 justify-center md:justify-start">
    <div className="text-4xl text-white/80">{icon}</div>
    <div>
      <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
      <p className="text-white/60 text-xs font-light">{desc}</p>
    </div>
  </div>
);

export default NewsletterFooter;