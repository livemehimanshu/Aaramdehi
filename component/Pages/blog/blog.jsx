import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoIosArrowForward, IoIosSearch } from "react-icons/io";

// --- DUMMY BLOG DATA ---
const blogData = [
    {
        id: 1,
        slug: "5-secrets-to-choosing-the-perfect-pillow-for-neck-pain",
        title: "5 Secrets to Choosing the Perfect Pillow for Neck Pain",
        category: "Health",
        date: "April 2, 2026",
        author: "Himanshu",
        image: "https://images.unsplash.com/photo-1632102911919-835a743c399b?w=800",
        excerpt: "Waking up with a stiff neck? Your pillow might be the culprit. Discover how to choose the right support.",
        content: `
            <p>Neck pain can ruin your entire day. Choosing the right pillow is not just about comfort; it's about spinal alignment.</p>
            <h2>1. Understand Your Sleeping Position</h2>
            <p>Side sleepers need a thicker pillow, while back sleepers need something flatter to keep the neck aligned.</p>
            <h2>2. Material Matters</h2>
            <p>Memory foam or latex provide the best support for orthopedic needs.</p>
            <p>Check out our <b>Aaramdehi Orthopedic Collection</b> for more details.</p>
        `
    },
    {
        id: 2,
        slug: "how-to-style-your-living-room-with-velvet-cushions",
        title: "How to Style Your Living Room with Velvet Cushions",
        category: "Styling",
        date: "March 30, 2026",
        author: "Aaramdehi Team",
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
        excerpt: "Add a touch of luxury to your sofa with our premium velvet cushion styling guide.",
        content: "<p>Velvet is back in trend! Mix and match textures to create a rich, cozy environment...</p>"
    }
];

// --- BLOG LISTING COMPONENT ---
export const BlogList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');

    const filteredBlogs = blogData.filter(blog => 
        (selectedCat === 'All' || blog.category === selectedCat) &&
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#FDFBF7] min-h-screen pb-20">
            <Helmet>
                <title>Blog | Aaramdehi - Home Decor & Comfort Tips</title>
                <meta name="description" content="Read our latest tips on cushions, pillows, and how to style your home for comfort." />
            </Helmet>

            {/* Header Section */}
            <div className="bg-white py-16 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 uppercase tracking-tighter">Aaramdehi Journal</h1>
                    <p className="text-gray-400 mt-4 text-sm tracking-[2px] uppercase font-bold">Comfort Redefined & Shared</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="relative w-full md:w-[400px]">
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-red-500 outline-none transition shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IoIosSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl" />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto">
                        {['All', 'Styling', 'Health', 'Maintenance'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCat(cat)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${selectedCat === cat ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                            <div className="relative overflow-hidden h-64">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-800">
                                    {blog.category}
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-400 text-[11px] font-bold mb-2 uppercase">{blog.date} | BY {blog.author}</p>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-red-600 transition">{blog.title}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{blog.excerpt}</p>
                                <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-800 border-b-2 border-red-600 pb-1 hover:text-red-600 transition">
                                    Read Article <IoIosArrowForward />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- BLOG DETAIL COMPONENT ---
export const BlogDetail = () => {
    const { slug } = useParams();
    const blog = blogData.find(b => b.slug === slug);

    if (!blog) return <div className="text-center py-20 font-bold">Article not found.</div>;

    return (
        <article className="bg-white min-h-screen">
            <Helmet>
                <title>{blog.title} | Aaramdehi Blog</title>
                <meta name="description" content={blog.excerpt} />
            </Helmet>

            {/* Post Header */}
            <header className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
                <span className="text-red-600 text-xs font-black uppercase tracking-[3px]">{blog.category}</span>
                <h1 className="text-3xl md:text-6xl font-bold text-gray-900 mt-6 mb-8 leading-tight">{blog.title}</h1>
                <div className="flex items-center justify-center gap-6 text-gray-400 text-xs font-bold uppercase border-y border-gray-100 py-4">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span>Written by {blog.author}</span>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 mb-16">
                <img src={blog.image} alt={blog.title} className="w-full h-[500px] object-cover rounded-3xl shadow-2xl" />
            </div>

            {/* Post Content */}
            <div className="max-w-3xl mx-auto px-4 prose prose-slate lg:prose-xl">
                <div 
                    className="text-gray-700 leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{ __html: blog.content }} 
                />
                
                {/* CTA Box */}
                <div className="mt-16 p-10 bg-[#FDFBF7] rounded-3xl border border-gray-100 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Upgrade Your Comfort</h3>
                    <p className="text-gray-500 mb-8">Discover our premium range of cushions and pillows today.</p>
                    <Link to="/" className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition shadow-xl">
                        Shop the Collection
                    </Link>
                </div>
            </div>
        </article>
    );
};