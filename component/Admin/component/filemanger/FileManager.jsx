import React from 'react';
import { Folder, FileText, Image as ImageIcon, MoreVertical, Search, List } from 'lucide-react';
import { ActivityChart } from '../charts/FileCharts.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const FileManager = () => {
  const quickAccess = [
    { name: 'Employee Sheet', icon: Folder, color: 'bg-amber-400', files: '1.2 GB' },
    { name: 'Employee history.pdf', icon: FileText, color: 'bg-rose-500', files: '8.4 MB' },
    { name: 'Final Changes.doc', icon: FileText, color: 'bg-blue-500', files: '12 MB' },
    { name: 'Office Setup.img', icon: ImageIcon, color: 'bg-emerald-500', files: '4.5 MB' },
  ];

  const stats = [
    { label: 'Total Images', size: '36,476 GB', usage: '32%', color: 'text-blue-500' },
    { label: 'Total Videos', size: '53,406 GB', usage: '48%', color: 'text-rose-500' },
    { label: 'Total Documents', size: '90,875 GB', usage: '89%', color: 'text-emerald-500' },
    { label: 'Total Music', size: '63,076 GB', usage: '54%', color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10 px-4 md:px-8">
      
      {/* Top Stats Cards - Swiper Responsive */}
      <div className="w-full">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
        >
          {stats.map((stat, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white dark:bg-[#161B28] p-4 md:p-5 rounded-[20px] border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <h4 className="text-md md:text-lg font-bold mt-1 tracking-tight">{stat.size}</h4>
                </div>
                <div className={`text-xs md:text-sm font-black ${stat.color}`}>{stat.usage}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Access */}
          <section>
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Quick Access</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {quickAccess.map((item, i) => (
                <div key={i} className="bg-white dark:bg-[#161B28] p-4 rounded-[20px] border border-gray-100 dark:border-white/5 text-center cursor-pointer hover:shadow-lg transition-all">
                  <div className={`w-10 h-10 ${item.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg`}>
                    <item.icon size={20} />
                  </div>
                  <p className="text-[11px] font-bold truncate text-gray-700 dark:text-gray-200">{item.name}</p>
                  <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{item.files}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Chart */}
          <section className="bg-white dark:bg-[#161B28] p-4 md:p-8 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold mb-4 text-lg">Upload & Download Activity</h3>
            <div className="h-[200px] md:h-[300px] w-full"><ActivityChart /></div>
          </section>
        </div>

        {/* Right Section - Storage Panel */}
        <div className="lg:col-span-4">
           <div className="bg-white dark:bg-[#161B28] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm sticky top-6">
              <h3 className="font-bold mb-6">Storage Used</h3>
              <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-6">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100 dark:text-white/5" />
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="264" strokeDashoffset="58" className="text-blue-500" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-4xl font-black">78%</span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold">Used of 100GB</span>
                 </div>
              </div>
              <button className="w-full py-3 md:py-4 bg-emerald-400 text-[#0F1219] rounded-[16px] font-black text-xs md:text-sm transition-transform active:scale-95">
                UPGRADE STORAGE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;