const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // authController 테스트를 먼저 실행
    const copyTests = Array.from(tests);
    return copyTests.sort((testA, testB) => {
      if (testA.path.includes('authController')) return -1;
      if (testB.path.includes('authController')) return 1;
      if (testA.path.includes('userDao')) return -1;
      if (testB.path.includes('userDao')) return 1;
      return 0;
    });
  }
}

module.exports = CustomSequencer;
