import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa';

interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderType: 'user' | 'seller';
    message: string;
    createdAt: string;
}

interface ChatWidgetProps {
    sellerId: string;
    sellerName: string;
    userId: string;
    userName: string;
    onClose: () => void;
}

const ChatWidget = ({ sellerId, sellerName, userId, userName, onClose }: ChatWidgetProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Connect to socket
    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            withCredentials: true
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Get or create conversation
    useEffect(() => {
        const initConversation = async () => {
            try {
                const response = await fetch('http://localhost:5000/chat/conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ userId, sellerId, userName, sellerName })
                });

                const data = await response.json();
                if (data.success) {
                    setConversationId(data.conversation._id);
                }
            } catch (error) {
                console.error('Error creating conversation:', error);
            }
        };

        if (userId && sellerId) {
            initConversation();
        }
    }, [userId, sellerId, userName, sellerName]);

    // Join room and fetch messages
    useEffect(() => {
        if (!conversationId || !socket) return;

        socket.emit('join_room', conversationId);

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5000/chat/messages/${conversationId}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Mark as read
        fetch('http://localhost:5000/chat/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ conversationId, readerType: 'user' })
        });

        // Listen for new messages
        socket.on('receive_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.emit('leave_room', conversationId);
            socket.off('receive_message');
        };
    }, [conversationId, socket]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !conversationId || !socket) return;

        socket.emit('send_message', {
            conversationId,
            senderId: userId,
            senderType: 'user',
            message: newMessage.trim()
        });

        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
            {/* Header */}
            <div className="bg-teal-600 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaComments />
                    <div>
                        <p className="font-semibold text-sm">{sellerName}</p>
                        <p className="text-xs opacity-80">Seller</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-teal-700 p-1 rounded">
                    <FaTimes />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {loading ? (
                    <div className="text-center text-gray-500 py-4">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start a conversation with the seller!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${msg.senderType === 'user'
                                    ? 'bg-teal-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                    }`}
                            >
                                <p>{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
