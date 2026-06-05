import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../src/utils/authUtils';

const RoomSection = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get('/room'); 
                if (res.data.success) setRooms(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchRooms();
    }, []);

    if (rooms.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black text-blue-900 uppercase tracking-tighter">Shop by Room</h2>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Find the perfect comfort for every corner</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                    <Link key={room._id} to={`/shop-by-room/${room.slug}`} className="group relative overflow-hidden rounded-[40px] aspect-[4/5] shadow-xl">
                        <img 
                            src={room.image || 'https://placehold.co/600x800'} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={room.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                        <div className="absolute bottom-10 left-10 text-white">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{room.name}</h3>
                            <span className="inline-block bg-white text-blue-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                Explore Room
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
export default RoomSection;