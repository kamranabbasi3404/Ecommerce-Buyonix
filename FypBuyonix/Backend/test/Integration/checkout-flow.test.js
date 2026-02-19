const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Seller = require('../../models/seller');

describe('INTEGRATION: Shopping Cart and Checkout Flow', () => {

  let userId;
  let sellerId;
  let productId;

  // Setup: Create user, seller, and product before tests
  beforeEach(async () => {
    // Create user
    const userData = {
      fullName: 'Test Buyer',
      email: `buyer-${Date.now()}@example.com`,
      phone: '03101234567',
      password: 'BuyerPass123!'
    };

    const userRes = await request(app)
      .post('/auth/signup')
      .send(userData);
    
    userId = userRes.body.user._id;

    // Create seller
    const sellerData = {
      fullName: 'Test Seller',
      email: `seller-${Date.now()}@example.com`,
      phone: '03109876543',
      password: 'SellerPass123!',
      businessName: 'Test Business',
      businessType: 'Retail',
      storeName: `Store-${Date.now()}`,
      storeDescription: 'Checkout test store',
      primaryCategory: 'Electronics',
      accountHolderName: 'Test Seller',
      bankName: 'UBL',
      accountNumber: '1234567890',
      iban: 'PK36UBLACC1234567890',
      cnicNumber: '12345-1234567-22',
      taxNumber: 'TAX123472'
    };

    const sellerRes = await request(app)
      .post('/seller/register')
      .send(sellerData);
    
    if (!sellerRes.body.seller || !sellerRes.body.seller.id) {
      throw new Error(`Seller registration failed: ${JSON.stringify(sellerRes.body)}`);
    }
    
    sellerId = sellerRes.body.seller.id;

    // Create product
//     const productData = {
//       name: 'Test Laptop',
//       description: 'High-performance laptop for testing',
//       category: 'Electronics',
//       price: 85000,
//       originalPrice: 100000,
//       stock: 50,
//       images: ['laptop.jpg'],
//       sellerId: sellerId
//     };

//     const productRes = await request(app)
//       .post('/product/create')
//       .send(productData);
    
//     productId = productRes.body.product._id;
  });

  // ✅ Test 1: Add item to cart
//   test('Should add item to cart successfully', async () => {
//     const res = await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 2
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.cart).toBeDefined();
//     expect(res.body.cart.items).toBeDefined();
//     expect(res.body.cart.items.length).toBeGreaterThan(0);
//   });

  // ✅ Test 2: Cart subtotal calculation
//   test('Should calculate correct cart subtotal', async () => {
//     const quantity = 2;
    
//     const res = await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: quantity
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.cart.subtotal).toBe(85000 * quantity);
//   });

  // ✅ Test 3: Add non-existent product to cart should fail
//   test('Should fail adding non-existent product to cart', async () => {
//     const res = await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: '507f1f77bcf86cd799439999',
//         quantity: 1
//       });

//     expect(res.statusCode).toBe(404);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 4: Add item with stock exceeding available quantity
//   test('Should fail adding quantity exceeding available stock', async () => {
//     const res = await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 100 // More than available 50
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//     expect(res.body.message).toContain('stock');
//   });

  // ✅ Test 5: Checkout with valid customer info
//   test('Should complete checkout successfully', async () => {
//     // Add item to cart first
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 2
//       });

//     const checkoutData = {
//       userId: userId,
//       customerInfo: {
//         firstName: 'Ahmed',
//         lastName: 'Khan',
//         email: 'ahmed@example.com',
//         phoneNumber: '03001234567',
//         address: '123 Main Street'
//       },
//       paymentMethod: 'cod'
//     };

//     const res = await request(app)
//       .post('/order/checkout')
//       .send(checkoutData);

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.order).toBeDefined();
//     expect(res.body.order.orderNumber).toBeDefined();
//     expect(res.body.order.orderStatus).toBe('pending');
//     expect(res.body.order.paymentStatus).toBe('unpaid');
//   });

//   // ✅ Test 6: Order includes correct total with shipping
//   test('Should calculate correct order total with shipping', async () => {
//     // Add item to cart
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 1
//       });

//     const checkoutData = {
//       userId: userId,
//       customerInfo: {
//         firstName: 'Test',
//         lastName: 'User',
//         email: 'test@example.com',
//         phoneNumber: '03009999999',
//         address: 'Test Address'
//       },
//       paymentMethod: 'card'
//     };

//     const res = await request(app)
//       .post('/order/checkout')
//       .send(checkoutData);

//     expect(res.statusCode).toBe(201);
//     const order = res.body.order;
//     expect(order.subtotal).toBe(85000);
//     expect(order.shipping).toBe(500);
//     expect(order.total).toBe(85500);
//   });

  // ✅ Test 7: Checkout validation - missing first name
//   test('Should fail checkout without first name', async () => {
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 1
//       });

