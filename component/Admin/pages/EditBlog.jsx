import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiImage, FiSettings, FiBarChart2 } from 'react-icons/fi';
import { getBlogByIdOrSlugAPI, createBlogAPI, updateBlogAPI } from '../../../src/api/authAndAdminApi';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content, seo, settings

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    tags: [],
    author: 'Aaramdehi Team',
    image: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'Draft'
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchBlogData();
    }
  }, [id]);

  const fetchBlogData = async () => {
    try {
      const res = await getBlogByIdOrSlugAPI(id, { admin: true });
      if (res.success && res.data) {
        setFormData({
          ...res.data,
          tags: res.data.tags || []
        });
      } else {
        toast.error('Blog not found');
        navigate('/admin/blogs');
      }
    } catch (error) {
      toast.error('Error fetching blog');
      navigate('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and Content are required!');
      return;
    }

    try {
      setSaving(true);
      let res;
      if (isEditing) {
        res = await updateBlogAPI(id, formData);
      } else {
        res = await createBlogAPI(formData);
      }

      if (res.success) {
        toast.success(`Blog ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/admin/blogs');
      } else {
        toast.error(res.message || 'Failed to save blog');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">Loading editor...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/blogs')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <FiArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">{isEditing ? 'Edit Article' : 'Write New Article'}</h1>
            <p className="text-sm text-gray-500 mt-1">{formData.status} • {formData.views || 0} Views</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="Draft">Save as Draft</option>
            <option value="Published">Publish Live</option>
          </select>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm"
          >
            <FiSave size={18} />
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Main Editor Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'content' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiEdit size={16} /> Content
            </button>
            <button 
              onClick={() => setActiveTab('seo')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'seo' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiBarChart2 size={16} /> SEO & Meta
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'settings' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiSettings size={16} /> Settings
            </button>
          </div>

          <div className="p-6">
            {/* CONTENT TAB */}
            <div className={activeTab === 'content' ? 'block' : 'hidden'}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Article Title *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. 5 Ways to Decorate Your Living Room"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Excerpt (For Cards) *</label>
                <textarea 
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="A brief summary of what the article is about..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Content *</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    className="h-[400px] pb-10" // Padding bottom because quill toolbar/content height issues
                  />
                </div>
              </div>
            </div>

            {/* SEO TAB */}
            <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium">These fields control how your article appears on Google Search and Social Media (Facebook/Twitter).</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Title</label>
                <input 
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="Custom SEO Title (defaults to Article Title)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Recommended length: 50-60 characters.</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Description</label>
                <textarea 
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Custom SEO Description (defaults to Excerpt)"
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Recommended length: 150-160 characters.</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Focus Keywords</label>
                <input 
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleInputChange}
                  placeholder="e.g. home decor, living room, cushions"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom URL Slug (Optional)</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <span className="text-gray-400 text-sm">/blog/</span>
                  <input 
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="my-custom-url-slug"
                    className="w-full bg-transparent border-none outline-none text-sm font-semibold text-gray-800 ml-1"
                  />
                </div>
              </div>
            </div>

            {/* SETTINGS TAB */}
            <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cover Image URL *</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <FiImage className="text-gray-400 mr-2" />
                  <input 
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-800"
                  />
                </div>
                {formData.image && (
                  <div className="mt-4 rounded-xl overflow-hidden h-40 border border-gray-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="General">General</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Styling">Styling</option>
                    <option value="Health & Comfort">Health & Comfort</option>
                    <option value="Guides">Guides</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Author</label>
                  <input 
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Aaramdehi Team"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags (Press Enter)</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:border-blue-500 focus-within:bg-white transition-all flex flex-wrap gap-2 items-center">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500 ml-1">&times;</button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 min-w-[150px] p-2"
                  />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
