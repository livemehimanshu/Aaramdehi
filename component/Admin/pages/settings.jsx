import React, { useEffect, useState } from 'react';
import { Settings, Save, Lock, Store, User } from 'lucide-react';
import { getAllProductsAPI, adminGetAllSettingsAPI, updateSettingAPI, createSettingAPI, createBannerAPI } from '../../../src/api/authAndAdminApi';
import imageCompression from 'browser-image-compression';

export default function SettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Aaramdehi',
    email: 'admin@aaramdehi.com',
    currency: 'INR (₹)',
  });

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-white">
        <Settings size={28} className="text-emerald-500" /> Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Profile Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Store size={20} className="text-blue-500" /> Store Details
          </h2>
          <div className="space-y-4">
            <input 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
              value={storeInfo.name} 
              onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})} 
              placeholder="Store Name" 
            />
            <input 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
              value={storeInfo.email} 
              onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})} 
              placeholder="Admin Email" 
            />
            <select 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all cursor-pointer"
              value={storeInfo.currency}
              onChange={(e) => setStoreInfo({...storeInfo, currency: e.target.value})}
            >
              <option>INR (₹)</option>
              <option>USD ($)</option>
            </select>
            <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-semibold">
              <Save size={18} /> Update Store
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Lock size={20} className="text-rose-500" /> Security
          </h2>
          <div className="space-y-4">
            <input type="password" placeholder="Old Password" className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-rose-500 outline-none text-white transition-all" />
            <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-rose-500 outline-none text-white transition-all" />
            <button className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-all font-semibold">
              <User size={18} /> Update Password
            </button>
          </div>
        </div>
      </div>

      <LogoEditor />
      
      {/* Featured Banner Setting */}
      <div className="mt-8 bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl max-w-3xl">
        <h2 className="text-lg font-bold mb-4 text-white">Featured Banner (Admin)</h2>
        <p className="text-sm text-slate-400 mb-4">Select a product to use as the featured banner image on the public site. This will set the public setting <strong>FEATURED_PRODUCT_ID</strong>.</p>
        <FeaturedBannerEditor />
      </div>
    </div>
  );
}