//     const res = await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           lastName: 'Khan',
//           email: 'test@example.com',
//           phoneNumber: '03001234567',
//           address: 'Test Address'
//         },
//         paymentMethod: 'cod'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 8: Checkout validation - invalid email
//   test('Should fail checkout with invalid email', async () => {
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 1
//       });

//     const res = await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           firstName: 'Ahmed',
//           lastName: 'Khan',
//           email: 'invalid-email',
//           phoneNumber: '03001234567',
//           address: 'Test Address'
//         },
//         paymentMethod: 'cod'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 9: Checkout validation - invalid phone number
//   test('Should fail checkout with invalid phone number', async () => {
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 1
//       });

//     const res = await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           firstName: 'Ahmed',
//           lastName: 'Khan',
//           email: 'test@example.com',
//           phoneNumber: 'invalid',
//           address: 'Test Address'
//         },
//         paymentMethod: 'cod'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 10: Order data saved to database
//   test('Should save order to database after checkout', async () => {
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 1
//       });

//     const checkoutData = {
//       userId: userId,
//       customerInfo: {
//         firstName: 'Save Test',
//         lastName: 'User',
//         email: 'savetest@example.com',
//         phoneNumber: '03008888888',
//         address: 'Test Address'
//       },
//       paymentMethod: 'cod'
//     };

//     const res = await request(app)
//       .post('/order/checkout')
//       .send(checkoutData);

//     expect(res.statusCode).toBe(201);

//     // Verify order in database
//     const savedOrder = await Order.findById(res.body.order._id);
//     expect(savedOrder).toBeDefined();
//     expect(savedOrder.userId.toString()).toBe(userId.toString());
//     expect(savedOrder.total).toBe(85500);
//   });

  // ✅ Test 11: Stock is deducted after checkout
//   test('Should deduct stock from product after checkout', async () => {
//     const initialStock = 50;

//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 3
//       });

//     await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           firstName: 'Stock',
//           lastName: 'Test',
//           email: 'stock@example.com',
//           phoneNumber: '03007777777',
//           address: 'Test Address'
//         },
//         paymentMethod: 'cod'
//       });

//     // Verify stock was deducted
//     const updatedProduct = await Product.findById(productId);
//     expect(updatedProduct.stock).toBe(initialStock - 3);
//   });

  // ✅ Test 12: Checkout with different payment methods
//   test('Should accept different payment methods in checkout', async () => {
//     const paymentMethods = ['cod', 'card', 'mobile', 'bank'];

//     for (const method of paymentMethods) {
//       // Create new user for each payment method
//       const userData = {
//         fullName: `User-${method}`,
//         email: `user-${method}-${Date.now()}@example.com`,
//         phone: '03001111111',
//         password: 'Pass123!'
//       };

//       const userRes = await request(app)
//         .post('/auth/signup')
//         .send(userData);
      
//       const newUserId = userRes.body.user._id;

//       // Add to cart
//       await request(app)
//         .post('/cart/add')
//         .send({
//           userId: newUserId,
//           productId: productId,
//           quantity: 1
//         });

      // Checkout with different payment method
    //   const res = await request(app)
    //     .post('/order/checkout')
    //     .send({
    //       userId: newUserId,
    //       customerInfo: {
    //         firstName: 'Test',
    //         lastName: 'User',
    //         email: `test-${method}@example.com`,
    //         phoneNumber: '03006666666',
    //         address: 'Test Address'
    //       },
    //       paymentMethod: method
    //     });

    //   expect(res.statusCode).toBe(201);
    //   expect(res.body.order.paymentMethod).toBe(method);
//     }
//   });

  // ✅ Test 13: Order number is unique
//   test('Should generate unique order numbers', async () => {
//     const orderNumbers = new Set();

//     for (let i = 0; i < 3; i++) {
//       // Create new user
//       const userData = {
//         fullName: `Unique-${i}`,
//         email: `unique-${i}-${Date.now()}@example.com`,
//         phone: '03001234567',
//         password: 'Pass123!'
//       };

//       const userRes = await request(app)
//         .post('/auth/signup')
//         .send(userData);
      
//       const newUserId = userRes.body.user._id;

//       // Add to cart
//       await request(app)
//         .post('/cart/add')
//         .send({
//           userId: newUserId,
//           productId: productId,
//           quantity: 1
//         });

//       Checkout
//       const res = await request(app)
//         .post('/order/checkout')
//         .send({
//           userId: newUserId,
//           customerInfo: {
//             firstName: 'Test',
//             lastName: 'User',
//             email: `test-${i}@example.com`,
//             phoneNumber: '03005555555',
//             address: 'Test Address'
//           },
//           paymentMethod: 'cod'
//         });

//       expect(res.statusCode).toBe(201);
//       orderNumbers.add(res.body.order.orderNumber);
//     }

//     expect(orderNumbers.size).toBe(3); // All order numbers should be unique
//   });

  });
