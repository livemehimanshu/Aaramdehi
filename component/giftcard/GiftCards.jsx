import React from 'react';

const GiftCards = () => {
    return (
        <div className="flex-1 bg-white ml-4 shadow-sm border border-gray-100 rounded-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Flipkart Gift Card</h2>
                <div className="flex gap-6 text-blue-600 text-sm font-bold">
                    <button className="hover:underline">Buy a Gift Card</button>
                    <button className="hover:underline">Check Gift Card Balance</button>
                </div>
            </div>
            <div className="p-8">
                <div className="flex items-center gap-4 text-blue-600 font-bold text-sm cursor-pointer mb-8">
                    <span className="text-xl">+</span> ADD A GIFT CARD
                </div>
                
                <h3 className="font-bold text-gray-800 mb-6">Buy a Flipkart Gift Card</h3>
                <div className="flex gap-10">
                    <div className="flex-1 space-y-4">
                        <input type="email" placeholder="Receiver's Email ID *" className="w-full border-b p-2 outline-none focus:border-blue-600" />
                        <input type="text" placeholder="Receiver's Name *" className="w-full border-b p-2 outline-none focus:border-blue-600" />
                        <div className="flex gap-4">
                            <select className="flex-1 border-b p-2 outline-none bg-transparent">
                                <option>Card Value in ₹</option>
                                <option>₹500</option>
                                <option>₹1000</option>
                            </select>
                            <input type="number" placeholder="No. of Cards" className="w-24 border-b p-2 outline-none" defaultValue="1" />
                        </div>
                        <input type="text" placeholder="Gifter's Name (Optional)" className="w-full border-b p-2 outline-none" />
                        <button className="bg-orange-500 text-white w-full py-4 font-bold rounded-sm mt-6 shadow-md uppercase">Buy Gift Card for ₹0</button>
                    </div>
                    <div className="w-80 bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden h-48">
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-xl italic tracking-widest">Aaramdehi</p>
                        </div>
                        <div className="mt-12">
                            <p className="text-xs opacity-80 uppercase">Gift Card Value</p>
                            <p className="text-3xl font-bold">₹0</p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftCards;