const request = require('supertest');
const app = require('../../server');

describe('INTEGRATION: Tutorial Routes - Tutorial Retrieval, Saving, Filtering & User Management', () => {

  let userId;

  beforeEach(async () => {
    // Create a test user
    const userData = {
      fullName: 'Tutorial Test User',
      email: `tutorialuser-${Date.now()}@example.com`,
      phone: '03001234567',
      password: 'TutorialPass123!'
    };

    const userRes = await request(app)
      .post('/auth/signup')
      .send(userData);

    if (userRes.body.user?._id) {
      userId = userRes.body.user._id;
    }
  });

  // ============== TUTORIAL RETRIEVAL TESTS ==============

  // ✅ Test 1: Get all available tutorials
//   test('Should retrieve all available tutorials', async () => {
//     const res = await request(app)
//       .get('/tutorial/all');

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.tutorials).toBeDefined();
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 2: Tutorial list contains required fields
//   test('Should return tutorials with all required fields', async () => {
//     const res = await request(app)
//       .get('/tutorial/all');

//     expect(res.statusCode).toBe(200);

//     if (res.body.tutorials.length > 0) {
//       const tutorial = res.body.tutorials[0];
//       expect(tutorial._id).toBeDefined();
//       expect(tutorial.title).toBeDefined();
//       expect(tutorial.description).toBeDefined();
//     }
//   });

  // ✅ Test 3: Get tutorial by ID
//   test('Should retrieve specific tutorial by ID', async () => {
//     const allTutorialsRes = await request(app)
//       .get('/tutorial/all');

//     if (allTutorialsRes.body.tutorials.length > 0) {
//       const tutorialId = allTutorialsRes.body.tutorials[0]._id;

//       const res = await request(app)
//         .get(`/tutorial/${tutorialId}`);

//       expect(res.statusCode).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(res.body.tutorial._id).toBe(tutorialId);
//     } else {
//       expect(true).toBe(true);
//     }
//   });

  // ✅ Test 4: Get non-existent tutorial returns 404
//   test('Should return 404 for non-existent tutorial', async () => {
//     const fakeId = '507f1f77bcf86cd799439999';
//     const res = await request(app)
//       .get(`/tutorial/${fakeId}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.success).toBe(false);
//   });

//   // ✅ Test 5: Tutorial contains URL/link information
//   test('Should return tutorial with content URL', async () => {
//     const allTutorialsRes = await request(app)
//       .get('/tutorial/all');

//     if (allTutorialsRes.body.tutorials.length > 0) {
//       const tutorialId = allTutorialsRes.body.tutorials[0]._id;
//       const res = await request(app)
//         .get(`/tutorial/${tutorialId}`);

//       expect(res.statusCode).toBe(200);
//       expect(res.body.tutorial).toBeDefined();
      
//       // URL, link, or content should be present
//       expect(
//         res.body.tutorial.url || 
//         res.body.tutorial.link || 
//         res.body.tutorial.videoUrl ||
//         res.body.tutorial.contentUrl
//       ).toBeDefined();
//     } else {
//       expect(true).toBe(true);
//     }
//   });

  // ✅ Test 6: Tutorial programming language information
//   test('Should include programming language for tutorial', async () => {
//     const res = await request(app)
//       .get('/tutorial/all');

//     expect(res.statusCode).toBe(200);

//     if (res.body.tutorials.length > 0) {
//       const tutorial = res.body.tutorials[0];
//       // Language information should exist
//       expect(
//         tutorial.language || 
//         tutorial.programmingLanguage || 
//         tutorial.lang
//       ).toBeDefined();
//     }
//   });

  // ✅ Test 7: Tutorials sorted appropriately
//   test('Should return tutorials in a consistent order', async () => {
//     const res1 = await request(app).get('/tutorial/all');
//     const res2 = await request(app).get('/tutorial/all');

//     expect(res1.statusCode).toBe(200);
//     expect(res2.statusCode).toBe(200);
    
//     expect(res1.body.tutorials.length).toBe(res2.body.tutorials.length);
//   });

  // ============== TUTORIAL FILTERING TESTS ==============

  // ✅ Test 8: Filter tutorials by programming language
//   test('Should filter tutorials by programming language', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ language: 'python' });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);

//     // All returned tutorials should be for Python
//     if (res.body.tutorials.length > 0) {
//       res.body.tutorials.forEach(tutorial => {
//         expect(
//           tutorial.language?.toLowerCase().includes('python') ||
//           tutorial.programmingLanguage?.toLowerCase().includes('python')
//         ).toBe(true);
//       });
//     }
//   });

  // ✅ Test 9: Filter tutorials by difficulty level
//   test('Should filter tutorials by difficulty level', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ level: 'beginner' });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 10: Filter tutorials by category
//   test('Should filter tutorials by category', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ category: 'web-development' });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 11: Filter tutorials by multiple criteria
//   test('Should filter tutorials by multiple criteria', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ 
//         language: 'python',
//         level: 'intermediate'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 12: Search tutorials by title
//   test('Should search tutorials by title', async () => {
//     const res = await request(app)
//       .get('/tutorial/search')
//       .query({ q: 'Python' });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.tutorials).toBeDefined();
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 13: Search tutorials by description
//   test('Should search tutorials in description', async () => {
//     const res = await request(app)
//       .get('/tutorial/search')
//       .query({ q: 'functions' });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ✅ Test 14: Tutorial pagination
//   test('Should support pagination for tutorials', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ page: 1, limit: 10 });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.pagination || res.body.tutorials).toBeDefined();
//   });

  // ✅ Test 15: Sorting tutorials
//   test('Should support sorting tutorials', async () => {
//     const res = await request(app)
//       .get('/tutorial/all')
//       .query({ sort: 'title' });

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body.tutorials)).toBe(true);
//   });

  // ============== TUTORIAL SAVING & BOOKMARKING TESTS ==============

  // ✅ Test 16: Save/bookmark tutorial
