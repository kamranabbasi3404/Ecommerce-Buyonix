import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaSave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

interface UserInfo {
    id?: string;
    displayName?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
}

export default function Settings() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [saved, setSaved] = useState(false);
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: true,
        chatMessages: true,
    });

    useEffect(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                const info = JSON.parse(userInfoStr);
                setUser(info);
                setDisplayName(info.displayName || '');
                setPhone(info.phone || '');
            } catch { /* ignore */ }
        }

        // Load notification preferences
        const notifStr = localStorage.getItem('buyonix_notif_prefs');
        if (notifStr) {
            try { setNotifications(JSON.parse(notifStr)); } catch { /* ignore */ }
        }
    }, []);

    const handleSaveProfile = () => {
        if (!user) return;
        const updated = { ...user, displayName, phone };
        localStorage.setItem('userInfo', JSON.stringify(updated));
        setUser(updated);

        // Dispatch event so navbar picks up the change
        window.dispatchEvent(new Event('authStatusChanged'));

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleToggleNotif = (key: keyof typeof notifications) => {
        const updated = { ...notifications, [key]: !notifications[key] };
        setNotifications(updated);
        localStorage.setItem('buyonix_notif_prefs', JSON.stringify(updated));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h2>
                    <p className="text-gray-600 mb-6">Please login to access settings.</p>
                    <Link to="/login" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <FaArrowLeft className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500 mt-0.5">Manage your account preferences</p>
                    </div>
                </div>

                {/* Success Banner */}
                {saved && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 animate-pulse">
                        <FaCheckCircle /> Profile updated successfully!
                    </div>
                )}

                {/* Profile Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Edit Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-gray-900"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-gray-900"
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                        >
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Notification Preferences</h2>
                    <div className="space-y-4">
                        {[
                            { key: 'orderUpdates' as const, label: 'Order Updates', desc: 'Get notified about your order status changes' },
                            { key: 'promotions' as const, label: 'Promotions & Deals', desc: 'Receive exclusive offers and discounts' },
                            { key: 'chatMessages' as const, label: 'Chat Messages', desc: 'Get notified when sellers reply to your messages' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggleNotif(item.key)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${notifications[item.key] ? 'bg-teal-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Account</h2>
                    <div className="space-y-3">
                        <Link
                            to="/support"
                            className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors"
                        >
                            🎧 Contact Customer Support
                        </Link>
                        <Link
                            to="/faqs"
                            className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors"
                        >
                            ❓ FAQs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
