require('dotenv').config({ path: '.env' });

module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["Login.test.js"],
  collectCoverageFrom: [
    "models/**/*.js",
    "routes/**/*.js",
    "!node_modules/**"
  ],
  testTimeout: 30000
}