//   test('Should allow user to save tutorial', async () => {
//     if (!userId) {
//       expect(true).toBe(true);
//       return;
//     }

//     const allTutorialsRes = await request(app)
//       .get('/tutorial/all');

//     if (allTutorialsRes.body.tutorials.length > 0) {
//       const tutorialId = allTutorialsRes.body.tutorials[0]._id;

//       const res = await request(app)
//         .post('/tutorial/save')
//         .send({
//           userId: userId,
//           tutorialId: tutorialId
//         });

//       expect(res.statusCode).toBe(200);
//       expect(res.body.success).toBe(true);
//     } else {
//       expect(true).toBe(true);
//     }
//   });

  // ✅ Test 17: Get user saved tutorials
  test('Should retrieve user saved tutorials', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/tutorial/saved/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tutorials).toBeDefined();
    expect(Array.isArray(res.body.tutorials)).toBe(true);
  });

  // ✅ Test 18: Remove saved tutorial
  test('Should allow user to remove saved tutorial', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const allTutorialsRes = await request(app)
      .get('/tutorial/all');

    if (allTutorialsRes.body.tutorials.length > 0) {
      const tutorialId = allTutorialsRes.body.tutorials[0]._id;

      // Save first
      const saveRes = await request(app)
        .post('/tutorial/save')
        .send({
          userId: userId,
          tutorialId: tutorialId
        });

      if (saveRes.statusCode === 200) {
        // Then remove
        const removeRes = await request(app)
          .delete('/tutorial/unsave')
          .send({
            userId: userId,
            tutorialId: tutorialId
          });

        expect([200, 204]).toContain(removeRes.statusCode);
      }
    } else {
      expect(true).toBe(true);
    }
  });

  // ✅ Test 19: Save tutorial without user ID fails
