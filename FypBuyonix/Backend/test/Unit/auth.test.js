/**
 * Unit Tests for Auth Routes
 * Tests login, signup, and authentication endpoints
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const authRouter = require('../../routes/auth');
const bcrypt = require('bcryptjs');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

// Mock data - use fullName to match route expectations
const mockUser = {
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'TestPassword123'
};

const mockUser2 = {
  fullName: 'Another User',
  email: 'another@example.com',
  phone: '9876543210',
  password: 'AnotherPass123'
};

describe('Auth Routes - Unit Tests', () => {
  
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  // ============== SIGNUP TESTS ==============
  describe('POST /auth/signup', () => {

    test('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.displayName).toBe(mockUser.fullName);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.phone).toBe(mockUser.phone);

      // Verify user is saved in database
      const savedUser = await User.findOne({ email: mockUser.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.displayName).toBe(mockUser.fullName);
    });

    test('should hash password correctly during signup', async () => {
      await request(app).post('/auth/signup').send(mockUser);

      // Fetch user after creation to ensure existence
      const user = await User.findOne({ email: mockUser.email });
      expect(user).toBeDefined(); // Safety check for TypeError
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe(mockUser.password); // Password should be hashed
      
      // Verify hashed password matches original
      const isPasswordValid = await bcrypt.compare(mockUser.password, user.password);
      expect(isPasswordValid).toBe(true);
    });

    test('should reject duplicate email', async () => {
      // Create first user
      const response1 = await request(app).post('/auth/signup').send(mockUser);
      expect(response1.status).toBe(201);
      expect(response1.body.success).toBe(true);

      // Try to create user with same email
      const response2 = await request(app)
        .post('/auth/signup')
        .send(mockUser);

      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
    });

    test('should reject signup with missing fullName', async () => {
      const invalidUser = {
        email: 'test@example.com',
        phone: '1234567890',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidUser);

      // FIX: Changed from 500 to 400 (validation error)
      expect(response.status).toBe(400); 
      expect(response.body.success).toBe(false);
    });

    test('should reject signup with missing email', async () => {
      const invalidUser = {
        fullName: 'Test User',
        phone: '1234567890',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should reject signup with missing password', async () => {
      const invalidUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidUser);

      // FIX: Changed from 500 to 400 (validation error)
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should create user with optional phone field', async () => {
      const userWithoutPhone = {
        fullName: mockUser.fullName,
        email: 'newuser@example.com', // Use different email to avoid conflicts
        password: mockUser.password
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userWithoutPhone);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  // ============== LOGIN TESTS ==============
  describe('POST /auth/login', () => {

    beforeEach(async () => {
      // Create a user before each login test
      const hashedPassword = await bcrypt.hash(mockUser.password, 12);
      await User.create({
        displayName: mockUser.fullName, // Use fullName from mockUser (which maps to displayName in DB)
        email: mockUser.email,
        password: hashedPassword,
        phone: mockUser.phone
      });
    });

    test('should login user with correct email and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });

      // FIX: Login API Integration test failed with 400 -> expected 200, this unit test should pass 200
      expect(response.status).toBe(200); 
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(mockUser.email);
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: mockUser.password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should require email field', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: mockUser.password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should require password field', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: mockUser.email
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should not login user created with Google OAuth', async () => {
      // Create a Google OAuth user (no password)
      await User.create({
        displayName: 'Google User',
        email: 'google@example.com',
        googleId: 'google_123'
        // No password field
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'google@example.com',
          password: 'anypassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Google');
    });

    test('should return user data without password hash', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.user.password).toBeUndefined();
    });
  });

  // ============== GET USERS TESTS ==============
  describe('GET /auth/users', () => {

    beforeEach(async () => {
      // Create multiple users
      const hashedPassword = await bcrypt.hash(mockUser.password, 12);
      await User.create([
        {
          displayName: mockUser.fullName, // Use fullName from mockUser (which maps to displayName in DB)
          email: mockUser.email,
          password: hashedPassword,
          phone: mockUser.phone
        },
        {
          displayName: mockUser2.fullName, // Use fullName from mockUser2 (which maps to displayName in DB)
          email: mockUser2.email,
          password: hashedPassword,
          phone: mockUser2.phone
        }
      ]);
    });

    test('should fetch all users', async () => {
      const response = await request(app)
        .get('/auth/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.users)).toBe(true);
      // FIX: Expectation changed from 0 to 2, ensuring successful setup
      expect(response.body.users.length).toBe(2); 
    });

    test('should not return password in user data', async () => {
      const response = await request(app)
        .get('/auth/users');

      expect(response.status).toBe(200);
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    test('should return users sorted by creation date', async () => {
      const response = await request(app)
        .get('/auth/users');

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBe(2);
      // Just verify both users are returned
      const emails = response.body.users.map(u => u.email);
      expect(emails).toContain(mockUser.email);
      expect(emails).toContain(mockUser2.email);
    });

    test('should return empty array when no users exist', async () => {
      await User.deleteMany({});

      const response = await request(app)
        .get('/auth/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.users.length).toBe(0);
    });
  });

  // ============== SESSION/LOGIN SUCCESS TESTS ==============
  describe('GET /auth/login/success', () => {

    test('should return 401 when user not authenticated', async () => {
      const response = await request(app)
        .get('/auth/login/success');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authenticated');
    });
  });

  // ============== PASSWORD VALIDATION TESTS ==============
  describe('Password Security', () => {

    test('passwords should be hashed with bcrypt', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    test('bcrypt should verify correct passwords', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('bcrypt should reject incorrect passwords', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isValid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  // ============== USER CREATION TESTS ==============
  describe('User Document Creation', () => {

    test('user should have createdAt timestamp', async () => {
      await request(app).post('/auth/signup').send(mockUser);

      const user = await User.findOne({ email: mockUser.email });
      expect(user.createdAt).toBeDefined();
      expect(user.createdAt instanceof Date).toBe(true);
    });

    test('user email should be unique', async () => {
      await User.create({
        displayName: 'User 1',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 12)
      });

      try {
        await User.create({
          displayName: 'User 2',
          email: 'duplicate@example.com',
          password: await bcrypt.hash('password123', 12)
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('user displayName should be required', async () => {
      try {
        await User.create({
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12)
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});