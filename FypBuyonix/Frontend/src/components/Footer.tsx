import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-full bg-gray-700/60 flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
    {children}
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="BUYONIX Logo" className="h-7 w-7 object-contain" />
            <span className="font-semibold">BUYONIX</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Experience the future of online shopping with AI‑powered features. Visual Search, Smart
            Bargaining, and personalized recommendations all in one place.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <SocialIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.414c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.314h3.59l-.467 3.696h-3.123V24h6.127C23.406 24 24 23.406 24 22.674V1.326C24 .595 23.406 0 22.675 0z" />
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.949 13.949 0 011.671 3.149a4.916 4.916 0 001.523 6.557 4.9 4.9 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085 4.924 4.924 0 004.6 3.417A9.867 9.867 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A9.935 9.935 0 0024 4.557z" />
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.615 3.184C20.403 3.4 21.03 4.03 21.246 4.818 21.6 6.076 21.6 12 21.6 12s0 5.924-.354 7.182a2.392 2.392 0 01-1.683 1.683C18.306 21.2 12.382 21.2 12.382 21.2s-5.924 0-7.182-.354a2.392 2.392 0 01-1.683-1.683C3.163 17.924 3.163 12 3.163 12s0-5.924.354-7.182a2.392 2.392 0 011.683-1.683C6.458 2.8 12.382 2.8 12.382 2.8s5.924 0 7.233.384zM10.4 15.6l5.2-3.6-5.2-3.6v7.2z" />
              </svg>
            </SocialIcon>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-300">
            <li><a href="/About" className="hover:text-white">About Us</a></li>
            <li><a href="Shop" className="hover:text-white">Shop</a></li>
            <li><a href="#" className="hover:text-white">Categories</a></li>
            <li><a href="#" className="hover:text-white">Deals & Offers</a></li>
            <li><a href="/become-seller" className="hover:text-white">Become a Seller</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-3 text-gray-300">
            <li><a href="/support" className="hover:text-white">Customer Support</a></li>
            <li><a href="#" className="hover:text-white">Track Order</a></li>
            <li><a href="#" className="hover:text-white">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white">Shipping Info</a></li>
            <li><a href="/faqs" className="hover:text-white">FAQs</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3"><span>📍</span> Air University E9 Islamabad </li>
            <li className="flex gap-3"><span>📞</span> +92 300 0579453</li>
            <li className="flex gap-3"><span>✉️</span> support@buyonix.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-gray-300 text-lg font-medium">Subscribe to Our Newsletter</p>
          <p className="text-center text-gray-400 mt-2">Get the latest updates on new products and exclusive offers!</p>
          <form className="mt-5 flex max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-md bg-slate-700 text-white placeholder-gray-300 outline-none"
            />
            <button type="button" className="px-5 py-3 bg-teal-500 hover:bg-teal-600 rounded-r-md text-white font-medium">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400">© 2025 Buyonix. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
          </div>
          {/* <div className="flex items-center gap-2 text-gray-300">
            <span className="mr-1">We accept:</span>
            {['Payoneer', 'Stripe', 'JazzCash', 'EasyPaisa'].map((p) => (
              <span key={p} className="px-2 py-1 rounded-full bg-slate-700 text-sm">{p}</span>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
}


