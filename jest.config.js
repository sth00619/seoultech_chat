module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/server/src/setupTests.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'server/**/*.js',
      '!server/**/node_modules/**',
      '!server/**/__tests__/**'
    ],
    testMatch: [
      '**/server/**/__tests__/**/*.test.js',
      '**/server/**/*.test.js'
    ],
    moduleDirectories: ['node_modules', 'server'],
    verbose: true,
    testTimeout: 10000
  };