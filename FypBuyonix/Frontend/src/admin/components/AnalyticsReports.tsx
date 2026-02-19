import React, { useEffect, useState } from 'react';

const AnalyticsReports: React.FC = () => {
  const [categories, setCategories] = useState<{ name: string; percentage: number }[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/product', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const prods = data.products || [];
        const counts: Record<string, number> = {};
        prods.forEach((p: { category?: string }) => {
          const cat = p.category || 'Other';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const arr = Object.keys(counts).map((k) => ({ name: k, percentage: Math.round((counts[k] / total) * 100) }));
        setCategories(arr.slice(0, 6));
      } catch (err) {
        console.error('Analytics fetch error', err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-base text-gray-600">
          Comprehensive platform insights and reports
        </p>
      </div>

      {/* Revenue Analytics Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
              Daily
            </button>
            <button className="px-3 py-1 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              Weekly
            </button>
            <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
              Monthly
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Revenue Analytics Dashboard</h3>
            <p className="text-gray-500 mb-4">Interactive charts and data visualization would appear here</p>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium">
              View Detailed Report
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Top Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
          <div className="space-y-5">
            {categories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800">{category.name}</span>
                  <span className="text-sm font-semibold text-teal-600">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-2.5 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="w-full py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors font-medium">
              View All Categories →
            </button>
          </div>
        </div>

        {/* Right Card: User Growth */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                6M
              </button>
              <button className="px-3 py-1 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                1Y
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                2Y
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <p className="text-gray-500 text-center">User growth chart</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="w-full py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors font-medium">
              View Detailed Analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;

