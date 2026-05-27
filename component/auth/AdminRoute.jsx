import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminDetailsAPI } from '@/api/authAndAdminApi'; 

const AdminRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // loading, authorized, unauthorized

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // ✅ Backend se admin details fetch karein
                const response = await getAdminDetailsAPI(); 

                if (response.success && response.user.role.toUpperCase() === 'ADMIN') {
                    setStatus('authorized');
                } else {
                    console.error("⛔ Unauthorized: User is not an ADMIN or session invalid.");
                    setStatus('unauthorized');
                }
            } catch (error) {
                console.error("❌ Admin verification failed:", error.response?.data?.message || error.message);
                setStatus('unauthorized');
            }
        };
        checkAuth();
    }, []);

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center font-bold text-red-500 text-2xl">🛡️ Verifying Admin Credentials...</div>;
    }

    if (status === 'unauthorized') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;