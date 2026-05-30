import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IoCloseOutline, 
  IoBagHandleOutline, 
  IoPersonOutline, 
  IoLocationOutline, 
  IoCardOutline, 
  IoWalletOutline, 
  IoTicketOutline, 
  IoStarOutline, 
  IoLogOutOutline,
  IoChevronForwardOutline
} from "react-icons/io5";
import { CiHeart } from "react-icons/ci";

const Sidebar = ({ isOpen, onClose, user, handleLogout, isStatic = false }) => {
  if (!user) return null;

  return (
    <>
      {/* --- Background Overlay (Blur & Dark) --- */}
      {!isStatic && (
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          } ${isStatic ? 'hidden' : 'md:hidden'}`}
        onClick={onClose}
        ></div>
      )}

      {/* --- Sidebar Container (Slide from Left) --- */}
      <div className={`${isStatic ? 'relative w-full h-full border border-gray-100 rounded-[30px] hidden md:flex' : 'fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] z-[1001] md:hidden translate-x-0 transition-transform duration-300'} bg-white flex flex-col ${
        !isStatic && !isOpen ? '-translate-x-full' : 'translate-x-0'
      } shadow-2xl overflow-hidden`}>
        
        {/* Sidebar Header: User Info & Close */}
        <div className="p-6 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <IoPersonOutline size={24} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-tight truncate">{user.name}</p>
              <p className="text-[10px] opacity-70 truncate lowercase">{user.email}</p>
            </div>
          </div>
          {!isStatic && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <IoCloseOutline size={28} />
            </button>
          )}
        </div>

        {/* Sidebar Menu: Grouped Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          {/* Section: Orders */}
          <Link to="/orders" onClick={onClose} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-900">
                <IoBagHandleOutline size={22} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-800">My Orders</span>
            </div>
            <IoChevronForwardOutline className="text-gray-300" />
          </Link>

          {/* Section Group: Account Settings */}
          <div>
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Account Settings</p>
            <div className="space-y-1">
              {[
                { label: 'Profile Information', path: '/account/profile', icon: IoPersonOutline },
                { label: 'Manage Addresses', path: '/account/addresses', icon: IoLocationOutline },
                { label: 'PAN Card Information', path: '/account/pan', icon: IoCardOutline }
              ].map((item, idx) => (
                <Link key={idx} to={item.path} onClick={onClose} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <item.icon size={20} className="text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-600">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Section Group: Payments */}
          <div>
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Payments</p>
            <div className="space-y-1">
              {[
                { label: 'Gift Cards', path: '/payments/giftcards', icon: IoWalletOutline, badge: '₹0' },
                { label: 'Saved UPI', path: '/payments/upi', icon: IoWalletOutline },
                { label: 'Saved Cards', path: '/payments/cards', icon: IoCardOutline }
              ].map((item, idx) => (
                <Link key={idx} to={item.path} onClick={onClose} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className="text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-600">{item.label}</span>
                  </div>
                  {item.badge && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{item.badge}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Section Group: My Stuff */}
          <div>
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">My Stuff</p>
            <div className="space-y-1">
              {[
                { label: 'My Coupons', path: '/coupons', icon: IoTicketOutline },
                { label: 'My Reviews & Ratings', path: '/reviews', icon: IoStarOutline },
                { label: 'My Wishlist', path: '/wishlist', icon: CiHeart }
              ].map((item, idx) => (
                <Link key={idx} to={item.path} onClick={onClose} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <item.icon size={20} className="text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-600">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Logout */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => { handleLogout(); onClose(); }}
            className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
          >
            <IoLogOutOutline size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;