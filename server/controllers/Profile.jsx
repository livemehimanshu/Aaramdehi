import React, { useState, useEffect } from 'react';
import { IoPersonOutline, IoMailOutline, IoCallOutline, IoShieldCheckmarkOutline, IoSaveOutline, IoCloseOutline } from "react-icons/io5";
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', mobile: '' });

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setEditData({ 
                name: parsed.name || '', 
                mobile: parsed.mobile || '' 
            });
        }
    }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/upload-avatar`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedUser = { ...user, avatar: response.data.data.avatar };
                setUser(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                toast.success("Profile picture updated!");
                window.dispatchEvent(new Event("userDataUpdated"));
            }
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!editData.name) return toast.error("Name cannot be empty");
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/update`, editData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                const updatedUser = { ...user, ...editData };
                setUser(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                window.dispatchEvent(new Event("userDataUpdated"));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Loading profile...</div>;

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 h-32 md:h-48"></div>
                <div className="px-6 pb-10">
                    <div className="relative -mt-16 mb-6 flex justify-center md:justify-start">
                        <div className="relative group">
                            <img 
                                src={user.avatar || 'https://via.placeholder.com/150'} 
                                alt="Profile" 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover bg-gray-100"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                <input type="file" className="hidden" onChange={handleAvatarChange} disabled={loading} />
                                <span className="text-white text-xs font-bold">{loading ? 'Uploading...' : 'Change Photo'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">{isEditing ? editData.name : user.name}</h2>
                            <p className="text-gray-500 flex items-center gap-2 mb-6">
                                <IoShieldCheckmarkOutline className="text-green-500" /> 
                                Verified {user.role}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <IoMailOutline className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email Address</p>
                                        <p className="text-sm font-medium text-gray-700">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <IoCallOutline className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Mobile Number</p>
                                        <p className="text-sm font-medium text-gray-700">{user.mobile || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 text-lg">Account Settings</h3>
                            <p className="text-blue-700/70 text-sm mb-6">Manage your security and preferences from here.</p>
                            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition shadow-sm mb-3">
                                Edit Personal Info
                            </button>
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;