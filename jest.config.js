module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  transform: {},
  moduleFileExtensions: ['js', 'json', 'node'],
  // Fix for Node.js 22+ compatibility
  testEnvironmentOptions: {
    NODE_OPTIONS: '--no-experimental-fetch'
  }
};

