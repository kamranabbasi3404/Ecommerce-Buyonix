/**
 * Unit Tests for Order Routes
 * Tests order creation, retrieval, and status updates
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Seller = require('../../models/seller');
const User = require('../../models/User');
const orderRouter = require('../../routes/order');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/order', orderRouter);

// MOCK DATA - **UPDATED TO INCLUDE ALL REQUIRED SELLER FIELDS**
const mockSeller = {
  fullName: 'Test Seller',
  email: 'seller@example.com',
  phone: '1234567890',
  password: 'TestPassword123',
  storeName: 'Test Store',
  businessName: 'Test Business',
  businessType: 'Retail',
  storeDescription: 'A test store for selling products',
  primaryCategory: 'Electronics',
  accountHolderName: 'Test Seller',
  bankName: 'Test Bank',
  accountNumber: '1234567890',
  iban: 'PK36SCBL0000001123456702',
  cnicNumber: '12345-1234567-1',
  taxNumber: 'TAX123456',
  status: 'approved'
};

const mockProduct = {
  name: 'Test Product',
  description: 'Test Description',
  category: 'Electronics',
  price: 5000,
  originalPrice: 7000,
  stock: 20,
  status: 'active'
};

const mockOrder = {
  customerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@example.com',
    phoneNumber: '03001234567',
    address: '123 Main Street',
    city: 'Karachi',
    postalCode: '75000'
  },
  items: [],
  paymentMethod: 'card',
  subtotal: 5000,
  shipping: 500,
  total: 5500
};

describe('Order Routes - Unit Tests', () => {

  let sellerId;
  let productId;

  beforeEach(async () => {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Create seller and product for testing with complete mockSeller data
    const seller = await Seller.create(mockSeller);
    sellerId = seller._id;

    const product = await Product.create({
      ...mockProduct,
      sellerId: sellerId
    });
    productId = product._id;
  });

  // ============== CREATE ORDER TESTS ==============
  describe('POST /order/create', () => {

    test('should create a new order with valid data', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.orderNumber).toBeDefined();
      expect(response.body.order.orderStatus).toBe('pending');
    });

    test('should generate unique order number', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response1 = await request(app).post('/order/create').send(orderData);
      const response2 = await request(app).post('/order/create').send(orderData);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.order.orderNumber).not.toBe(response2.body.order.orderNumber);
    });

    test('should validate customer info fields', async () => {
      const incompleteOrder = {
        ...mockOrder,
        customerInfo: {
          firstName: 'John',
          // Missing other required fields
        },
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(incompleteOrder);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should require at least one item', async () => {
      const orderData = {
        ...mockOrder,
        items: []
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid payment method', async () => {
      const orderData = {
        ...mockOrder,
        paymentMethod: 'invalid_method',
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should calculate total correctly', async () => {
      const orderData = {
        ...mockOrder,
        subtotal: 10000,
        shipping: 500,
        total: 10500,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 2,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.total).toBe(10500);
    });

    test('should set order status to pending by default', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.orderStatus).toBe('pending');
      expect(response.body.order.paymentStatus).toBe('unpaid');
    });

    test('should save order to database', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app).post('/order/create').send(orderData);

      expect(response.status).toBe(201);
      const savedOrder = await Order.findById(response.body.order._id);
      expect(savedOrder).toBeDefined();
      expect(savedOrder.customerInfo.firstName).toBe('John');
    });

    test('should set timestamps on creation', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app).post('/order/create').send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.createdAt).toBeDefined();
      expect(new Date(response.body.order.createdAt)).toBeInstanceOf(Date);
    });
  });

  // ============== GET ALL ORDERS (ADMIN) TESTS ==============
  describe('GET /order/admin/all', () => {

    beforeEach(async () => {
      // Create multiple orders
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      await request(app).post('/order/create').send(orderData);
      await request(app).post('/order/create').send({
        ...orderData,
        customerInfo: {
          ...mockOrder.customerInfo,
          firstName: 'Jane'
        }
      });
    });

    test('should fetch all orders', async () => {
      const response = await request(app).get('/order/admin/all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBe(2);
    });

    test('should include total revenue calculation', async () => {
      const response = await request(app).get('/order/admin/all');

      expect(response.status).toBe(200);
      expect(response.body.totalRevenue).toBeDefined();
      expect(typeof response.body.totalRevenue).toBe('number');
    });

    test('should return empty array when no orders', async () => {
      await Order.deleteMany({});

      const response = await request(app).get('/order/admin/all');

      expect(response.status).toBe(200);
      expect(response.body.orders.length).toBe(0);
      expect(response.body.totalRevenue).toBe(0);
    });

    test('should sort orders by most recent first', async () => {
      const response = await request(app).get('/order/admin/all');

      expect(response.status).toBe(200);
      // Check if ordered correctly (based on creation time)
      if (response.body.orders.length > 1) {
        const order1Time = new Date(response.body.orders[0].createdAt);
        const order2Time = new Date(response.body.orders[1].createdAt);
        expect(order1Time.getTime()).toBeGreaterThanOrEqual(order2Time.getTime());
      }
    });
  });

  // ============== GET SELLER ORDERS TESTS ==============
  describe('GET /order/seller/:sellerId', () => {

    beforeEach(async () => {
      // Create orders for this seller
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      await request(app).post('/order/create').send(orderData);
      await request(app).post('/order/create').send(orderData);
    });

    test('should fetch orders for specific seller', async () => {
      const response = await request(app)
        .get(`/order/seller/${sellerId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orders.length).toBe(2);
    });

    test('should filter by seller ID in items', async () => {
      const response = await request(app)
        .get(`/order/seller/${sellerId}`);

      expect(response.status).toBe(200);
      response.body.orders.forEach(order => {
        const hasSellerItem = order.items.some(item => 
          item.sellerId.toString() === sellerId.toString()
        );
        expect(hasSellerItem).toBe(true);
      });
    });

    test('should return empty array for seller with no orders', async () => {
      const newSeller = await Seller.create({
        ...mockSeller,
        email: 'newseller@example.com'
      });

      const response = await request(app)
        .get(`/order/seller/${newSeller._id}`);

      expect(response.status).toBe(200);
      expect(response.body.orders.length).toBe(0);
    });

    test('should handle invalid seller ID', async () => {
      const response = await request(app)
        .get('/order/seller/invalid_id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== GET SINGLE ORDER TESTS ==============
  describe('GET /order/:orderNumber', () => {

    let orderNumber;

    beforeEach(async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app).post('/order/create').send(orderData);
      orderNumber = response.body.order.orderNumber;
    });

    test('should fetch single order by order number', async () => {
      const response = await request(app)
        .get(`/order/${orderNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.orderNumber).toBe(orderNumber);
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/order/ORD-NONEXISTENT-12345');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should include all order details', async () => {
      const response = await request(app)
        .get(`/order/${orderNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.order.customerInfo).toBeDefined();
      expect(response.body.order.items).toBeDefined();
      expect(response.body.order.total).toBeDefined();
      expect(response.body.order.orderStatus).toBeDefined();
    });
  });

  // ============== UPDATE ORDER STATUS TESTS ==============
  describe('PUT /order/:orderNumber/status', () => {

    let orderNumber;

    beforeEach(async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app).post('/order/create').send(orderData);
      orderNumber = response.body.order.orderNumber;
    });

    test('should update order status', async () => {
      const response = await request(app)
        .put(`/order/${orderNumber}/status`)
        .send({ orderStatus: 'shipped' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.orderStatus).toBe('shipped');
    });

    test('should update payment status', async () => {
      const response = await request(app)
        .put(`/order/${orderNumber}/status`)
        .send({ paymentStatus: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.order.paymentStatus).toBe('completed');
    });

    test('should update both statuses simultaneously', async () => {
      const response = await request(app)
        .put(`/order/${orderNumber}/status`)
        .send({ 
          orderStatus: 'delivered',
          paymentStatus: 'completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.order.orderStatus).toBe('delivered');
      expect(response.body.order.paymentStatus).toBe('completed');
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .put('/order/ORD-NONEXISTENT-12345/status')
        .send({ orderStatus: 'shipped' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid order status', async () => {
      const response = await request(app)
        .put(`/order/${orderNumber}/status`)
        .send({ orderStatus: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid payment status', async () => {
      const response = await request(app)
        .put(`/order/${orderNumber}/status`)
        .send({ paymentStatus: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== ORDER VALIDATION TESTS ==============
  describe('Order Validation', () => {

    test('should validate email format', async () => {
      const orderData = {
        ...mockOrder,
        customerInfo: {
          ...mockOrder.customerInfo,
          email: 'invalid-email'
        },
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate phone format', async () => {
      const orderData = {
        ...mockOrder,
        customerInfo: {
          ...mockOrder.customerInfo,
          phone: '123' // Too short
        },
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate quantity is positive', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: -1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate price is positive', async () => {
      const orderData = {
        ...mockOrder,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: -100,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const response = await request(app)
        .post('/order/create')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== ORDER REVENUE TESTS ==============
  describe('Revenue Calculation', () => {

    test('should calculate correct total revenue', async () => {
      const order1Data = {
        ...mockOrder,
        subtotal: 5000,
        shipping: 500,
        total: 5500,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: 5000,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      const order2Data = {
        ...mockOrder,
        customerInfo: { ...mockOrder.customerInfo, firstName: 'Jane' },
        subtotal: 3000,
        shipping: 300,
        total: 3300,
        items: [
          {
            productId: productId,
            name: mockProduct.name,
            price: 3000,
            quantity: 1,
            sellerId: sellerId
          }
        ]
      };

      await request(app).post('/order/create').send(order1Data);
      await request(app).post('/order/create').send(order2Data);

      const response = await request(app).get('/order/admin/all');

      expect(response.status).toBe(200);
      expect(response.body.totalRevenue).toBe(8800); // 5500 + 3300
    });
  });
});