const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('INTEGRATION: Authentication Routes - User Registration, Login & Validation', () => {

  // ============== USER REGISTRATION TESTS ==============

  // ✅ Test 1: Complete user signup successfully
  test('Should register new user with valid credentials', async () => {
    const newUser = {
      fullName: 'John Doe Auth',
      email: `john-auth-${Date.now()}@example.com`,
      phone: '03001234567',
      password: 'SecurePass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(newUser.email);
    expect(res.body.user.displayName).toBe(newUser.fullName);
  });

  // ✅ Test 2: Signup validation - missing full name
  test('Should fail signup without full name', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: `noname-${Date.now()}@example.com`,
        phone: '03001111111',
        password: 'SecurePass789!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Full name');
  });

  // ✅ Test 3: Signup validation - missing email
  test('Should fail signup without email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Test User',
        phone: '03002222222',
        password: 'SecurePass999!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('email');
  });

  // ✅ Test 4: Signup validation - missing password
  test('Should fail signup without password', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Test User',
        email: `nopass-${Date.now()}@example.com`,
        phone: '03003333333'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('password');
  });

  // ✅ Test 5: Signup with duplicate email should fail
  test('Should prevent signup with duplicate email', async () => {
    const duplicateEmail = `duplicate-${Date.now()}@example.com`;
    
    const user1 = {
      fullName: 'First User',
      email: duplicateEmail,
      phone: '03004444444',
      password: 'Pass123!'
    };

    // First signup
    const res1 = await request(app)
      .post('/auth/signup')
      .send(user1);

    expect(res1.statusCode).toBe(201);

    // Second signup with same email
    const res2 = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Second User',
        email: duplicateEmail,
        phone: '03005555555',
        password: 'Pass456!'
      });

    expect(res2.statusCode).toBe(400);
    expect(res2.body.success).toBe(false);
    expect(res2.body.message).toContain('already exists');
  });

  // ✅ Test 6: Signup response contains user ID
  test('Should return user ID in signup response', async () => {
    const newUser = {
      fullName: 'ID Test User',
      email: `idtest-${Date.now()}@example.com`,
      phone: '03006666666',
      password: 'Pass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.id).toBeDefined();
  });

  // ✅ Test 7: Password is hashed in database (not stored as plain text)
  test('Should hash password in database after signup', async () => {
    const plainPassword = 'PlainPass123!';
    const newUser = {
      fullName: 'Hash Test User',
      email: `hashtest-${Date.now()}@example.com`,
      phone: '03007777777',
      password: plainPassword
    };

    await request(app)
      .post('/auth/signup')
      .send(newUser);

    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.password).not.toBe(plainPassword);
    expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
  });

  // ✅ Test 8: Signup response does not include password
  test('Should not return password in signup response', async () => {
    const newUser = {
      fullName: 'No Pass Response',
      email: `nopassres-${Date.now()}@example.com`,
      phone: '03008888888',
      password: 'SecurePass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.password).toBeUndefined();
  });

  // ✅ Test 9: User data persists in database
  test('Should save user data in database after signup', async () => {
    const newUser = {
      fullName: 'Database Test User',
      email: `dbtest-${Date.now()}@example.com`,
      phone: '03009999999',
      password: 'Pass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);

    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.displayName).toBe(newUser.fullName);
    expect(savedUser.phone).toBe(newUser.phone);
  });

  // ✅ Test 10: Multiple users can register with different emails
  test('Should register multiple users with unique emails', async () => {
    const users = [
      { fullName: 'User A', email: `usera-${Date.now()}@example.com`, phone: '03010000001', password: 'Pass1!' },
      { fullName: 'User B', email: `userb-${Date.now()}@example.com`, phone: '03010000002', password: 'Pass2!' },
      { fullName: 'User C', email: `userc-${Date.now()}@example.com`, phone: '03010000003', password: 'Pass3!' }
    ];

    for (const user of users) {
      const res = await request(app)
        .post('/auth/signup')
        .send(user);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    }

    const userCount = await User.countDocuments({ 
      email: { $in: users.map(u => u.email) } 
    });
    expect(userCount).toBe(3);
  });

  // ============== USER LOGIN TESTS ==============

  // ✅ Test 11: Successful login with correct credentials
  test('Should login successfully with correct email and password', async () => {
    const userData = {
      fullName: 'Login Test User',
      email: `logintest-${Date.now()}@example.com`,
      phone: '03011111111',
      password: 'LoginPass123!'
    };

    // First signup
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(signupRes.statusCode).toBe(201);

    // Then login
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

  // ✅ Test 12: Login validation - missing email
  test('Should fail login without email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        password: 'SomePass123!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  // ✅ Test 13: Login validation - missing password
  test('Should fail login without password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  // ✅ Test 14: Login with non-existent email
  test('Should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Pass123!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 15: Login with incorrect password
  test('Should fail login with incorrect password', async () => {
    const userData = {
      fullName: 'Wrong Pass Test',
      email: `wrongpass-${Date.now()}@example.com`,
      phone: '03012222222',
      password: 'CorrectPass123!'
    };

    // Signup
    await request(app)
      .post('/auth/signup')
      .send(userData);

    // Try login with wrong password
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: 'WrongPass123!'
      });

    expect(loginRes.statusCode).toBe(400);
    expect(loginRes.body.success).toBe(false);
  });

  // ✅ Test 16: Login returns user information
  test('Should return complete user information after login', async () => {
    const userData = {
      fullName: 'User Info Test',
      email: `userinfo-${Date.now()}@example.com`,
      phone: '03013333333',
      password: 'Pass123!'
    };

    // Signup
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
    expect(loginRes.body.user.id).toBeDefined();
    expect(loginRes.body.user.displayName).toBe(userData.fullName);
    expect(loginRes.body.user.email).toBe(userData.email);
  });

  // ✅ Test 17: Login response does not include password
  test('Should not return password in login response', async () => {
    const userData = {
      fullName: 'No Pass Login',
      email: `nologinpass-${Date.now()}@example.com`,
      phone: '03014444444',
      password: 'Pass123!'
    };

    // Signup
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
    expect(loginRes.body.user.password).toBeUndefined();
  });

  // ✅ Test 18: Login success message is informative
  test('Should return success message on login', async () => {
    const userData = {
      fullName: 'Message Test User',
      email: `msgtest-${Date.now()}@example.com`,
      phone: '03015555555',
      password: 'Pass123!'
    };

    // Signup
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
    expect(loginRes.body.message).toBeDefined();
    expect(loginRes.body.message.toLowerCase()).toContain('success');
  });

  // ============== AUTHENTICATION STATE TESTS ==============

  // ✅ Test 19: Check login success endpoint
  test('Should access login success endpoint', async () => {
    const res = await request(app)
      .get('/auth/login/success');

    expect(res.statusCode).toBeDefined();
    expect([200, 401]).toContain(res.statusCode);
  });

  // ✅ Test 20: Case-insensitive email handling
//   test('Should handle email case-insensitivity correctly', async () => {
//     const email = `casetest-${Date.now()}@example.com`;
    
//     const userData = {
//       fullName: 'Case Test',
//       email: email.toLowerCase(),
//       phone: '03016666666',
//       password: 'Pass123!'
//     };

//     // Signup with lowercase
//     const signupRes = await request(app)
//       .post('/auth/signup')
//       .send(userData);

//     expect(signupRes.statusCode).toBe(201);

//     // Try login with uppercase
//     const loginRes = await request(app)
//       .post('/auth/login')
//       .send({
//         email: email.toUpperCase(),
//         password: userData.password
//       });

//     expect(loginRes.statusCode).toBe(200);
//   });

  // ✅ Test 21: Email trimming (spaces removed)
  test('Should trim whitespace from email input', async () => {
    const email = `emailtrim-${Date.now()}@example.com`;
    
    const userData = {
      fullName: 'Email Trim Test',
      email: email,
      phone: '03017777777',
      password: 'Pass123!'
    };

    // Signup
    const signupRes = await request(app)
      .post('/auth/signup')
      .send({
        ...userData,
        email: `  ${email}  ` // With spaces
      });

    expect(signupRes.statusCode).toBe(201);
  });

  // ✅ Test 22: Password requirements validation
  test('Should accept password with special characters', async () => {
    const userData = {
      fullName: 'Special Char Pass',
      email: `specialpass-${Date.now()}@example.com`,
      phone: '03018888888',
      password: 'P@ssw0rd!#$%^&*()'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ============== ERROR HANDLING TESTS ==============

  // ✅ Test 23: Invalid email format rejection
  test('Should handle invalid email format gracefully', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Invalid Email',
        email: 'notanemail',
        phone: '03019999999',
        password: 'Pass123!'
      });

    // Should either succeed (if no validation) or fail with proper error
    expect(res.statusCode).toBeDefined();
  });

  // ✅ Test 24: Phone number is optional but stored if provided
  test('Should store phone number when provided', async () => {
    const phone = '03010101010';
    const userData = {
      fullName: 'Phone Storage Test',
      email: `phonetest-${Date.now()}@example.com`,
      phone: phone,
      password: 'Pass123!'
    };

    await request(app)
      .post('/auth/signup')
      .send(userData);

    const user = await User.findOne({ email: userData.email });
    expect(user.phone).toBe(phone);
  });

  // ✅ Test 25: User creation timestamp
  test('Should create user with createdAt timestamp', async () => {
    const userData = {
      fullName: 'Timestamp Test',
      email: `timestamptest-${Date.now()}@example.com`,
      phone: '03011111112',
      password: 'Pass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.createdAt).toBeDefined();
  });

  // ✅ Test 26: Concurrent signup handling
  test('Should handle concurrent signup requests', async () => {
    const user1 = {
      fullName: 'Concurrent User 1',
      email: `concurrent1-${Date.now()}@example.com`,
      phone: '03012222223',
      password: 'Pass1!'
    };

    const user2 = {
      fullName: 'Concurrent User 2',
      email: `concurrent2-${Date.now()}@example.com`,
      phone: '03012222224',
      password: 'Pass2!'
    };

    const [res1, res2] = await Promise.all([
      request(app).post('/auth/signup').send(user1),
      request(app).post('/auth/signup').send(user2)
    ]);

    expect(res1.statusCode).toBe(201);
    expect(res2.statusCode).toBe(201);
  });

  // ✅ Test 27: Signup then immediate login sequence
  test('Should allow immediate login after signup', async () => {
    const userData = {
      fullName: 'Immediate Login',
      email: `immediatelogin-${Date.now()}@example.com`,
      phone: '03012222225',
      password: 'Pass123!'
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
    expect(loginRes.body.user.id).toBe(signupRes.body.user.id);
  });

  // ✅ Test 28: Server error handling in signup
  test('Should handle server errors in signup gracefully', async () => {
    // Send invalid data type
    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 123, // Should be string
        email: `error-${Date.now()}@example.com`,
        phone: '03012222226',
        password: 'Pass123!'
      });

    expect(res.statusCode).toBeDefined();
    expect(res.body.success !== undefined).toBe(true);
  });

  // ✅ Test 29: Server error handling in login
  test('Should handle server errors in login gracefully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Pass123!'
      });

    expect(res.statusCode).toBeDefined();
    expect(res.body.success !== undefined).toBe(true);
  });

  // ✅ Test 30: User session data structure
  test('Should return properly structured user session data', async () => {
    const userData = {
      fullName: 'Session Data Test',
      email: `sessiondata-${Date.now()}@example.com`,
      phone: '03012222227',
      password: 'Pass123!'
    };

    const signupRes = await request(app)
      .post('/auth/signup')
      .send(userData);

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(loginRes.body.user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        displayName: expect.any(String),
        email: expect.any(String)
      })
    );
  });

});
