import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllRoomsAPI, getAllProductsAPI, getAllCategoriesAPI } from '../../../src/api/authAndAdminApi';
import ProductCard from '../../slider/ProductCard';
import { FiChevronRight, FiGrid, FiInfo } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

const RoomProductsPage = () => {
    const { slug } = useParams();
    const [room, setRoom] = useState(null);
    const [products, setProducts] = useState([]);
    const [isCurated, setIsCurated] = useState(false); // ✅ Type track karne ke liye
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Room Metadata and Categories simultaneously
                const [roomsRes, catsRes] = await Promise.all([
                    getAllRoomsAPI(),
                    getAllCategoriesAPI()
                ]);

                // ✅ Case-insensitive and trimmed slug matching
                const foundRoom = roomsRes.data?.find(r => 
                    String(r.slug).trim().toLowerCase() === String(slug).trim().toLowerCase()
                );
                
                // Metadata set karein
                setRoom(foundRoom || { name: slug.replace(/-/g, ' '), categorySlug: slug, description: "Explore this curated collection." });

                // ✅ Parse curated products safely (handles both Array and JSON string from DB)
                let productIds = foundRoom?.products || [];
                if (typeof productIds === 'string') {
                    try { productIds = JSON.parse(productIds); } catch (e) { productIds = []; }
                }

                let productsRes;
                // ✅ New Logic: Check if specific products are curated for this room
                if (foundRoom && productIds.length > 0) {
                    // Fetch only those specific products selected in Admin
                    // Note: 'ids' param backend controller mein handle hona chahiye
                    console.log(`🎯 Room "${slug}": Fetching ${productIds.length} Curated Products.`);
                    productsRes = await getAllProductsAPI({ ids: productIds.join(','), limit: 100 });
                    setIsCurated(true);
                } else {
                    // ✅ SMART FALLBACK: Resolve Slug to actual Category Name
                    const targetSlug = foundRoom?.categorySlug || slug;
                    const categoryObj = catsRes.data?.find(c => c.slug === targetSlug);
                    const categoryToFilter = categoryObj ? categoryObj.name : targetSlug;

                    console.log(`🔍 Curated list empty, falling back to Category: "${categoryToFilter}"`);
                    productsRes = await getAllProductsAPI({ category: categoryToFilter, limit: 50 });
                    setIsCurated(false);
                }
                
                // Ensure results match the category/IDs filter strictly
                setProducts(productsRes?.data || productsRes?.products || []);
            } catch (err) {
                console.error("Error fetching room products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d]"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Curating your space...</p>
        </div>
    );

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Link to="/" className="hover:text-blue-900 transition-colors">Home</Link>
                    <FiChevronRight />
                    <span className="text-blue-900">Shop by Room</span>
                    <FiChevronRight />
                    <span className="text-blue-900 opacity-50">{room?.name}</span>
                </div>
            </div>

            {/* Header / Room Banner */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="relative rounded-[40px] overflow-hidden bg-[#1a365d] text-white p-8 md:p-16 shadow-2xl">
                    {room?.image && (
                        <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                    <div className="relative z-10 max-w-3xl">
                        {isCurated && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">Curated Gallery</span>
                        )}
                        <h1 className="text-4xl md:text-6xl font-serif tracking-tight mb-4 capitalize">
                            {room?.name} {isCurated ? 'Essentials' : 'Collection'}
                        </h1>
                        <p className="text-sm md:text-lg text-white/80 font-medium leading-relaxed">
                            {room?.description || `Explore our curated selection of premium essentials for your ${room?.name}. Handpicked for comfort and style.`}
                        </p>
                    </div>
                    <div className="absolute bottom-8 right-8 hidden md:block">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                            <FiGrid className="text-xl" />
                            <span className="font-bold text-xs uppercase tracking-widest">{products.length} Products Found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((item) => (
                            <div key={item._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ProductCard product={item} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiInfo size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Products in this Room Yet</h3>
                        <p className="text-gray-500 text-sm mb-8">Check back soon or explore our other collections.</p>
                        <Link to="/products" className="bg-[#1a365d] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomProductsPage;