const request = require('supertest');
const app = require('../../server');
const Seller = require('../../models/seller');
const User = require('../../models/User');

describe('INTEGRATION: Seller Registration and Approval Flow', () => {

  // ✅ Test 1: Complete seller registration
  test('Should register seller with all required fields', async () => {
    const sellerData = {
      fullName: 'Ahmed Khan',
      email: 'ahmed.seller@example.com',
      phone: '03101234567',
      password: 'SellerPass123!',
      businessName: 'Ahmed Tech Solutions',
      businessType: 'Retail',
      storeName: 'Ahmed Electronics Store',
      storeDescription: 'Premium electronics and gadgets',
      primaryCategory: 'Electronics',
      accountHolderName: 'Ahmed Khan',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-1',
      taxNumber: 'TAX123456'
    };

    const res = await request(app)
      .post('/seller/register')
      .send(sellerData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.seller).toBeDefined();
    expect(res.body.seller.email).toBe(sellerData.email);
    expect(res.body.seller.storeName).toBe(sellerData.storeName);
  });

  // ✅ Test 2: Seller registration with duplicate email should fail
  test('Should prevent seller registration with duplicate email', async () => {
    const sellerData = {
      fullName: 'Duplicate Seller',
      email: 'duplicate.seller@example.com',
      phone: '03102222222',
      password: 'Pass123!',
      businessName: 'First Business',
      businessType: 'Wholesale',
      storeName: 'First Store',
      storeDescription: 'First store description',
      primaryCategory: 'Electronics',
      accountHolderName: 'Duplicate Seller',
      bankName: 'UBL',
      accountNumber: '1234567890',
      iban: 'PK36UBLACC1234567890',
      cnicNumber: '12345-1234567-2',
      taxNumber: 'TAX123457'
    };

    // First registration
    await request(app)
      .post('/seller/register')
      .send(sellerData);

    // Second registration with same email
    const res = await request(app)
      .post('/seller/register')
      .send({
        ...sellerData,
        email: 'duplicate.seller@example.com',
        storeName: 'Second Store'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 3: Seller registration with duplicate store name should fail
  test('Should prevent seller registration with duplicate store name', async () => {
    const sellerData = {
      fullName: 'Store Name Test',
      email: 'storetest1@example.com',
      phone: '03103333333',
      password: 'Pass123!',
      businessName: 'Test Business',
      businessType: 'Retail',
      storeName: 'Unique Store Name',
      storeDescription: 'Store test description',
      primaryCategory: 'Electronics',
      accountHolderName: 'Store Name Test',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-3',
      taxNumber: 'TAX123458'
    };

    // First registration
    await request(app)
      .post('/seller/register')
      .send(sellerData);

    // Second registration with same store name
    const res = await request(app)
      .post('/seller/register')
      .send({
        ...sellerData,
        email: 'storetest2@example.com',
        fullName: 'Different Name'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 4: Seller registration validation - missing storeName
  test('Should fail seller registration without store name', async () => {
    const res = await request(app)
      .post('/seller/register')
      .send({
        fullName: 'No Store Name',
        email: 'nostorename@example.com',
        phone: '03104444444',
        password: 'Pass123!',
        businessName: 'Test Business',
        businessType: 'Retail',
        storeDescription: 'Test description',
        primaryCategory: 'Electronics',
        accountHolderName: 'No Store Name',
        bankName: 'HBL',
        accountNumber: '1234567890',
        iban: 'PK36HBLACC1234567890',
        cnicNumber: '12345-1234567-4',
        taxNumber: 'TAX123459'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 5: Seller registration validation - missing businessName
  test('Should fail seller registration without business name', async () => {
    const res = await request(app)
      .post('/seller/register')
      .send({
        fullName: 'No Business Name',
        email: 'nobusiness@example.com',
        phone: '03105555555',
        password: 'Pass123!',
        businessType: 'Retail',
        storeName: 'Some Store',
        storeDescription: 'Test description',
        primaryCategory: 'Electronics',
        accountHolderName: 'No Business Name',
        bankName: 'HBL',
        accountNumber: '1234567890',
        iban: 'PK36HBLACC1234567890',
        cnicNumber: '12345-1234567-5',
        taxNumber: 'TAX123460'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 6: Seller registration validation - missing category
  test('Should fail seller registration without category', async () => {
    const res = await request(app)
      .post('/seller/register')
      .send({
        fullName: 'No Category',
        email: 'nocategory@example.com',
        phone: '03106666666',
        password: 'Pass123!',
        businessName: 'Some Business',
        businessType: 'Retail',
        storeName: 'Some Store',
        storeDescription: 'Test description',
        accountHolderName: 'No Category',
        bankName: 'HBL',
        accountNumber: '1234567890',
        iban: 'PK36HBLACC1234567890',
        cnicNumber: '12345-1234567-6',
        taxNumber: 'TAX123461'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 7: Seller data persistence in database
  test('Should save seller data in database', async () => {
    const sellerData = {
      fullName: 'DB Seller Test',
      email: 'dbseller@example.com',
      phone: '03107777777',
      password: 'Pass123!',
      businessName: 'DB Test Business',
      businessType: 'Retail',
      storeName: 'DB Test Store',
      storeDescription: 'Database test description',
      primaryCategory: 'Fashion',
      accountHolderName: 'DB Seller Test',
      bankName: 'UBL',
      accountNumber: '1234567890',
      iban: 'PK36UBLACC1234567890',
      cnicNumber: '12345-1234567-7',
      taxNumber: 'TAX123462'
    };

    const res = await request(app)
      .post('/seller/register')
      .send(sellerData);

    expect(res.statusCode).toBe(201);

    // Verify seller in database
    const savedSeller = await Seller.findOne({ email: sellerData.email });
    expect(savedSeller).toBeDefined();
    expect(savedSeller.storeName).toBe(sellerData.storeName);
    expect(savedSeller.businessName).toBe(sellerData.businessName);
  });

  // ✅ Test 8: Seller status should be 'pending' after registration
  test('Should have pending status after registration', async () => {
    const sellerData = {
      fullName: 'Pending Status Test',
      email: 'pendingstatus@example.com',
      phone: '03108888888',
      password: 'Pass123!',
      businessName: 'Pending Business',
      businessType: 'Retail',
      storeName: 'Pending Store',
      storeDescription: 'Pending store description',
      primaryCategory: 'Electronics',
      accountHolderName: 'Pending Status Test',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-8',
      taxNumber: 'TAX123463'
    };

    const res = await request(app)
      .post('/seller/register')
      .send(sellerData);

    expect(res.statusCode).toBe(201);
    expect(res.body.seller.status).toBe('pending');

    // Verify in database
    const savedSeller = await Seller.findOne({ email: sellerData.email });
    expect(savedSeller.status).toBe('pending');
  });

  // ✅ Test 9: Multiple sellers with different emails can register
  test('Should register multiple sellers with unique emails', async () => {
    // Build seller objects and ensure emails are unique per test run
    const suffix = Date.now();
    const sellers = [
      { fullName: 'Seller A', phone: '03109999999', password: 'Pass1!', businessName: 'Business A', businessType: 'Retail', storeName: 'Store A', storeDescription: 'Store A description', primaryCategory: 'Electronics', accountHolderName: 'Seller A', bankName: 'HBL', accountNumber: '1234567890', iban: 'PK36HBLACC1234567890', cnicNumber: '12345-1234567-9', taxNumber: 'TAX123464' },
      { fullName: 'Seller B', phone: '03100000000', password: 'Pass2!', businessName: 'Business B', businessType: 'Wholesale', storeName: 'Store B', storeDescription: 'Store B description', primaryCategory: 'Fashion', accountHolderName: 'Seller B', bankName: 'UBL', accountNumber: '1234567890', iban: 'PK36UBLACC1234567890', cnicNumber: '12345-1234567-10', taxNumber: 'TAX123465' },
      { fullName: 'Seller C', phone: '03101111112', password: 'Pass3!', businessName: 'Business C', businessType: 'Retail', storeName: 'Store C', storeDescription: 'Store C description', primaryCategory: 'Home', accountHolderName: 'Seller C', bankName: 'HBL', accountNumber: '1234567890', iban: 'PK36HBLACC1234567890', cnicNumber: '12345-1234567-11', taxNumber: 'TAX123466' }
    ].map((s, i) => ({
      // assign a unique email per seller using the test run suffix and index
      ...s,
      email: `${s.fullName.toLowerCase().replace(/\s+/g, '')}-${suffix}-${i}@example.com`
    }));

    for (const seller of sellers) {
      const res = await request(app)
        .post('/seller/register')
        .send(seller);

      // If registration fails, include the response body to make debugging easier
      if (res.statusCode !== 201) {
        // attach body so that test failure message includes server validation details
        throw new Error(`Expected 201 on seller register but got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    }

    // Verify all sellers exist in DB by the unique emails we generated
    const sellerCount = await Seller.countDocuments({ email: { $in: sellers.map(s => s.email) } });
    expect(sellerCount).toBe(3);
  });

  // ✅ Test 10: Seller password is hashed
  test('Should hash seller password in database', async () => {
    const sellerData = {
      fullName: 'Hash Test Seller',
      email: 'hashseller@example.com',
      phone: '03102222221',
      password: 'PlainPassword123!',
      businessName: 'Hash Test Business',
      businessType: 'Retail',
      storeName: 'Hash Test Store',
      storeDescription: 'Hash test description',
      primaryCategory: 'Electronics',
      accountHolderName: 'Hash Test Seller',
      bankName: 'HBL',
      accountNumber: '1234567890',
      iban: 'PK36HBLACC1234567890',
      cnicNumber: '12345-1234567-12',
      taxNumber: 'TAX123467'
    };

    await request(app)
      .post('/seller/register')
      .send(sellerData);

    const savedSeller = await Seller.findOne({ email: sellerData.email });
    expect(savedSeller.password).not.toBe(sellerData.password);
    expect(savedSeller.password).toMatch(/^\$2[aby]\$/);
  });

  // ✅ Test 11: Seller fields in response
//   test('Should return correct fields in seller registration response', async () => {
//     const sellerData = {
//       fullName: 'Field Test Seller',
//       email: 'fieldsseller@example.com',
//       phone: '03103333321',
//       password: 'Pass123!',
//       businessName: 'Field Business',
//       businessType: 'Retail',
//       storeName: 'Field Store',
//       storeDescription: 'Field store description',
//       primaryCategory: 'Electronics',
//       accountHolderName: 'Field Test Seller',
//       bankName: 'HBL',
//       accountNumber: '1234567890',
//       iban: 'PK36HBLACC1234567890',
//       cnicNumber: '12345-1234567-13',
//       taxNumber: 'TAX123468'
//     };

//     const res = await request(app)
//       .post('/seller/register')
//       .send(sellerData);

//     expect(res.statusCode).any(201);
//     expect(res.body.seller.id).toBeDefined();
//     expect(res.body.seller.email).toBe(sellerData.email);
//     expect(res.body.seller.storeName).toBe(sellerData.storeName);
//     expect(res.body.seller.status).toBe('pending');
//     expect(res.body.seller.password).toBeUndefined(); // Should not return password
//   });

  // ✅ Test 12: Seller can have initial ratings
  test('Should initialize seller with zero ratings', async () => {
    const sellerData = {
      fullName: 'Rating Test Seller',
      email: 'ratingseller@example.com',
      phone: '03104444321',
      password: 'Pass123!',
      businessName: 'Rating Business',
      businessType: 'Retail',
      storeName: 'Rating Store',
      storeDescription: 'Rating store description',
      primaryCategory: 'Electronics',
      accountHolderName: 'Rating Test Seller',
      bankName: 'UBL',
      accountNumber: '1234567890',
      iban: 'PK36UBLACC1234567890',
      cnicNumber: '12345-1234567-14',
      taxNumber: 'TAX123469'
    };

    await request(app)
      .post('/seller/register')
      .send(sellerData);

    const savedSeller = await Seller.findOne({ email: sellerData.email });
    expect(savedSeller.ratings).any();
    expect(savedSeller.ratings.totalReviews).toBe(0);
    expect(savedSeller.ratings.averageRating).toBe(0);
  });

});
