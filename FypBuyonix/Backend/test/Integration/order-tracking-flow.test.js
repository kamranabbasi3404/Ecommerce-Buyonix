// const request = require('supertest');
// const app = require('../../server');
// const User = require('../../models/User');
// const Seller = require('../../models/seller');
// const Product = require('../../models/product');
// const Order = require('../../models/order');

// describe('INTEGRATION: Order Tracking and Status Management', () => {

//   let userId;
//   let sellerId;
//   let productId;
//   let orderId;
//   let orderNumber;

//   // Setup: Create user, seller, product, and order before tests
//   beforeEach(async () => {
//     // Create user
//     const userData = {
//       fullName: 'Order Tracker',
//       email: `tracker-${Date.now()}@example.com`,
//       phone: '03101234567',
//       password: 'TrackerPass123!'
//     };

//     const userRes = await request(app)
//       .post('/auth/signup')
//       .send(userData);
    
//     userId = userRes.body.user._id;

//     // Create seller
//     const sellerData = {
//       fullName: 'Order Seller',
//       email: `orderseller-${Date.now()}@example.com`,
//       phone: '03109876543',
//       password: 'SellerPass123!',
//       businessName: 'Order Business',
//       businessType: 'Retail',
//       storeName: `OrderStore-${Date.now()}`,
//       storeDescription: 'Order tracking test store',
//       primaryCategory: 'Electronics',
//       accountHolderName: 'Order Seller',
//       bankName: 'HBL',
//       accountNumber: '1234567890',
//       iban: 'PK36HBLACC1234567890',
//       cnicNumber: '12345-1234567-20',
//       taxNumber: 'TAX123470'
//     };

//     const sellerRes = await request(app)
//       .post('/seller/register')
//       .send(sellerData);
    
//     if (!sellerRes.body.seller || !sellerRes.body.seller.id) {
//       throw new Error(`Seller registration failed: ${JSON.stringify(sellerRes.body)}`);
//     }
    
//     sellerId = sellerRes.body.seller.id;

//     // Create product
//     const productData = {
//       name: 'Test Product for Order',
//       description: 'Test product for order tracking',
//       category: 'Electronics',
//       price: 50000,
//       stock: 100,
//       images: ['product.jpg'],
//       sellerId: sellerId
//     };

//     const productRes = await request(app)
//       .post('/product/create')
//       .send(productData);
    
//     productId = productRes.body.product._id;

//     // Add to cart and create order
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: productId,
//         quantity: 2
//       });

//     const checkoutRes = await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           firstName: 'Test',
//           lastName: 'User',
//           email: 'test@example.com',
//           phoneNumber: '03001234567',
//           address: 'Test Address'
//         },
//         paymentMethod: 'cod'
//       });

//     orderId = checkoutRes.body.order._id;
//     orderNumber = checkoutRes.body.order.orderNumber;
//   });

//   // ✅ Test 1: Get user's orders
//   test('Should retrieve all user orders', async () => {
//     const res = await request(app)
//       .get(`/order/user/${userId}`)
//       .query({ page: 1, limit: 10 });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.orders).toBeDefined();
//     expect(Array.isArray(res.body.orders)).toBe(true);
//     expect(res.body.orders.length).toBeGreaterThan(0);
//   });

//   // ✅ Test 2: User orders pagination
//   test('Should support pagination in user orders', async () => {
//     const res = await request(app)
//       .get(`/order/user/${userId}`)
//       .query({ page: 1, limit: 5 });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.pagination).toBeDefined();
//     expect(res.body.pagination.page).toBe(1);
//     expect(res.body.pagination.limit).toBe(5);
//     expect(res.body.pagination.total).toBeDefined();
//   });

//   // ✅ Test 3: Get seller's orders
//   test('Should retrieve all seller orders', async () => {
//     const res = await request(app)
//       .get(`/order/seller/${sellerId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.orders).toBeDefined();
//   });

//   // ✅ Test 4: Seller orders organized by status
//   test('Should organize seller orders by status', async () => {
//     const res = await request(app)
//       .get(`/order/seller/${sellerId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.orders).toBeDefined();
//     expect(res.body.orders.pending).toBeDefined();
//     expect(res.body.orders.confirmed).toBeDefined();
//     expect(res.body.orders.shipped).toBeDefined();
//     expect(res.body.orders.delivered).toBeDefined();
//   });

