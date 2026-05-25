import React from 'react';

const PanCardInfo = () => {
    return (
        <div className="flex-1 bg-white p-8 ml-4 shadow-sm border border-gray-100 rounded-sm">
            <h2 className="text-lg font-bold mb-8">PAN Card Information</h2>
            <div className="max-w-sm space-y-6">
                <div>
                    <input type="text" placeholder="PAN Card Number" className="w-full border-b p-2 outline-none focus:border-blue-600 transition-colors" />
                </div>
                <div>
                    <input type="text" placeholder="Full Name" className="w-full border-b p-2 outline-none focus:border-blue-600 transition-colors" />
                </div>
                <div className="bg-gray-50 p-4 border border-dashed border-gray-300 rounded-sm">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Upload PAN Card (Only JPEG file is allowed)</p>
                    <input type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input type="checkbox" className="mt-0.5" />
                    <span>I do hereby declare that PAN furnished/stated above is correct and belongs to me, registered as an account holder with www.aaramdehi.com.</span>
                </label>
                <button className="w-32 bg-blue-600 text-white py-3 font-bold text-sm rounded-sm opacity-50 cursor-not-allowed">UPLOAD</button>
            </div>
            <p className="text-blue-600 text-xs font-bold mt-8 cursor-pointer hover:underline uppercase">Read Terms & Conditions of PAN Card Information</p>
        </div>
    );
};

export default PanCardInfo;