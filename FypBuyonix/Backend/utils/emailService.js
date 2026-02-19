const nodemailer = require('nodemailer');

// Check if email credentials are configured
const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Create transporter - using Gmail as example
// For production, use environment variables for credentials
let transporter = null;

if (hasEmailConfig) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password, not regular password
    },
  });
} else {
  console.warn('⚠️  Email credentials not configured. OTPs will be logged to console only.');
}

// Alternative: Use SMTP directly
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || 'smtp.gmail.com',
//   port: process.env.SMTP_PORT || 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const sendOTPEmail = async (email, otp) => {
  try {
    // If email not configured, log to console for development
    if (!hasEmailConfig) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 OTP EMAIL (Email service not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Your Buyonix Verification Code`);
      console.log(`\nYour verification code is: ${otp}`);
      console.log(`This code expires in 10 minutes.`);
      console.log('='.repeat(60) + '\n');
      return { success: true, messageId: 'console-log' };
    }

    const mailOptions = {
      from: `"Buyonix" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Buyonix Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #14b8a6;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-code {
              background-color: #f0f0f0;
              border: 2px dashed #14b8a6;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #14b8a6;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Buyonix Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for using Buyonix! Please use the following verification code to complete your login or signup:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              
              <p>Best regards,<br>The Buyonix Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Buyonix Verification Code
        
        Hello,
        
        Thank you for using Buyonix! Please use the following verification code to complete your login or signup:
        
        ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The Buyonix Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

const sendSellerApprovalEmail = async (email, sellerName, storeName) => {
  try {
    // If email not configured, log to console for development
    if (!hasEmailConfig) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 SELLER APPROVAL EMAIL (Email service not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Congratulations! Your Store Has Been Approved`);
      console.log(`\nDear ${sellerName},`);
      console.log(`\nCongratulations! Your store "${storeName}" has been successfully approved.`);
      console.log(`You can now log in to your seller dashboard and start listing your products.`);
      console.log(`\nBest regards,`);
      console.log(`The Buyonix Team`);
      console.log('='.repeat(60) + '\n');
      return { success: true, messageId: 'console-log' };
    }

    const mailOptions = {
      from: `"Buyonix" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Congratulations! Your Store Has Been Approved',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #14b8a6;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .success-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .message-box {
              background-color: #f0fdf4;
              border-left: 4px solid #14b8a6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background-color: #14b8a6;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Store Approval Successful!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Dear ${sellerName},</p>
              
              <div class="message-box">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #14b8a6;">
                  Congratulations! Your store has been successfully approved!
                </p>
              </div>
              
              <p>We are excited to inform you that your store <strong>"${storeName}"</strong> has been reviewed and approved by our admin team.</p>
              
              <p>You can now:</p>
              <ul>
                <li>Log in to your seller dashboard</li>
                <li>Start listing your products</li>
                <li>Manage your inventory</li>
                <li>Track your orders and sales</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/seller-dashboard" class="cta-button">
                  Go to Seller Dashboard
                </a>
              </p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br><strong>The Buyonix Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations! Your Store Has Been Approved
        
        Dear ${sellerName},
        
        We are excited to inform you that your store "${storeName}" has been reviewed and approved by our admin team.
        
        You can now:
        - Log in to your seller dashboard
        - Start listing your products
        - Manage your inventory
        - Track your orders and sales
        
        Visit your seller dashboard to get started!
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Best regards,
        The Buyonix Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Seller approval email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending seller approval email:', error);
    throw error;
  }
};

const sendOrderConfirmationEmail = async (customerInfo, orderNumber, items, subtotal, shipping, total, paymentMethod) => {
  try {
    const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`;
    const customerEmail = customerInfo.email;

    // If email not configured, log to console for development
    if (!hasEmailConfig) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 ORDER CONFIRMATION EMAIL (Email service not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: Order Confirmation - ${orderNumber}`);
      console.log(`\nDear ${customerName},`);
      console.log(`\nThank you for your order! Your order has been successfully placed.`);
      console.log(`\nOrder Number: ${orderNumber}`);
      console.log(`\nOrder Details:`);
      items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: PKR ${item.price}`);
      });
      console.log(`\nSubtotal: $ ${subtotal}`);
      console.log(`Shipping: $ ${shipping}`);
      console.log(`Total: $ ${total}`);
      console.log(`Payment Method: ${paymentMethod}`);
      console.log(`\nWe will process your order and notify you once it's shipped.`);
      console.log(`\nBest regards,`);
      console.log(`The Buyonix Team`);
      console.log('='.repeat(60) + '\n');
      return { success: true, messageId: 'console-log' };
    }

    // Build items HTML
    const itemsHtml = items.map((item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">PKR ${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Buyonix" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #14b8a6;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .success-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .order-number {
              background-color: #f0fdf4;
              border-left: 4px solid #14b8a6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 18px;
              font-weight: bold;
              color: #14b8a6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
              font-weight: bold;
              color: #374151;
            }
            .total-row {
              background-color: #f9fafb;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .info-box {
              background-color: #f0f9ff;
              border-left: 4px solid #0ea5e9;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Dear ${customerName},</p>
              
              <p>Thank you for your order! We're excited to confirm that your order has been successfully placed and is being processed.</p>
              
              <div class="order-number">
                Order Number: ${orderNumber}
              </div>
              
              <h3 style="color: #374151; margin-top: 30px;">Order Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="4" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">PKR ${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="4" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">PKR ${shipping.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="4" style="padding: 12px; text-align: right; font-size: 18px; color: #14b8a6;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; color: #14b8a6;">PKR ${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>Payment Method:</strong> ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
                <p style="margin: 5px 0 0 0;"><strong>Delivery Address:</strong> ${customerInfo.address}, ${customerInfo.city} ${customerInfo.postalCode}</p>
              </div>
              
              <p>We will process your order and notify you once it's shipped. You can track your order status using the order number above.</p>
              
              <p>If you have any questions or concerns, please don't hesitate to contact our customer support team.</p>
              
              <p>Thank you for shopping with us!</p>
              
              <p>Best regards,<br><strong>The Buyonix Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Confirmation - ${orderNumber}
        
        Dear ${customerName},
        
        Thank you for your order! We're excited to confirm that your order has been successfully placed and is being processed.
        
        Order Number: ${orderNumber}
        
        Order Details:
        ${items.map((item, index) => `${index + 1}. ${item.name} - Quantity: ${item.quantity} - Price: PKR ${item.price.toFixed(2)}`).join('\n')}
        
        Subtotal: PKR ${subtotal.toFixed(2)}
        Shipping: PKR ${shipping.toFixed(2)}
        Total: PKR ${total.toFixed(2)}
        
        Payment Method: ${paymentMethod}
        Delivery Address: ${customerInfo.address}, ${customerInfo.city} ${customerInfo.postalCode}
        
        We will process your order and notify you once it's shipped. You can track your order status using the order number above.
        
        If you have any questions or concerns, please don't hesitate to contact our customer support team.
        
        Thank you for shopping with us!
        
        Best regards,
        The Buyonix Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

const sendChatNotificationEmail = async (recipientEmail, recipientName, senderName, messagePreview, chatUrl) => {
  try {
    // If email not configured, log to console for development
    if (!hasEmailConfig) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 CHAT NOTIFICATION EMAIL (Email service not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: New message from ${senderName}`);
      console.log(`\nHello ${recipientName},`);
      console.log(`\nYou have a new message from ${senderName}:`);
      console.log(`"${messagePreview}..."`);
      console.log(`\nReply now: ${chatUrl}`);
      console.log('='.repeat(60) + '\n');
      return { success: true, messageId: 'console-log' };
    }

    const mailOptions = {
      from: `"Buyonix" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `New message from ${senderName} - Buyonix`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #14b8a6;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .message-box {
              background-color: #f0f9ff;
              border-left: 4px solid #14b8a6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background-color: #14b8a6;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              
              <p>You have a new message from <strong>${senderName}</strong>:</p>
              
              <div class="message-box">
                <p style="margin: 0; font-style: italic; color: #555;">"${messagePreview}..."</p>
              </div>
              
              <p style="text-align: center;">
                <a href="${chatUrl}" class="cta-button">Reply Now</a>
              </p>
              
              <p>Don't leave them waiting - reply now to continue the conversation!</p>
              
              <p>Best regards,<br><strong>The Buyonix Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New Message from ${senderName}
        
        Hello ${recipientName},
        
        You have a new message from ${senderName}:
        
        "${messagePreview}..."
        
        Reply now: ${chatUrl}
        
        Best regards,
        The Buyonix Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Chat notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending chat notification email:', error);
    // Don't throw - we don't want email failures to break chat
    return { success: false, error: error.message };
  }
};

const sendSupportReplyEmail = async (recipientEmail, recipientName, ticketId, subject, replyText, viewUrl) => {
  try {
    if (!hasEmailConfig) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 SUPPORT REPLY NOTIFICATION (Email service not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: Reply on Ticket ${ticketId} - ${subject}`);
      console.log(`\nHello ${recipientName},`);
      console.log(`\nYou have a new reply on your support ticket ${ticketId}:`);
      console.log(`"${replyText}"`);
      console.log(`\nView your ticket: ${viewUrl}`);
      console.log('='.repeat(60) + '\n');
      return { success: true, messageId: 'console-log' };
    }

    const mailOptions = {
      from: `"Buyonix Support" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Reply on Ticket ${ticketId} — ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #14b8a6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .ticket-info { background-color: #f0fdf4; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .reply-box { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Support Ticket Update</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>

              <div class="ticket-info">
                <p style="margin: 0; font-weight: bold; color: #14b8a6;">Ticket: ${ticketId}</p>
                <p style="margin: 5px 0 0 0; color: #555;">${subject}</p>
              </div>

              <p>You have received a new reply on your support ticket:</p>

              <div class="reply-box">
                <p style="margin: 0; font-style: italic; color: #555;">"${replyText}"</p>
              </div>

              <p style="text-align: center;">
                <a href="${viewUrl}" class="cta-button">View Ticket</a>
              </p>

              <p>If you have further questions, simply reply through the ticket page.</p>

              <p>Best regards,<br><strong>The Buyonix Support Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Support Ticket Update — ${ticketId}

        Hello ${recipientName},

        You have a new reply on your support ticket "${subject}":

        "${replyText}"

        View your ticket: ${viewUrl}

        Best regards,
        The Buyonix Support Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Support reply notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending support reply email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail, sendSellerApprovalEmail, sendOrderConfirmationEmail, sendChatNotificationEmail, sendSupportReplyEmail };

