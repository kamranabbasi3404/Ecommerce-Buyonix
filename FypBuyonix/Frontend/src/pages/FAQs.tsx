import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaSearch, FaArrowLeft } from 'react-icons/fa';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // General
    {
        category: 'General',
        question: 'What is Buyonix?',
        answer: 'Buyonix is an AI-powered e-commerce platform that connects buyers with verified sellers. It features smart product recommendations, visual search, AI-powered bargaining, and a seamless shopping experience.'
    },
    {
        category: 'General',
        question: 'How do I create an account on Buyonix?',
        answer: 'Click the "Sign Up" button on the top right corner of the page. Fill in your name, email, and password. You can also sign up using your Google account for a faster registration process.'
    },
    {
        category: 'General',
        question: 'Is Buyonix free to use?',
        answer: 'Yes! Browsing, searching, and creating a buyer account is completely free. Sellers may have specific terms related to their onboarding, but there are no hidden fees for buyers.'
    },

    // Shopping
    {
        category: 'Shopping',
        question: 'How does Visual Search work?',
        answer: 'Our AI-powered Visual Search lets you upload a photo of any product, and our system will find visually similar products from our catalog. Just click the camera icon in the search bar, upload your image, and get instant results.'
    },
    {
        category: 'Shopping',
        question: 'What is AI Bargaining?',
        answer: 'AI Bargaining allows you to negotiate prices with our intelligent system. On eligible products, click the "Bargain" button and propose your price. The AI will counter-offer based on the seller\'s price range, helping you get the best deal.'
    },
    {
        category: 'Shopping',
        question: 'How do I search for products?',
        answer: 'You can search by typing in the search bar, using Visual Search (image upload), browsing categories, or checking the Deals section. Our AI also provides personalized product recommendations on the home page.'
    },
    {
        category: 'Shopping',
        question: 'Can I save products to buy later?',
        answer: 'Yes! Click the heart icon on any product to add it to your Wishlist. You can access your saved products anytime from the Wishlist page.'
    },
    {
        category: 'Shopping',
        question: 'How do I add items to my cart?',
        answer: 'Click "Add to Cart" on any product page. You can view your cart by clicking the cart icon in the navigation bar, where you can update quantities or remove items before checkout.'
    },

    // Orders & Payments
    {
        category: 'Orders & Payments',
        question: 'What payment methods do you accept?',
        answer: 'We currently accept Bank Transfer and Cash on Delivery (COD). For bank transfers, you\'ll receive banking details during checkout. Your order will be confirmed after payment verification by our admin team.'
    },
    {
        category: 'Orders & Payments',
        question: 'How do I track my order?',
        answer: 'After placing an order, you\'ll receive an order confirmation with a unique order number (e.g., ORD-XXXXXXXX). You can use this number to check your order status.'
    },
    {
        category: 'Orders & Payments',
        question: 'How long does payment verification take?',
        answer: 'Bank transfer payments are verified by our admin team, usually within 24 hours. You\'ll receive an email notification once your payment is confirmed.'
    },
    {
        category: 'Orders & Payments',
        question: 'Can I cancel my order?',
        answer: 'You can contact the seller directly through our chat feature to discuss order cancellations. If the order hasn\'t been shipped yet, cancellation is usually possible.'
    },

    // Seller
    {
        category: 'Seller',
        question: 'How do I become a seller on Buyonix?',
        answer: 'Click "Become a Seller" and fill in the registration form with your business details, store name, bank information, and CNIC. Your application will be reviewed by our admin team. Once approved, you\'ll receive an email and can start listing products.'
    },
    {
        category: 'Seller',
        question: 'How long does seller approval take?',
        answer: 'Seller applications are reviewed by our admin team. Approval typically happens within 1-3 business days. You\'ll receive an email notification once your account is approved.'
    },
    {
        category: 'Seller',
        question: 'How do I manage my products as a seller?',
        answer: 'Once approved, log in to the Seller Dashboard. Navigate to "Products" to add, edit, or remove your listings. You can upload multiple product images, set prices, manage stock levels, and add color variants.'
    },
    {
        category: 'Seller',
        question: 'How do seller payouts work?',
        answer: 'Payouts are processed based on your confirmed orders. You can view your earnings and payout details in the "Payouts" section of the Seller Dashboard.'
    },

    // Communication
    {
        category: 'Communication',
        question: 'How do I chat with a seller?',
        answer: 'On any product page, click the "Chat with Seller" button to start a real-time conversation. You can discuss product details, negotiate, or ask questions. All your chats are accessible from the "My Chats" page.'
    },
    {
        category: 'Communication',
        question: 'How does the AI Chatbot help me?',
        answer: 'Our AI Chatbot can help you find products, answer questions about Buyonix features, provide shopping assistance in both English and Roman Urdu. Click the chat bubble icon at the bottom right of any page to start a conversation.'
    },
    {
        category: 'Communication',
        question: 'Will I get email notifications for new messages?',
        answer: 'Yes! When a seller or admin replies to your chat or support ticket, you\'ll receive an email notification with a preview of the message and a link to reply directly.'
    },

    // Support
    {
        category: 'Support',
        question: 'How do I submit a support ticket?',
        answer: 'Go to the "Customer Support" page from the footer. Fill in the subject, category, priority, and your message. You\'ll receive a ticket ID (e.g., TKT-001) to track your query. Admins will respond directly within the ticket.'
    },
    {
        category: 'Support',
        question: 'How do I contact Buyonix support?',
        answer: 'You can reach us through: 1) Customer Support page (submit a ticket), 2) AI Chatbot for quick queries, 3) Email at support@buyonix.com. Our team typically responds within 24 hours.'
    },
    {
        category: 'Support',
        question: 'What should I do if I receive a damaged product?',
        answer: 'Submit a support ticket immediately with photos of the damaged item. Select "Product Issue" as the category and "High" priority. Our team will coordinate with the seller for a replacement or refund.'
    },
];

const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

const FAQs = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = faqs.filter(faq => {
        const matchCategory = activeCategory === 'All' || faq.category === activeCategory;
        const matchSearch = !searchQuery.trim() ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <section className="bg-gradient-to-r from-teal-600 to-teal-400 py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
                        <p className="text-lg text-teal-50 mb-8">
                            Find answers to common questions about Buyonix
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/30 bg-white shadow-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Tabs */}
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
                        <p className="text-gray-500">Try a different search term or category</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${isOpen ? 'border-teal-300 shadow-md' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between px-6 py-4 text-left"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {faq.category}
                                            </span>
                                            <span className="font-medium text-gray-800">{faq.question}</span>
                                        </div>
                                        {isOpen ? (
                                            <FaChevronUp className="text-teal-600 flex-shrink-0 ml-2" />
                                        ) : (
                                            <FaChevronDown className="text-gray-400 flex-shrink-0 ml-2" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-5">
                                            <div className="border-t border-gray-100 pt-4">
                                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-6 pb-16">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
                    <p className="text-teal-50 mb-6">Our support team is ready to help you</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/support"
                            className="bg-white text-teal-600 px-6 py-2.5 rounded-lg font-medium hover:bg-teal-50 transition-colors"
                        >
                            Contact Support
                        </Link>
                        <Link
                            to="/about"
                            className="border-2 border-white text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                        >
                            Learn About Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQs;
