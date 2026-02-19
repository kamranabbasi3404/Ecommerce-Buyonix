import React, { useEffect, useState } from 'react';

interface TicketMessage {
  sender: 'customer' | 'agent';
  text: string;
  time: string;
}

interface Ticket {
  id: string;
  issue: string;
  customer: string;
  email?: string;
  senderType: 'user' | 'seller';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  category: string;
  date: string;
  messages: TicketMessage[];
}

const CustomerSupport: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'user' | 'seller'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'In Progress' | 'Resolved'>('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterType, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('senderType', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const res = await fetch(`http://localhost:5000/support/queries?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) { setTickets([]); return; }
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Support fetch error', err);
      setError('Unable to fetch support queries');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const res = await fetch(`http://localhost:5000/support/${selectedTicket}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: replyText, sender: 'agent' })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchTickets();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/support/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) fetchTickets();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const selectedTicketData = tickets.find(ticket => ticket.id === selectedTicket);

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-600';
      case 'Medium': return 'bg-orange-100 text-orange-600';
      case 'Low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSenderBadge = (type: string) => {
    return type === 'seller'
      ? 'bg-purple-100 text-purple-600'
      : 'bg-sky-100 text-sky-600';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Support</h1>
        <p className="text-base text-gray-600">
          Manage support tickets from users and sellers
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Type Filters */}
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'user', 'seller'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filterType === type
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {type === 'all' ? '📋 All' : type === 'user' ? '👤 Users' : '🏪 Sellers'}
            </button>
          ))}
        </div>
        {/* Status Filters */}
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'Open', 'In Progress', 'Resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${filterStatus === status
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm text-gray-500 flex items-center">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Support Tickets */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-2 flex flex-col h-[500px] border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-gray-50 rounded-t-2xl">
            <h2 className="text-lg font-bold text-gray-900">Support Tickets</h2>
          </div>
          <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading tickets...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : tickets.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No support queries found.</div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`p-4 cursor-pointer transition-all duration-150 hover:bg-gray-50 ${selectedTicket === ticket.id ? 'bg-teal-50 border-r-4 border-teal-500' : ''
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {ticket.id}
                      <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-full ${getSenderBadge(ticket.senderType)}`}>
                        {ticket.senderType === 'seller' ? 'Seller' : 'User'}
                      </span>
                    </h3>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2 line-clamp-1">{ticket.issue}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{ticket.customer}</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{ticket.date}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Ticket Conversation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-3 flex flex-col h-[500px] border border-gray-100">
          {selectedTicketData ? (
            <>
              <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-gray-50 rounded-t-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {selectedTicketData.id} • {selectedTicketData.customer}
                      <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-full ${getSenderBadge(selectedTicketData.senderType)}`}>
                        {selectedTicketData.senderType === 'seller' ? '🏪 Seller' : '👤 User'}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedTicketData.category} • {selectedTicketData.date}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityBadgeClass(selectedTicketData.priority)}`}>
                      {selectedTicketData.priority}
                    </span>
                    <select
                      value={selectedTicketData.status}
                      onChange={e => handleStatusChange(selectedTicketData.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${getStatusBadgeClass(selectedTicketData.status)}`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
                {selectedTicketData.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${message.sender === 'customer' ? 'justify-start' : 'justify-end'
                      }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender === 'customer'
                          ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                          : 'bg-teal-500 text-white rounded-tr-none'
                        }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'customer' ? 'text-gray-500' : 'text-teal-100'
                        }`}>
                        {message.sender === 'customer' ? `${selectedTicketData.senderType === 'seller' ? '🏪' : '👤'} ${selectedTicketData.customer}` : '🛡️ Admin'} • {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                    <span>➤</span>
                  </button>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  {selectedTicketData.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange(selectedTicketData.id, 'Resolved')}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      ✓ Resolve Ticket
                    </button>
                  )}
                  {selectedTicketData.status === 'Open' && (
                    <button
                      onClick={() => handleStatusChange(selectedTicketData.id, 'In Progress')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Mark In Progress
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Select a ticket</h2>
              </div>
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-b-2xl">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-gray-600 text-center mb-2">
                    Select a ticket to view conversation
                  </p>
                  <p className="text-gray-400 text-sm">
                    Use filters above to find specific tickets
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
