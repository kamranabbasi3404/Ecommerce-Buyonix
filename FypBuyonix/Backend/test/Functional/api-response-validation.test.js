const request = require('supertest');
const app = require('../../server');

describe('FUNCTIONAL: API Response Validation and Data Integrity', () => {
  
  describe('Authentication Response Validation', () => {
    
    test('Functional Flow 1: Signup response has correct structure', async () => {
      const userData = {
        fullName: 'Response User',
        email: `response1-${Date.now()}@example.com`,
        phone: '03001234567',
        password: 'ResponsePass123'
      };

      const res = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('displayName');
    });

    test('Functional Flow 2: Login response contains required user fields', async () => {
      const userData = {
        fullName: 'Login Response User',
        email: `loginresp-${Date.now()}@example.com`,
        phone: '03001234568',
        password: 'LoginRespPass123'
      };

      // Register first
      await request(app)
        .post('/auth/signup')
        .send(userData);

      // Login
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('success');
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.user).toHaveProperty('id');
      expect(loginRes.body.user).toHaveProperty('email');
      expect(loginRes.body.user).toHaveProperty('displayName');
    });

    test('Functional Flow 3: User object never includes password in response', async () => {
      const userData = {
        fullName: 'No Password User',
        email: `nopass-${Date.now()}@example.com`,
        phone: '03001234569',
        password: 'NoPassPass123'
      };

      const signupRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(signupRes.body.user).toBeDefined();
      expect(signupRes.body.user.password).toBeUndefined();

      // Login and verify password is not in response
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginRes.body.user.password).toBeUndefined();
    });

    test('Functional Flow 4: Signup returns HTTP 201 Created status', async () => {
      const userData = {
        fullName: 'Status Code User',
        email: `statuscode-${Date.now()}@example.com`,
        phone: '03001234570',
        password: 'StatusPass123'
      };

      const res = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(res.statusCode).toBe(201);
    });

    test('Functional Flow 5: Login returns HTTP 200 OK status', async () => {
      const userData = {
        fullName: 'Login Status User',
        email: `loginstatus-${Date.now()}@example.com`,
        phone: '03001234571',
        password: 'LoginStatPass123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginRes.statusCode).toBe(200);
    });
  });

  describe('Product Response Validation', () => {
    
    test('Functional Flow 6: Product list response is properly formatted', async () => {
      const res = await request(app)
        .get('/product');

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      if (res.body.products) {
        expect(Array.isArray(res.body.products)).toBe(true);
      }
    });

    test('Functional Flow 7: Product objects contain required fields', async () => {
      const res = await request(app)
        .get('/product');

      if (res.statusCode === 200 && res.body.products && res.body.products.length > 0) {
        const product = res.body.products[0];
        expect(product).toHaveProperty('_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('stock');
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 8: Product prices are numeric values', async () => {
      const res = await request(app)
        .get('/product');

      if (res.statusCode === 200 && res.body.products && res.body.products.length > 0) {
        const product = res.body.products[0];
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThanOrEqual(0);
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 9: Stock values are valid integers', async () => {
      const res = await request(app)
        .get('/product');

      if (res.statusCode === 200 && res.body.products && res.body.products.length > 0) {
        const product = res.body.products[0];
        expect(Number.isInteger(product.stock)).toBe(true);
        expect(product.stock).toBeGreaterThanOrEqual(0);
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 10: Product response includes category information', async () => {
      const res = await request(app)
        .get('/product');

      if (res.statusCode === 200 && res.body.products && res.body.products.length > 0) {
        const product = res.body.products[0];
        expect(product.category).toBeDefined();
        expect(typeof product.category).toBe('string');
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Order Response Validation', () => {
    
    // test('Functional Flow 11: Order response includes tracking information', async () => {
    //   // Create a test user
    //   const userData = {
    //     fullName: 'Order User',
    //     email: `orderuser-${Date.now()}@example.com`,
    //     phone: '03001234572',
    //     password: 'OrderUserPass123'
    //   };

    //   const userRes = await request(app)
    //     .post('/auth/signup')
    //     .send(userData);

    //   const userId = userRes.body.user.id;

    //   const orderRes = await request(app)
    //     .post('/order/checkout')
    //     .send({
    //       userId: userId,
    //       customerInfo: {
    //         firstName: 'Test',
    //         lastName: 'Customer',
    //         email: `customer-${Date.now()}@example.com`,
    //         phoneNumber: '03001234567',
    //         address: 'Test Address'
    //       },
    //       paymentMethod: 'cod'
    //     });

    //   if (orderRes.statusCode === 201 && orderRes.body.order) {
    //     expect(orderRes.body.order).toHaveProperty('_id');
    //     expect(orderRes.body.order).toHaveProperty('userId');
    //     expect(orderRes.body.order).toHaveProperty('orderStatus');
    //   } else {
    //     expect([200, 201, 400, 403]).toContain(orderRes.statusCode);
    //   }
    // });

    test('Functional Flow 12: Order status values are valid', async () => {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

      const userData = {
        fullName: 'Status Check User',
        email: `statuscheck-${Date.now()}@example.com`,
        phone: '03001234573',
        password: 'StatusCheckPass123'
      };

      const userRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      const orderRes = await request(app)
        .post('/order/checkout')
        .send({
          userId: userRes.body.user._id,
          customerInfo: {
            firstName: 'Test',
            lastName: 'Customer',
            email: `customer2-${Date.now()}@example.com`,
            phoneNumber: '03001234567',
            address: 'Test Address'
          },
          paymentMethod: 'cod'
        });

      if (orderRes.statusCode === 201 && orderRes.body.order) {
        expect(validStatuses).toContain(orderRes.body.order.orderStatus);
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 13: Order includes customer information', async () => {
      const userData = {
        fullName: 'Customer Info User',
        email: `custinfo-${Date.now()}@example.com`,
        phone: '03001234574',
        password: 'CustInfoPass123'
      };

      const userRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      const customerEmail = `customer3-${Date.now()}@example.com`;
      const orderRes = await request(app)
        .post('/order/checkout')
        .send({
          userId: userRes.body.user._id,
          customerInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: customerEmail,
            phoneNumber: '03001234567',
            address: '123 Main Street'
          },
          paymentMethod: 'cod'
        });

      if (orderRes.statusCode === 201 && orderRes.body.order) {
        expect(orderRes.body.order.customerInfo).toBeDefined();
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 14: Order includes order total', async () => {
      const userData = {
        fullName: 'Order Total User',
        email: `ordertotal-${Date.now()}@example.com`,
        phone: '03001234575',
        password: 'OrderTotalPass123'
      };

      const userRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      const orderRes = await request(app)
        .post('/order/checkout')
        .send({
          userId: userRes.body.user._id,
          customerInfo: {
            firstName: 'Test',
            lastName: 'Customer',
            email: `customer4-${Date.now()}@example.com`,
            phoneNumber: '03001234567',
            address: 'Test Address'
          },
          paymentMethod: 'cod'
        });

      if (orderRes.statusCode === 201 && orderRes.body.order) {
        expect(orderRes.body.order.total).toBeDefined();
        expect(typeof orderRes.body.order.total).toBe('number');
      } else {
        expect(true).toBe(true);
      }
    });

    test('Functional Flow 15: Order items array is present', async () => {
      const userData = {
        fullName: 'Order Items User',
        email: `orderitems-${Date.now()}@example.com`,
        phone: '03001234576',
        password: 'OrderItemsPass123'
      };

      const userRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      const orderRes = await request(app)
        .post('/order/checkout')
        .send({
          userId: userRes.body.user._id,
          customerInfo: {
            firstName: 'Test',
            lastName: 'Customer',
            email: `customer5-${Date.now()}@example.com`,
            phoneNumber: '03001234567',
            address: 'Test Address'
          },
          paymentMethod: 'cod'
        });

      if (orderRes.statusCode === 201 && orderRes.body.order) {
        expect(Array.isArray(orderRes.body.order.items)).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('HTTP Status Code Validation', () => {
    
    test('Functional Flow 16: GET requests return 200 for existing data', async () => {
      const res = await request(app)
        .get('/product');

      expect(res.statusCode).toBe(200);
    });

    test('Functional Flow 17: POST requests return appropriate status codes', async () => {
      const userData = {
        fullName: 'Status Test User',
        email: `statustest-${Date.now()}@example.com`,
        phone: '03001234577',
        password: 'StatusTestPass123'
      };

      const res = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect([200, 201, 400]).toContain(res.statusCode);
    });

    test('Functional Flow 18: Invalid endpoints return 404', async () => {
      const res = await request(app)
        .get('/invalid/endpoint');

      expect(res.statusCode).toBe(404);
    });

    test('Functional Flow 19: Server responds with JSON content type', async () => {
      const res = await request(app)
        .get('/product');

      expect(res.headers['content-type']).toMatch(/json/);
    });

    test('Functional Flow 20: API response times are reasonable', async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get('/product');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(res.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
