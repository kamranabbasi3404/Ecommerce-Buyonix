import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-teal-100 mt-2">Last updated: November 16, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Buyonix, where we are committed to protecting your personal information and your right to privacy.
            If you have any questions or concerns about our privacy policy or our practices regarding your personal information,
            please contact us at privacy@buyonix.com.
          </p>
          <p className="text-gray-700 leading-relaxed">
            When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously.
            In this privacy policy, we describe our privacy practices in detail. Please read our privacy policy carefully.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            Information We Collect
          </h3>

          <div className="space-y-6">
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h4>
              <p className="text-gray-700">
                We collect personal information that you provide to us when registering an account, making a purchase, or communicating with us.
                This may include: name, email address, phone number, physical address, payment information, shipping address, and any other information you provide.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Automatic Information</h4>
              <p className="text-gray-700">
                When you visit and use our website, we automatically collect certain information about your device and browsing activities.
                This includes: IP address, browser type, pages visited, time and date of visit, and interaction with our website.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cookies and Similar Technologies</h4>
              <p className="text-gray-700">
                We use cookies, web beacons, and similar tracking technologies to enhance your experience on our website.
                These tools help us understand user behavior, remember preferences, and improve our services.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Information</h4>
              <p className="text-gray-700">
                We may receive information about you from third parties, including payment processors, analytics providers, and social media platforms.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </span>
            How We Use Your Information
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            We use the information we collect for various purposes, including:
          </p>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">1</span>
              <span><strong>Processing Transactions:</strong> To complete and fulfill your orders, process payments, and send related information.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">2</span>
              <span><strong>Personalization:</strong> To tailor content, recommendations, and marketing messages to your interests and preferences.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">3</span>
              <span><strong>Improving Services:</strong> To understand user behavior, identify trends, and enhance our website and services.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">4</span>
              <span><strong>Customer Support:</strong> To respond to inquiries, provide technical support, and address customer concerns.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">5</span>
              <span><strong>Marketing Communications:</strong> To send promotional emails, newsletters, and updates about new products and offers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">6</span>
              <span><strong>Fraud Prevention:</strong> To detect, prevent, and address fraudulent activities and other illegal activities.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">7</span>
              <span><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</span>
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            Data Security & Protection Measures
          </h3>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mb-6">
            <p className="text-gray-700">
              We use comprehensive security measures, including encryption and secure data transmission protocols, to protect your personal information.
              However, no internet-based application is 100% secure. While we strive to protect your data with industry-standard security practices,
              we cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Key Security Practices:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Encryption of sensitive data in transit and at rest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Access controls and authentication mechanisms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Compliance with PCI-DSS standards for payment processing</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Sharing of Information */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM6.429 9.428a2.997 2.997 0 00-5.464 1.469A5.008 5.008 0 006 13h3V9.571A2.97 2.97 0 006.429 9.428zM16 13v-3a6 6 0 10-9 5.5V20h7a2 2 0 002-2v-1.268a4 4 0 015.964-3.064A1.988 1.988 0 0020 17v-4a2 2 0 00-2-2zM8 7a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            Sharing of Information
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            We may share your information in the following circumstances:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Service Providers</h4>
              <p className="text-gray-700">We share information with third-party vendors who provide services on our behalf (e.g., payment processors, shipping providers, customer support).</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Business Partners</h4>
              <p className="text-gray-700">We may share aggregated, de-identified information with partners for analytics and marketing purposes.</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Legal Requirements</h4>
              <p className="text-gray-700">We may disclose information when required by law, legal processes, or government requests.</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Business Transactions</h4>
              <p className="text-gray-700">In case of merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
            Your Privacy Rights
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Right to Access</h4>
              <p className="text-gray-700">You have the right to request access to your personal data and obtain a copy of the information we hold about you.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Right to Correction</h4>
              <p className="text-gray-700">You have the right to request correction of inaccurate or incomplete information we hold about you.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Right to Deletion</h4>
              <p className="text-gray-700">You have the right to request deletion of your personal data, subject to certain legal obligations.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Right to Opt-Out</h4>
              <p className="text-gray-700">You have the right to opt out of marketing communications and certain data processing activities.</p>
            </div>
          </div>
        </section>

        {/* Third-Party Links */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM16.243 15.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.757 16.243a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM6 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM10 1a9 9 0 100 18 9 9 0 000-18zm0 2a7 7 0 110 14 7 7 0 010-14z" />
              </svg>
            </span>
            Third-Party Links & Websites
          </h3>

          <p className="text-gray-700 leading-relaxed">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices, security measures, or content of external websites.
            We encourage you to review the privacy policies of any third-party websites before providing personal information. Your use of third-party websites is subject to their terms and policies.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM14.917 9h1.946a6.004 6.004 0 00-2.783-4.118c.454 1.147.748 2.572.837 4.118zM12.455 2.676A6.001 6.001 0 0010 2c-.822 0-1.608.154-2.355.436A6.001 6.001 0 005.545 9H2a1 1 0 000 2h.191A7.001 7.001 0 0010 18a7.001 7.001 0 006.809-7h.191a1 1 0 100-2h-3.545c0-1.268.335-2.467.839-3.324zM14.455 14.26A6.001 6.001 0 0010 16c-.822 0-1.608-.154-2.355-.436A6.003 6.003 0 005.545 11h1.946c.089 1.546.383 2.97.837 4.118A6.001 6.001 0 0010 16c.823 0 1.608.154 2.355.436.454-1.147.748-2.572.837-4.118h1.946z" clipRule="evenodd" />
              </svg>
            </span>
            Children's Privacy
          </h3>

          <p className="text-gray-700 leading-relaxed">
            Our website and services are not directed to children under the age of 13. We do not knowingly collect personal information from children.
            If we become aware that we have collected personal information from a child under 13, we will take appropriate steps to delete such information
            and terminate the child's account. Parents or guardians who believe their child has provided information to us should contact us immediately.
          </p>
        </section>

        {/* International Data Transfers */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </span>
            International Data Transfers
          </h3>

          <p className="text-gray-700 leading-relaxed">
            Your personal information may be transferred to, and processed in, countries other than your country of residence.
            These countries may have data protection laws that differ from your home country. By providing your information to us,
            you consent to such transfers and processing. We implement appropriate safeguards to ensure your data is protected during international transfers.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </span>
            Changes to This Privacy Policy
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this privacy policy periodically to reflect changes in our practices, technology, legal requirements, and other factors.
            Any changes will be effective when we post the updated privacy policy on our website. Your continued use of our website and services
            following the posting of changes constitutes your acceptance of the updated privacy policy.
          </p>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-6">
            <p className="text-gray-700 font-semibold">
              We encourage you to periodically review this privacy policy to stay informed about how we protect your information.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-teal-50 to-gray-50 p-8 rounded-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this privacy policy or our privacy practices, please don't hesitate to contact us:
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
                <p className="text-gray-700">privacy@buyonix.com</p>
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
                <p className="text-gray-700">+1 (234) 567-8900</p>
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
                <p className="text-gray-700">123 Shopping Street, Commerce City, CC 12345</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-gray-600 text-sm">
              For requests related to data subject rights (access, deletion, correction), please include relevant details about your account
              and specify the nature of your request.
            </p>
          </div>
        </section>

        {/* Navigation Links */}
        <div className="mt-12 flex flex-wrap items-center gap-4 justify-center text-gray-600 border-t border-gray-200 pt-8">
          <Link to="/terms-of-service" className="hover:text-teal-600 transition-colors">
            Terms of Service
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

export default PrivacyPolicy;
