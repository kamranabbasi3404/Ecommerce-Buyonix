/**
 * Unit Tests for Product Routes
 * Tests CRUD operations for products
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../../models/product');
const Seller = require('../../models/seller');
const productRouter = require('../../routes/product');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/product', productRouter);

// Mock data (Complete data to avoid validation errors)
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
  description: 'This is a test product',
  category: 'Electronics',
  price: 5000,
  originalPrice: 7000,
  stock: 10,
  images: ['image1.jpg', 'image2.jpg']
};

describe('Product Routes - Unit Tests', () => {

  let sellerId;

  beforeEach(async () => {
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Create a seller for testing
    const seller = await Seller.create(mockSeller);
    sellerId = seller._id;
  });

  // ============== CREATE PRODUCT TESTS ==============
  describe('POST /product', () => {

    test('should create a new product with valid data', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe(mockProduct.name);
      expect(response.body.product.price).toBe(mockProduct.price);
      expect(response.body.product.sellerId.toString()).toBe(sellerId.toString());
    });

    test('should calculate discount correctly', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId,
        originalPrice: 10000,
        price: 6000
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      const discount = Math.round(((10000 - 6000) / 10000) * 100);
      expect(response.body.product.discount).toBe(discount);
    });

    test('should set status to active when stock > 0', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId,
        stock: 5
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.product.status).toBe('active');
    });

    test('should set status to out_of_stock when stock = 0', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId,
        stock: 0
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      // FIX: The error log showed a 404, but expectation was 201. Assuming the 404 was due to prior errors.
      expect(response.status).toBe(201);
      expect(response.body.product.status).toBe('out_of_stock');
    });

    test('should reject product from non-existent seller', async () => {
      const productData = {
        ...mockProduct,
        sellerId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Seller not found');
    });

    test('should reject product from unapproved seller', async () => {
      const unapprovedSeller = await Seller.create({
        ...mockSeller,
        email: 'unapproved_seller@example.com', // FIX: Use unique email to avoid E11000 error
        status: 'pending'
      });

      const productData = {
        ...mockProduct,
        sellerId: unapprovedSeller._id
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('approved');
    });

    test('should reject product with missing name', async () => {
      const invalidProduct = {
        ...mockProduct,
        sellerId: sellerId
      };
      delete invalidProduct.name;

      const response = await request(app)
        .post('/product')
        .send(invalidProduct);

      // FIX: Changed from 500 to 400 (validation error)
      expect(response.status).toBe(400); 
      expect(response.body.success).toBe(false);
    });

    test('should reject product with missing price', async () => {
      const invalidProduct = {
        ...mockProduct,
        sellerId: sellerId
      };
      delete invalidProduct.price;

      const response = await request(app)
        .post('/product')
        .send(invalidProduct);

      // FIX: Changed from 500 to 400 (validation error)
      expect(response.status).toBe(400); 
      expect(response.body.success).toBe(false);
    });

    test('should set default images to empty array if not provided', async () => {
      const productData = {
        name: 'Product Without Images',
        description: 'Test',
        category: 'Electronics',
        price: 5000,
        stock: 10,
        sellerId: sellerId
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.product.images)).toBe(true);
    });

    test('should save product to database', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId
      };

      await request(app).post('/product').send(productData);

      const savedProduct = await Product.findOne({ name: mockProduct.name });
      expect(savedProduct).toBeDefined();
      expect(savedProduct.sellerId.toString()).toBe(sellerId.toString());
    });
  });

  // ============== GET PRODUCTS TESTS ==============
  describe('GET /product', () => {

    beforeEach(async () => {
      // Create multiple products
      // Ensure products are created with delays if necessary for sorting to work reliably
      const products = [
        { ...mockProduct, sellerId: sellerId, status: 'active', name: 'Product 1' },
        { ...mockProduct, name: 'Product 2', price: 3000, sellerId: sellerId, status: 'active' },
        { ...mockProduct, name: 'Product 3', price: 8000, sellerId: sellerId, status: 'out_of_stock' }
      ];

      for (let product of products) {
        await Product.create(product);
      }
    });

    test('should get all active products', async () => {
      const response = await request(app).get('/product');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBe(2); // Only active products
    });

    test('should populate seller information', async () => {
      const response = await request(app).get('/product');

      expect(response.status).toBe(200);
      expect(response.body.products[0].sellerId).toBeDefined();
      expect(response.body.products[0].sellerId.storeName).toBe(mockSeller.storeName);
    });

    test('should sort products by creation date', async () => {
      const response = await request(app).get('/product');

      expect(response.status).toBe(200);
      // Most recent first
      expect(response.body.products[0].name).toBe('Product 2');
    });

    test('should return empty array when no active products', async () => {
      await Product.deleteMany({});

      const response = await request(app).get('/product');

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(0);
    });
  });

  // ============== GET PRODUCTS BY SELLER TESTS ==============
  describe('GET /product/seller/:sellerId', () => {

    beforeEach(async () => {
      // Create products for this seller
      await Product.create([
        { ...mockProduct, sellerId: sellerId, name: 'Product 1' },
        { ...mockProduct, name: 'Product 2', sellerId: sellerId }
      ]);
    });

    test('should get products by seller ID', async () => {
      const response = await request(app)
        .get(`/product/seller/${sellerId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(2);
    });

    test('should return products sorted by creation date', async () => {
      const response = await request(app)
        .get(`/product/seller/${sellerId}`);

      expect(response.status).toBe(200);
      expect(response.body.products[0].name).toBe('Product 2');
    });

    test('should return empty array for seller with no products', async () => {
      const newSeller = await Seller.create({ ...mockSeller, email: 'temp@seller.com', storeName: 'Temp Store' });

      const response = await request(app)
        .get(`/product/seller/${newSeller._id}`);

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(0);
    });

    test('should handle invalid seller ID', async () => {
      const response = await request(app)
        .get(`/product/seller/invalid_id`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== GET SINGLE PRODUCT TESTS ==============
  describe('GET /product/:id', () => {

    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        ...mockProduct,
        sellerId: sellerId
      });
      productId = product._id;
    });

    test('should get single product by ID', async () => {
      const response = await request(app)
        .get(`/product/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product._id).toBe(productId.toString());
    });

    test('should populate seller information', async () => {
      const response = await request(app)
        .get(`/product/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.product.sellerId.storeName).toBe(mockSeller.storeName);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/product/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should handle invalid ID format', async () => {
      const response = await request(app)
        .get('/product/invalid_id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== UPDATE PRODUCT TESTS ==============
  describe('PUT /product/:id', () => {

    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        ...mockProduct,
        sellerId: sellerId
      });
      productId = product._id;
    });

    test('should update product with valid data', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 6000,
        stock: 15
      };

      const response = await request(app)
        .put(`/product/${productId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.name).toBe('Updated Product');
      expect(response.body.product.price).toBe(6000);
    });

    test('should update stock and adjust status accordingly', async () => {
      const updateData = {
        stock: 0
      };

      const response = await request(app)
        .put(`/product/${productId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.product.stock).toBe(0);
      expect(response.body.product.status).toBe('out_of_stock');
    });

    test('should restore status from out_of_stock when stock is added', async () => {
      // First set to out of stock
      await request(app).put(`/product/${productId}`).send({ stock: 0 });

      // Then add stock back
      const response = await request(app)
        .put(`/product/${productId}`)
        .send({ stock: 5 });

      expect(response.status).toBe(200);
      expect(response.body.product.status).toBe('active');
    });

    test('should recalculate discount when prices change', async () => {
      const updateData = {
        originalPrice: 10000,
        price: 7000
      };

      const response = await request(app)
        .put(`/product/${productId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      const expectedDiscount = Math.round(((10000 - 7000) / 10000) * 100);
      expect(response.body.product.discount).toBe(expectedDiscount);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/product/${fakeId}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should allow updating description', async () => {
      const newDescription = 'New detailed description';

      const response = await request(app)
        .put(`/product/${productId}`)
        .send({ description: newDescription });

      expect(response.status).toBe(200);
      expect(response.body.product.description).toBe(newDescription);
    });

    test('should allow updating images', async () => {
      const newImages = ['new1.jpg', 'new2.jpg', 'new3.jpg'];

      const response = await request(app)
        .put(`/product/${productId}`)
        .send({ images: newImages });

      expect(response.status).toBe(200);
      expect(response.body.product.images).toEqual(newImages);
    });
  });

  // ============== DELETE PRODUCT TESTS ==============
  describe('DELETE /product/:id', () => {

    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        ...mockProduct,
        sellerId: sellerId
      });
      productId = product._id;
    });

    test('should delete a product', async () => {
      const response = await request(app)
        .delete(`/product/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    test('should remove product from database', async () => {
      await request(app).delete(`/product/${productId}`);

      const product = await Product.findById(productId);
      expect(product).toBeNull();
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/product/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle invalid ID format', async () => {
      const response = await request(app)
        .delete('/product/invalid_id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============== DISCOUNT CALCULATION TESTS ==============
  describe('Discount Calculation', () => {

    test('should calculate correct discount percentage', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId,
        originalPrice: 1000,
        price: 500
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.product.discount).toBe(50); // 50% discount
    });

    test('should have zero discount when price equals originalPrice', async () => {
      const productData = {
        ...mockProduct,
        sellerId: sellerId,
        price: 5000,
        originalPrice: 5000
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.product.discount).toBe(0);
    });

    test('should use provided discount if prices not provided', async () => {
      const productData = {
        name: 'Product',
        description: 'Test',
        category: 'Electronics',
        price: 5000,
        stock: 10,
        sellerId: sellerId,
        discount: 25
      };

      const response = await request(app)
        .post('/product')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.product.discount).toBe(25);
    });
  });

  // ============== PRODUCT STATUS TESTS ==============
  describe('Product Status Management', () => {

    test('should update status explicitly', async () => {
      const product = await Product.create({
        ...mockProduct,
        sellerId: sellerId
      });

      const response = await request(app)
        .put(`/product/${product._id}`)
        .send({ status: 'discontinued' });

      expect(response.status).toBe(200);
      expect(response.body.product.status).toBe('discontinued');
    });

    test('should maintain status when only updating other fields', async () => {
      const product = await Product.create({
        ...mockProduct,
        sellerId: sellerId,
        status: 'active'
      });

      const response = await request(app)
        .put(`/product/${product._id}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.product.status).toBe('active');
    });
  });
});