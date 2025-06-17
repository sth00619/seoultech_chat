module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'server//*.js',
      '!server//node_modules/',
      '!server//tests/'
    ],
    testMatch: [
      '/server//tests//.test.js',
      '/server//.test.js'
    ],
    moduleDirectories: ['node_modules', 'server'],
    verbose: true,
    testTimeout: 10000
  };