module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom', // Ensure we use JSDOM for React testing
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], // Setup file for extending jest-dom matchers
    transform: {
      '^.+\\.tsx?$': 'ts-jest',      // Transform TS/TSX files using ts-jest
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'], // Handle js, jsx, ts, tsx extensions
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'], // Ignore node_modules and dist
    moduleNameMapper: {
      '\\.(css|less)$': 'identity-obj-proxy', // Mock CSS imports
      '^@/(.*)$': '<rootDir>/src/$1', // Resolve @ to src/
    },
  };
  