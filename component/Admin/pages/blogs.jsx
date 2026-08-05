import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiClock, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllBlogsAPI, deleteBlogAPI } from '../../../src/api/authAndAdminApi';

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Pass admin=true to get drafts as well
      const res = await getAllBlogsAPI({ admin: true });
      if (res.success) {
        setBlogs(res.data);
      }
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await deleteBlogAPI(id);
      if (res.success) {
        toast.success('Blog deleted successfully');
        setBlogs(blogs.filter(b => b._id !== id));
      } else {
        toast.error(res.message || 'Failed to delete blog');
      }
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">Manage Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage your articles</p>
        </div>
        <Link 
          to="/admin/edit-blog/new" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
        >
          <FiPlus size={20} />
          Create New Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
          <FiSearch className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search blogs by title or category..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400 animate-pulse font-semibold">
            Loading articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No blogs found.</p>
            <Link to="/admin/edit-blog/new" className="text-blue-600 font-bold hover:underline">Write your first article</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                  <th className="p-4 font-bold">Article</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Views</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{blog.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${blog.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {blog.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
                        <FiEye className="text-gray-400" /> {blog.views || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiClock className="text-gray-400" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Live"
                        >
                          <FiEye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/edit-blog/${blog._id}`)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsManagement;