function FeaturedBannerEditor() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prodRes = await getAllProductsAPI({ limit: 100 });
        const prods = prodRes && prodRes.success ? (prodRes.data || prodRes.products || prodRes) : (prodRes || []);
        setProducts(Array.isArray(prods) ? prods : []);

        const settingsRes = await adminGetAllSettingsAPI();
        if (settingsRes && settingsRes.success && Array.isArray(settingsRes.data)) {
          const found = settingsRes.data.find(s => s.key === 'FEATURED_PRODUCT_ID');
          if (found) setSelected(String(found.value));
        }
      } catch (err) {
        console.error('FeaturedBannerEditor load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setMessage(null);
    if (!selected) {
      setMessage({ type: 'error', text: 'Please select a product.' });
      return;
    }
    setLoading(true);
    try {
      // Fetch existing settings to decide whether to update or create
      const settingsRes = await adminGetAllSettingsAPI();
      if (settingsRes && settingsRes.success && Array.isArray(settingsRes.data)) {
        const found = settingsRes.data.find(s => s.key === 'FEATURED_PRODUCT_ID');
        if (found) {
          const up = await updateSettingAPI('FEATURED_PRODUCT_ID', selected);
          if (up && up.success) setMessage({ type: 'success', text: 'Featured product updated.' });
          else setMessage({ type: 'error', text: up.message || 'Failed to update setting.' });
        } else {
          const payload = { key: 'FEATURED_PRODUCT_ID', value: selected, category: 'general', isPublic: true };
          const cr = await createSettingAPI(payload);
          if (cr && cr.success) setMessage({ type: 'success', text: 'Featured product created.' });
          else setMessage({ type: 'error', text: cr.message || 'Failed to create setting.' });
        }
      } else {
        // If settings endpoint failed, fallback to attempt update then create
        const up = await updateSettingAPI('FEATURED_PRODUCT_ID', selected);
        if (up && up.success) setMessage({ type: 'success', text: 'Featured product updated.' });
        else {
          const payload = { key: 'FEATURED_PRODUCT_ID', value: selected, category: 'general', isPublic: true };
          const cr = await createSettingAPI(payload);
          if (cr && cr.success) setMessage({ type: 'success', text: 'Featured product created.' });
          else setMessage({ type: 'error', text: cr.message || up.message || 'Failed to save setting.' });
        }
      }
    } catch (err) {
      console.error('Save featured product error', err);
      setMessage({ type: 'error', text: err.message || 'Save failed' });
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

  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProcessing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
      const webp = await convertToWebP(compressed);
      setUploadPreview(URL.createObjectURL(webp));
      setUploadFile(webp);
    } catch (err) {
      console.error('Banner processing failed', err);
      setMessage({ type: 'error', text: 'Image processing failed' });
    } finally {
      setUploadProcessing(false);
    }
  };

  const handleUploadBanner = async () => {
    if (!uploadFile) return setMessage({ type: 'error', text: 'Select an image first' });
    setUploadProcessing(true);
    setMessage(null);
    try {
      const data = new FormData();
      data.append('title', 'Featured Banner (Admin)');
      data.append('description', 'Uploaded from admin settings');
      data.append('category', 'hero');
      data.append('position', 0);
      data.append('image', uploadFile);

      const res = await createBannerAPI(data);
      if (res && res.success && res.data && res.data.image) {
        // Save the image URL into BANNER_IMAGE setting so frontend can use it
        const setRes = await updateSettingAPI('BANNER_IMAGE', res.data.image);
        if (setRes && setRes.success) {
          setMessage({ type: 'success', text: 'Banner uploaded and setting updated.' });
          setUploadPreview(null);
          setUploadFile(null);
        } else {
          setMessage({ type: 'error', text: setRes.message || 'Banner created but failed to update setting.' });
        }
      } else {
        setMessage({ type: 'error', text: res?.message || 'Failed to create banner' });
      }
    } catch (err) {
      console.error('Upload banner error', err);
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploadProcessing(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white">
          <option value="">-- Select product --</option>
          {products.map((p) => (
            <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="bg-emerald-600 px-4 py-2 rounded-xl text-white font-semibold hover:bg-emerald-700" disabled={loading}>
            <Save size={16} /> Save
          </button>
          {loading && <div className="text-sm text-slate-400">Saving...</div>}
        </div>
      </div>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'}`}>{message.text}</div>
      )}
      
      <div className="mt-6 border-t border-gray-800 pt-4">
        <h4 className="text-sm font-semibold mb-2">Or upload a custom banner image</h4>
        <div className={`relative border-2 border-dashed rounded-2xl transition-all ${
          uploadPreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 hover:border-gray-700 bg-gray-950'
        }`}> 
          <input type="file" accept="image/*" onChange={handleBannerFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          {uploadPreview ? (
            <div className="p-4 relative">
              <img src={uploadPreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="text-sm">Click to select an image (recommended 1920x600)</div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-3">
          <button onClick={handleUploadBanner} disabled={uploadProcessing} className="bg-blue-600 px-4 py-2 rounded-xl text-white font-semibold">{uploadProcessing ? 'Uploading...' : 'Upload & Use'}</button>
          <button onClick={() => { setUploadPreview(null); setUploadFile(null); setMessage(null); }} className="px-4 py-2 rounded-xl border border-gray-800 text-slate-300">Clear</button>
        </div>
      </div>
    </div>
  );
}

function LogoEditor() {
  const [logoUrl, setLogoUrl] = useState('/aaramdehi-logo.svg');
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState('/aaramdehi-logo.svg');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    adminGetAllSettingsAPI().then((response) => {
      const setting = response?.data?.find(item => item.key === 'LOGO_URL');
      if (setting?.value) {
        setLogoUrl(setting.value);
        setPreview(setting.value);
      }
    }).catch(() => {});
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!logoFile) return setMessage({ type: 'error', text: 'Select a logo image first.' });
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('title', 'Store Logo');
      formData.append('description', 'Uploaded from admin settings');
      formData.append('category', 'branding');
      formData.append('position', 0);
      formData.append('image', logoFile);
      const uploadResponse = await createBannerAPI(formData);
      const uploadedUrl = uploadResponse?.data?.image;
      if (!uploadResponse?.success || !uploadedUrl) throw new Error(uploadResponse?.message || 'Logo upload failed.');

      const settingsResponse = await adminGetAllSettingsAPI();
      const existing = settingsResponse?.data?.find(item => item.key === 'LOGO_URL');
      const saveResponse = existing
        ? await updateSettingAPI('LOGO_URL', uploadedUrl)
        : await createSettingAPI({ key: 'LOGO_URL', value: uploadedUrl, type: 'url', category: 'branding', isPublic: true });
      if (!saveResponse?.success) throw new Error(saveResponse?.message || 'Logo setting could not be saved.');
      setLogoUrl(uploadedUrl);
      setPreview(uploadedUrl);
      setLogoFile(null);
      setMessage({ type: 'success', text: 'Logo updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Logo update failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl max-w-3xl">
      <h2 className="text-lg font-bold mb-2 text-white">Store Logo</h2>
      <p className="text-sm text-slate-400 mb-5">Upload the logo used on the website and generated invoices.</p>
      <div className="flex flex-wrap items-center gap-5">
        <img src={preview || logoUrl} alt="Store logo preview" className="h-24 w-24 rounded-full object-contain bg-white p-1" />
        <div className="flex-1 min-w-[220px] space-y-3">
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFileChange} className="block w-full text-sm text-gray-300" />
          <button type="button" onClick={handleSave} disabled={loading || !logoFile} className="bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold">
            {loading ? 'Uploading...' : 'Update Logo'}
          </button>
          {message && <p className={message.type === 'success' ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>{message.text}</p>}
        </div>
      </div>
    </div>
  );
}