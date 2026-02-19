const mongoose = require("mongoose");

let isConnected = false;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/fyp_test';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      isConnected = true;
    } catch (error) {
      console.error('MongoDB Connection Error in setup:', error.message);
      throw error;
    }
  }
}, 30000);

beforeEach(async () => {
  if (isConnected) {
    // Clean all collections before every test
    try {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    } catch (error) {
      console.error('Error cleaning collections:', error.message);
    }
  }
});

afterAll(async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      isConnected = false;
    } catch (error) {
      console.error('Error in afterAll:', error.message);
    }
  }
}, 30000);
