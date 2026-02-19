import { useState, useRef, useEffect } from 'react';

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
      text: '👋 Assalam o Alaikum! Main Buyonix Assistant hoon. Mujh se products ki price, availability ya koi bhi sawal pucho!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [helpfulResponse, setHelpfulResponse] = useState<{ [key: string]: 'yes' | 'no' | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: language === 'ur'
          ? '👋 Assalam o Alaikum! Main Buyonix Assistant hoon. Mujh se products ki price, availability ya koi bhi sawal pucho!'
          : '👋 Hello! I\'m the Buyonix Assistant. Ask me about product prices, availability, or anything else!',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setHelpfulResponse({});
  }, [language]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search products from API - fetches all and filters client-side
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      // Fetch all products from backend and filter client-side
      const response = await fetch(`http://localhost:5000/product?limit=100`);
      if (!response.ok) return [];
      const data = await response.json();

      // Filter products by name matching the query
      const allProducts = data.products || [];
      const queryLower = query.toLowerCase();

      const filtered = allProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(queryLower) ||
        (product.category && product.category.toLowerCase().includes(queryLower))
      );

      // Return top 5 matches
      return filtered.slice(0, 5);
    } catch {
      return [];
    }
  };

  // Format product info for display - bilingual
  const formatProductInfo = (products: Product[], isUrdu: boolean): string => {
    if (products.length === 0) {
      return isUrdu
        ? "❌ Is naam ka koi product nahi mila. Doosra naam try karo ya **Shop** page pe browse karo."
        : "❌ No products found with that name. Try a different search or browse the **Shop** page.";
    }

    let response = isUrdu
      ? `🛍️ **${products.length} Product${products.length > 1 ? 's' : ''} Mil Gaye:**\n\n`
      : `🛍️ **${products.length} Product${products.length > 1 ? 's' : ''} Found:**\n\n`;

    products.forEach((product, index) => {
      const availability = product.stock !== undefined
        ? (product.stock > 0
          ? (isUrdu ? `✅ Stock mein (${product.stock} available)` : `✅ In Stock (${product.stock} available)`)
          : (isUrdu ? '❌ Stock mein nahi' : '❌ Out of Stock'))
        : (isUrdu ? '✅ Available hai' : '✅ Available');

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

    response += isUrdu
      ? "🛒 Product khareedne ke liye **Shop** page pe jao!"
      : "🛒 Visit the **Shop** page to buy these products!";
    return response;
  };


  // Check if user is asking about product price/availability
  const isProductQuery = (message: string): boolean => {
    const productKeywords = [
      'price', 'rate', 'cost', 'kitne', 'kitna', 'kya price', 'qeemat', 'daam',
      'available', 'availability', 'stock', 'mil', 'milega', 'hai kya', 'hain kya',
      'show', 'dikhao', 'batao', 'bata', 'find', 'dhundo', 'search'
    ];
    const lower = message.toLowerCase();
    return productKeywords.some(keyword => lower.includes(keyword));
  };

  // Extract product name from query
  const extractProductName = (message: string): string => {
    // Remove common query words to get product name
    const removeWords = [
      // English query words
      'price', 'rate', 'cost', 'tell', 'give', 'show', 'what', 'how', 'much',
      'please', 'can', 'you', 'me', 'the', 'of', 'a', 'an', 'is', 'are', 'for',
      'available', 'availability', 'stock', 'find', 'search', 'get', 'want',
      'do', 'does', 'have', 'has', 'it', 'in', 'i', 'need', 'looking',
      // Roman Urdu query words
      'kitne', 'kitna', 'kya', 'qeemat', 'daam', 'ka', 'ki', 'ke', 'hai', 'hain',
      'mil', 'milega', 'milta', 'dikhao', 'batao', 'bata', 'dhundo', 'mujhe',
      'ko', 'wala', 'wali', 'karo', 'chahiye', 'lena', 'dena'
    ];

    let cleaned = message.toLowerCase();

    // Remove each word one by one with word boundaries
    removeWords.forEach(word => {
      // Use word boundary but be careful with short words
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    // Clean up extra spaces, punctuation and return
    return cleaned.replace(/[?!.,]/g, '').replace(/\s+/g, ' ').trim();
  };
  // Handle bot responses - Bilingual: Responds in user's selected language
  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const isUrdu = language === 'ur';

    // ===== VISUAL SEARCH =====
    if (lowerMessage.includes('visual search') || lowerMessage.includes('image search') || lowerMessage.includes('camera search') ||
      lowerMessage.includes('tasveer') || lowerMessage.includes('photo se') || lowerMessage.includes('image se dhundo')) {
      return isUrdu
        ? "🔍 **Visual Search** - Tasveer se Product Dhundo!\n\n**Kaise use karein:**\n1. Search bar mein **camera icon** 📷 click karo\n2. Koi bhi product ki photo upload karo\n3. AI similar products dhundh lega!\n\nBohot useful hai jab product ka naam nahi pata!"
        : "🔍 **Visual Search** - Find Products with Images!\n\n**How to use:**\n1. Click the **camera icon** 📷 in search bar\n2. Upload any product image\n3. AI will find similar products!\n\nPerfect when you don't know the product name!";
    }

    // ===== BARGAINING =====
    if (lowerMessage.includes('bargain') || lowerMessage.includes('negotiate') || lowerMessage.includes('mol tol') ||
      lowerMessage.includes('price kam') || lowerMessage.includes('qeemat kam') || lowerMessage.includes('rate kam')) {
      return isUrdu
        ? "💰 **Mol Tol / Bargaining** - Seller se Rate Negotiate Karo!\n\n**Kaise karein:**\n1. Product page pe jao\n2. **'Bargain Price'** button click karo\n3. Apni offer price likho\n4. Seller accept/reject/counter karega\n5. Real-time chat mein deal pakki karo!\n\nPaise bachao direct seller se deal karke!"
        : "💰 **Smart Bargaining** - Negotiate Prices!\n\n**How it works:**\n1. Go to any product page\n2. Click **'Bargain Price'** button\n3. Enter your offer price\n4. Seller will accept, reject, or counter-offer\n5. Chat in real-time until you agree!\n\nSave money by negotiating directly!";
    }

    // ===== SELLER / BECOME SELLER =====
    if (lowerMessage.includes('become seller') || lowerMessage.includes('seller ban') || lowerMessage.includes('apna store') ||
      lowerMessage.includes('product bechna') || lowerMessage.includes('dukhaan') || lowerMessage.includes('shop kholni') ||
      lowerMessage.includes('start selling') || lowerMessage.includes('sell products')) {
      return isUrdu
        ? "🏪 **Seller Banein Buyonix Pe!**\n\n**Steps:**\n1. Navbar mein **'Become a Seller'** click karo\n2. Store name, address, phone details do\n3. Approval ke liye submit karo\n4. Approve hone pe **Seller Dashboard** milega\n5. Products add karo aur bechna shuru!\n\n**Features:** Dashboard, Analytics, Order Management, Chat with Buyers"
        : "🏪 **Become a Seller on Buyonix!**\n\n**Steps:**\n1. Click **'Become a Seller'** in navbar\n2. Fill in store name, address, phone\n3. Submit for approval\n4. Once approved, access **Seller Dashboard**\n5. Add products and start selling!\n\n**Features:** Dashboard, Analytics, Order Management, Chat with Buyers";
    }

    if (lowerMessage.includes('seller dashboard') || lowerMessage.includes('apni shop') || lowerMessage.includes('meri dukhaan') || lowerMessage.includes('my store')) {
      return isUrdu
        ? "📊 **Seller Dashboard Features:**\n\n• **Dashboard** - Sales, orders, revenue dekho\n• **Products** - Products add/edit/delete karo\n• **Orders** - Customer orders manage karo\n• **Analytics** - Sales ke charts dekho\n• **Chat** - Customers se baat karo\n• **Payouts** - Apni earnings track karo\n\nSeller login ke baad access karo!"
        : "📊 **Seller Dashboard Features:**\n\n• **Dashboard** - View sales, orders, revenue\n• **Products** - Add, edit, delete products\n• **Orders** - Manage customer orders\n• **Analytics** - View sales charts\n• **Chat** - Respond to customers\n• **Payouts** - Track your earnings\n\nAccess after logging in as a seller!";
    }

    // ===== PAYMENT METHODS =====
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('easypaisa') || lowerMessage.includes('jazzcash') ||
      lowerMessage.includes('paisa') || lowerMessage.includes('paise') || lowerMessage.includes('payment kaise') || lowerMessage.includes('raqam')) {
      return isUrdu
        ? "💳 **Payment Methods:**\n\n• **EasyPaisa** 📱 - Number pe bhejo, TRX ID do\n• **JazzCash** 📲 - Number pe bhejo, TRX ID do\n• **Card** 💳 - Visa/Mastercard (Stripe se secure)\n• **COD** 📦 - Cash on Delivery (ghar pe paisa do)\n\nSab payments **100% secure** hain!"
        : "💳 **Payment Methods:**\n\n• **EasyPaisa** 📱 - Send to our number, enter TRX ID\n• **JazzCash** 📲 - Send to our number, enter TRX ID\n• **Card** 💳 - Visa/Mastercard (secure via Stripe)\n• **COD** 📦 - Cash on Delivery\n\nAll payments are **100% secure**!";
    }

    // ===== CART & CHECKOUT =====
    if (lowerMessage.includes('cart') || lowerMessage.includes('checkout') || lowerMessage.includes('khareed') ||
      lowerMessage.includes('order kaise') || lowerMessage.includes('shopping kaise') || lowerMessage.includes('lena hai') ||
      lowerMessage.includes('how to buy') || lowerMessage.includes('how to order')) {
      return isUrdu
        ? "🛒 **Cart & Checkout - Shopping Kaise Karein:**\n\n**Cart mein daalna:**\n1. Product dekhein, **'Add to Cart'** click karein\n2. Navbar mein cart icon pe count dikhega\n\n**Order Place karna:**\n1. Cart icon click karein\n2. **'Checkout'** dabayein\n3. Name, address, city likho\n4. Payment method chunein\n5. **'Place Order'** click karein!\n\nBas, order ho gaya! 🎉"
        : "🛒 **Cart & Checkout:**\n\n**Adding to Cart:**\n1. Browse products, click **'Add to Cart'**\n2. Cart icon shows item count in navbar\n\n**Placing Order:**\n1. Click cart icon\n2. Click **'Checkout'**\n3. Enter name, address, city\n4. Select payment method\n5. Click **'Place Order'**!\n\nDone, order placed! 🎉";
    }

    // ===== ORDERS & TRACKING =====
    if (lowerMessage.includes('track') || lowerMessage.includes('order kahan') || lowerMessage.includes('parcel kahan') ||
      lowerMessage.includes('delivery kab') || lowerMessage.includes('mera order') || lowerMessage.includes('order status') ||
      lowerMessage.includes('where is my order') || lowerMessage.includes('track my order')) {
      return isUrdu
        ? "📦 **Order Track Kaise Karein:**\n\n1. Profile icon click karo (top right)\n2. **'My Orders'** pe jao\n3. Apna order dhundo\n4. **'Track'** button dabao\n5. Real-time status dekho!\n\n**Status:**\n• Pending → Processing → Shipped → Delivered\n\nHar stage pe email aayegi!"
        : "📦 **Track Your Order:**\n\n1. Click profile icon (top right)\n2. Go to **'My Orders'**\n3. Find your order\n4. Click **'Track'** button\n5. See real-time status!\n\n**Statuses:**\n• Pending → Processing → Shipped → Delivered\n\nYou'll receive email at each stage!";
    }

    if (lowerMessage.includes('order') || lowerMessage.includes('orders dekh') || lowerMessage.includes('purane order') ||
      lowerMessage.includes('my orders') || lowerMessage.includes('order history')) {
      return isUrdu
        ? "📋 **Orders Dekhna:**\n\n1. Profile icon click karo\n2. **'My Orders'** select karo\n3. Sab orders ki list milegi\n4. Kisi bhi order pe click karke details dekho\n\nYahan se track, review, ya return bhi kar sakte ho!"
        : "📋 **View Your Orders:**\n\n1. Click your profile icon\n2. Select **'My Orders'**\n3. See all past and current orders\n4. Click any order for details\n\nFrom here you can track, review, or request returns!";
    }

    // ===== RETURN & REFUND =====
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('wapas') ||
      lowerMessage.includes('paise wapas') || lowerMessage.includes('cancel') || lowerMessage.includes('order cancel')) {
      return isUrdu
        ? "↩️ **Return & Refund - Wapsi:**\n\n**Return Kaise Karein:**\n1. **My Orders** mein jao\n2. Order pe **'Return'** click karo\n3. Waja select karo, submit karo\n4. Item wapas bhejo\n\n**Refund:**\n• 2-3 din mein process hota hai\n• Original payment method mein paise aayenge\n\n**Note:** Item unused aur original packing mein hona chahiye!"
        : "↩️ **Returns & Refunds:**\n\n**To Return:**\n1. Go to **My Orders**\n2. Click **'Return'** on the order\n3. Select reason and submit\n4. Ship the item back\n\n**Refund:**\n• Processed within 2-3 business days\n• Credited to original payment method\n\n**Note:** Items must be unused and in original packaging!";
    }

    // ===== SHIPPING =====
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('kitne din') ||
      lowerMessage.includes('kab ayega') || lowerMessage.includes('delivery charges') || lowerMessage.includes('shipping fee') ||
      lowerMessage.includes('delivery time') || lowerMessage.includes('how long')) {
      return isUrdu
        ? "🚚 **Delivery Information:**\n\n**Delivery Time:**\n• **Standard:** 3-5 din\n• **Express:** 1-2 din\n\n**Shipping Fee:** Rs. 200-500 (location ke hisab se)\n\n**Free Delivery:** Rs. 5000+ ke order pe!\n\nPure Pakistan mein delivery available hai. Real-time track kar sakte ho!"
        : "🚚 **Shipping Information:**\n\n**Delivery Time:**\n• **Standard:** 3-5 business days\n• **Express:** 1-2 business days\n\n**Shipping Fee:** Rs. 200-500 based on location\n\n**Free Shipping:** On orders above Rs. 5000!\n\nWe deliver across Pakistan. Track in real-time!";
    }

    // ===== SEARCH & BROWSE =====
    if (lowerMessage.includes('search') || lowerMessage.includes('dhundo') || lowerMessage.includes('kaise dhunde') ||
      lowerMessage.includes('product kahan') || lowerMessage.includes('browse') || lowerMessage.includes('find product')) {
      return isUrdu
        ? "🔎 **Product Kaise Dhundein:**\n\n**Text Search:**\n• Search bar mein naam likho\n• Enter dabao\n\n**Visual Search:**\n• Camera icon 📷 click karo\n• Photo upload karo, similar products milenge!\n\n**Browse:**\n• **Shop** page pe sab products hain\n• Category, price, rating se filter karo"
        : "🔎 **Finding Products:**\n\n**Text Search:**\n• Use the search bar at top\n• Type product name\n\n**Visual Search:**\n• Click 📷 camera icon\n• Upload image to find similar products!\n\n**Browse:**\n• Visit **Shop** page for all products\n• Filter by category, price, rating";
    }

    // ===== CATEGORIES =====
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('kya milta')) {
      return isUrdu
        ? "📁 **Product Categories:**\n\n• Electronics (phones, laptops)\n• Fashion (kapre, joote, bags)\n• Home & Living (furniture, decor)\n• Beauty & Health\n• Sports\n• Books\n• Aur bohot kuch!\n\n**Shop** page ya navbar se categories browse karo."
        : "📁 **Product Categories:**\n\n• Electronics (phones, laptops, accessories)\n• Fashion (clothing, shoes, bags)\n• Home & Living (furniture, decor)\n• Beauty & Health\n• Sports & Outdoors\n• Books & Stationery\n• And more!\n\nBrowse from **Shop** page or navbar.";
    }

    // ===== ACCOUNT & PROFILE =====
    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('apna account') ||
      lowerMessage.includes('settings') || lowerMessage.includes('meri profile')) {
      return isUrdu
        ? "👤 **Account Manage Karna:**\n\n1. Profile icon click karo (top right)\n2. Options milenge:\n   • **My Profile** - Details update karo\n   • **My Orders** - Order history\n   • **Addresses** - Delivery addresses\n   • **Settings** - Preferences\n\n**Tip:** Email updated rakho notifications ke liye!"
        : "👤 **Account Management:**\n\n1. Click profile icon (top right)\n2. Access:\n   • **My Profile** - Update personal info\n   • **My Orders** - View order history\n   • **Addresses** - Manage addresses\n   • **Settings** - Preferences\n\n**Tip:** Keep email updated for notifications!";
    }

    // ===== LOGIN & REGISTER =====
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('kaise login') || lowerMessage.includes('login karna')) {
      return isUrdu
        ? "🔐 **Login Kaise Karein:**\n\n**Options:**\n1. **Email + Password** - Apni details dalo\n2. **Google Login** - 'Continue with Google' click karo\n\n**Password Bhool Gaye?**\n• 'Forgot Password' click karo\n• Email dalo, OTP aayega\n• Naya password set karo!\n\nAccount nahi hai? **'Sign Up'** pe click karo!"
        : "🔐 **Login to Buyonix:**\n\n**Options:**\n1. **Email & Password** - Enter your credentials\n2. **Google Login** - Click 'Continue with Google'\n\n**Forgot Password?**\n• Click 'Forgot Password'\n• Enter email, receive OTP\n• Set new password!\n\nNo account? Click **'Sign Up'**!";
    }

    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('account banana') ||
      lowerMessage.includes('naya account') || lowerMessage.includes('account kaise') || lowerMessage.includes('create account')) {
      return isUrdu
        ? "📝 **Account Banana:**\n\n1. **'Sign Up'** button click karo\n2. Name, email, password dalo\n3. Ya **'Continue with Google'** use karo\n4. Email verify karo\n5. Shopping shuru karo!\n\n**Fayde:** Order tracking, wishlist, fast checkout, exclusive deals!"
        : "📝 **Create an Account:**\n\n1. Click **'Sign Up'** button\n2. Enter name, email, password\n3. Or use **'Continue with Google'**\n4. Verify your email\n5. Start shopping!\n\n**Benefits:** Order tracking, wishlist, faster checkout, exclusive deals!";
    }

    // ===== REVIEWS & RATINGS =====
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback') ||
      lowerMessage.includes('rai') || lowerMessage.includes('stars')) {
      return isUrdu
        ? "⭐ **Reviews & Ratings:**\n\n**Review Likhna:**\n1. Jo product liya, uski page pe jao\n2. **Reviews** section tak scroll karo\n3. **'Write a Review'** click karo\n4. Stars do (1-5) aur feedback likho\n5. Submit!\n\nDoosron ko faisla karne mein madad milti hai!"
        : "⭐ **Reviews & Ratings:**\n\n**To Write a Review:**\n1. Go to the product you purchased\n2. Scroll to **Reviews** section\n3. Click **'Write a Review'**\n4. Rate 1-5 stars and add feedback\n5. Submit!\n\nHelps others make decisions!";
    }

    // ===== RECOMMENDATIONS =====
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion') || lowerMessage.includes('for you') ||
      lowerMessage.includes('mere liye') || lowerMessage.includes('kya lu')) {
      return isUrdu
        ? "🎯 **AI Recommendations:**\n\nBuyonix AI aapke liye products suggest karta hai!\n\n**Kaise kaam karta hai:**\n• Aap kya browse karte ho\n• Kya purchase kiya\n• Similar customers kya lete hain\n\nHome page pe **'Recommended For You'** section dekho!"
        : "🎯 **AI Recommendations:**\n\nBuyonix uses AI to suggest products you'll love!\n\n**How it works:**\n• Based on your browsing history\n• Products you've purchased\n• Similar customers' preferences\n\nCheck **'Recommended For You'** on Home page!";
    }

    // ===== CHAT WITH SELLER =====
    if (lowerMessage.includes('chat') || lowerMessage.includes('seller se baat') || lowerMessage.includes('seller ko contact') ||
      lowerMessage.includes('message') || lowerMessage.includes('sawaal') || lowerMessage.includes('contact seller')) {
      return isUrdu
        ? "💬 **Seller Se Baat Karna:**\n\n1. Kisi bhi product page pe jao\n2. **'Chat with Seller'** button click karo\n3. Sawaal pucho product ke baare mein\n4. Price, shipping wagera negotiate karo\n\nReal-time chat hai - sellers jaldi jawab dete hain!"
        : "💬 **Chat with Sellers:**\n\n1. Go to any product page\n2. Click **'Chat with Seller'** button\n3. Ask questions about the product\n4. Negotiate price, shipping, etc.\n\nReal-time messaging - sellers respond quickly!";
    }

    // ===== DEALS & DISCOUNTS =====
    if (lowerMessage.includes('discount') || lowerMessage.includes('deal') || lowerMessage.includes('offer') ||
      lowerMessage.includes('sale') || lowerMessage.includes('sasta') || lowerMessage.includes('kam price') || lowerMessage.includes('coupon')) {
      return isUrdu
        ? "🏷️ **Deals & Discounts:**\n\n**Deals Kahan Milein:**\n• **Home page** pe featured deals\n• Products pe **red discount badge** dekho\n• Navbar mein **Deals** section\n\n**Coupon Codes:**\n• Checkout pe code dalo\n• Newsletter subscribe karo exclusive codes ke liye!\n\n**Flash Sales:** Limited time - jaldi karo!"
        : "🏷️ **Deals & Discounts:**\n\n**Find Deals:**\n• Check **Home page** for featured deals\n• Look for **red discount badges** on products\n• Visit **Deals** section in navbar\n\n**Coupon Codes:**\n• Enter code at checkout\n• Subscribe to newsletter for exclusive codes!\n\n**Flash Sales:** Limited-time offers - act fast!";
    }

    // ===== WISHLIST / FAVORITES =====
    if (lowerMessage.includes('wishlist') || lowerMessage.includes('favorite') || lowerMessage.includes('save') ||
      lowerMessage.includes('baad mein') || lowerMessage.includes('dil laga') || lowerMessage.includes('save for later')) {
      return isUrdu
        ? "❤️ **Wishlist / Pasand:**\n\n**Product Save Karna:**\n1. Product pe **heart icon** ❤️ click karo\n2. Wishlist mein add ho gaya!\n\n**Wishlist Dekhna:**\n• Profile → **My Wishlist**\n• Saved items dekho\n• Jab chaaho cart mein daalo!"
        : "❤️ **Wishlist / Favorites:**\n\n**To Save Products:**\n1. Click the **heart icon** ❤️ on any product\n2. Product saved to your wishlist!\n\n**View Wishlist:**\n• Profile → **My Wishlist**\n• See all saved items\n• Move to cart when ready!";
    }

    // ===== CONTACT & SUPPORT =====
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') ||
      lowerMessage.includes('madad') || lowerMessage.includes('problem') || lowerMessage.includes('shikayat') || lowerMessage.includes('customer service')) {
      return isUrdu
        ? "📞 **Contact Buyonix:**\n\n• **Email:** support@buyonix.com\n• **Phone:** +92 300 0579453\n• **Address:** Air University E9, Islamabad\n\n**Timing:** Mon-Sat, 9 AM - 6 PM\n\nYa phir mujhse yahan baat karo! Main 24/7 available hoon 🤖"
        : "📞 **Contact Buyonix:**\n\n• **Email:** support@buyonix.com\n• **Phone:** +92 300 0579453\n• **Address:** Air University E9, Islamabad\n\n**Hours:** Mon-Sat, 9 AM - 6 PM\n\nOr chat with me here - I'm available 24/7! 🤖";
    }

    // ===== ABOUT BUYONIX =====
    if (lowerMessage.includes('about') || lowerMessage.includes('buyonix kya') || lowerMessage.includes('ye kya hai') || lowerMessage.includes('what is buyonix')) {
      return isUrdu
        ? "🛍️ **Buyonix Kya Hai:**\n\nBuyonix ek AI-powered e-commerce platform hai!\n\n**Special Features:**\n• 🔍 **Visual Search** - Photo se product dhundo\n• 💰 **Bargaining** - Seller se rate negotiate karo\n• 🎯 **AI Recommendations** - Personalized suggestions\n• 💬 **Real-time Chat** - Sellers se baat karo\n• 🛡️ **Secure Payments** - Safe payment options\n\nSmart shopping Buyonix ke saath!"
        : "🛍️ **About Buyonix:**\n\nBuyonix is an AI-powered e-commerce platform!\n\n**Special Features:**\n• 🔍 **Visual Search** - Find products using images\n• 💰 **Smart Bargaining** - Negotiate prices with sellers\n• 🎯 **AI Recommendations** - Personalized suggestions\n• 💬 **Real-time Chat** - Talk to sellers directly\n• 🛡️ **Secure Payments** - Multiple safe options\n\nShop smarter with Buyonix!";
    }

    // ===== SAFETY & SECURITY =====
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('privacy') ||
      lowerMessage.includes('mehfooz') || lowerMessage.includes('trust')) {
      return isUrdu
        ? "🔒 **Safety & Security:**\n\n• **Secure Payments** - SSL encrypted\n• **Verified Sellers** - Sab sellers verified hain\n• **Buyer Protection** - Money-back guarantee\n• **Privacy** - Data share nahi hota\n• **Secure Login** - 2FA available\n\nBuyonix pe bharosa karke shopping karo!"
        : "🔒 **Safety & Security:**\n\n• **Secure Payments** - SSL encrypted transactions\n• **Verified Sellers** - All sellers are verified\n• **Buyer Protection** - Money-back guarantee\n• **Privacy** - Your data is never shared\n• **Secure Login** - 2FA available\n\nShop with confidence on Buyonix!";
    }

    // ===== GREETINGS =====
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') ||
      lowerMessage.includes('salam') || lowerMessage.includes('assalam') || lowerMessage.includes('aoa') ||
      lowerMessage.includes('kaise ho') || lowerMessage.includes('kya hal')) {
      return isUrdu
        ? "👋 **Wa Alaikum Assalam! Buyonix mein Khush Amdeed!**\n\nMain aapka AI assistant hoon. Mujh se pucho:\n\n• 🔍 Visual Search kaise use karein\n• 💰 Bargaining kaise karein\n• 🛒 Shopping kaise karein\n• 📦 Order kaise track karein\n• 💳 Payment methods\n• 🏪 Seller kaise banein\n\nBatao, kya madad chahiye?"
        : "👋 **Hello! Welcome to Buyonix!**\n\nI'm your AI assistant. Ask me about:\n\n• 🔍 How to use Visual Search\n• 💰 How to bargain prices\n• 🛒 How to shop\n• 📦 How to track orders\n• 💳 Payment methods\n• 🏪 How to become a seller\n\nHow can I help you?";
    }

    // ===== THANKS =====
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('shukriya') ||
      lowerMessage.includes('jazak') || lowerMessage.includes('bohot acha')) {
      return isUrdu
        ? "😊 **Shukriya!** Khushi hui madad karke!\n\nKuch aur poochna hai Buyonix ke baare mein? Main 24/7 yahan hoon! 🤖"
        : "😊 **You're welcome!** Happy to help!\n\nAnything else you'd like to know about Buyonix? I'm here 24/7! 🤖";
    }

    // ===== PRODUCT SPECIFIC =====
    if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('cheez') || lowerMessage.includes('saman')) {
      return isUrdu
        ? "📦 **Products Dekhna:**\n\n1. **Shop** page pe sab products hain\n2. Search bar se dhundo\n3. Categories se browse karo\n4. Product click karo details ke liye\n5. **'Add to Cart'** ya **'Buy Now'** dabao\n\nVisual Search bhi try karo - photo upload karo similar products milenge!"
        : "📦 **Viewing Products:**\n\n1. All products are on **Shop** page\n2. Use search bar to find\n3. Browse by categories\n4. Click product for details\n5. Click **'Add to Cart'** or **'Buy Now'**\n\nTry Visual Search too - upload a photo to find similar products!";
    }

    // ===== DEFAULT FALLBACK =====
    return isUrdu
      ? "🤖 **Main Buyonix Assistant Hoon!**\n\nMujh se pucho:\n• **Visual Search** - Photo se product dhundo\n• **Bargaining** - Rate negotiate karo\n• **Payment** - EasyPaisa, JazzCash, COD\n• **Orders** - Track karo\n• **Seller** - Apni shop kholein\n• **Cart** - Shopping help\n• **Returns** - Wapsi policy\n\nKya madad chahiye?"
      : "🤖 **I'm your Buyonix Assistant!**\n\nAsk me about:\n• **Visual Search** - Find products with images\n• **Bargaining** - Negotiate prices\n• **Payment** - EasyPaisa, JazzCash, COD\n• **Orders** - Track & manage\n• **Seller** - How to sell on Buyonix\n• **Cart** - Shopping help\n• **Returns** - Refund policy\n\nHow can I help you?";
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
      const isUrdu = language === 'ur';

      // Add loading message
      const loadingId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: loadingId,
        text: isUrdu ? '🔍 Products dhundh raha hoon...' : '🔍 Searching for products...',
        sender: 'bot',
        timestamp: new Date(),
      }]);

      try {
        const productName = extractProductName(userText);
        if (productName.length > 1) {
          const products = await searchProducts(productName);
          // Remove loading message and add result
          setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
            id: (Date.now() + 2).toString(),
            text: formatProductInfo(products, isUrdu),
            sender: 'bot',
            timestamp: new Date(),
          }));
        } else {
          // Query too vague
          setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
            id: (Date.now() + 2).toString(),
            text: isUrdu
              ? '🤔 Konsa product dekhna hai? Naam batao jaise "iPhone price" ya "laptop stock"'
              : '🤔 Which product are you looking for? Try "iPhone price" or "laptop stock"',
            sender: 'bot',
            timestamp: new Date(),
          }));
        }
      } catch {
        setMessages((prev) => prev.filter(m => m.id !== loadingId).concat({
          id: (Date.now() + 2).toString(),
          text: isUrdu
            ? '❌ Products search mein error. Please dobara try karo.'
            : '❌ Error searching products. Please try again.',
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
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="font-semibold">Chatling Bot</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white hover:text-gray-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
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

      {/* Language Toggle */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
        <span className="text-xs text-gray-500 mr-1">🌐</span>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('ur')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${language === 'ur'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
        >
          Roman Urdu
        </button>
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
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{formatMessage(message.text)}</p>

                {/* Feedback buttons for bot messages */}
                {message.sender === 'bot' && !helpfulResponse[message.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600 mb-2">Was this response helpful?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'yes')}
                        className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'no')}
                        className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {helpfulResponse[message.id] && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-green-600">
                      {helpfulResponse[message.id] === 'yes' ? '✓ Thank you for your feedback!' : '✗ Thanks, we\'ll improve!'}
                    </p>
                  </div>
                )}
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
            placeholder={language === 'ur' ? 'Yahan apna sawal likho...' : 'Type your message here...'}
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
        <p className="text-xs text-gray-500 text-center mt-2">Powered by Chatling</p>
      </div>
    </div>
  );
};

export default Chatbot;

