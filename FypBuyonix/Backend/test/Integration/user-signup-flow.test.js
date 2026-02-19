const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('INTEGRATION: User Signup and Authentication Flow', () => {
  
  // ✅ Test 1: Complete signup flow
  test('Should complete user signup successfully', async () => {
    const newUser = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
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

  // ✅ Test 2: Signup with duplicate email should fail
  test('Should prevent signup with duplicate email', async () => {
    const newUser = {
      fullName: 'Jane Smith',
      email: 'duplicate@example.com',
      phone: '03009876543',
      password: 'SecurePass456!'
    };

    // First signup
    await request(app)
      .post('/auth/signup')
      .send(newUser);

    // Second signup with same email
    const res = await request(app)
      .post('/auth/signup')
      .send({
        ...newUser,
        fullName: 'Different Name'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  // ✅ Test 3: Signup validation - missing fullName
  test('Should fail signup without full name', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'noname@example.com',
        phone: '03001111111',
        password: 'SecurePass789!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 4: Signup validation - missing email
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
  });

  // ✅ Test 5: Signup validation - missing password
  test('Should fail signup without password', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Test User',
        email: 'nopass@example.com',
        phone: '03003333333'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 6: User data persistence - verify user is saved in DB
  test('Should save user data in database after signup', async () => {
    const newUser = {
      fullName: 'Database Test',
      email: 'dbtest@example.com',
      phone: '03004444444',
      password: 'TestPass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);

    // Verify user exists in database
    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.displayName).toBe(newUser.fullName);
    expect(savedUser.phone).toBe(newUser.phone);
  });

  // ✅ Test 7: Signup followed by login
  test('Should allow login after successful signup', async () => {
    const newUser = {
      fullName: 'Login Test User',
      email: 'logintest@example.com',
      phone: '03005555555',
      password: 'LoginPass123!'
    };

    // Signup
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(signupRes.statusCode).toBe(201);

    // Try to login with same credentials
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: newUser.email,
        password: newUser.password
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.user).toBeDefined();
  });

  // ✅ Test 8: Password is hashed (not stored in plain text)
  test('Should hash password in database', async () => {
    const newUser = {
      fullName: 'Hash Test User',
      email: 'hashtest@example.com',
      phone: '03006666666',
      password: 'PlainPassword123!'
    };

    await request(app)
      .post('/auth/signup')
      .send(newUser);

    // Verify password is hashed in DB
    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser.password).not.toBe(newUser.password);
    expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash starts with $2a$, $2b$ or $2y$
  });

  // ✅ Test 9: Multiple users can be created with unique emails
  test('Should create multiple users with different emails', async () => {
    const users = [
      { fullName: 'User One', email: 'user1@example.com', phone: '03007777777', password: 'Pass1!' },
      { fullName: 'User Two', email: 'user2@example.com', phone: '03008888888', password: 'Pass2!' },
      { fullName: 'User Three', email: 'user3@example.com', phone: '03009999999', password: 'Pass3!' }
    ];

    for (const user of users) {
      const res = await request(app)
        .post('/auth/signup')
        .send(user);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    }

    // Verify all users exist
    const userCount = await User.countDocuments({ email: { $in: users.map(u => u.email) } });
    expect(userCount).toBe(3);
  });

  // ✅ Test 10: User fields are returned correctly in signup response
  test('Should return correct user fields in signup response', async () => {
    const newUser = {
      fullName: 'Field Test User',
      email: 'fieldtest@example.com',
      phone: '03001010101',
      password: 'FieldPass123!'
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(newUser.email);
    expect(res.body.user.displayName).toBe(newUser.fullName);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.password).toBeUndefined(); // Password should not be in response
  });

});
