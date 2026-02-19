import { Link } from 'react-router-dom';
import {
  FaBullseye,
  FaHeart,
  FaCog,
  FaShieldAlt,
  FaUser,
  FaTrophy,
  FaImage,
  FaChartLine,
  FaBolt
} from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-400 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">About Buyonix</h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Revolutionizing online shopping with AI-powered features that make your experience smarter, faster, and more personalized.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white rounded-lg shadow-md p-8 relative">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-6">
              <FaBullseye className="text-3xl text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To transform the e-commerce experience by integrating cutting-edge AI technology. We empower customers to shop with confidence, sellers to grow their business, and everyone to benefit from a more intelligent marketplace.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-lg shadow-md p-8 relative">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
              <FaHeart className="text-3xl text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the world's most trusted and innovative e-commerce platform, where technology and human needs perfectly align to create a seamless shopping experience that delights customers and drives success for sellers.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
          <p className="text-gray-600 text-lg">The principles that guide everything we do at Buyonix</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Innovation */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <FaCog className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Innovation</h3>
            <p className="text-gray-600">Constantly pushing boundaries with AI technology.</p>
          </div>

          {/* Trust */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Trust</h3>
            <p className="text-gray-600">Building secure and transparent transactions.</p>
          </div>

          {/* Customer-first */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Customer-first</h3>
            <p className="text-gray-600">Putting your needs at the heart of everything.</p>
          </div>

          {/* Excellence */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <FaTrophy className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Excellence</h3>
            <p className="text-gray-600">Ensuring quality in every interaction.</p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What Makes Us Different</h2>
          <p className="text-gray-600 text-lg">Unique AI-powered features that set Buyonix apart from traditional e-commerce</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Visual Search */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-6">
              <FaImage className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Visual Search</h3>
            <p className="text-gray-600 mb-6">
              Upload any product photo and our AI will find similar items in our catalog instantly. Find exactly what you're looking for with image recognition.
            </p>
            <button className="text-teal-600 border-2 border-teal-600 px-6 py-2 rounded-md hover:bg-teal-50 transition-colors">
              Learn More
            </button>
          </div>

          {/* Smart Bargaining */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <FaChartLine className="text-3xl text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Bargaining</h3>
            <p className="text-gray-600 mb-6">
              Negotiate prices with our intelligent AI assistant to get the best possible deals. Save money while enjoying the shopping experience.
            </p>
            <button className="text-teal-600 border-2 border-teal-600 px-6 py-2 rounded-md hover:bg-teal-50 transition-colors">
              Learn More
            </button>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-6">
              <FaBolt className="text-3xl text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">AI Recommendations</h3>
            <p className="text-gray-600 mb-6">
              Receive personalized product suggestions based on your preferences, browsing history, and shopping behavior.
            </p>
            <button className="text-teal-600 border-2 border-teal-600 px-6 py-2 rounded-md hover:bg-teal-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">500K+</div>
              <div className="text-white text-lg">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-white text-lg">Products Listed</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">1000+</div>
              <div className="text-white text-lg">Verified Sellers</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white text-lg">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Leadership</h2>
          <p className="text-gray-600 text-lg">The team behind Buyonix's innovation and success</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Leader 1 */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-teal-600">MF</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Muhammad Faisal</h3>
            <p className="text-gray-600">CEO & Founder</p>
          </div>

          {/* Leader 2 */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-teal-600">AH</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Abdul Hadi</h3>
            <p className="text-gray-600">CTO</p>
          </div>

          {/* Leader 3 */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-teal-600">KA</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Kamran Ali Abbasi</h3>
            <p className="text-gray-600">Head of AI</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Experience the Future?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Join thousands of satisfied customers who are already enjoying smarter shopping with Buyonix
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-teal-600 text-white px-8 py-3 rounded-md hover:bg-teal-700 transition-colors font-medium"
            >
              Start Shopping
            </Link>
            <Link
              to="/become-seller"
              className="bg-white text-teal-600 border-2 border-teal-600 px-8 py-3 rounded-md hover:bg-teal-50 transition-colors font-medium"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

