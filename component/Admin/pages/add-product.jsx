import React, { useState } from 'react';
import { Upload, Save, Box, DollarSign, ListChecks, Loader2, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AddProduct() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Image Optimization Function
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Compress
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000 });

      // 2. Convert to WebP
      const webpFile = await convertToWebP(compressedFile);
      
      setPreview(URL.createObjectURL(webpFile));
      console.log("WebP ready for upload:", webpFile);
    } catch (err) {
      console.error("Error processing image:", err);
    } finally {
      setLoading(false);
    }
  };

  const convertToWebP = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' }));
        }, 'image/webp', 0.8);
      };
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Box className="text-emerald-500" /> Add New Product
      </h1>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500" placeholder="Product Name" />
              <input className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none" placeholder="Brand Name" />
              <select className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none">
                <option>Select Category</option>
                <option>Furniture</option>
                <option>Lighting</option>
              </select>
              <input type="number" className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none" placeholder="Stock Quantity" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2"><DollarSign size={18}/> Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none" placeholder="MRP" />
              <input type="number" className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none" placeholder="Selling Price" />
              <input type="number" className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none" placeholder="Discount %" />
            </div>
          </div>
        </div>

        {/* RIGHT: Image Upload */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold mb-4 text-slate-400 uppercase">Product Image</h3>
            <div className="relative border-2 border-dashed border-gray-700 h-48 flex flex-col items-center justify-center rounded-lg hover:border-emerald-500 cursor-pointer overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} className="h-full w-full object-cover" alt="prod" />
                  <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-red-500 rounded-full p-1"><X size={14}/></button>
                </>
              ) : (
                <>
                  <Upload className="text-gray-500" />
                  <span className="text-xs text-gray-500 mt-2">Click to Upload</span>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </>
              )}
            </div>
            {loading && <p className="text-emerald-500 text-xs mt-2 flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Compressing & Converting...</p>}
          </div>

          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold transition-all">
            Publish Product
          </button>
        </div>
      </form>
    </div>
  );
}