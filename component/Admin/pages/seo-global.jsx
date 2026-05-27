import React, { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle2, Globe, FileText, Tag } from 'lucide-react';
import { getGlobalSeoAPI, updateGlobalSeoAPI } from '../../../src/api/authAndAdminApi';

const SEOGlobal = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    pageTitle: '',
    metaDescription: '',
    keywords: '',
    siteTitle: '',
    siteDescription: '',
    brandName: '',
    ogImage: '',
    ogTitle: '',
    ogDescription: '',
    robotsIndex: true,
    robotsFollow: true
  });

  // Fetch current SEO data
  useEffect(() => {
    const fetchSEO = async () => {
      setLoading(true);
      try {
        const response = await getGlobalSeoAPI();
        if (response.success) {
          setFormData({
            pageTitle: response.data.pageTitle || '',
            metaDescription: response.data.metaDescription || '',
            keywords: (response.data.keywords || []).join(', '),
            siteTitle: response.data.siteTitle || '',
            siteDescription: response.data.siteDescription || '',
            brandName: response.data.brandName || 'Aaramdehi',
            ogImage: response.data.ogImage || '',
            ogTitle: response.data.ogTitle || '',
            ogDescription: response.data.ogDescription || '',
            robotsIndex: response.data.robotsIndex !== false,
            robotsFollow: response.data.robotsFollow !== false
          });
        }
      } catch (error) {
        console.error('Error fetching SEO:', error);
        setMessage({ type: 'error', text: 'Failed to load SEO settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSEO();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.pageTitle || !formData.metaDescription) {
      setMessage({ type: 'error', text: 'Page title and meta description are required' });
      return;
    }

    if (formData.pageTitle.length < 30 || formData.pageTitle.length > 60) {
      setMessage({ type: 'error', text: 'Page title must be between 30-60 characters' });
      return;
    }

    if (formData.metaDescription.length < 50 || formData.metaDescription.length > 160) {
      setMessage({ type: 'error', text: 'Meta description must be between 50-160 characters' });
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        pageTitle: formData.pageTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        siteTitle: formData.siteTitle,
        siteDescription: formData.siteDescription,
        brandName: formData.brandName,
        ogImage: formData.ogImage,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        robotsIndex: formData.robotsIndex,
        robotsFollow: formData.robotsFollow
      };

      const response = await updateGlobalSeoAPI(submitData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'SEO settings updated successfully! ✓' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update SEO settings' });
      }
    } catch (error) {
      console.error('Error updating SEO:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update SEO settings' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={40} />
          <p className="text-slate-400">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
          <Globe className="text-emerald-500" /> Global SEO Settings
        </h1>
        <p className="text-slate-400 mb-8">Manage your website's global SEO metadata and settings</p>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Site Information */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
              <FileText size={18} /> Site Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">Site Title</label>
                <input 
                  name="siteTitle" 
                  value={formData.siteTitle} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="e.g., Aaramdehi - Premium Home Furniture" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">Brand Name</label>
                <input 
                  name="brandName" 
                  value={formData.brandName} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="e.g., Aaramdehi" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">Site Description</label>
                <textarea 
                  name="siteDescription" 
                  value={formData.siteDescription} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="Brief description of your website"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Page SEO Metadata */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
              <Tag size={18} /> Page SEO Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-300">Page Title *</label>
                  <span className={`text-xs ${formData.pageTitle.length > 60 ? 'text-rose-400' : formData.pageTitle.length > 50 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formData.pageTitle.length}/60
                  </span>
                </div>
                <input 
                  name="pageTitle" 
                  value={formData.pageTitle} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="Page title for search engines (30-60 chars)"
                  maxLength="60"
                />
                <p className="text-xs text-slate-500 mt-1">Optimal length: 50-60 characters</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-300">Meta Description *</label>
                  <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-rose-400' : formData.metaDescription.length > 120 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formData.metaDescription.length}/160
                  </span>
                </div>
                <textarea 
                  name="metaDescription" 
                  value={formData.metaDescription} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="Meta description for search results (50-160 chars)"
                  rows="3"
                  maxLength="160"
                />
                <p className="text-xs text-slate-500 mt-1">Optimal length: 120-160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2">
                  <Tag size={14} /> Keywords
                </label>
                <input 
                  name="keywords" 
                  value={formData.keywords} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="keyword1, keyword2, keyword3" 
                />
                <p className="text-xs text-slate-500 mt-1">Separate keywords with commas</p>
              </div>
            </div>
          </div>

          {/* Open Graph / Social Media */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">📱 Open Graph (Social Media)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">OG Image URL</label>
                <input 
                  name="ogImage" 
                  value={formData.ogImage} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="https://example.com/image.jpg" 
                />
                <p className="text-xs text-slate-500 mt-1">Image for sharing on social media (1200x630px recommended)</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">OG Title</label>
                <input 
                  name="ogTitle" 
                  value={formData.ogTitle} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="Title for social media share" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">OG Description</label>
                <textarea 
                  name="ogDescription" 
                  value={formData.ogDescription} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" 
                  placeholder="Description for social media share"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Robots Meta Tags */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">🤖 Search Engine Crawling</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="robotsIndex" 
                  checked={formData.robotsIndex} 
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-800"
                />
                <span className="text-sm font-semibold text-slate-300">Allow search engines to index this site</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="robotsFollow" 
                  checked={formData.robotsFollow} 
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-800"
                />
                <span className="text-sm font-semibold text-slate-300">Allow search engines to follow links on this site</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save SEO Settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SEOGlobal;