import React from 'react';

const PanCardInfo = () => {
    return (
        <div className="flex-1 bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-[30px] min-h-[600px]">
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8">PAN Card Information</h2>
            <div className="max-w-md space-y-8">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Card Number</p>
                    <input type="text" placeholder="ABCDE1234F" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-blue-900 transition-colors font-bold text-gray-800 tracking-[0.2em]" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Full Name (As on Card)</p>
                    <input type="text" placeholder="Name on PAN card" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-blue-900 transition-colors font-bold text-gray-800 uppercase" />
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-100 group hover:bg-white hover:border-blue-900/20 transition-all">
                    <p className="text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">Upload PAN Image (JPEG only)</p>
                    <input type="file" className="text-xs file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-900 file:text-white hover:file:bg-black transition-all cursor-pointer" />
                </div>
                <label className="flex items-start gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer leading-relaxed">
                    <input type="checkbox" className="mt-0.5" />
                    <span>I do hereby declare that PAN furnished/stated above is correct and belongs to me, registered as an account holder with www.aaramdehi.com.</span>
                </label>
                <button className="w-full sm:w-40 bg-blue-900 text-white py-4 font-black text-[10px] uppercase tracking-widest rounded-xl opacity-30 cursor-not-allowed shadow-lg">UPLOAD</button>
            </div>
            <p className="text-blue-900 text-[10px] font-black mt-12 cursor-pointer hover:underline uppercase tracking-widest">Read Terms & Conditions of PAN Card Information</p>
        </div>
    );
};

export default PanCardInfo;