import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoIosArrowForward, IoIosSearch } from "react-icons/io";
import { FiClock, FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { getAllBlogsAPI, getBlogByIdOrSlugAPI } from '../../../src/api/authAndAdminApi';

// Helper to calculate reading time
const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute;
    const readTime = Math.ceil(minutes);
    return `${readTime} Min Read`;
};

// --- BLOG LISTING COMPONENT ---
export const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await getAllBlogsAPI(); // By default fetches published only
                if (res.success) {
                    setBlogs(res.data);
                }
            } catch (err) {
                console.error("Error fetching blogs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Get unique categories from blogs
    const categories = ['All', ...new Set(blogs.map(b => b.category).filter(Boolean))];

    const filteredBlogs = blogs.filter(blog => 
        (selectedCat === 'All' || blog.category === selectedCat) &&
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#FDFBF7] min-h-screen pb-20">
            <Helmet>
                <title>Aaramdehi Journal | Comfort & Decor Blog</title>
                <meta name="description" content="Read our latest tips on cushions, pillows, home decor styling, and how to maximize your comfort with Aaramdehi." />
                <link rel="canonical" href="https://www.aaramdehi.co.in/blog" />
            </Helmet>

            {/* Header Section */}
            <div className="bg-white py-20 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A365D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="text-red-600 font-bold tracking-[4px] text-xs uppercase mb-4 block">The Journal</span>
                    <h1 className="text-4xl md:text-6xl font-black text-blue-900 uppercase tracking-tighter">Stories of Comfort</h1>
                    <p className="text-gray-500 mt-6 text-sm tracking-[1px] max-w-2xl mx-auto leading-relaxed">
                        Discover the art of relaxation. Expert tips on orthopedic support, styling your space, and choosing the perfect comfort essentials.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 max-w-7xl">
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
                    <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => { setSelectedCat(cat); setVisibleCount(6); }}
                                className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCat === cat ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-[350px]">
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-sm border-none focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IoIosSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-3xl h-[450px]"></div>
                        ))}
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-2xl font-bold mb-2">No articles found.</p>
                        <p>Try adjusting your search or category.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {filteredBlogs.slice(0, visibleCount).map(blog => (
                                <div key={blog._id} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                                    <Link to={`/blog/${blog.slug}`} className="relative overflow-hidden h-64 md:h-72 block">
                                        {blog.image ? (
                                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200">No Image</div>
                                        )}
                                        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-blue-900 tracking-wider shadow-sm">
                                            {blog.category}
                                        </div>
                                    </Link>
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                            <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-1"><FiClock /> {calculateReadingTime(DOMPurify.sanitize(blog.content, { ALLOWED_TAGS: [] }))}</span>
                                        </div>
                                        <Link to={`/blog/${blog.slug}`}>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors">{blog.title}</h2>
                                        </Link>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{blog.excerpt}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs uppercase">
                                                    {blog.author.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{blog.author}</span>
                                            </div>
                                            <Link to={`/blog/${blog.slug}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <IoIosArrowForward />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {visibleCount < filteredBlogs.length && (
                            <div className="text-center mt-16">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-10 py-4 bg-white border border-gray-200 text-blue-900 text-sm font-black uppercase tracking-widest rounded-full hover:bg-gray-50 transition-all hover:shadow-lg"
                                >
                                    Load More Articles
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Newsletter Section */}
            <div className="container mx-auto px-4 mt-32 max-w-5xl">
                <div className="bg-blue-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Stay Comfortably Informed</h3>
                        <p className="text-blue-100 mb-10 max-w-xl mx-auto">Subscribe to our newsletter for exclusive home styling tips, ergonomic advice, and early access to Aaramdehi product launches.</p>
                        <form className="max-w-md mx-auto flex flex-col md:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                            <input type="email" placeholder="Enter your email address" required className="flex-1 px-6 py-4 rounded-full border-none outline-none text-sm font-medium focus:ring-4 focus:ring-blue-700 transition-shadow" />
                            <button type="submit" className="px-8 py-4 bg-red-600 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors">Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- BLOG DETAIL COMPONENT ---
export const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlogByIdOrSlugAPI(slug);
                if (res.success && res.data) {
                    setBlog(res.data);
                } else {
                    navigate('/not-found');
                }
            } catch (err) {
                console.error("Error", err);
                navigate('/not-found');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug, navigate]);

    // Generate Table of Contents from HTML content using useMemo
    const toc = useMemo(() => {
        if (!blog?.content) return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(blog.content, 'text/html');
        const headings = doc.querySelectorAll('h2, h3');
        const tocItems = [];
        headings.forEach((h, index) => {
            const id = `heading-${index}`;
            // Add ID to the actual DOM string will be hard without re-parsing, 
            // so we will just use it for display or basic anchor jumps if we inject IDs.
            tocItems.push({
                id,
                text: h.textContent,
                level: h.tagName.toLowerCase() === 'h2' ? 2 : 3
            });
        });
        return tocItems;
    }, [blog]);

    // Inject IDs into content for TOC scrolling
    const modifiedContent = useMemo(() => {
        if (!blog?.content) return '';
        let content = blog.content;
        toc.forEach(item => {
            // Very simple replacement, ideally done properly with DOM parser
            content = content.replace(`<h2>${item.text}</h2>`, `<h2 id="${item.id}" class="scroll-mt-32">${item.text}</h2>`);
            content = content.replace(`<h3>${item.text}</h3>`, `<h3 id="${item.id}" class="scroll-mt-32">${item.text}</h3>`);
        });
        return DOMPurify.sanitize(content);
    }, [blog, toc]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <div className="animate-pulse">
                    <div className="w-1/2 h-10 bg-gray-200 mx-auto rounded-lg mb-8"></div>
                    <div className="w-full h-[500px] bg-gray-100 rounded-3xl max-w-5xl mx-auto mb-10"></div>
                    <div className="w-2/3 h-6 bg-gray-100 mx-auto rounded mb-4"></div>
                </div>
            </div>
        );
    }

    if (!blog) return null;

    const readTime = calculateReadingTime(DOMPurify.sanitize(blog.content, { ALLOWED_TAGS: [] }));
    const publishDate = new Date(blog.publishedAt || blog.createdAt).toISOString();
    const currentUrl = window.location.href;

    return (
        <article className="bg-white min-h-screen pb-20">
            {/* Enterprise SEO Injection */}
            <Helmet>
                <title>{blog.metaTitle || blog.title} | Aaramdehi Blog</title>
                <meta name="description" content={blog.metaDescription || blog.excerpt} />
                {blog.metaKeywords && <meta name="keywords" content={blog.metaKeywords} />}
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={blog.metaTitle || blog.title} />
                <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
                <meta property="og:image" content={blog.image} />
                <meta property="og:url" content={currentUrl} />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blog.metaTitle || blog.title} />
                <meta name="twitter:description" content={blog.metaDescription || blog.excerpt} />
                <meta name="twitter:image" content={blog.image} />

                <link rel="canonical" href={currentUrl} />

                {/* Article JSON-LD Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": currentUrl
                        },
                        "headline": blog.metaTitle || blog.title,
                        "description": blog.metaDescription || blog.excerpt,
                        "image": blog.image,
                        "author": {
                            "@type": "Person",
                            "name": blog.author
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Aaramdehi",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.aaramdehi.co.in/logo.png"
                            }
                        },
                        "datePublished": publishDate,
                        "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : publishDate
                    })}
                </script>
            </Helmet>

            {/* Post Header */}
            <header className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
                <Link to="/blog" className="text-gray-400 hover:text-blue-600 text-xs font-black uppercase tracking-widest transition-colors mb-8 inline-block">
                    &larr; Back to Journal
                </Link>
                <br/>
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    {blog.category}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-blue-900 mb-8 leading-tight tracking-tighter">
                    {blog.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center">
                            {blog.author.charAt(0)}
                        </div>
                        <span className="text-gray-800">By {blog.author}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-red-500"><FiClock /> {readTime}</span>
                </div>
            </header>

            {/* Hero Image */}
            {blog.image && (
                <div className="max-w-[1200px] mx-auto px-4 mb-16">
                    <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <img src={blog.image} alt={blog.title} className="w-full h-[400px] md:h-[600px] object-cover" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
            )}

            {/* Main Content Layout (Sidebar + Content) */}
            <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-12 lg:gap-20">
                
                {/* Left Sidebar: Social Sharing & Details (Sticky) */}
                <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1 hidden md:block">
                    <div className="sticky top-32 space-y-10">
                        {/* Share Links */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Share Article</p>
                            <div className="flex flex-col gap-3">
                                <a href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] text-gray-600 transition-all group">
                                    <FiTwitter className="group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Twitter</span>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#4267B2] hover:text-white hover:border-[#4267B2] text-gray-600 transition-all group">
                                    <FiFacebook className="group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Facebook</span>
                                </a>
                                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title + " " + currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] text-gray-600 transition-all group">
                                    <FaWhatsapp className="group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">WhatsApp</span>
                                </a>
                                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] text-gray-600 transition-all group">
                                    <FiLinkedin className="group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">LinkedIn</span>
                                </a>
                            </div>
                        </div>

                        {/* TOC */}
                        {toc.length > 0 && (
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">In this article</p>
                                <ul className="space-y-3">
                                    {toc.map(item => (
                                        <li key={item.id} className={`${item.level === 3 ? 'ml-4' : ''}`}>
                                            <a href={`#${item.id}`} className="text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                                                {item.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Article Content */}
                <div className="flex-1 order-1 lg:order-2">
                    {/* Mobile Share (Top) */}
                    <div className="flex items-center gap-4 mb-8 md:hidden pb-8 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest"><FiShare2 className="inline mr-1" /> Share:</span>
                        <div className="flex gap-4">
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title + " " + currentUrl)}`} className="text-gray-400 hover:text-[#25D366]"><FaWhatsapp size={20} /></a>
                            <a href={`https://twitter.com/intent/tweet?url=${currentUrl}`} className="text-gray-400 hover:text-[#1DA1F2]"><FiTwitter size={20} /></a>
                        </div>
                    </div>

                    {/* Prose Content */}
                    <div 
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:text-blue-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-red-600 prose-img:rounded-2xl prose-img:shadow-lg prose-p:leading-relaxed prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: modifiedContent }} 
                    />

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Tags:</span>
                            {blog.tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Newsletter Injection inside Article Page */}
            <div className="max-w-4xl mx-auto px-4 mt-24">
                <div className="bg-[#FDFBF7] border border-[#F0EBE1] rounded-[2rem] p-8 md:p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-900 mb-6">
                        <FiMail size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-blue-900 mb-2">Did you find this helpful?</h3>
                    <p className="text-gray-500 mb-8 max-w-md text-sm">Join our community of comfort-seekers and get the latest articles delivered straight to your inbox.</p>
                    <form className="w-full max-w-sm flex gap-2" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Your email address" required className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm" />
                        <button type="submit" className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors">Subscribe</button>
                    </form>
                </div>
            </div>
        </article>
    );
};