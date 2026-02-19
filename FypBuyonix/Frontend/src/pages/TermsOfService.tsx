import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-teal-100 mt-2">Last updated: November 16, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction & Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Buyonix ("Company," "we," "us," "our"). These Terms of Service ("Terms") constitute a legally binding agreement between you
            ("User," "you," "your") and Buyonix regarding your use of our website, mobile application, and all related services (collectively, "Services").
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing, browsing, or using Buyonix, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            If you do not agree with any part of these Terms, please do not use our Services. We reserve the right to modify these Terms at any time,
            and your continued use of the Services following any changes constitutes your acceptance of the modified Terms.
          </p>
        </section>

        {/* Use License */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </span>
            2. Use License
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Buyonix grants you a limited, non-exclusive, non-transferable, revocable license to use our Services for personal, non-commercial purposes only.
            This license does not include the right to:
          </p>

          <ul className="space-y-3 text-gray-700 mb-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">•</span>
              <span>Modify, copy, or distribute the content of our Services without prior written consent</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">•</span>
              <span>Use our Services for any unlawful purpose or in violation of any applicable laws</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">•</span>
              <span>Reverse engineer, decompile, or attempt to discover the source code or underlying technology</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">•</span>
              <span>Harass, threaten, or abuse any person or entity through our Services</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">•</span>
              <span>Interfere with or disrupt the functionality of our Services or servers</span>
            </li>
          </ul>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            3. User Accounts & Registration
          </h3>

          <div className="space-y-4">
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Creation</h4>
              <p className="text-gray-700">
                To access certain features of Buyonix, you may be required to create an account. You are responsible for providing accurate,
                complete, and current information during registration. You must be at least 18 years old to create an account.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Security</h4>
              <p className="text-gray-700">
                You are solely responsible for maintaining the confidentiality of your account credentials (username and password).
                You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                Buyonix is not liable for any loss or damage resulting from unauthorized access to your account.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Accurate Information</h4>
              <p className="text-gray-700">
                You agree to keep your account information accurate and up-to-date. You are responsible for all activities that occur
                under your account, whether or not authorized by you.
              </p>
            </div>
          </div>
        </section>

        {/* Product Listings & Purchases */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1h7.586a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM5 16a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            4. Product Listings & Purchases
          </h3>

          <div className="space-y-4 text-gray-700">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Product Information</h4>
              <p>
                We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that all product
                information is complete, accurate, or error-free. We reserve the right to correct any errors or inaccuracies.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Order Placement</h4>
              <p>
                By placing an order, you make an offer to purchase the products listed. We reserve the right to accept or reject any order
                for any reason. You will receive confirmation of order acceptance via email.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Pricing & Availability</h4>
              <p>
                All prices are subject to change without notice. Products are subject to availability. If a product is out of stock,
                we will notify you and offer alternatives or provide a full refund.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Payment Methods</h4>
              <p>
                We accept various payment methods including credit cards, debit cards, and other payment processors.
                You agree to provide valid payment information and authorize us to charge your account for purchases.
              </p>
            </div>
          </div>
        </section>

        {/* Returns & Refunds */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </span>
            5. Returns, Refunds & Cancellations
          </h3>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mb-6">
            <p className="text-gray-700">
              Our return and refund policy is detailed separately. Please refer to our <Link to="/terms-of-service" className="text-teal-600 hover:underline">Return Policy</Link> for complete
              information regarding returns, refunds, and cancellations.
            </p>
          </div>

          <div className="space-y-4 text-gray-700">
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-teal-600 font-bold">•</span>
              <span><strong>Return Window:</strong> Most items can be returned within 30 days of purchase in original condition</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-teal-600 font-bold">•</span>
              <span><strong>Refund Processing:</strong> Refunds are processed within 5-7 business days after return receipt</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-teal-600 font-bold">•</span>
              <span><strong>Original Shipping:</strong> Original shipping costs are non-refundable unless the return is due to our error</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-teal-600 font-bold">•</span>
              <span><strong>Cancellations:</strong> Orders can be cancelled within 24 hours of placement for a full refund</span>
            </p>
          </div>
        </section>

        {/* Intellectual Property Rights */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2h10a1 1 0 100-2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </span>
            6. Intellectual Property Rights
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            All content on Buyonix, including but not limited to text, graphics, logos, images, software, and design elements,
            is the exclusive property of Buyonix or our content suppliers and is protected by copyright, trademark, and other intellectual property laws.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Limited License</h4>
              <p className="text-gray-700">
                You are granted a limited, non-exclusive license to use the content on Buyonix for personal, non-commercial purposes only.
                You may not reproduce, distribute, or transmit any content without prior written consent from Buyonix.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">User-Generated Content</h4>
              <p className="text-gray-700">
                By submitting reviews, comments, or other content to Buyonix, you grant us a non-exclusive, royalty-free license to use,
                reproduce, modify, and distribute such content.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Trademark Notice</h4>
              <p className="text-gray-700">
                BUYONIX and all related logos and trademarks are the trademarks of Buyonix. You may not use these trademarks without our prior written consent.
              </p>
            </div>
          </div>
        </section>

        {/* Warranty Disclaimer */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13 7H7v6h6V7zM7 5a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V5zm5.172-1.414a1 1 0 11-1.414-1.414L16.5 1.086a1 1 0 011.414 0l3.5 3.5a1 1 0 01-1.414 1.414L18.914 2.5zM5 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
            7. Warranty Disclaimer
          </h3>

          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-6">
            <p className="text-gray-700 font-semibold mb-3">
              BUYONIX AND ITS SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OR REPRESENTATIONS, EXPRESSED OR IMPLIED.
            </p>
            <p className="text-gray-700">
              We disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose,
              and non-infringement. We do not warrant that our Services will be uninterrupted, error-free, or secure.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v1h4a1 1 0 010 2h-1v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5H1a1 1 0 010-2h4V2zM7 7a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
              </svg>
            </span>
            8. Limitation of Liability
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            TO THE FULLEST EXTENT PERMITTED BY LAW, BUYONIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
            OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION,
            EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Our total liability for any claim arising from or related to these Terms or your use of our Services shall not exceed the amount paid by you
            to Buyonix in the 12 months preceding the claim, or $100, whichever is greater.
          </p>
        </section>

        {/* Indemnification */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </span>
            9. Indemnification
          </h3>

          <p className="text-gray-700 leading-relaxed">
            You agree to indemnify, defend, and hold harmless Buyonix, its officers, directors, employees, and agents from any claims,
            damages, liabilities, or expenses arising from your violation of these Terms, your violation of any law or regulation,
            or your infringement of any third-party rights.
          </p>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 110.5 5.997V5.5a.5.5 0 011 0V3H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h2.006a.5.5 0 000-1H1.146A6.002 6.002 0 0113.477 14.89z" clipRule="evenodd" />
              </svg>
            </span>
            10. Prohibited Activities
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            You agree not to engage in any of the following prohibited activities:
          </p>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Harassing, threatening, or abusing any person or entity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Posting false, misleading, or defamatory content</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Attempting to gain unauthorized access to our systems or user accounts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Uploading malware, viruses, or harmful code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Spamming or sending unsolicited messages</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Engaging in fraudulent or illegal activities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">✕</span>
              <span>Violating any applicable laws, regulations, or third-party rights</span>
            </li>
          </ul>
        </section>

        {/* Seller Terms */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </span>
            11. Seller Account Terms
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            If you register as a seller on Buyonix, you agree to the following additional terms:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Compliance</h4>
              <p className="text-gray-700">
                You agree to comply with all applicable laws and regulations in the jurisdiction where you conduct business.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Product Quality</h4>
              <p className="text-gray-700">
                You warrant that all products you list are authentic, accurately described, and comply with all applicable laws.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Commission & Fees</h4>
              <p className="text-gray-700">
                You agree to pay Buyonix the applicable commission and fees for each transaction completed through our platform.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Account Suspension</h4>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your seller account for violation of these Terms, fraudulent activity,
                or repeated customer complaints.
              </p>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
            12. Termination of Account
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            Buyonix reserves the right to terminate or suspend your account at any time for any reason, including:
          </p>

          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">!</span>
              <span>Violation of these Terms of Service</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">!</span>
              <span>Fraudulent, abusive, or illegal activity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">!</span>
              <span>Non-payment of fees or commissions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">!</span>
              <span>At our sole discretion for business reasons</span>
            </li>
          </ul>
        </section>

        {/* Dispute Resolution */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </span>
            13. Dispute Resolution & Governing Law
          </h3>

          <div className="space-y-4 text-gray-700">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Informal Resolution</h4>
              <p>
                In the event of a dispute, we encourage you to contact us first to attempt an amicable resolution.
                Please reach out to support@buyonix.com with a detailed description of the issue.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Governing Law</h4>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Buyonix is located,
                without regard to its conflict of law principles.
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Jurisdiction</h4>
              <p>
                You agree that any legal action or proceedings arising from these Terms shall be brought exclusively in the courts
                of the jurisdiction specified in the governing law clause.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </span>
            14. Changes to Terms of Service
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Buyonix reserves the right to modify these Terms at any time. Changes will be effective when posted to our website.
            Your continued use of our Services following the posting of modified Terms constitutes your acceptance of the updated Terms.
          </p>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-6">
            <p className="text-gray-700 font-semibold">
              We recommend reviewing these Terms periodically to stay informed of any updates or changes.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-teal-50 to-gray-50 p-8 rounded-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions or concerns regarding these Terms of Service, please contact us:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-teal-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-700">support@buyonix.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-teal-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-700">+92 300 0579453</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-teal-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-700">Air University E9 Islamabad</p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <div className="mt-12 flex flex-wrap items-center gap-4 justify-center text-gray-600 border-t border-gray-200 pt-8">
          <Link to="/privacy-policy" className="hover:text-teal-600 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/cookie-policy" className="hover:text-teal-600 transition-colors">
            Cookie Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/" className="hover:text-teal-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