//   // ✅ Test 5: Order starts with pending status
//   test('Should have pending status when order is created', async () => {
//     const res = await request(app)
//       .get(`/order/user/${userId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.orders.length).toBeGreaterThan(0);
//     expect(res.body.orders[0].orderStatus).toBe('pending');
//   });

//   // ✅ Test 6: Update order status from pending to confirmed
//   test('Should update order status to confirmed', async () => {
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.order.orderStatus).toBe('confirmed');
//   });

//   // ✅ Test 7: Update order status from confirmed to shipped
//   test('Should update order status to shipped', async () => {
//     // First update to confirmed
//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     // Then update to shipped
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'shipped'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.order.orderStatus).toBe('shipped');
//   });

//   // ✅ Test 8: Update order status to delivered
//   test('Should update order status to delivered', async () => {
//     // Progress through statuses
//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'shipped'
//       });

//     // Final delivery
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'delivered'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.order.orderStatus).toBe('delivered');
//   });

//   // ✅ Test 9: COD payment status changes to paid when delivered
//   test('Should update payment status to paid when COD order is delivered', async () => {
//     // Progress to delivered
//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'shipped'
//       });

//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'delivered'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.order.paymentStatus).toBe('paid');
//   });

//   // ✅ Test 10: Invalid status transition should fail
//   test('Should prevent invalid status transition', async () => {
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'delivered' // Cannot jump directly from pending to delivered
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

//   // ✅ Test 11: Non-existent order should fail
//   test('Should fail updating non-existent order', async () => {
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: 'NONEXISTENT-12345',
//         newStatus: 'confirmed'
//       });

//     expect(res.statusCode).toBe(404);
//     expect(res.body.success).toBe(false);
//   });

//   // ✅ Test 12: Order status update timestamp
//   test('Should update status timestamp when status changes', async () => {
//     const beforeUpdate = new Date();

//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     const afterUpdate = new Date();

//     expect(res.statusCode).toBe(200);
//     expect(res.body.order.statusUpdatedAt).toBeDefined();
//     const updateTime = new Date(res.body.order.statusUpdatedAt);
//     expect(updateTime.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
//     expect(updateTime.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
//   });

//   // ✅ Test 13: Multiple orders can be tracked independently
//   test('Should track multiple orders independently', async () => {
//     // Create second product
//     const product2Data = {
//       name: 'Second Product',
//       description: 'Another test product',
//       category: 'Fashion',
//       price: 5000,
//       stock: 50,
//       images: [],
//       sellerId: sellerId
//     };

//     const product2Res = await request(app)
//       .post('/product/create')
//       .send(product2Data);
    
//     const product2Id = product2Res.body.product._id;

//     // Create second order
//     await request(app)
//       .post('/cart/add')
//       .send({
//         userId: userId,
//         productId: product2Id,
//         quantity: 1
//       });

//     const order2Res = await request(app)
//       .post('/order/checkout')
//       .send({
//         userId: userId,
//         customerInfo: {
//           firstName: 'Test',
//           lastName: 'User',
//           email: 'test2@example.com',
//           phoneNumber: '03002222222',
//           address: 'Test Address 2'
//         },
//         paymentMethod: 'card'
//       });

//     const order2Number = order2Res.body.order.orderNumber;

//     // Update first order to confirmed
//     await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'confirmed'
//       });

//     // Verify second order is still pending
//     const secondOrderRes = await request(app)
//       .get(`/order/user/${userId}`);

//     const secondOrder = secondOrderRes.body.orders.find(o => o.orderNumber === order2Number);
//     expect(secondOrder.orderStatus).toBe('pending');
//   });

//   // ✅ Test 14: Cancel order from pending status
//   test('Should allow cancellation from pending status', async () => {
//     const res = await request(app)
//       .put(`/order/update-status`)
//       .send({
//         orderNumber: orderNumber,
//         newStatus: 'cancelled'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.order.orderStatus).toBe('cancelled');
//   });

// });
