import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRoomsAPI } from '../../../src/api/authAndAdminApi';
import { FiPlus, FiArrowRight } from 'react-icons/fi';

const RoomSection = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const res = await getAllRoomsAPI();
            if (res?.success) {
                setRooms(res.data);
            }
        };
        fetchRooms();
    }, []);

    if (rooms.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-16">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-600 block mb-3">Curated Spaces</span>
                <h2 className="text-3xl md:text-4xl font-serif text-[#1A365D] tracking-tight">Shop by Room</h2>
                <p className="text-gray-500 text-sm mt-3 font-medium tracking-wide">Discover furniture and decor for every corner of your home</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {rooms.map((room) => (
                    <Link key={room._id} to={`/shop-by-room/${room.slug}`} className="group block text-center">
                        <div className="relative overflow-hidden rounded-full aspect-square shadow-sm group-hover:shadow-2xl transition-all duration-700 mb-6">
                        <img 
                            src={room.image || 'https://placehold.co/600x600'} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            alt={room.name} 
                        />
                        
                        {/* Floating Icon Badge */}
                        <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/50 group-hover:bg-[#1a365d] group-hover:text-white transition-all duration-500 z-10">
                            <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                            <div className="bg-white text-[#1a365d] p-4 rounded-full shadow-xl">
                                <FiArrowRight size={24} />
                            </div>
                        </div>
                        </div>
                        
                        <h3 className="text-lg font-serif text-gray-800 group-hover:text-[#1a365d] transition-colors duration-300 tracking-tight">
                            {room.name}
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1 group-hover:text-blue-600 transition-colors">Explore Collection</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};
export default RoomSection;