const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const Seller = require('../models/seller');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create Order
router.post('/create', async (req, res) => {
  try {
    const { customerInfo, paymentMethod, paymentDetails, items, subtotal, shipping, total, orderDate } = req.body;

    // Validate required fields
    if (!customerInfo || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    
    // Fetch seller information and complete product details for each item
    const itemsWithSeller = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item._id);
        return {
          _id: item._id,
          name: item.name || product?.name || 'Unknown Product',
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          images: item.images || product?.images || [],
          description: product?.description || '',
          category: product?.category || '',
          sellerId: product?.seller || product?.sellerId || 'unknown',
        };
      })
    );

    const order = new Order({
      orderNumber,
      customerInfo,
      paymentMethod,
      paymentDetails: paymentMethod === 'bank' ? paymentDetails : null,
      items: itemsWithSeller,
      subtotal,
      shipping,
      total,
      orderDate: new Date(orderDate || Date.now()),
      orderStatus: 'confirmed',
      paymentStatus: 'unpaid',
    });

    const savedOrder = await order.save();

    // Update product stock for each item in the order
    for (const item of items) {
      try {
        const product = await Product.findById(item._id);
        if (product) {
          // Decrease stock by quantity ordered
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          await Product.findByIdAndUpdate(
            item._id,
            { stock: newStock },
            { new: true }
          );
          console.log(`Product: ${product.name} | Previous Stock: ${product.stock} | Quantity Ordered: ${item.quantity || 1} | New Stock: ${newStock}`);
        }
      } catch (error) {
        console.error(`Error updating stock for product ${item._id}:`, error);
      }
    }

    // Send order notifications to sellers
    const sellerOrdersMap = {};
    itemsWithSeller.forEach((item) => {
      const sellerId = item.sellerId;
      if (!sellerOrdersMap[sellerId]) {
        sellerOrdersMap[sellerId] = [];
      }
      sellerOrdersMap[sellerId].push(item);
    });

    // Notify each seller
    for (const [sellerId, sellerItems] of Object.entries(sellerOrdersMap)) {
      try {
        const seller = await Seller.findById(sellerId);
        if (seller) {
          // In a real app, you'd send an email here
          console.log(`\n${'='.repeat(80)}`);
          console.log(`📦 NEW ORDER RECEIVED`);
          console.log(`${'='.repeat(80)}`);
          console.log(`\n🏪 SELLER: ${seller.storeName}`);
          console.log(`📧 Email: ${seller.email}`);
          console.log(`Order Number: ${orderNumber}`);
          console.log(`\n👤 CUSTOMER DETAILS:`);
          console.log(`  Name: ${customerInfo.firstName} ${customerInfo.lastName}`);
          console.log(`  Email: ${customerInfo.email}`);
          console.log(`  Phone: ${customerInfo.phoneNumber}`);
          console.log(`  Address: ${customerInfo.address}, ${customerInfo.city} ${customerInfo.postalCode}`);
          console.log(`\n📋 PRODUCTS ORDERED:`);
          sellerItems.forEach((item, index) => {
            console.log(`\n  ${index + 1}. Product Name: ${item.name}`);
            console.log(`     Category: ${item.category}`);
            console.log(`     Quantity: ${item.quantity}`);
            console.log(`     Price: PKR ${item.price}`);
            console.log(`     Subtotal: PKR ${item.price * item.quantity}`);
          });
          console.log(`\n💰 PAYMENT DETAILS:`);
          console.log(`  Subtotal: PKR ${subtotal}`);
          console.log(`  Shipping: PKR ${shipping}`);
          console.log(`  Total: PKR ${total}`);
          console.log(`  Payment Method: ${paymentMethod.toUpperCase()}`);
          console.log(`  Payment Status: UNPAID`);
          console.log(`  Order Status: CONFIRMED`);
          console.log(`\n${'='.repeat(80)}\n`);
        }
      } catch (error) {
        console.error(`Error notifying seller ${sellerId}:`, error);
      }
    }

    // Log order for admin dashboard (in real app, this would update admin dashboard/analytics)
    console.log('=== NEW ORDER ===');
    console.log('Order Number:', orderNumber);
    console.log('Customer:', `${customerInfo.firstName} ${customerInfo.lastName}`);
    console.log('Email:', customerInfo.email);
    console.log('Phone:', customerInfo.phoneNumber);
    console.log('Delivery Address:', `${customerInfo.address}, ${customerInfo.city} ${customerInfo.postalCode}`);
    console.log('Payment Method:', paymentMethod);
    console.log('Total Amount:', total);
    console.log('Items:', items);
    console.log('================');

    // Send order confirmation email to customer
    try {
      await sendOrderConfirmationEmail(
        customerInfo,
        orderNumber,
        itemsWithSeller,
        subtotal,
        shipping,
        total,
        paymentMethod
      );
      console.log(`Order confirmation email sent to ${customerInfo.email}`);
    } catch (emailError) {
      // Log email error but don't fail the order creation
      console.error('Error sending order confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder,
      orderNumber: orderNumber,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
});

// Get Order by Order Number
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
});

// Get all orders (Admin)
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders: orders,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

// Get orders for specific seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const orders = await Order.find({ 'items.sellerId': req.params.sellerId }).sort({ createdAt: -1 });
    
    // Format orders with clear product information
    const formattedOrders = orders.map(order => {
      // Filter items for this seller only
      const sellerItems = order.items.filter(item => item.sellerId === req.params.sellerId);
      
      return {
        orderNumber: order.orderNumber,
        customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phoneNumber,
        customerAddress: `${order.customerInfo.address}, ${order.customerInfo.city} ${order.customerInfo.postalCode}`,
        items: sellerItems.map(item => ({
          productId: item._id,
          productName: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          image: item.images && item.images.length > 0 ? item.images[0] : null
        })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate,
        createdAt: order.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      orders: formattedOrders,
      totalOrders: formattedOrders.length,
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller orders',
      error: error.message,
    });
  }
});

// Update Order Status
router.put('/:orderNumber/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
});

module.exports = router;
