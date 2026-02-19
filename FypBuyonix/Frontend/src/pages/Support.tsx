import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaTicketAlt, FaPlus, FaArrowLeft, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface Message {
    sender: 'customer' | 'agent';
    text: string;
    time: string;
}

interface Ticket {
    id: string;
    subject: string;
    category: string;
    priority: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    date: string;
    messages: Message[];
}

const Support: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyText, setReplyText] = useState('');

    // New ticket form
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Other');
    const [priority, setPriority] = useState('Medium');
    const [message, setMessage] = useState('');

    // Get user info
    const getUserInfo = () => {
        const raw = localStorage.getItem('user') || localStorage.getItem('userInfo');
        if (raw) {
            try {
                const user = JSON.parse(raw);
                return {
                    id: user._id || user.id || user.googleId || '',
                    name: user.displayName || user.name || 'User',
                    email: user.email || ''
                };
            } catch { return null; }
        }
        return null;
    };

    const fetchTickets = async () => {
        const user = getUserInfo();
        if (!user || !user.id) { setLoading(false); return; }
        try {
            const res = await fetch(`http://localhost:5000/support/my-tickets?senderId=${user.id}&senderType=user`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setTickets(data.tickets);
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = getUserInfo();
        if (!user || !user.id) { alert('Please log in first'); return; }
        if (!subject.trim() || !message.trim()) { alert('Subject and message are required'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/support/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    senderType: 'user',
                    senderId: user.id,
                    senderName: user.name,
                    senderEmail: user.email,
                    subject, category, priority, message
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Ticket submitted successfully! ID: ' + data.ticket.id);
                setSubject(''); setCategory('Other'); setPriority('Medium'); setMessage('');
                setShowNewForm(false);
                fetchTickets();
            } else {
                alert(data.message || 'Error submitting ticket');
            }
        } catch (err) {
            alert('Error submitting ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        try {
            const res = await fetch(`http://localhost:5000/support/${selectedTicket}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: replyText, sender: 'customer' })
            });
            const data = await res.json();
            if (data.success) {
                setReplyText('');
                fetchTickets();
            }
        } catch (err) {
            console.error('Error replying:', err);
        }
    };

    const selectedData = tickets.find(t => t.id === selectedTicket);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Open': return <FaClock className="text-yellow-500" />;
            case 'In Progress': return <FaSpinner className="text-blue-500 animate-spin" />;
            case 'Resolved': return <FaCheckCircle className="text-green-500" />;
            default: return <FaClock className="text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-yellow-100 text-yellow-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-600';
            case 'Medium': return 'bg-orange-100 text-orange-600';
            case 'Low': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const user = getUserInfo();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
                        <p className="text-gray-600 mt-1">Submit a query or track your existing tickets</p>
                    </div>
                    {!showNewForm && (
                        <button
                            onClick={() => {
                                if (!user || !user.id) { alert('Please log in to submit a support ticket'); return; }
                                setShowNewForm(true);
                                setSelectedTicket(null);
                            }}
                            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg"
                        >
                            <FaPlus /> New Ticket
                        </button>
                    )}
                </div>

                {/* New Ticket Form */}
                {showNewForm && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Submit a New Ticket</h2>
                            <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
                                <FaArrowLeft /> Back to tickets
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Brief description of your issue"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                                    >
                                        <option value="Order Issue">Order Issue</option>
                                        <option value="Payment">Payment</option>
                                        <option value="Account">Account</option>
                                        <option value="Product">Product</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <div className="flex gap-3">
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${priority === p
                                                    ? p === 'High' ? 'bg-red-500 text-white' : p === 'Medium' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : <><FaPaperPlane /> Submit Ticket</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tickets Grid */}
                {!showNewForm && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Panel: Ticket List */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col" style={{ height: '550px' }}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex items-center gap-2">
                                <FaTicketAlt className="text-teal-600" />
                                <h2 className="text-lg font-bold text-gray-900">My Tickets ({tickets.length})</h2>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">Loading tickets...</div>
                                ) : !user || !user.id ? (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3">🔒</div>
                                        <p className="text-gray-600">Please log in to view your tickets</p>
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3">📭</div>
                                        <p className="text-gray-600 mb-3">No tickets yet</p>
                                        <button
                                            onClick={() => setShowNewForm(true)}
                                            className="text-teal-600 font-medium hover:underline text-sm"
                                        >
                                            Submit your first ticket
                                        </button>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket.id)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${selectedTicket === ticket.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.id}
                                                </h3>
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-1 line-clamp-1">{ticket.subject}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{ticket.date}</span>
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Conversation */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col" style={{ height: '550px' }}>
                            {selectedData ? (
                                <>
                                    {/* Ticket Header */}
                                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-sm font-bold text-gray-900">{selectedData.id} — {selectedData.subject}</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">{selectedData.category} • {selectedData.date}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(selectedData.priority)}`}>
                                                    {selectedData.priority}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedData.status)}`}>
                                                    {selectedData.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                        {selectedData.messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'customer'
                                                        ? 'bg-teal-500 text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-teal-100' : 'text-gray-400'}`}>
                                                        {msg.sender === 'customer' ? 'You' : '👤 Admin'} • {msg.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Box */}
                                    {selectedData.status !== 'Resolved' && (
                                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                                                    placeholder="Type your reply..."
                                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                                />
                                                <button
                                                    onClick={handleReply}
                                                    className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                                                >
                                                    <FaPaperPlane className="text-xs" /> Send
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl">
                                    <div className="text-center p-8">
                                        <div className="text-5xl mb-4">💬</div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a ticket</h3>
                                        <p className="text-gray-500 text-sm">Click on a ticket to view the conversation</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;
