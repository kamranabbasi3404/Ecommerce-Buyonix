const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Seller = require('../../models/seller');
const Product = require('../../models/product');

describe('INTEGRATION: Product Creation and Listing Flow', () => {

  let sellerId;
  let sellerToken;

  // Setup: Create a seller before running tests
  beforeEach(async () => {
    const sellerData = {
      fullName: 'Product Test Seller',
      email: `seller-${Date.now()}@example.com`,
      phone: '03101234567',
      password: 'SellerPass123!',
      businessName: 'Test Business',
      businessType: 'Retail',
      storeName: `Store-${Date.now()}`,
      storeDescription: 'Product test store',
      primaryCategory: 'Electronics',
      accountHolderName: 'Product Test Seller',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-21',
      taxNumber: 'TAX123471'
    };

    const res = await request(app)
      .post('/seller/register')
      .send(sellerData);

    if (!res.body.seller || !res.body.seller.id) {
      throw new Error(`Seller registration failed: ${JSON.stringify(res.body)}`);
    }

    sellerId = res.body.seller.id;

    // Now login as seller to get token/session
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: sellerData.email,
        password: sellerData.password
      });

    sellerToken = loginRes.body.user ? loginRes.body.user._id : sellerId;
  });

  // ✅ Test 1: Seller can create a product
//   test('Should create product successfully', async () => {
//     const productData = {
//       name: 'Test Laptop',
//       description: 'High-performance laptop for professionals',
//       category: 'Electronics',
//       price: 85000,
//       originalPrice: 100000,
//       stock: 50,
//       images: ['laptop1.jpg', 'laptop2.jpg']
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.product).toBeDefined();
//     expect(res.body.product.name).toBe(productData.name);
//     expect(res.body.product.price).toBe(productData.price);
//   });

  // ✅ Test 2: Product discount is calculated correctly
//   test('Should calculate discount percentage correctly', async () => {
//     const productData = {
//       name: 'Test Phone',
//       description: 'Latest smartphone',
//       category: 'Electronics',
//       price: 45000,
//       originalPrice: 60000,
//       stock: 30,
//       images: ['phone1.jpg']
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     const discount = res.body.product.discount;
//     const expectedDiscount = ((60000 - 45000) / 60000) * 100;
//     expect(discount).toBeCloseTo(expectedDiscount, 1);
//   });

  // ✅ Test 3: Product validation - missing name
//   test('Should fail product creation without name', async () => {
//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         description: 'Test description',
//         category: 'Electronics',
//         price: 50000,
//         stock: 20,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 4: Product validation - invalid price
//   test('Should fail product creation with invalid price', async () => {
//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         name: 'Test Product',
//         description: 'Test description',
//         category: 'Electronics',
//         price: -100,
//         stock: 20,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 5: Product validation - missing description
//   test('Should fail product creation without description', async () => {
//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         name: 'Test Product',
//         category: 'Electronics',
//         price: 50000,
//         stock: 20,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 6: Product validation - invalid stock
//   test('Should fail product creation with negative stock', async () => {
//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         name: 'Test Product',
//         description: 'Test description with min length',
//         category: 'Electronics',
//         price: 50000,
//         stock: -5,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 7: Product status should be 'active' with stock
//   test('Should set product status to active when stock available', async () => {
//     const productData = {
//       name: 'Active Product',
//       description: 'Product with good stock',
//       category: 'Electronics',
//       price: 30000,
//       stock: 25,
//       images: []
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.product.status).toBe('active');
//   });

  // ✅ Test 8: Product status should be 'out_of_stock' with zero stock
//   test('Should set product status to out_of_stock when stock is zero', async () => {
//     const productData = {
//       name: 'Out of Stock Product',
//       description: 'Product with no stock',
//       category: 'Electronics',
//       price: 20000,
//       stock: 0,
//       images: []
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.product.status).toBe('out_of_stock');
//   });

  // ✅ Test 9: Product status should be 'low_stock' with low stock
//   test('Should set product status to low_stock when stock is less than 5', async () => {
//     const productData = {
//       name: 'Low Stock Product',
//       description: 'Product with low stock',
//       category: 'Electronics',
//       price: 15000,
//       stock: 3,
//       images: []
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.product.status).toBe('low_stock');
//   });

  // ✅ Test 10: Product data persistence
//   test('Should save product in database', async () => {
//     const productData = {
//       name: 'Database Test Product',
//       description: 'Test product for database persistence',
//       category: 'Electronics',
//       price: 25000,
//       stock: 15,
//       images: ['img1.jpg']
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);

//     // Verify in database
//     const savedProduct = await Product.findById(res.body.product._id);
//     expect(savedProduct).toBeDefined();
//     expect(savedProduct.name).toBe(productData.name);
//     expect(savedProduct.price).toBe(productData.price);
//   });

  // ✅ Test 11: Product has initial zero ratings
//   test('Should initialize product with zero rating and reviews', async () => {
//     const productData = {
//       name: 'New Product',
//       description: 'Brand new product with no ratings',
//       category: 'Electronics',
//       price: 12000,
//       stock: 10,
//       images: []
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.product.rating).toBe(0);
//     expect(res.body.product.reviewCount).toBe(0);
//   });

  // ✅ Test 12: Multiple products can be created
//   test('Should create multiple products for seller', async () => {
//     const products = [
//       { name: 'Product 1', description: 'First product description here', category: 'Electronics', price: 10000, stock: 5, images: [] },
//       { name: 'Product 2', description: 'Second product description here', category: 'Fashion', price: 5000, stock: 10, images: [] },
//       { name: 'Product 3', description: 'Third product description here', category: 'Home', price: 15000, stock: 8, images: [] }
//     ];

//     for (const product of products) {
//       const res = await request(app)
//         .post('/product/create')
//         .send({
//           ...product,
//           sellerId: sellerId
//         });
      
//       expect(res.statusCode).toBe(201);
//       expect(res.body.success).toBe(true);
//     }

//     // Verify all products exist in database
//     const productCount = await Product.countDocuments({ sellerId: sellerId });
//     expect(productCount).toBe(3);
//   });

  // ✅ Test 13: Product returns correct response fields
//   test('Should return all required fields in product response', async () => {
//     const productData = {
//       name: 'Field Test Product',
//       description: 'Testing all response fields',
//       category: 'Electronics',
//       price: 35000,
//       originalPrice: 45000,
//       stock: 20,
//       images: ['test.jpg']
//     };

//     const res = await request(app)
//       .post('/product/create')
//       .send({
//         ...productData,
//         sellerId: sellerId
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.product._id).toBeDefined();
//     expect(res.body.product.name).toBe(productData.name);
//     expect(res.body.product.price).toBe(productData.price);
//     expect(res.body.product.originalPrice).toBe(productData.originalPrice);
//     expect(res.body.product.stock).toBe(productData.stock);
//     expect(res.body.product.discount).toBeDefined();
//     expect(res.body.product.status).toBe('active');
//     expect(res.body.product.sellerId).toBe(sellerId.toString());
//   });

});
