import React, { useEffect } from 'react';
import { getDatabase, ref, onChildAdded, query, limitToLast } from "firebase/database";
import { initializeApp } from "firebase/app";
import { toast } from "react-hot-toast"; // Ya koi aur notification library
import { Package } from "lucide-react";

// Frontend client-side config (Aapke .env se aayegi)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const OrderNotificationListener = () => {
    useEffect(() => {
        // Notification sound (Use a short clean alert sound)
        const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

        const ordersRef = ref(db, 'orders');
        const latestOrderQuery = query(ordersRef, limitToLast(1));

        let initialLoad = true;

        const unsubscribe = onChildAdded(latestOrderQuery, (snapshot) => {
            // Initial load par notification nahi dikhani, sirf naye orders par
            if (initialLoad) {
                initialLoad = false;
                return;
            }

            const newOrder = snapshot.val();
            
            // Play Sound
            notificationSound.play().catch(e => console.log("Sound error:", e));

            // Show Toast Popup
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-emerald-500`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Package className="h-10 w-10 text-emerald-500 bg-emerald-50 p-2 rounded-full" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">New Order Received!</p>
                                <p className="mt-1 text-xs text-gray-500">Order #{newOrder.orderNumber} for ₹${newOrder.totalAmount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 5000, position: 'top-right' });
        });

        return () => unsubscribe();
    }, []);

    return null; // Invisible component
};

export default OrderNotificationListener;