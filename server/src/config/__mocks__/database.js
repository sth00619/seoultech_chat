// Mock database pool
const mockPool = {
    query: jest.fn(),
    execute: jest.fn(),
    end: jest.fn(),
    getConnection: jest.fn()
  };
  
  module.exports = mockPool;