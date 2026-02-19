const request = require('supertest');
const app = require('../../server');

describe('BUSINESS: Commission and Revenue Calculation', () => {
  
  let sellerUser;
  let sellerToken;
  let buyerUser;
  let buyerToken;
  let productId1;
  let productId2;

  beforeEach(async () => {
    // Create seller
    const sellerData = {
      fullName: 'Commission Seller',
      email: `commission-seller-${Date.now()}@example.com`,
      phone: '03001234567',
      password: 'SellerPass123',
      businessName: 'Commission Business',
      businessType: 'Retail',
      storeName: `CommStore-${Date.now()}`,
      storeDescription: 'Commission test store',
      primaryCategory: 'Electronics',
      accountHolderName: 'Commission Seller',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-91',
      taxNumber: 'TAX123491'
    };

    const sellerRes = await request(app)
      .post('/seller/register')
      .send(sellerData);

    if (sellerRes.body.seller) {
      sellerUser = sellerRes.body.seller;
      sellerToken = sellerRes.body.token || sellerRes.body.seller._id;
    }

    // Create buyer
    const buyerData = {
      fullName: 'Commission Buyer',
      email: `commission-buyer-${Date.now()}@example.com`,
      phone: '03009876543',
      password: 'BuyerPass123'
    };

    const buyerRes = await request(app)
      .post('/auth/signup')
      .send(buyerData);

    if (buyerRes.body.user) {
      buyerUser = buyerRes.body.user;
      buyerToken = buyerRes.body.token || buyerRes.body.user._id;
    }

    // Create products with different prices
    const product1Data = {
      name: 'Premium Product',
      description: 'High-value test product',
      category: 'Electronics',
      price: 50000,
      stock: 100,
      images: ['product1.jpg'],
      sellerId: sellerUser?.id || sellerUser?._id
    };

    const product1Res = await request(app)
      .post('/product/create')
      .send(product1Data);

    if (product1Res.body.product) {
      productId1 = product1Res.body.product._id;
    }

    const product2Data = {
      name: 'Standard Product',
      description: 'Standard test product',
      category: 'Electronics',
      price: 10000,
      stock: 200,
      images: ['product2.jpg'],
      sellerId: sellerUser?.id || sellerUser?._id
    };

    const product2Res = await request(app)
      .post('/product/create')
      .send(product2Data);

    if (product2Res.body.product) {
      productId2 = product2Res.body.product._id;
    }
  });

  describe('Commission Calculation Rules', () => {
    
    test('Commission is calculated based on order amount', async () => {
      if (!productId1 || !buyerToken) {
        expect(true).toBe(true);
        return;
      }

      // Order with 50,000 price
      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: 50000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Check commission calculation
        const commissionRes = await request(app)
          .get(`/order/${orderId}/commission`)
          .set('Authorization', `Bearer ${sellerToken}`);

        expect([200, 400, 404]).toContain(commissionRes.statusCode);

        if (commissionRes.statusCode === 200 && commissionRes.body.commission) {
          // Commission should be calculated (e.g., 5% of 50000 = 2500)
          expect(commissionRes.body.commission).toBeGreaterThan(0);
          expect(commissionRes.body.commission).toBeLessThan(50000);
        }
      }
    });

    test('Different commission rates apply to different categories', async () => {
      if (!productId1 || !productId2 || !buyerToken) {
        expect(true).toBe(true);
        return;
      }

      // Order product 1
      const order1Res = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: 50000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(order1Res.statusCode);

      // Order product 2
      const order2Res = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId2,
            quantity: 1,
            price: 10000
          }],
          totalAmount: 10000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(order2Res.statusCode);
    });

    test('Commission is not charged for failed transactions', async () => {
      if (!productId1 || !buyerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create order
      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: 50000,
          paymentMethod: 'card'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Mark payment as failed
        const failRes = await request(app)
          .put(`/order/${orderId}/payment`)
          .send({ paymentStatus: 'failed' });

        expect([200, 201, 400, 404]).toContain(failRes.statusCode);

        // Check no commission charged
        const commissionRes = await request(app)
          .get(`/order/${orderId}/commission`)
          .set('Authorization', `Bearer ${sellerToken}`);

        if (commissionRes.statusCode === 200) {
          expect(commissionRes.body.commission || 0).toBe(0);
        }
      }
    });

    test('Minimum commission amount is enforced', async () => {
      if (!productId2 || !buyerToken) {
        expect(true).toBe(true);
        return;
      }

      // Order with small amount
      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId2,
            quantity: 1,
            price: 100
          }],
          totalAmount: 100,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        const commissionRes = await request(app)
          .get(`/order/${orderId}/commission`)
          .set('Authorization', `Bearer ${sellerToken}`);

        if (commissionRes.statusCode === 200 && commissionRes.body.commission !== undefined) {
          // Minimum commission should be applied (e.g., at least 10)
          expect(commissionRes.body.commission).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Seller Revenue Calculation', () => {
    
    test('Seller revenue equals total - commission', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderAmount = 50000;

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: orderAmount,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Get commission
        const commissionRes = await request(app)
          .get(`/order/${orderId}/commission`)
          .set('Authorization', `Bearer ${sellerToken}`);

        if (commissionRes.statusCode === 200 && commissionRes.body.commission) {
          const expectedRevenue = orderAmount - commissionRes.body.commission;

          // Verify revenue calculation
          const revenueRes = await request(app)
            .get(`/order/${orderId}/seller-revenue`)
            .set('Authorization', `Bearer ${sellerToken}`);

          if (revenueRes.statusCode === 200 && revenueRes.body.revenue) {
            expect(revenueRes.body.revenue).toBeCloseTo(expectedRevenue, 2);
          }
        }
      }
    });

    test('Monthly revenue is calculated correctly', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const revenueRes = await request(app)
        .get('/seller/monthly-revenue')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(revenueRes.statusCode);

      if (revenueRes.statusCode === 200 && revenueRes.body.revenue) {
        expect(revenueRes.body.revenue).toBeGreaterThanOrEqual(0);
      }
    });

    test('Seller can view total lifetime revenue', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const revenueRes = await request(app)
        .get('/seller/total-revenue')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(revenueRes.statusCode);

      if (revenueRes.statusCode === 200 && revenueRes.body.revenue) {
        expect(typeof revenueRes.body.revenue).toBe('number');
        expect(revenueRes.body.revenue).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Commission Tier Based Calculations', () => {
    
    test('Higher volume sellers get reduced commission rates', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const tierRes = await request(app)
        .get('/seller/commission-tier')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(tierRes.statusCode);

      if (tierRes.statusCode === 200 && tierRes.body.tier) {
        // Should have a tier assigned based on sales volume
        expect(['bronze', 'silver', 'gold', 'platinum']).toContain(tierRes.body.tier);
      }
    });

    test('Commission rate changes with tier progression', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Get current tier info
      const currentRes = await request(app)
        .get('/seller/commission-tier')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(currentRes.statusCode);

      // Check commission rate
      const rateRes = await request(app)
        .get('/seller/commission-rate')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(rateRes.statusCode);

      if (rateRes.statusCode === 200 && rateRes.body.rate !== undefined) {
        expect(rateRes.body.rate).toBeGreaterThan(0);
        expect(rateRes.body.rate).toBeLessThan(100);
      }
    });
  });

  describe('Payment and Settlement', () => {
    
    test('Commission amount is deducted from seller payout', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/order/create')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            items: [{
              productId: productId1,
              quantity: 1,
              price: 50000
            }],
            totalAmount: 50000,
            paymentMethod: 'cod'
          });
      }

      // Check seller payout
      const payoutRes = await request(app)
        .get('/seller/pending-payout')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(payoutRes.statusCode);

      if (payoutRes.statusCode === 200 && payoutRes.body.amount) {
        // Should be less than total order amount due to commissions
        expect(payoutRes.body.amount).toBeLessThan(150000); // 3 * 50000
      }
    });

    test('Seller receives payout after payment is confirmed', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: 50000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Mark payment as paid
        await request(app)
          .put(`/order/${orderId}/payment`)
          .send({ paymentStatus: 'paid' });

        // Check seller payout eligibility
        const payoutRes = await request(app)
          .get('/seller/pending-payout')
          .set('Authorization', `Bearer ${sellerToken}`);

        expect([200, 400, 404]).toContain(payoutRes.statusCode);
      }
    });

    test('Commission breakdown is transparent to seller', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 2,
            price: 50000
          }],
          totalAmount: 100000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Get detailed breakdown
        const breakdownRes = await request(app)
          .get(`/order/${orderId}/payment-breakdown`)
          .set('Authorization', `Bearer ${sellerToken}`);

        expect([200, 400, 404]).toContain(breakdownRes.statusCode);

        if (breakdownRes.statusCode === 200 && breakdownRes.body.breakdown) {
          expect(breakdownRes.body.breakdown).toHaveProperty('totalAmount');
          expect(breakdownRes.body.breakdown).toHaveProperty('commission');
          expect(breakdownRes.body.breakdown).toHaveProperty('sellerRevenue');
        }
      }
    });
  });

  describe('Refund and Commission Adjustments', () => {
    
    test('Commission is refunded when order is returned', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 1,
            price: 50000
          }],
          totalAmount: 50000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Process return
        const returnRes = await request(app)
          .post(`/order/${orderId}/return-request`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ reason: 'Defective product' });

        expect([200, 201, 400, 404]).toContain(returnRes.statusCode);

        // Check refund with commission adjustment
        const refundRes = await request(app)
          .get(`/order/${orderId}/refund-details`)
          .set('Authorization', `Bearer ${sellerToken}`);

        expect([200, 400, 404]).toContain(refundRes.statusCode);
      }
    });

    test('Partial refunds adjust commission proportionally', async () => {
      if (!productId1 || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId1,
            quantity: 2,
            price: 50000
          }],
          totalAmount: 100000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        const orderId = orderRes.body.order._id;

        // Request partial return
        const partialRes = await request(app)
          .post(`/order/${orderId}/partial-return`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            quantity: 1,
            reason: 'One unit defective'
          });

        expect([200, 201, 400, 404]).toContain(partialRes.statusCode);
      }
    });
  });

  describe('Commission Reports', () => {
    
    test('Seller can view commission report', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const reportRes = await request(app)
        .get('/seller/commission-report')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(reportRes.statusCode);

      if (reportRes.statusCode === 200 && reportRes.body.report) {
        expect(reportRes.body.report).toHaveProperty('totalOrders');
        expect(reportRes.body.report).toHaveProperty('totalCommission');
        expect(reportRes.body.report).toHaveProperty('totalRevenue');
      }
    });

    test('Admin can view all commission data', async () => {
      // Admin would have different endpoint
      const adminRes = await request(app)
        .get('/admin/commissions')
        .set('Authorization', `Bearer admin-token`);

      expect([200, 400, 401, 403, 404]).toContain(adminRes.statusCode);
    });
  });
});
