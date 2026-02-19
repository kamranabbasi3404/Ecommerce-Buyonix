const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('FUNCTIONAL: User Authentication Workflow', () => {
  
  describe('User Registration Functional Flow', () => {
    
    test('Functional Flow 1: New user can register successfully', async () => {
      const testEmail = `user1-${Date.now()}@example.com`;
      const userData = {
        fullName: 'John Doe',
        email: testEmail,
        phone: '03001234567',
        password: 'SecurePass123'
      };

      const res = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.displayName).toBe(userData.fullName);
      expect(savedUser.phone).toBe(userData.phone);
    });

    test('Functional Flow 2: Registered user can log in immediately', async () => {
      const testEmail = `user2-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Jane Smith',
        email: testEmail,
        phone: '03001111111',
        password: 'SecurePass456'
      };

      const signupRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(signupRes.statusCode).toBe(201);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.user).toBeDefined();
      expect(loginRes.body.user.email).toBe(userData.email);
    });

    test('Functional Flow 3: Multiple users can register with different credentials', async () => {
      const baseTime = Date.now();
      const users = [
        {
          fullName: 'User One',
          email: `userone-${baseTime}@example.com`,
          phone: '03002222222',
          password: 'Pass1234'
        },
        {
          fullName: 'User Two',
          email: `usertwo-${baseTime}@example.com`,
          phone: '03003333333',
          password: 'Pass1234'
        },
        {
          fullName: 'User Three',
          email: `userthree-${baseTime}@example.com`,
          phone: '03004444444',
          password: 'Pass1234'
        }
      ];

      for (const user of users) {
        const res = await request(app)
          .post('/auth/signup')
          .send(user);

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe(user.email);
      }

      const userCount = await User.countDocuments({
        email: { $in: users.map(u => u.email) }
      });
      expect(userCount).toBe(3);
    });
  });

  describe('User Login and Session Management', () => {
    
    let testUserEmail;
    
    beforeEach(async () => {
      testUserEmail = `login-test-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Test User',
        email: testUserEmail,
        phone: '03005555555',
        password: 'LoginPass123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);
    });

    test('Functional Flow 4: User can log in with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'LoginPass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUserEmail);
    });

    test('Functional Flow 5: Login stores session information', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'LoginPass123'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.user.id).toBeDefined();
      expect(loginRes.body.user.displayName).toBeDefined();
      expect(loginRes.body.user.email).toBe(testUserEmail);
    });

    test('Functional Flow 6: Login returns user with all required fields', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'LoginPass123'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.user).toHaveProperty('id');
      expect(loginRes.body.user).toHaveProperty('email');
      expect(loginRes.body.user).toHaveProperty('displayName');
    });
  });

  describe('User Data Integrity and Persistence', () => {
    
    test('Functional Flow 7: User data persists correctly in database', async () => {
      const testEmail = `persist-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Persistence Test User',
        email: testEmail,
        phone: '03006666666',
        password: 'Persist123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);

      const dbUser = await User.findOne({ email: userData.email });

      expect(dbUser).toBeDefined();
      expect(dbUser.displayName).toBe(userData.fullName);
      expect(dbUser.email).toBe(userData.email);
      expect(dbUser.phone).toBe(userData.phone);
      expect(dbUser.createdAt).toBeDefined();
    });

    test('Functional Flow 8: Password is securely stored (hashed) in database', async () => {
      const testEmail = `hash-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Hash Test User',
        email: testEmail,
        phone: '03007777777',
        password: 'PlainPassword123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);

      const dbUser = await User.findOne({ email: userData.email });

      expect(dbUser.password).not.toBe(userData.password);
      expect(dbUser.password.length).toBeGreaterThan(20);
    });

    test('Functional Flow 9: User ID is generated and unique for each user', async () => {
      const baseTime = Date.now();
      const user1Email = `unique1-${baseTime}@example.com`;
      const user2Email = `unique2-${baseTime + 1}@example.com`;

      const res1 = await request(app)
        .post('/auth/signup')
        .send({
          fullName: 'User 1',
          email: user1Email,
          phone: '03008888888',
          password: 'Pass1234'
        });

      const res2 = await request(app)
        .post('/auth/signup')
        .send({
          fullName: 'User 2',
          email: user2Email,
          phone: '03009999999',
          password: 'Pass1234'
        });

      expect(res1.body.user.id).toBeDefined();
      expect(res2.body.user.id).toBeDefined();
      expect(res1.body.user.id).not.toBe(res2.body.user._id);
    });

    test('Functional Flow 10: User creation timestamp is automatically set', async () => {
      const testEmail = `timestamp-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Timestamp Test User',
        email: testEmail,
        phone: '03000000010',
        password: 'Timestamp123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);

      const dbUser = await User.findOne({ email: userData.email });

      expect(dbUser.createdAt).toBeDefined();
      expect(dbUser.createdAt instanceof Date).toBe(true);
    });
  });

  describe('User Session Management', () => {
    
    test('Functional Flow 11: User session data contains required fields', async () => {
      const testEmail = `session-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Session Test User',
        email: testEmail,
        phone: '03000000001',
        password: 'SessionPass123'
      };

      const signupRes = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(signupRes.body.user).toHaveProperty('id');
      expect(signupRes.body.user).toHaveProperty('email');
      expect(signupRes.body.user).toHaveProperty('displayName');
    });

    test('Functional Flow 12: Successful login returns complete user object', async () => {
      const testEmail = `complete-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Complete User Object Test',
        email: testEmail,
        phone: '03000000002',
        password: 'CompletePass123'
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

      expect(loginRes.body.user.id).toBeDefined();
      expect(loginRes.body.user.email).toBe(userData.email);
      expect(loginRes.body.user.displayName).toBe(userData.fullName);
    });

    test('Functional Flow 13: Registration response contains success flag', async () => {
      const testEmail = `success-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Success Flag Test',
        email: testEmail,
        phone: '03000000003',
        password: 'SuccessPass123'
      };

      const res = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toBe(true);
    });

    test('Functional Flow 14: Login response contains success flag', async () => {
      const testEmail = `loginsuccess-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Login Success Flag Test',
        email: testEmail,
        phone: '03000000004',
        password: 'LoginSuccessPass123'
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

      expect(loginRes.body).toHaveProperty('success');
      expect(loginRes.body.success).toBe(true);
    });

    test('Functional Flow 15: User can perform consecutive logins', async () => {
      const testEmail = `consecutive-${Date.now()}@example.com`;
      const userData = {
        fullName: 'Consecutive Login Test',
        email: testEmail,
        phone: '03000000005',
        password: 'ConsecutivePass123'
      };

      await request(app)
        .post('/auth/signup')
        .send(userData);

      const login1 = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(login1.statusCode).toBe(200);

      const login2 = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(login2.statusCode).toBe(200);
      expect(login1.body.user._id).toBe(login2.body.user._id);
    });
  });
});
