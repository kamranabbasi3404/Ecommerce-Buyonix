import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaShoppingBag, FaHeart, FaComments, FaHeadset, FaEdit, FaArrowLeft } from 'react-icons/fa';

interface UserInfo {
    id?: string;
    displayName?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
}

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                setUser(JSON.parse(userInfoStr));
            } catch { /* ignore */ }
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h2>
                    <p className="text-gray-600 mb-6">Please login to view your profile.</p>
                    <Link to="/login" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const initials = user.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const quickLinks = [
        { icon: FaShoppingBag, label: 'My Orders', to: '/orders', color: 'bg-blue-50 text-blue-600' },
        { icon: FaHeart, label: 'My Wishlist', to: '/wishlist', color: 'bg-pink-50 text-pink-600' },
        { icon: FaComments, label: 'My Chats', to: '/chats', color: 'bg-purple-50 text-purple-600' },
        { icon: FaHeadset, label: 'Customer Support', to: '/support', color: 'bg-teal-50 text-teal-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors"
                >
                    <FaArrowLeft /> Back
                </button>
                {/* Header Card */}
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white mb-6 shadow-lg">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user.displayName}</h1>
                            <p className="text-teal-100 mt-1">{user.email}</p>
                            <p className="text-teal-200 text-sm mt-1">
                                <FaCalendarAlt className="inline mr-1" /> Member since {memberSince}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                        <Link to="/settings" className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium">
                            <FaEdit /> Edit
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <FaUser className="text-gray-400 text-lg" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                                <p className="text-gray-900 font-medium">{user.displayName || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <FaEnvelope className="text-gray-400 text-lg" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                <p className="text-gray-900 font-medium">{user.email || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <FaPhone className="text-gray-400 text-lg" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                                <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
                            >
                                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center`}>
                                    <link.icon className="text-lg" />
                                </div>
                                <span className="font-medium text-gray-700">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
