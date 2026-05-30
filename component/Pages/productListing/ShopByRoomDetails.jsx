import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../src/utils/authUtils';
import ProductListing from './index'; // Re-use existing listing logic
import { Loader2 } from 'lucide-react';

const ShopByRoomDetails = () => {
    const { slug } = useParams();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/room/${slug}`);
                if (res.data.success) setRoom(res.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchRoomDetails();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-900 mb-4" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Setting up the room...</p>
        </div>
    );

    if (!room) return <div className="p-20 text-center uppercase font-black">Room not found</div>;

    return (
        <div className="min-h-screen bg-[#f4f7f9] mt-20">
            {/* Lookbook Banner */}
            <div className="relative h-[400px] md:h-[600px] overflow-hidden">
                <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">{room.name}</h1>
                        <p className="text-white/80 font-bold uppercase tracking-widest text-xs md:text-sm">{room.description || `Beautiful collections curated for your ${room.name.toLowerCase()}`}</p>
                    </div>
                </div>
            </div>

            {/* Products Section - Reusing ProductListing logic with filtered category */}
            <div className="container mx-auto py-12">
                <div className="flex items-center gap-4 mb-10 px-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <h2 className="text-xl font-black text-blue-900 uppercase tracking-widest">Featured in {room.name}</h2>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>
                
                {/* 
                    Yahan hum aapka existing ProductListing component call kar sakte hain 
                    bas ise overrideCategory prop deni hogi ya iska internal state update karna hoga.
                */}
                <ProductListing forcedCategory={room.categorySlug} />
            </div>
        </div>
    );
};
export default ShopByRoomDetails;