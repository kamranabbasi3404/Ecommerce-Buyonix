import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaArrowLeft, FaStore } from 'react-icons/fa';
import ChatWidget from '../components/ChatWidget';

interface Conversation {
    _id: string;
    userId: string;
    sellerId: string;
    userName: string;
    sellerName: string;
    lastMessage: string;
    lastMessageAt: string;
    userUnread: number;
}

const AllChats = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');

    // Get user info
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                setUserId(user._id || user.id || '');
                setUserName(user.name || user.email?.split('@')[0] || 'User');
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:5000/chat/user/${userId}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setConversations(data.conversations);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchConversations();
        }
    }, [userId]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Please login to view your chats</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-teal-600 hover:text-teal-700">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div className="flex items-center gap-2">
                        <FaComments className="text-teal-600 text-xl" />
                        <h1 className="text-xl font-bold text-gray-900">My Chats</h1>
                    </div>
                </div>
            </div>

            {/* Chat List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading chats...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <FaComments className="text-6xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No conversations yet</p>
                        <p className="text-gray-400 text-sm mt-1">Start chatting with sellers on product pages!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={async () => {
                                    setSelectedChat(conv);
                                    // Mark as read when chat is opened
                                    if (conv.userUnread > 0) {
                                        try {
                                            await fetch('http://localhost:5000/chat/read', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                credentials: 'include',
                                                body: JSON.stringify({
                                                    conversationId: conv._id,
                                                    readerType: 'user'
                                                })
                                            });
                                            // Update local unread count
                                            setConversations(prev => prev.map(c =>
                                                c._id === conv._id ? { ...c, userUnread: 0 } : c
                                            ));
                                        } catch (error) {
                                            console.error('Error marking as read:', error);
                                        }
                                    }
                                }}
                                className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                    <FaStore className="text-teal-600 text-lg" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">{conv.sellerName}</h3>
                                        <span className="text-xs text-gray-400">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                                </div>
                                {conv.userUnread > 0 && (
                                    <div className="w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center">
                                        {conv.userUnread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Widget */}
            {selectedChat && (
                <ChatWidget
                    sellerId={selectedChat.sellerId}
                    sellerName={selectedChat.sellerName}
                    userId={userId}
                    userName={userName}
                    onClose={() => setSelectedChat(null)}
                />
            )}
        </div>
    );
};

export default AllChats;
