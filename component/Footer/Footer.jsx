import React from 'react';
import { FiTruck, FiRotateCcw, FiShield, FiGift, FiHeadphones } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterestP } from 'react-icons/fa';

const NewsletterFooter = () => {
  return (
    <div className="bg-white border-t border-gray-100">
      
      {/* 1. Service Badges Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 border-b border-gray-100 pb-10">
          <ServiceItem icon={<FiTruck />} title="Free Shipping" desc="For all Orders Over $100" />
          <ServiceItem icon={<FiRotateCcw />} title="30 Days Returns" desc="For an Exchange Product" />
          <ServiceItem icon={<FiShield />} title="Secured Payment" desc="Payment Cards Accepted" />
          <ServiceItem icon={<FiGift />} title="Special Gifts" desc="Our First Product Order" />
          <ServiceItem icon={<FiHeadphones />} title="Support 24/7" desc="Contact us Anytime" />
        </div>

        {/* 2. Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold text-gray-800">Contact us</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              Classyshop - Mega Super Store<br />
              507-Union Trade Centre France
            </p>
            <p className="text-gray-500 text-[14px]">sales@yourcompany.com</p>
            <p className="text-[#ff4e50] text-[20px] font-bold">(+91) 9876-543-210</p>
            <div className="flex items-center gap-3 mt-4">
               <div className="w-10 h-10 border rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff4e50] hover:text-white transition-all cursor-pointer"><FaFacebookF /></div>
               <div className="w-10 h-10 border rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff4e50] hover:text-white transition-all cursor-pointer"><FaTwitter /></div>
               <div className="w-10 h-10 border rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff4e50] hover:text-white transition-all cursor-pointer"><FaInstagram /></div>
               <div className="w-10 h-10 border rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff4e50] hover:text-white transition-all cursor-pointer"><FaYoutube /></div>
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-6">Products</h3>
            <ul className="space-y-3 text-gray-500 text-[14px]">
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Prices drop</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">New products</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Best sales</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Contact us</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Sitemap</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Stores</li>
            </ul>
          </div>

          {/* Our Company Links */}
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-6">Our company</h3>
            <ul className="space-y-3 text-gray-500 text-[14px]">
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Delivery</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Legal Notice</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Terms and conditions of use</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">About us</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Secure payment</li>
              <li className="hover:text-[#ff4e50] cursor-pointer transition-colors">Login</li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-6">Subscribe to newsletter</h3>
            <p className="text-gray-500 text-[14px] mb-6">
              Subscribe to our latest newsletter to get news about special discounts.
            </p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="w-full border border-gray-200 px-4 py-3 text-[14px] outline-none focus:border-[#ff4e50]"
              />
              <button className="bg-[#ff4e50] text-white font-bold text-[13px] px-8 py-3 uppercase tracking-wider hover:bg-black transition-colors w-full md:w-auto">
                Subscribe
              </button>
              <div className="flex items-start gap-2 mt-4">
                <input type="checkbox" className="mt-1" id="terms" />
                <label htmlFor="terms" className="text-gray-400 text-[12px] leading-tight">
                  I agree to the terms and conditions and the privacy policy
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="bg-[#f6f6f6] py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-[13px]">© 2026 - AaramDehi </p>
          <img src="https://demo.codezeel.com/prestashop/PRS21/PRS210502/img/cms/payment.png" alt="Payments" className="h-6 object-contain" />
        </div>
      </div>
    </div>
  );
};

// Helper Component for Service Items
const ServiceItem = ({ icon, title, desc }) => (
  <div className="flex items-center gap-4 justify-center md:justify-start">
    <div className="text-3xl text-gray-800">{icon}</div>
    <div>
      <h4 className="text-[14px] font-bold text-gray-800">{title}</h4>
      <p className="text-gray-400 text-[12px]">{desc}</p>
    </div>
  </div>
);

export default NewsletterFooter;