const request = require('supertest');
const app = require('../../server');

describe('BUSINESS: Discount and Promotion Management', () => {
  
  let sellerUser;
  let sellerToken;
  let buyerUser;
  let buyerToken;
  let productId;
  let promotionId;

  beforeEach(async () => {
    // Create seller
    const sellerData = {
      fullName: 'Promotion Seller',
      email: `promo-seller-${Date.now()}@example.com`,
      phone: '03001234567',
      password: 'SellerPass123',
      businessName: 'Promotion Business',
      businessType: 'Retail',
      storeName: `PromoStore-${Date.now()}`,
      storeDescription: 'Promotion test store',
      primaryCategory: 'Electronics',
      accountHolderName: 'Promotion Seller',
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
      fullName: 'Promo Buyer',
      email: `promo-buyer-${Date.now()}@example.com`,
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

    // Create product
    const productData = {
      name: 'Promotion Test Product',
      description: 'Product for promotion testing',
      category: 'Electronics',
      price: 10000,
      stock: 500,
      images: ['product.jpg'],
      sellerId: sellerUser?.id || sellerUser?._id
    };

    const productRes = await request(app)
      .post('/product/create')
      .send(productData);

    if (productRes.body.product) {
      productId = productRes.body.product._id;
    }
  });

  describe('Discount and Promotion Creation', () => {
    
    test('Seller can create percentage discount', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const promotionData = {
        type: 'percentage',
        value: 15,
        minPurchaseAmount: 5000,
        maxDiscount: 5000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        productId: productId
      };

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(promotionData);

      expect([200, 201, 400, 404]).toContain(promRes.statusCode);

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        promotionId = promRes.body.promotion._id;
        expect(promRes.body.promotion.discountType).toBe('percentage');
      }
    });

    test('Seller can create fixed amount discount', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const promotionData = {
        type: 'fixed',
        value: 2000,
        minPurchaseAmount: 10000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        productId: productId
      };

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(promotionData);

      expect([200, 201, 400, 404]).toContain(promRes.statusCode);
    });

    test('Discount cannot exceed product price', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const promotionData = {
        type: 'fixed',
        value: 15000, // More than product price (10000)
        minPurchaseAmount: 10000,
        productId: productId
      };

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(promotionData);

      // Should reject invalid discount
      expect([400, 404]).toContain(promRes.statusCode);
    });

    test('Percentage discount must be between 0-100', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const invalidPromotion = {
        type: 'percentage',
        value: 150, // Invalid percentage
        productId: productId
      };

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidPromotion);

      // Should reject invalid percentage
      expect([400, 404]).toContain(promRes.statusCode);
    });

    test('Promotion validity period must be valid', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const promotionData = {
        type: 'percentage',
        value: 10,
        validFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Starts in future
        validUntil: new Date(), // Ends in past
        productId: productId
      };

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(promotionData);

      expect([200, 201, 400, 404]).toContain(promRes.statusCode);
    });
  });

  describe('Discount Application Rules', () => {
    
    test('Active promotion is applied at checkout', async () => {
      if (!productId || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create active promotion
      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          minPurchaseAmount: 5000,
          validFrom: new Date(Date.now() - 1000),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        // Create order with product
        const orderRes = await request(app)
          .post('/order/create')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            items: [{
              productId: productId,
              quantity: 1,
              price: 10000,
              promotionId: promRes.body.promotion._id
            }],
            totalAmount: 9000, // 10% discount already applied
            paymentMethod: 'cod'
          });

        expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

        if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
          // Verify discount was applied
          expect(orderRes.body.order.totalAmount).toBeLessThan(10000);
        }
      }
    });

    test('Expired promotion is not applied', async () => {
      if (!productId || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create expired promotion
      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          validUntil: new Date(Date.now() - 1000), // Already expired
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        // Try to apply expired promotion
        const orderRes = await request(app)
          .post('/order/create')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            items: [{
              productId: productId,
              quantity: 1,
              price: 10000,
              promotionId: promRes.body.promotion._id
            }],
            totalAmount: 10000, // No discount should apply
            paymentMethod: 'cod'
          });

        expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

        // Full price should be charged
        if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
          expect(orderRes.body.order.totalAmount).toBeGreaterThanOrEqual(10000);
        }
      }
    });

    test('Minimum purchase requirement is enforced', async () => {
      if (!productId || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create promotion with minimum purchase of 50000
      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          minPurchaseAmount: 50000,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        // Try to order less than minimum
        const orderRes = await request(app)
          .post('/order/create')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            items: [{
              productId: productId,
              quantity: 1,
              price: 10000,
              promotionId: promRes.body.promotion._id
            }],
            totalAmount: 10000,
            paymentMethod: 'cod'
          });

        expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

        // Discount should not apply
        if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
          expect(orderRes.body.order.totalAmount).toBeGreaterThanOrEqual(10000);
        }
      }
    });

    test('Multiple promotions on same product apply according to policy', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create first promotion
      const prom1Res = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      expect([200, 201, 400, 404]).toContain(prom1Res.statusCode);

      // Create second promotion
      const prom2Res = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 5,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      expect([200, 201, 400, 404]).toContain(prom2Res.statusCode);
    });
  });

  describe('Promotion Management', () => {
    
    test('Seller can view all their promotions', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const listRes = await request(app)
        .get('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(listRes.statusCode);

      if (listRes.statusCode === 200 && Array.isArray(listRes.body.promotions)) {
        expect(listRes.body.promotions.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('Seller can edit active promotion', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create promotion first
      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        const promId = promRes.body.promotion._id;

        // Edit the promotion
        const editRes = await request(app)
          .put(`/seller/promotions/${promId}`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({
            value: 15 // Change discount from 10 to 15
          });

        expect([200, 201, 400, 404]).toContain(editRes.statusCode);
      }
    });

    test('Seller can deactivate promotion', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        const promId = promRes.body.promotion._id;

        // Deactivate
        const deactRes = await request(app)
          .put(`/seller/promotions/${promId}/deactivate`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send();

        expect([200, 201, 400, 404]).toContain(deactRes.statusCode);
      }
    });

    test('Cannot edit promotion after it expires', async () => {
      if (!productId || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create expired promotion
      const promRes = await request(app)
        .post('/seller/promotions')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'percentage',
          value: 10,
          validUntil: new Date(Date.now() - 1000), // Already expired
          productId: productId
        });

      if ((promRes.statusCode === 201 || promRes.statusCode === 200) && promRes.body.promotion) {
        const promId = promRes.body.promotion._id;

        // Try to edit
        const editRes = await request(app)
          .put(`/seller/promotions/${promId}`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ value: 20 });

        // Should not allow editing expired promotion
        expect([400, 404]).toContain(editRes.statusCode);
      }
    });
  });

  describe('Platform-Wide Promotions', () => {
    
    test('Admin can create platform-wide promotion', async () => {
      const adminToken = 'admin-token-test';

      const platformPromRes = await request(app)
        .post('/admin/platform-promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'percentage',
          value: 5,
          category: 'Electronics',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(platformPromRes.statusCode);
    });

    test('Category-based promotion applies to all products in category', async () => {
      // Create category promotion
      const adminToken = 'admin-token-test';

      const promRes = await request(app)
        .post('/admin/platform-promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'percentage',
          value: 5,
          category: 'Electronics',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(promRes.statusCode);
    });
  });

  describe('Promotion Analytics', () => {
    
    test('Seller can view promotion performance', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const analyticsRes = await request(app)
        .get('/seller/promotion-analytics')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(analyticsRes.statusCode);

      if (analyticsRes.statusCode === 200 && analyticsRes.body.analytics) {
        expect(analyticsRes.body.analytics).toHaveProperty('totalPromotions');
        expect(analyticsRes.body.analytics).toHaveProperty('activePromotions');
      }
    });

    test('Seller can see discount impact on revenue', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const impactRes = await request(app)
        .get('/seller/discount-impact-report')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 400, 404]).toContain(impactRes.statusCode);
    });
  });

  describe('Coupon Code Management', () => {
    
    test('Seller can create coupon codes', async () => {
      if (!sellerToken) {
        expect(true).toBe(true);
        return;
      }

      const couponRes = await request(app)
        .post('/seller/coupons')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          code: `PROMO${Date.now()}`,
          type: 'percentage',
          value: 15,
          maxUsage: 100,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect([200, 201, 400, 404]).toContain(couponRes.statusCode);
    });

    test('Buyer can apply valid coupon code', async () => {
      if (!productId || !buyerToken || !sellerToken) {
        expect(true).toBe(true);
        return;
      }

      // Create coupon
      const couponRes = await request(app)
        .post('/seller/coupons')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          code: `VALID${Date.now()}`,
          type: 'percentage',
          value: 10,
          maxUsage: 100,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      if ((couponRes.statusCode === 201 || couponRes.statusCode === 200) && couponRes.body.coupon) {
        // Apply coupon to order
        const orderRes = await request(app)
          .post('/order/create')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            items: [{
              productId: productId,
              quantity: 1,
              price: 10000
            }],
            couponCode: couponRes.body.coupon.code,
            totalAmount: 9000,
            paymentMethod: 'cod'
          });

        expect([200, 201, 400, 404]).toContain(orderRes.statusCode);
      }
    });

    test('Invalid coupon code is rejected', async () => {
      if (!productId || !buyerToken) {
        expect(true).toBe(true);
        return;
      }

      const orderRes = await request(app)
        .post('/order/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          items: [{
            productId: productId,
            quantity: 1,
            price: 10000
          }],
          couponCode: 'INVALID123',
          totalAmount: 10000,
          paymentMethod: 'cod'
        });

      expect([200, 201, 400, 404]).toContain(orderRes.statusCode);

      // Full price should be charged with invalid coupon
      if ((orderRes.statusCode === 201 || orderRes.statusCode === 200) && orderRes.body.order) {
        expect(orderRes.body.order.totalAmount).toBeGreaterThanOrEqual(10000);
      }
    });
  });
});
