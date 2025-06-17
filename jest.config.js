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
  testTimeout: 10000,
  // Babel 변환 설정 추가
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // JSX 파일 확장자 인식
  moduleFileExtensions: ['js', 'jsx', 'json'],
  // React 테스트 환경 설정
  testEnvironment: 'jsdom',
  // 모듈 이름 매핑 (필요시)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};