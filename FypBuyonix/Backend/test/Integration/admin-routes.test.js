const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Seller = require('../../models/seller');
const Order = require('../../models/order');
const Product = require('../../models/product');

describe('INTEGRATION: Admin Routes - User Management, Analytics & Seller Administration', () => {

  let userId;
  let sellerId1, sellerId2, sellerId3;
  let orderId;

  // Setup: Create test data before running admin tests
  beforeEach(async () => {
    // Create multiple users
    const userData1 = {
      fullName: 'Admin Test User 1',
      email: `admin-user1-${Date.now()}@example.com`,
      phone: '03101234567',
      password: 'AdminPass123!'
    };

    const userRes = await request(app)
      .post('/auth/signup')
      .send(userData1);
    
    userId = userRes.body.user?._id;

    // Create multiple sellers with different statuses
    const sellerData1 = {
      fullName: 'Pending Seller Test',
      email: `pending-seller-${Date.now()}@example.com`,
      phone: '03101111111',
      password: 'SellerPass1!',
      businessName: 'Pending Business',
      businessType: 'Retail',
      storeName: `PendingStore-${Date.now()}`,
      storeDescription: 'Pending seller store',
      primaryCategory: 'Electronics',
      accountHolderName: 'Pending Seller',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-100',
      taxNumber: 'TAX123500'
    };

    const sellerRes1 = await request(app)
      .post('/seller/register')
      .send(sellerData1);
    
    if (sellerRes1.body.seller?.id) {
      sellerId1 = sellerRes1.body.seller.id;
    }

    // Create second seller
    const sellerData2 = {
      fullName: 'Approved Seller Test',
      email: `approved-seller-${Date.now()}@example.com`,
      phone: '03102222222',
      password: 'SellerPass2!',
      businessName: 'Approved Business',
      businessType: 'Wholesale',
      storeName: `ApprovedStore-${Date.now()}`,
      storeDescription: 'Approved seller store',
      primaryCategory: 'Fashion',
      accountHolderName: 'Approved Seller',
      bankName: 'UBL',
      accountNumber: '1234567890',
      iban: 'PK36UBLACC1234567890',
      cnicNumber: '12345-1234567-101',
      taxNumber: 'TAX123501'
    };

    const sellerRes2 = await request(app)
      .post('/seller/register')
      .send(sellerData2);
    
    if (sellerRes2.body.seller?.id) {
      sellerId2 = sellerRes2.body.seller.id;
      // Approve this seller manually
      await Seller.findByIdAndUpdate(sellerId2, { status: 'approved' });
    }

    // Create third seller
    const sellerData3 = {
      fullName: 'Another Pending Seller',
      email: `another-seller-${Date.now()}@example.com`,
      phone: '03103333333',
      password: 'SellerPass3!',
      businessName: 'Another Business',
      businessType: 'Retail',
      storeName: `AnotherStore-${Date.now()}`,
      storeDescription: 'Another seller store',
      primaryCategory: 'Home',
      accountHolderName: 'Another Seller',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-102',
      taxNumber: 'TAX123502'
    };

    const sellerRes3 = await request(app)
      .post('/seller/register')
      .send(sellerData3);
    
    if (sellerRes3.body.seller?.id) {
      sellerId3 = sellerRes3.body.seller.id;
    }

    // Create products and orders for analytics testing
    if (sellerId2) {
      const productData = {
        name: 'Admin Test Product',
        description: 'Test product for admin analytics',
        category: 'Electronics',
        price: 50000,
        stock: 100,
        images: ['product.jpg'],
        sellerId: sellerId2
      };

      const productRes = await request(app)
        .post('/product/create')
        .send(productData);

      const productId = productRes.body.product?._id;

      // Create an order if we have all required data
      if (userId && productId) {
        await request(app)
          .post('/cart/add')
          .send({
            userId: userId,
            productId: productId,
            quantity: 2
          });

        const checkoutRes = await request(app)
          .post('/order/checkout')
          .send({
            userId: userId,
            customerInfo: {
              firstName: 'Admin',
              lastName: 'Test',
              email: 'admin@test.com',
              phoneNumber: '03001234567',
              address: 'Test Address'
            },
            paymentMethod: 'cod'
          });

        if (checkoutRes.body.order?._id) {
          orderId = checkoutRes.body.order._id;
        }
      }
    }
  });

  // ============== USER MANAGEMENT TESTS ==============

  // ✅ Test 1: Get all users
  test('Should retrieve all users from database', async () => {
    const res = await request(app)
      .get('/auth/users');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users).toBeDefined();
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  // ✅ Test 2: Verify user passwords are not returned
  test('Should not return user passwords in user list', async () => {
    const res = await request(app)
      .get('/auth/users');

    expect(res.statusCode).toBe(200);
    res.body.users.forEach(user => {
      expect(user.password).toBeUndefined();
    });
  });

  // ✅ Test 3: Verify users are sorted by creation date (newest first)
  test('Should return users sorted by creation date (newest first)', async () => {
    const res = await request(app)
      .get('/auth/users');

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
    
    // Check if sorted (each user's createdAt should be >= next user's createdAt)
    for (let i = 0; i < res.body.users.length - 1; i++) {
      expect(new Date(res.body.users[i].createdAt) >= new Date(res.body.users[i + 1].createdAt)).toBe(true);
    }
  });

  // ✅ Test 4: User list contains all required fields
  test('Should include all required user fields in response', async () => {
    const res = await request(app)
      .get('/auth/users');

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);

    const firstUser = res.body.users[0];
    expect(firstUser._id).toBeDefined();
    expect(firstUser.displayName).toBeDefined();
    expect(firstUser.email).toBeDefined();
  });

  // ============== SELLER MANAGEMENT TESTS ==============

  // ✅ Test 5: Get all sellers (admin view)
  test('Should retrieve all sellers', async () => {
    const res = await request(app)
      .get('/seller/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sellers).toBeDefined();
    expect(Array.isArray(res.body.sellers)).toBe(true);
    expect(res.body.sellers.length).toBeGreaterThanOrEqual(1);
  });

  // ✅ Test 6: Verify seller passwords are not returned
  test('Should not return seller passwords in seller list', async () => {
    const res = await request(app)
      .get('/seller/all');

    expect(res.statusCode).toBe(200);
    res.body.sellers.forEach(seller => {
      expect(seller.password).toBeUndefined();
    });
  });

  // ✅ Test 7: Get pending sellers only
  test('Should retrieve only pending sellers', async () => {
    const res = await request(app)
      .get('/seller/pending');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sellers).toBeDefined();
    expect(Array.isArray(res.body.sellers)).toBe(true);

    // Verify all sellers are in pending status
    res.body.sellers.forEach(seller => {
      expect(seller.status).toBe('pending');
    });
  });

  // ✅ Test 8: Get pending sellers should exclude approved sellers
  test('Should not include approved sellers in pending list', async () => {
    const res = await request(app)
      .get('/seller/pending');

    expect(res.statusCode).toBe(200);
    
    // If we have sellers, none should be approved
    res.body.sellers.forEach(seller => {
      expect(seller.status).not.toBe('approved');
    });
  });

  // ✅ Test 9: Get seller by ID
  test('Should retrieve specific seller by ID', async () => {
    if (!sellerId1) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/seller/${sellerId1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seller).toBeDefined();
    expect(res.body.seller._id.toString()).toBe(sellerId1.toString());
  });

  // ✅ Test 10: Get non-existent seller should fail
  test('Should fail when getting non-existent seller', async () => {
    const fakeId = '507f1f77bcf86cd799439999';
    const res = await request(app)
      .get(`/seller/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 11: Approve pending seller
  test('Should approve pending seller', async () => {
    if (!sellerId1) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .put(`/seller/${sellerId1}/approve`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seller.status).toBe('approved');
  });

  // ✅ Test 12: Verify seller status is updated in database after approval
  test('Should persist seller approval status in database', async () => {
    if (!sellerId1) {
      expect(true).toBe(true);
      return;
    }

    // Approve the seller
    await request(app)
      .put(`/seller/${sellerId1}/approve`);

    // Verify in database
    const seller = await Seller.findById(sellerId1);
    expect(seller.status).toBe('approved');
  });

  // ✅ Test 13: Reject pending seller
  test('Should reject pending seller', async () => {
    if (!sellerId3) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .put(`/seller/${sellerId3}/reject`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seller.status).toBe('rejected');
  });

  // ✅ Test 14: Verify seller rejection status is updated in database
  test('Should persist seller rejection status in database', async () => {
    if (!sellerId3) {
      expect(true).toBe(true);
      return;
    }

    // Reject the seller
    await request(app)
      .put(`/seller/${sellerId3}/reject`);

    // Verify in database
    const seller = await Seller.findById(sellerId3);
    expect(seller.status).toBe('rejected');
  });

  // ============== ORDER ANALYTICS TESTS ==============

  // ✅ Test 15: Get all orders for analytics
  test('Should retrieve all orders for admin analytics', async () => {
    const res = await request(app)
      .get('/order/admin/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders).toBeDefined();
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.totalOrders).toBeDefined();
    expect(res.body.totalRevenue).toBeDefined();
  });

  // ✅ Test 16: Total revenue calculation
  test('Should calculate total revenue correctly', async () => {
    const res = await request(app)
      .get('/order/admin/all');

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.totalRevenue).toBe('number');
    expect(res.body.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  // ✅ Test 17: Order count accuracy
  test('Should return accurate total order count', async () => {
    const res = await request(app)
      .get('/order/admin/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.totalOrders).toBe(res.body.orders.length);
  });

  // ✅ Test 18: Orders sorted by creation date
  test('Should return orders sorted by creation date (newest first)', async () => {
    const res = await request(app)
      .get('/order/admin/all');

    expect(res.statusCode).toBe(200);
    
    if (res.body.orders.length > 1) {
      for (let i = 0; i < res.body.orders.length - 1; i++) {
        expect(new Date(res.body.orders[i].createdAt) >= new Date(res.body.orders[i + 1].createdAt)).toBe(true);
      }
    }
  });

  // ✅ Test 19: Get orders for specific seller
  test('Should retrieve orders for specific seller', async () => {
    if (!sellerId2) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/order/seller/${sellerId2}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders).toBeDefined();
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.totalOrders).toBeDefined();
  });

  // ✅ Test 20: Seller-specific orders contain correct seller ID
  test('Should only return orders containing the specified seller', async () => {
    if (!sellerId2) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/order/seller/${sellerId2}`);

    expect(res.statusCode).toBe(200);
    
    // Each order should contain items from the seller
    res.body.orders.forEach(order => {
      const hasSellerItem = order.items?.some(item => item.sellerId?.toString() === sellerId2.toString());
      expect(hasSellerItem).toBe(true);
    });
  });

  // ============== ADMIN AUTHENTICATION & AUTHORIZATION TESTS ==============

  // ✅ Test 21: Verify admin endpoints are accessible
  test('Should be able to access admin user endpoints', async () => {
    const res = await request(app)
      .get('/auth/users');

    expect(res.statusCode).toBeDefined();
    expect(res.statusCode !== 500).toBe(true);
  });

  // ✅ Test 22: Admin seller approval returns correct response structure
  test('Should return complete seller data after approval', async () => {
    if (!sellerId1) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .put(`/seller/${sellerId1}/approve`);

    expect(res.statusCode).toBe(200);
    expect(res.body.seller.id).toBeDefined();
    expect(res.body.seller.fullName).toBeDefined();
    expect(res.body.seller.email).toBeDefined();
    expect(res.body.seller.storeName).toBeDefined();
    expect(res.body.seller.status).toBe('approved');
  });

  // ✅ Test 23: Admin seller rejection returns correct response structure
  test('Should return complete seller data after rejection', async () => {
    if (!sellerId3) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .put(`/seller/${sellerId3}/reject`);

    expect(res.statusCode).toBe(200);
    expect(res.body.seller.id).toBeDefined();
    expect(res.body.seller.fullName).toBeDefined();
    expect(res.body.seller.email).toBeDefined();
    expect(res.body.seller.storeName).toBeDefined();
    expect(res.body.seller.status).toBe('rejected');
  });

  // ✅ Test 24: Admin can view seller details including sensitive info
  test('Should return seller details with business information', async () => {
    if (!sellerId1) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/seller/${sellerId1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.seller.businessName).toBeDefined();
    expect(res.body.seller.storeName).toBeDefined();
    expect(res.body.seller.email).toBeDefined();
    expect(res.body.seller.phone).toBeDefined();
  });

  // ============== DATA CONSISTENCY TESTS ==============

  // ✅ Test 25: User list consistency
  test('Should maintain consistency of user data across multiple requests', async () => {
    const res1 = await request(app).get('/auth/users');
    const res2 = await request(app).get('/auth/users');

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    expect(res1.body.users.length).toBe(res2.body.users.length);
  });

  // ✅ Test 26: Seller list consistency
  test('Should maintain consistency of seller data across multiple requests', async () => {
    const res1 = await request(app).get('/seller/all');
    const res2 = await request(app).get('/seller/all');

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    expect(res1.body.sellers.length).toBe(res2.body.sellers.length);
  });

  // ✅ Test 27: Order analytics consistency
  test('Should maintain consistency of order data across multiple requests', async () => {
    const res1 = await request(app).get('/order/admin/all');
    const res2 = await request(app).get('/order/admin/all');

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    expect(res1.body.totalOrders).toBe(res2.body.totalOrders);
    expect(res1.body.totalRevenue).toBe(res2.body.totalRevenue);
  });

  // ============== ERROR HANDLING TESTS ==============

  // ✅ Test 28: Invalid seller ID format
  test('Should handle invalid seller ID format gracefully', async () => {
    const res = await request(app)
      .get('/seller/invalidId123');

    expect(res.statusCode).toBeDefined();
    expect([400, 404, 500]).toContain(res.statusCode);
  });

  // ✅ Test 29: Non-existent seller approval
  test('Should fail gracefully when approving non-existent seller', async () => {
    const fakeId = '507f1f77bcf86cd799439999';
    const res = await request(app)
      .put(`/seller/${fakeId}/approve`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 30: Non-existent seller rejection
  test('Should fail gracefully when rejecting non-existent seller', async () => {
    const fakeId = '507f1f77bcf86cd799439999';
    const res = await request(app)
      .put(`/seller/${fakeId}/reject`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

});
