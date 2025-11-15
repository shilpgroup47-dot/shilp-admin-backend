// Jest setup file
// This file runs before each test file

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test_shilpadmin';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';

// Increase test timeout for async operations
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };