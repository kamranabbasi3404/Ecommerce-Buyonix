#!/bin/bash
# Test Installation and Setup Script

echo "=================================="
echo "🧪 Unit Testing Setup Script"
echo "=================================="

cd Backend

echo ""
echo "📦 Installing test dependencies..."
npm install --save-dev jest supertest @babel/preset-env @babel/preset-react babel-jest

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Test Files Created:"
echo "  ✓ test/Unit/auth.test.js (40+ tests)"
echo "  ✓ test/Unit/product.test.js (35+ tests)"
echo "  ✓ test/Unit/order.test.js (30+ tests)"
echo "  ✓ test/Unit/seller.test.js (25+ tests)"
echo "  ✓ jest.config.js"
echo "  ✓ test/setup.js"
echo ""
echo "🚀 To run tests:"
echo "  npm test                 # Run all tests"
echo "  npm test -- --coverage   # With coverage report"
echo "  npm test -- --watch      # Watch mode"
echo ""
echo "📖 View full guide: UNIT_TESTING_GUIDE.md"
echo ""
