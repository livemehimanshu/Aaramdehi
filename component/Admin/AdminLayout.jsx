import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './component/common/Sidebar.jsx'; 
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // जब भी रूट (Page) बदले, पेज को ऊपर (Top) पर ले जाएं
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0F1219] text-slate-200">
      {/* Sidebar - इसमें isOpen और setIsOpen प्रोप्स पास किए गए हैं */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Header */}
      <header className="lg:ml-72 p-6 flex justify-between items-center border-b border-white/5 bg-[#0F1219]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-bold text-lg text-white">Admin Control Panel</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">Himanshu Srivastava</p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center font-bold text-[#0F1219] shadow-lg shadow-emerald-400/20">
            HS
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* lg:ml-72 यह साइडबार के लिए जगह छोड़ता है */}
      <main className="lg:ml-72 p-4 md:p-8 transition-all duration-300 min-h-[calc(100vh-80px)]">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;