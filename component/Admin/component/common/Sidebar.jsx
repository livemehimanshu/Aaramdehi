import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, LayoutDashboard, ShoppingBag, BarChart2, Package, Tags, 
  Layers, CreditCard, RefreshCcw, TrendingUp, Mail, Users, 
  MessageSquare, Settings, Globe, ShieldCheck, LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation();

  const menuSections = [
    { title: "Dashboard", items: [
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ]},
    { title: "Catalog", items: [
        { name: 'All Products', path: '/admin/AllProducts', icon: Package },
        { name: 'Add Product', path: '/admin/add-product', icon: ShoppingBag },
        { name: 'Categories', path: '/admin/categories', icon: Tags },
        { name: 'Inventory', path: '/admin/inventory', icon: Layers },
    ]},
    { title: "Sales & Orders", items: [
        { name: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Transactions', path: '/admin/payments', icon: CreditCard },
        { name: 'Refunds', path: '/admin/refunds', icon: RefreshCcw },
    ]},
    { title: "Marketing & SEO", items: [
        { name: 'SEO Optimizer', path: '/admin/seo-optimizer', icon: TrendingUp },
        { name: 'Coupons', path: '/admin/coupons', icon: Tags },
        { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
    ]},
    { title: "Users", items: [
        { name: 'Customers', path: '/admin/users', icon: Users },
        { name: 'Feedback', path: '/admin/reviews', icon: MessageSquare },
    ]},
    { title: "System", items: [
        { name: 'General Settings', path: '/admin/settings', icon: Settings },
        { name: 'SEO Global', path: '/admin/seo-global', icon: Globe },
        { name: 'Admin Team', path: '/admin/team', icon: ShieldCheck },
    ]}
  ];

  return (
    <>
      {/* मोबाइल ओवरले */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* मुख्य साइडबार */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#161B28] border-r border-white/5 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        
        {/* ब्रांड और क्लोज बटन */}
        <div className="p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-[#0F1219] font-black shadow-lg shadow-emerald-400/20">AD</div>
             <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter">Aaramdehi</h1>
                <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Admin Panel</p>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* नेविगेशन लिंक्स */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-8 pb-8 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase px-4 mb-3">{section.title}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-emerald-400 text-[#0F1219] font-bold shadow-md shadow-emerald-400/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[13px] font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* साइन आउट */}
        <div className="p-6 border-t border-white/5 bg-[#0F1219]/50 shrink-0">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent text-sm font-bold">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* स्क्रॉलबार छुपाने के लिए स्टाइल */}
      <style>{`.custom-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </>
  );
};

export default Sidebar;