# 🛒 Buyonix — AI-Powered E-Commerce Platform

**Buyonix** is a full-stack e-commerce platform built as a Final Year Project (FYP). It features an AI-powered chatbot, visual product search, collaborative filtering recommendations, real-time chat, price bargaining, and multi-role dashboards for buyers, sellers, and admins.

---

## ✨ Key Features

### 🛍️ Buyer Experience
- **Product Browsing** — Shop, Categories, Deals, and detailed product pages
- **AI Chatbot** — Intelligent assistant powered by Google Gemini AI with bilingual support (English & Roman Urdu)
- **Visual Search** — Upload an image to find visually similar products using deep learning
- **Smart Recommendations** — Collaborative filtering-based personalized product suggestions
- **Shopping Cart & Wishlist** — Full cart management with wishlist support
- **Secure Checkout** — Stripe payment integration with order tracking
- **Price Bargaining** — Real-time buyer-seller negotiation system
- **Real-Time Chat** — Socket.io powered live messaging between buyers and sellers
- **Support Tickets** — Customer support system with ticket tracking
- **OTP Verification** — Email-based OTP for password recovery

### 🏪 Seller Dashboard
- Product management (add, edit, delete listings)
- Order management and fulfillment
- Sales analytics and performance tracking
- Chat with buyers and handle bargain requests

### 🔧 Admin Panel
- User and seller management
- Platform-wide analytics and reporting
- Content moderation and support ticket oversight

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose) |
| **AI / ML** | Google Gemini AI, Python (Collaborative Filtering, Visual Search) |
| **Payments** | Stripe |
| **Auth** | bcryptjs, Google OAuth 2.0 (Passport.js), OTP via Nodemailer |
| **Real-Time** | Socket.io |
| **Charts** | Recharts |
| **Testing** | Jest, Supertest, React Testing Library |

---

## 📁 Project Structure

```
FypBuyonix/
├── Frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/           # Home, Shop, Checkout, ProductDetail, etc.
│   │   ├── components/      # Navbar, Chatbot, VisualSearch, Cart, etc.
│   │   ├── admin/           # Admin dashboard panels
│   │   ├── seller/          # Seller dashboard panels
│   │   ├── context/         # React context providers
│   │   └── utils/           # Utility functions
│   └── public/
│
├── Backend/                 # Node.js + Express
│   ├── routes/              # Auth, Product, Order, Chat, Bargain, etc.
│   ├── models/              # Mongoose schemas (User, Product, Order, etc.)
│   ├── ai_models/           # Python ML models
│   │   ├── collaborative_filtering.py
│   │   └── visual_search.py
│   ├── utils/               # Helper utilities
│   ├── config/              # Database config
│   ├── test/                # Jest test suites
│   └── server.js            # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Python 3** (for AI models)
- **Stripe Account** (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamranabbasi3404/Ecommerce-Buyonix.git
   cd Ecommerce-Buyonix/FypBuyonix
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```
   Create a `.env` file with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   STRIPE_SECRET_KEY=your_stripe_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

---

## 🧪 Testing

```bash
cd Backend
npm test
```

---

## 👥 Authors

- **Muhammad Faisal** - [Github](https://github.com/Faisal468)
- **Kamran Abbasi** — [GitHub](https://github.com/kamranabbasi3404)

---

## 📄 License

This project is developed as a Final Year Project (FYP) for academic purposes.
