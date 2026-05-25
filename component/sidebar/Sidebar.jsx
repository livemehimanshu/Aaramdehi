import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IoWalletSharp, IoPersonSharp, IoBagHandleSharp, 
  IoPower, IoFolderSharp, IoChevronForward 
} from "react-icons/io5";

const Sidebar = () => {
    const activeLink = "bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600";
    const normalLink = "text-gray-600 hover:bg-gray-50 hover:text-blue-500 transition-all";

    return (
        <div className="w-80 bg-white shadow-sm border border-gray-100 h-fit rounded-sm overflow-hidden">
            {/* Header Section */}
            <div className="flex items-center gap-4 p-4 border-b bg-white">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <IoPersonSharp className="text-blue-600 text-xl" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider leading-none mb-1">Hello,</p>
                    <h3 className="font-bold text-gray-800">Himanshu Srivastava</h3>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="py-2">
                <NavLink to="/orders" className={({isActive}) => `flex items-center justify-between p-4 border-b group ${isActive ? activeLink : normalLink}`}>
                    <div className="flex items-center gap-4">
                        <IoBagHandleSharp className="text-blue-600" />
                        <span className="uppercase text-sm font-bold tracking-tight">My Orders</span>
                    </div>
                    <IoChevronForward className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </NavLink>

                {/* Account Settings */}
                <div className="border-b">
                    <div className="flex items-center gap-4 p-4 text-gray-400">
                        <IoPersonSharp className="text-blue-600" />
                        <span className="uppercase text-sm font-bold tracking-tight">Account Settings</span>
                    </div>
                    <div className="pb-2">
                        <NavLink to="/account/profile" className={({isActive}) => `block pl-14 py-2 text-sm ${isActive ? "text-blue-600 font-bold bg-blue-50 border-r-4 border-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                            Profile Information
                        </NavLink>
                        <NavLink to="/account/addresses" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">Manage Addresses</NavLink>
                        <NavLink to="/account/pan" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">PAN Card Information</NavLink>
                    </div>
                </div>

                {/* Payments */}
                <div className="border-b">
                    <div className="flex items-center gap-4 p-4 text-gray-400">
                        <IoWalletSharp className="text-blue-600" />
                        <span className="uppercase text-sm font-bold tracking-tight">Payments</span>
                    </div>
                    <div className="pb-2">
                        <NavLink to="/payments/giftcards" className="flex justify-between items-center pl-14 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                            Gift Cards <span className="text-green-600 font-bold text-xs">₹0</span>
                        </NavLink>
                        <NavLink to="/payments/upi" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">Saved UPI</NavLink>
                        <NavLink to="/payments/cards" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">Saved Cards</NavLink>
                    </div>
                </div>

                {/* My Stuff */}
                <div className="border-b">
                    <div className="flex items-center gap-4 p-4 text-gray-400">
                        <IoFolderSharp className="text-blue-600" />
                        <span className="uppercase text-sm font-bold tracking-tight">My Stuff</span>
                    </div>
                    <div className="pb-2">
                        <NavLink to="/coupons" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">My Coupons</NavLink>
                        <NavLink to="/reviews" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">My Reviews & Ratings</NavLink>
                        <NavLink to="/wishlist" className="block pl-14 py-2 text-sm text-gray-600 hover:bg-gray-50">My Wishlist</NavLink>
                    </div>
                </div>

                {/* Logout */}
                <button className="w-full flex items-center gap-4 p-4 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all border-b group">
                    <IoPower className="text-blue-600 group-hover:text-red-500" />
                    <span className="uppercase text-sm font-bold tracking-tight text-left">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;