import { useState, useRef, useEffect } from 'react';
import buyonixLogo from '../assets/logo.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock?: number;
  category?: string;
}

const Chatbot = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I\'m the Buyonix Assistant. Ask me about product prices, availability, or anything else!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [helpfulResponse, setHelpfulResponse] = useState<{ [key: string]: 'yes' | 'no' | null }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Category mapping - Maps user queries to actual product categories in database
  const categoryMapping: { [key: string]: string[] } = {
    'Footwear': ['shoe', 'shoes', 'shoewear', 'footwear', 'boots', 'sneakers', 'sandals', 'slippers', 'heels', 'loafers', 'trainers'],
    'Sports': ['sports', 'sportswear', 'athletic', 'gym', 'fitness', 'workout', 'activewear', 'sports item', 'skateboard', 'hockey', 'cricket', 'football', 'basketball', 'volleyball', 'baseball', 'tennis', 'badminton'],
    'Books': ['book', 'books', 'novel', 'novels', 'textbook', 'ebook', 'reading'],
    'Toys': ['toy', 'toys', 'game', 'games', 'gaming', 'video game', 'board game', 'console', 'playstation', 'xbox', 'rubik'],
    'Clothing': ['apparel', 'clothes', 'clothing', 'dress', 'shirt', 'pants', 'trousers', 'top', 'wear', 'fabric', 'jeans', 'jacket', 'hoodie', 'sweater', 'shalwar', 'kameez', 'kurta'],
    'Electronics': ['electronic', 'electronics', 'phone', 'laptop', 'computer', 'gadget', 'device', 'tablet', 'tv', 'camera'],
    'Accessories': ['accessories', 'phone accessories', 'phone case', 'charger', 'cable', 'screen protector', 'earphones', 'headphones', 'watch', 'bag', 'belt', 'wallet'],
    'Beauty': ['beauty', 'cosmetics', 'skincare', 'makeup', 'salon', 'personal care', 'lipstick', 'foundation', 'mascara'],
    'Home & Garden': ['home', 'garden', 'furniture', 'decor', 'home decor', 'gardening', 'fan', 'lamp', 'curtain'],
    'Jewelry': ['jewelry', 'jewellery', 'ring', 'necklace', 'bracelet', 'earring', 'diamond'],
  };

  // Extract category from user query
  const extractCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    return null;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search products from API - fetches all and filters client-side
  const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
    try {
      // Fetch all products from backend and filter client-side
      const response = await fetch(`http://localhost:5000/product?limit=100`);
      if (!response.ok) return [];
      const data = await response.json();

      const allProducts = data.products || [];
      const queryLower = query.toLowerCase();

      // If category is provided, do exact category match
      if (category) {
        const filtered = allProducts.filter((product: Product) => {
          const productCategory = product.category || '';
          return productCategory.toLowerCase() === category.toLowerCase();
        });
        return filtered.slice(0, 8);
      }

      // Otherwise, filter products by name and category matching the query
      const filtered = allProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(queryLower) ||
        (product.category && product.category.toLowerCase().includes(queryLower))
      );

      // If no results, try matching individual words from the query
      if (filtered.length === 0 && queryLower.includes(' ')) {
        const words = queryLower.split(' ').filter((w: string) => w.length > 2);
        const wordMatched = allProducts.filter((product: Product) =>
          words.some((word: string) =>
            product.name.toLowerCase().includes(word) ||
            (product.category && product.category.toLowerCase().includes(word))
          )
        );
        return wordMatched.slice(0, 8);
      }

      // Return top 8 matches
      return filtered.slice(0, 8);
    } catch {
      return [];
    }
  };

  // Format product info for display
  const formatProductInfo = (products: Product[]): string => {
    if (products.length === 0) {
      return "❌ No products found with that name. Try a different search or browse the **Shop** page.";
    }

    let response = `🛍️ **${products.length} Product${products.length > 1 ? 's' : ''} Found:**\n\n`;

    products.forEach((product, index) => {
      const availability = product.stock !== undefined
        ? (product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock')
        : '✅ Available';

      const priceDisplay = product.discount && product.originalPrice
        ? `~~$${product.originalPrice}~~ **$${product.price}** (${product.discount}% OFF)`
        : `**$${product.price}**`;

      response += `**${index + 1}. ${product.name}**\n`;
      response += `   💰 Price: ${priceDisplay}\n`;
      response += `   📦 ${availability}\n`;
      if (product.category) {
        response += `   📁 Category: ${product.category}\n`;
      }
      response += '\n';
    });

    response += "🛒 Visit the **Shop** page to buy these products!";
    return response;
  };


  // Check if user is asking about product price/availability or categories
  const isProductQuery = (message: string): boolean => {
    const productKeywords = [
      'price', 'rate', 'cost', 'how much',
      'available', 'availability', 'stock', 'in stock',
      'show', 'find', 'search', 'list', 'all',
      'what is', 'kids', 'children', 'mens', 'womens'
    ];
    const lower = message.toLowerCase();
    
    const hasProductKeyword = productKeywords.some(keyword => lower.includes(keyword));
    const hasCategory = extractCategory(message) !== null;
    
    return hasProductKeyword || hasCategory;
  };

  // Extract product name from query
  const extractProductName = (message: string): string => {
    const removeWords = [
      'price', 'rate', 'cost', 'tell', 'give', 'show', 'what', 'how', 'much',
      'please', 'can', 'you', 'me', 'the', 'of', 'a', 'an', 'is', 'are', 'for',
      'available', 'availability', 'stock', 'find', 'search', 'get', 'want', 'all',
      'do', 'does', 'have', 'has', 'it', 'in', 'i', 'need', 'looking',
      'list', 'items', 'products', 'any', 'every', 'each', 'kinds', 'types',
      'this', 'that', 'these', 'those', 'there', 'here', 'about'
    ];

    let cleaned = message.toLowerCase();

    removeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    return cleaned.replace(/[?!.,]/g, '').replace(/\s+/g, ' ').trim();
  };

  // Handle bot responses
  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // ===== VISUAL SEARCH =====
    if (lowerMessage.includes('visual search') || lowerMessage.includes('image search') || lowerMessage.includes('camera search')) {
      return "🔍 **Visual Search** - Find Products with Images!\n\n**How to use:**\n1. Click the **camera icon** 📷 in search bar\n2. Upload any product image\n3. AI will find similar products!\n\nPerfect when you don't know the product name!";
    }

    // ===== BARGAINING =====
    if (lowerMessage.includes('bargain') || lowerMessage.includes('negotiate') || lowerMessage.includes('price lower')) {
      return "💰 **Smart Bargaining** - Negotiate Prices!\n\n**How it works:**\n1. Go to any product page\n2. Click **'Smart Bargaining'** button\n3. Enter your offer price\n4. AI will accept, reject, or counter-offer\n5. Get the best deal!\n\nSave money by negotiating with our AI!";
    }

    // ===== SELLER / BECOME SELLER =====
    if (lowerMessage.includes('become seller') || lowerMessage.includes('start selling') || lowerMessage.includes('sell products') || lowerMessage.includes('open shop')) {
      return "🏪 **Become a Seller on Buyonix!**\n\n**Steps:**\n1. Click **'Become a Seller'** in navbar\n2. Fill in store name, address, phone\n3. Submit for approval\n4. Once approved, access **Seller Dashboard**\n5. Add products and start selling!\n\n**Features:** Dashboard, Analytics, Order Management, Chat with Buyers";
    }

    if (lowerMessage.includes('seller dashboard') || lowerMessage.includes('my store') || lowerMessage.includes('my shop')) {
      return "📊 **Seller Dashboard Features:**\n\n• **Dashboard** - View sales, orders, revenue\n• **Products** - Add, edit, delete products\n• **Orders** - Manage customer orders\n• **Analytics** - View sales charts\n• **Chat** - Respond to customers\n• **Payouts** - Track your earnings\n\nAccess after logging in as a seller!";
    }

    // ===== PAYMENT METHODS =====
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('easypaisa') || lowerMessage.includes('jazzcash')) {
      return "💳 **Payment Methods:**\n\n• **EasyPaisa** 📱 - Send to our number, enter TRX ID\n• **JazzCash** 📲 - Send to our number, enter TRX ID\n• **Card** 💳 - Visa/Mastercard (secure via Stripe)\n• **COD** 📦 - Cash on Delivery\n\nAll payments are **100% secure**!";
    }

    // ===== CART & CHECKOUT =====
    if (lowerMessage.includes('cart') || lowerMessage.includes('checkout') || lowerMessage.includes('how to buy') || lowerMessage.includes('how to order')) {
      return "🛒 **Cart & Checkout:**\n\n**Adding to Cart:**\n1. Browse products, click **'Add to Cart'**\n2. Cart icon shows item count in navbar\n\n**Placing Order:**\n1. Click cart icon\n2. Click **'Checkout'**\n3. Enter name, address, city\n4. Select payment method\n5. Click **'Place Order'**!\n\nDone, order placed! 🎉";
    }

    // ===== ORDERS & TRACKING =====
    if (lowerMessage.includes('track') || lowerMessage.includes('order status') || lowerMessage.includes('where is my order') || lowerMessage.includes('delivery status')) {
      return "📦 **Track Your Order:**\n\n1. Click profile icon (top right)\n2. Go to **'My Orders'**\n3. Find your order\n4. Click **'Track'** button\n5. See real-time status!\n\n**Statuses:**\n• Pending → Processing → Shipped → Delivered\n\nYou'll receive email at each stage!";
    }

    if (lowerMessage.includes('order') || lowerMessage.includes('my orders') || lowerMessage.includes('order history')) {
      return "📋 **View Your Orders:**\n\n1. Click your profile icon\n2. Select **'My Orders'**\n3. See all past and current orders\n4. Click any order for details\n\nFrom here you can track, review, or request returns!";
    }

    // ===== RETURN & REFUND =====
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('cancel') || lowerMessage.includes('money back')) {
      return "↩️ **Returns & Refunds:**\n\n**To Return:**\n1. Go to **My Orders**\n2. Click **'Return'** on the order\n3. Select reason and submit\n4. Ship the item back\n\n**Refund:**\n• Processed within 2-3 business days\n• Credited to original payment method\n\n**Note:** Items must be unused and in original packaging!";
    }

    // ===== SHIPPING =====
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('delivery time') || lowerMessage.includes('how long') || lowerMessage.includes('shipping fee')) {
      return "🚚 **Shipping Information:**\n\n**Delivery Time:**\n• **Standard:** 3-5 business days\n• **Express:** 1-2 business days\n\n**Shipping Fee:** Rs. 200-500 based on location\n\n**Free Shipping:** On orders above Rs. 5000!\n\nWe deliver across Pakistan. Track in real-time!";
    }

    // ===== SEARCH & BROWSE =====
    if (lowerMessage.includes('search') || lowerMessage.includes('browse') || lowerMessage.includes('find product') || lowerMessage.includes('how to find')) {
      return "🔎 **How to Find Products:**\n\n**Text Search:**\n• Type in the search bar\n• Search by product name or category\n\n**Category Search:**\n• 'Show all shoes' or 'footwear'\n• 'List sports items' or 'sports'\n• 'Books available?'\n• 'Jewelry items'\n\n**Visual Search:**\n• Click 📷 camera icon\n• Upload image to find similar products!\n\n**Browse:**\n• Visit **Shop** page for all products\n• Filter by category, price, rating\n\n**Available Categories:**\n👟 Footwear | 🏃 Sports | 📚 Books | 🎮 Toys | 👕 Clothing | 📱 Electronics | 💄 Beauty | 💍 Jewelry | 🏠 Home & Garden | 🎁 Accessories";
    }

    // ===== CATEGORIES =====
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('what do you sell')) {
      return "📁 **Product Categories:**\n\n• 👟 **Footwear** - shoes, boots, sneakers\n• 🏃 **Sports** - gym, sports, fitness items\n• 📚 **Books** - novels, textbooks, educational\n• 🎮 **Toys** - toys, games, video games\n• 👕 **Clothing** - shirts, pants, dresses\n• 📱 **Electronics** - phones, laptops, gadgets\n• 💄 **Beauty** - cosmetics, skincare, makeup\n• 💍 **Jewelry** - rings, necklaces, earrings\n• 🏠 **Home & Garden** - furniture, decor\n• 🎁 **Accessories** - phone cases, chargers, headphones\n\nYou can also browse from the **Shop** page or navbar!";
    }

    // ===== ACCOUNT & PROFILE =====
    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
      return "👤 **Account Management:**\n\n1. Click profile icon (top right)\n2. Access:\n   • **My Profile** - Update personal info\n   • **My Orders** - View order history\n   • **Addresses** - Manage addresses\n   • **Settings** - Preferences\n\n**Tip:** Keep email updated for notifications!";
    }

    // ===== LOGIN & REGISTER =====
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      return "🔐 **Login to Buyonix:**\n\n**Options:**\n1. **Email & Password** - Enter your credentials\n2. **Google Login** - Click 'Continue with Google'\n\n**Forgot Password?**\n• Click 'Forgot Password'\n• Enter email, receive OTP\n• Set new password!\n\nNo account? Click **'Sign Up'**!";
    }

    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('create account')) {
      return "📝 **Create an Account:**\n\n1. Click **'Sign Up'** button\n2. Enter name, email, password\n3. Or use **'Continue with Google'**\n4. Verify your email\n5. Start shopping!\n\n**Benefits:** Order tracking, wishlist, faster checkout, exclusive deals!";
    }

    // ===== REVIEWS & RATINGS =====
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback') || lowerMessage.includes('stars')) {
      return "⭐ **Reviews & Ratings:**\n\n**To Write a Review:**\n1. Go to the product you purchased\n2. Scroll to **Reviews** section\n3. Click **'Write a Review'**\n4. Rate 1-5 stars and add feedback\n5. Submit!\n\nHelps others make decisions!";
    }

    // ===== RECOMMENDATIONS =====
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion') || lowerMessage.includes('for you') || lowerMessage.includes('what should i buy')) {
      return "🎯 **AI Recommendations:**\n\nBuyonix uses AI to suggest products you'll love!\n\n**How it works:**\n• Based on your browsing history\n• Products you've purchased\n• Similar customers' preferences\n\nCheck **'Recommended For You'** on Home page!";
    }

    // ===== CHAT WITH SELLER =====
    if (lowerMessage.includes('chat') || lowerMessage.includes('message') || lowerMessage.includes('contact seller')) {
      return "💬 **Chat with Sellers:**\n\n1. Go to any product page\n2. Click **'Chat with Seller'** button\n3. Ask questions about the product\n4. Negotiate price, shipping, etc.\n\nReal-time messaging - sellers respond quickly!";
    }

    // ===== DEALS & DISCOUNTS =====
    if (lowerMessage.includes('discount') || lowerMessage.includes('deal') || lowerMessage.includes('offer') || lowerMessage.includes('sale') || lowerMessage.includes('coupon')) {
      return "🏷️ **Deals & Discounts:**\n\n**Find Deals:**\n• Check **Home page** for featured deals\n• Look for **red discount badges** on products\n• Visit **Deals** section in navbar\n\n**Coupon Codes:**\n• Enter code at checkout\n• Subscribe to newsletter for exclusive codes!\n\n**Flash Sales:** Limited-time offers - act fast!";
    }

    // ===== WISHLIST / FAVORITES =====
    if (lowerMessage.includes('wishlist') || lowerMessage.includes('favorite') || lowerMessage.includes('save for later')) {
      return "❤️ **Wishlist / Favorites:**\n\n**To Save Products:**\n1. Click the **heart icon** ❤️ on any product\n2. Product saved to your wishlist!\n\n**View Wishlist:**\n• Profile → **My Wishlist**\n• See all saved items\n• Move to cart when ready!";
    }

    // ===== CONTACT & SUPPORT =====
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('customer service')) {
      return "📞 **Contact Buyonix:**\n\n• **Email:** support@buyonix.com\n• **Phone:** +92 300 0579453\n• **Address:** Air University E9, Islamabad\n\n**Hours:** Mon-Sat, 9 AM - 6 PM\n\nOr chat with me here - I'm available 24/7! 🤖";
    }

    // ===== ABOUT BUYONIX =====
    if (lowerMessage.includes('about') || lowerMessage.includes('what is buyonix')) {
      return "🛍️ **About Buyonix:**\n\nBuyonix is an AI-powered e-commerce platform!\n\n**Special Features:**\n• 🔍 **Visual Search** - Find products using images\n• 💰 **Smart Bargaining** - Negotiate prices with AI\n• 🎯 **AI Recommendations** - Personalized suggestions\n• 💬 **Real-time Chat** - Talk to sellers directly\n• 🛡️ **Secure Payments** - Multiple safe options\n\nShop smarter with Buyonix!";
    }

    // ===== SAFETY & SECURITY =====
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('privacy') || lowerMessage.includes('trust')) {
      return "🔒 **Safety & Security:**\n\n• **Secure Payments** - SSL encrypted transactions\n• **Verified Sellers** - All sellers are verified\n• **Buyer Protection** - Money-back guarantee\n• **Privacy** - Your data is never shared\n• **Secure Login** - 2FA available\n\nShop with confidence on Buyonix!";
    }

    // ===== GREETINGS =====
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good evening')) {
      return "👋 **Hello! Welcome to Buyonix!**\n\nI'm your AI assistant. Ask me about:\n\n• 🔍 How to use Visual Search\n• 💰 How to bargain prices\n• 🛒 How to shop\n• 📦 How to track orders\n• 💳 Payment methods\n• 🏪 How to become a seller\n\nHow can I help you?";
    }

    // ===== THANKS =====
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      return "😊 **You're welcome!** Happy to help!\n\nAnything else you'd like to know about Buyonix? I'm here 24/7! 🤖";
    }

    // ===== PRODUCT SPECIFIC =====
    if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      return "📦 **Viewing Products:**\n\n1. All products are on **Shop** page\n2. Use search bar to find\n3. Browse by categories\n4. Click product for details\n5. Click **'Add to Cart'** or **'Buy Now'**\n\nTry Visual Search too - upload a photo to find similar products!";
    }

    // ===== DEFAULT FALLBACK =====
    return "🤖 **I'm your Buyonix Assistant!**\n\nAsk me about:\n• **Visual Search** - Find products with images\n• **Bargaining** - Negotiate prices\n• **Payment** - EasyPaisa, JazzCash, COD\n• **Orders** - Track & manage\n• **Seller** - How to sell on Buyonix\n• **Cart** - Shopping help\n• **Returns** - Refund policy\n\nOr ask about any specific product by name!\n\nHow can I help you?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Check if it's a product query
    if (isProductQuery(userText)) {
      setIsLoading(true);

      // Add loading message
      const loadingId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: loadingId,
        text: '🔍 Searching for products...',
        sender: 'bot',
        timestamp: new Date(),
      }]);

      try {
        const detectedCategory = extractCategory(userText);
        const productName = extractProductName(userText);
        const lowerText = userText.toLowerCase();

        // Check if user explicitly wants a category listing ("show all electronics", "list sports")
        const wantsCategoryListing = detectedCategory && (
          lowerText.includes('show all') || lowerText.includes('list') || 
          lowerText.includes('all ') || lowerText.includes('category')
        );

        let products: Product[] = [];

        if (wantsCategoryListing && detectedCategory) {
          // User explicitly wants all items from a category
          products = await searchProducts(detectedCategory, detectedCategory);
        } else if (productName.length > 1) {
          // Try searching by product name first
          products = await searchProducts(productName);

          // If no results by name AND a category was detected, fall back to category
          if (products.length === 0 && detectedCategory) {
            products = await searchProducts(detectedCategory, detectedCategory);
          }
        } else if (detectedCategory) {
          // Only category keyword, no product name
          products = await searchProducts(detectedCategory, detectedCategory);
        }

        if (productName.length > 1 || detectedCategory) {
          // Remove loading message and add result
          setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
            id: (Date.now() + 2).toString(),
            text: formatProductInfo(products),
            sender: 'bot',
            timestamp: new Date(),
          }));
        } else {
          // Query too vague
          setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
            id: (Date.now() + 2).toString(),
            text: '🤔 Which product or category? Try "show shoes", "sports items" or "phone accessories"',
            sender: 'bot',
            timestamp: new Date(),
          }));
        }
      } catch {
        setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
          id: (Date.now() + 2).toString(),
          text: '❌ Error searching products. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        }));
      }

      setIsLoading(false);
    } else {
      // Regular response with delay
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(userText),
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, feedback: 'yes' | 'no') => {
    setHelpfulResponse((prev) => ({
      ...prev,
      [messageId]: feedback,
    }));
  };

  const formatMessage = (text: string) => {
    // Convert **bold** to <strong> tags
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-400 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src={buyonixLogo} alt="Buyonix" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-semibold">Buyonix Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden">
                  <img src={buyonixLogo} alt="Bot" className="w-6 h-6 object-contain" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{formatMessage(message.text)}</p>



              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Powered by Buyonix AI</p>
      </div>
    </div>
  );
};

export default Chatbot;