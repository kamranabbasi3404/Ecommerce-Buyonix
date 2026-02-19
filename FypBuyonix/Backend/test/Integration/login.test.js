const request = require('supertest');
const app = require('../../server'); // adjust if your file name is index.js or app.js

describe('LOGIN API TESTING', () => {

  // ❌ Test wrong login information
  test('Should return error for invalid email or password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: "wrong@gmail.com",
        password: "incorrect123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password");
  });


  // ✔ Test correct login (user must exist in your database)
  test('Should login successfully with correct details', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: "hadi1@gmail.com",    // must be a real user in your DB
        password: "Hadi.221780"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });


 
});
