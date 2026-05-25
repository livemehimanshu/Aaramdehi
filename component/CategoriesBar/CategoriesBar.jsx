import React from 'react';
import { 
    IoHeartOutline, 
    IoBedOutline, 
    IoAppsOutline, 
    IoCheckmarkCircleOutline,
    IoShirtOutline
} from "react-icons/io5";
import { Link } from 'react-router-dom';

const CategoriesBar = () => {
    const categories = [
        { id: 1, name: 'Mattress', icon: IoBedOutline, path: '/category/mattress' },
        { id: 2, name: 'Pillows', icon: IoHeartOutline, path: '/category/pillows' },
        { id: 3, name: 'Cushions', icon: IoAppsOutline, path: '/category/cushions' },
        { id: 4, name: 'Bedsheets', icon: IoCheckmarkCircleOutline, path: '/category/bedsheets' },
        { id: 5, name: 'Wellness', icon: IoShirtOutline, path: '/category/wellness' },
    ];

    return (
        <section className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={category.path}
                                className="flex flex-col items-center gap-2 group transition-all duration-300 cursor-pointer flex-shrink-0"
                            >
                                {/* Circular Icon Container */}
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-100 group-hover:bg-red-50 group-hover:border-red-300 transition-all duration-300 shadow-sm">
                                    <IconComponent 
                                        size={32} 
                                        className="text-gray-600 group-hover:text-red-500 transition-colors duration-300"
                                    />
                                </div>

                                {/* Category Text */}
                                <span className="text-xs md:text-sm font-bold text-gray-700 text-center group-hover:text-red-500 transition-colors duration-300 whitespace-nowrap">
                                    {category.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default CategoriesBar;
