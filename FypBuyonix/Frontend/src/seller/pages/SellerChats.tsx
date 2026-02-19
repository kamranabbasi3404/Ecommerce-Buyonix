import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import logo from "../../assets/logo.png";

interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderType: 'user' | 'seller';
    message: string;
    createdAt: string;
}

interface Conversation {
    _id: string;
    userId: string;
    sellerId: string;
    userName: string;
    sellerName: string;
    lastMessage: string;
    lastMessageAt: string;
    sellerUnread: number;
}

const SellerChats = () => {
    const navigate = useNavigate();
    const [sellerInfo, setSellerInfo] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get seller info
    useEffect(() => {
        const sellerData = localStorage.getItem('sellerInfo');
        if (sellerData) {
            setSellerInfo(JSON.parse(sellerData));
        } else {
            navigate('/become-seller');
        }
    }, [navigate]);

    // Initialize socket
    useEffect(() => {
        const newSocket = io('http://localhost:5000', { withCredentials: true });
        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, []);

    // Fetch conversations
    useEffect(() => {
        if (!sellerInfo?.id) return;

        const fetchConversations = async () => {
            try {
                const response = await fetch(`http://localhost:5000/chat/seller/${sellerInfo.id}`, {
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

        fetchConversations();
    }, [sellerInfo?.id]);

    // Fetch messages when conversation selected
    useEffect(() => {
        if (!selectedConvo || !socket) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5000/chat/messages/${selectedConvo._id}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }

                // Mark as read - fix URL and update local state
                await fetch(`http://localhost:5000/chat/read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        conversationId: selectedConvo._id,
                        readerType: 'seller'
                    })
                });

                // Update local conversation unread count
                setConversations(prev => prev.map(c =>
                    c._id === selectedConvo._id ? { ...c, sellerUnread: 0 } : c
                ));
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        socket.emit('join_room', selectedConvo._id);

        const handleNewMessage = (message: Message) => {
            if (message.conversationId === selectedConvo._id) {
                setMessages(prev => [...prev, message]);
            }
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.emit('leave_room', selectedConvo._id);
        };
    }, [selectedConvo, socket]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !socket || !selectedConvo || !sellerInfo) return;

        socket.emit('send_message', {
            conversationId: selectedConvo._id,
            senderId: sellerInfo.id,
            senderType: 'seller',
            message: newMessage.trim()
        });

        setNewMessage('');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg fixed top-0 left-0 h-screen overflow-y-auto">
                <div className="p-6 border-b">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="BUYONIX" className="h-10 w-10" />
                    </Link>
                </div>

                <nav className="p-4">
                    <div className="space-y-2">
                        <Link to="/seller-dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <span className="text-xl">📊</span>
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/seller-products" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <span className="text-xl">📦</span>
                            <span>Products</span>
                        </Link>
                        <Link to="/seller-orders" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <span className="text-xl">📋</span>
                            <span>Orders</span>
                        </Link>
                        <Link to="/seller-analytics" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <span className="text-xl">📈</span>
                            <span>Analytics</span>
                        </Link>
                        <Link to="/seller-payouts" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <span className="text-xl">💰</span>
                            <span>Payouts</span>
                        </Link>
                        <Link to="/seller-chats" className="flex items-center space-x-3 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium">
                            <span className="text-xl">💬</span>
                            <span>Chats</span>
                        </Link>
                    </div>
                </nav>

                <div className="absolute bottom-6 left-4 right-4 space-y-2">
                    <button
                        onClick={() => {
                            localStorage.removeItem('sellerInfo');
                            localStorage.removeItem('sellerId');
                            navigate('/become-seller');
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                    <Link to="/" className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300">
                        <span>←</span>
                        <span>Back to Shopping</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 ml-64">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Customer Chats</h1>
                    <p className="text-gray-600 mt-1">Respond to customer inquiries</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-12rem)] flex">
                    {/* Conversations List */}
                    <div className="w-80 border-r border-gray-200 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-5xl mb-3">💬</div>
                                <p className="text-gray-500">No conversations yet</p>
                                <p className="text-gray-400 text-sm mt-1">Customers will appear here when they message you</p>
                            </div>
                        ) : (
                            conversations.map(convo => (
                                <div
                                    key={convo._id}
                                    onClick={() => setSelectedConvo(convo)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConvo?._id === convo._id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                                            {convo.userName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">{convo.userName}</span>
                                                {convo.sellerUnread > 0 && (
                                                    <span className="w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center">
                                                        {convo.sellerUnread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{convo.lastMessage || 'No messages'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConvo ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                                            {selectedConvo.userName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{selectedConvo.userName}</h3>
                                            <p className="text-xs text-gray-500">Customer</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map(msg => (
                                        <div key={msg._id} className={`flex ${msg.senderType === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderType === 'seller' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${msg.senderType === 'seller' ? 'text-teal-200' : 'text-gray-400'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <button
                                            onClick={handleSend}
                                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">💬</div>
                                    <p className="text-gray-500">Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerChats;
