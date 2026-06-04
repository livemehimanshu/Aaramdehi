import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getActiveCategoriesAPI } from '../../src/api/authAndAdminApi';

const CategoriesBar = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getActiveCategoriesAPI();
            
            if (response.success && response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            }
        } catch (error) {
            console.log('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/products?category=${categoryName}`);
    };

    if (loading) {
        return (
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-center items-center gap-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-20 h-20 rounded-xl bg-gray-200"></div>
                                <div className="h-3 bg-gray-200 rounded mt-2 w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-2">
                    {categories.map((category) => (
                        <button
                            key={category._id || category.id}
                            onClick={() => handleCategoryClick(category.name)}
                            className="flex flex-col items-center gap-2 group transition-all duration-300 cursor-pointer flex-shrink-0"
                        >
                            {/* Image Container - Shows actual category image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-gray-100 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-300 shadow-md overflow-hidden">
                                {category.icon && category.icon.startsWith('http') ? (
                                    <img 
                                        src={category.icon} 
                                        onError={(e) => { e.target.src = "https://placehold.co/80x80?text=📦"; }}
                                        alt={category.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <span className="text-4xl">{category.icon || '🎁'}</span>
                                )}
                            </div>

                            {/* Category Name */}
                            <span className="text-xs md:text-sm font-bold text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-300 whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis">
                                {category.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default CategoriesBar;