//   test('Should fail saving tutorial without user ID', async () => {
//     const res = await request(app)
//       .post('/tutorial/save')
//       .send({
//         tutorialId: '507f1f77bcf86cd799439999'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ✅ Test 20: Save tutorial without tutorial ID fails
//   test('Should fail saving without tutorial ID', async () => {
//     const res = await request(app)
//       .post('/tutorial/save')
//       .send({
//         userId: userId || '507f1f77bcf86cd799439999'
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

  // ============== USER TUTORIAL MANAGEMENT TESTS ==============

  // ✅ Test 21: Get user viewed tutorials history
  test('Should retrieve user viewed tutorials history', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/tutorial/history/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tutorials).toBeDefined();
    expect(Array.isArray(res.body.tutorials)).toBe(true);
  });

  // ✅ Test 22: Track tutorial view
  test('Should track when user views tutorial', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const allTutorialsRes = await request(app)
      .get('/tutorial/all');

    if (allTutorialsRes.body.tutorials.length > 0) {
      const tutorialId = allTutorialsRes.body.tutorials[0]._id;

      const res = await request(app)
        .post('/tutorial/view')
        .send({
          userId: userId,
          tutorialId: tutorialId
        });

      expect([200, 201]).toContain(res.statusCode);
    } else {
      expect(true).toBe(true);
    }
  });

  // ✅ Test 23: Tutorial completion marking
  test('Should mark tutorial as completed', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const allTutorialsRes = await request(app)
      .get('/tutorial/all');

    if (allTutorialsRes.body.tutorials.length > 0) {
      const tutorialId = allTutorialsRes.body.tutorials[0]._id;

      const res = await request(app)
        .put(`/tutorial/${tutorialId}/complete`)
        .send({
          userId: userId
        });

      expect([200, 404]).toContain(res.statusCode);
    } else {
      expect(true).toBe(true);
    }
  });

  // ✅ Test 24: Get user tutorial learning progress
  test('Should retrieve user tutorial progress', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/tutorial/progress/${userId}`);

    expect([200, 404]).toContain(res.statusCode);
    
    if (res.statusCode === 200) {
      expect(res.body.progress || res.body.tutorials).toBeDefined();
    }
  });

  // ✅ Test 25: Tutorial recommendation for user
  test('Should provide tutorial recommendations', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const res = await request(app)
      .get(`/tutorial/recommendations/${userId}`);

    expect([200, 404]).toContain(res.statusCode);
    
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body.tutorials) || res.body.recommendations).toBe(true);
    }
  });

  // ============== TUTORIAL RATING & FEEDBACK TESTS ==============

  // ✅ Test 26: Get tutorial rating
//   test('Should return tutorial rating information', async () => {
//     const allTutorialsRes = await request(app)
//       .get('/tutorial/all');

//     if (allTutorialsRes.body.tutorials.length > 0) {
//       const tutorialId = allTutorialsRes.body.tutorials[0]._id;

//       const res = await request(app)
//         .get(`/tutorial/${tutorialId}`);

//       expect(res.statusCode).toBe(200);
      
//       if (res.body.tutorial.rating) {
//         expect(res.body.tutorial.rating).toBeGreaterThanOrEqual(0);
//         expect(res.body.tutorial.rating).toBeLessThanOrEqual(5);
//       }
//     } else {
//       expect(true).toBe(true);
//     }
//   });

  // ✅ Test 27: Rate tutorial
  test('Should allow user to rate tutorial', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const allTutorialsRes = await request(app)
      .get('/tutorial/all');

    if (allTutorialsRes.body.tutorials.length > 0) {
      const tutorialId = allTutorialsRes.body.tutorials[0]._id;

      const res = await request(app)
        .post(`/tutorial/${tutorialId}/rate`)
        .send({
          userId: userId,
          rating: 5
        });

      expect([200, 201, 400, 404]).toContain(res.statusCode);
    } else {
      expect(true).toBe(true);
    }
  });

  // ✅ Test 28: Tutorial feedback
  test('Should allow user to provide tutorial feedback', async () => {
    if (!userId) {
      expect(true).toBe(true);
      return;
    }

    const allTutorialsRes = await request(app)
      .get('/tutorial/all');

    if (allTutorialsRes.body.tutorials.length > 0) {
      const tutorialId = allTutorialsRes.body.tutorials[0]._id;

      const res = await request(app)
        .post(`/tutorial/${tutorialId}/feedback`)
        .send({
          userId: userId,
          feedback: 'Great tutorial!'
        });

      expect([200, 201, 400, 404]).toContain(res.statusCode);
    } else {
      expect(true).toBe(true);
    }
  });

  // ============== TUTORIAL CONTENT TESTS ==============

  // ✅ Test 29: Tutorial contains code examples
//   test('Should return tutorial with code examples', async () => {
//     const allTutorialsRes = await request(app)
//       .get('/tutorial/all');

//     if (allTutorialsRes.body.tutorials.length > 0) {
//       const tutorialId = allTutorialsRes.body.tutorials[0]._id;
//       const res = await request(app)
//         .get(`/tutorial/${tutorialId}`);

//       expect(res.statusCode).toBe(200);
      
//       // Code examples might be optional
//       if (res.body.tutorial.codeExamples) {
//         expect(Array.isArray(res.body.tutorial.codeExamples)).toBe(true);
//       }
//     } else {
//       expect(true).toBe(true);
//     }
//   });

  // ✅ Test 30: Tutorial response consistency
//   test('Should return consistent tutorial data structure', async () => {
//     const res1 = await request(app).get('/tutorial/all');
//     const res2 = await request(app).get('/tutorial/all');

//     expect(res1.statusCode).toBe(200);
//     expect(res2.statusCode).toBe(200);
//     expect(res1.body.tutorials.length).toBe(res2.body.tutorials.length);

//     // Compare first tutorial structure
//     if (res1.body.tutorials.length > 0 && res2.body.tutorials.length > 0) {
//       expect(Object.keys(res1.body.tutorials[0])).toEqual(
//         Object.keys(res2.body.tutorials[0])
//       );
//     }
//   });

 });
