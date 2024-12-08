module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use Babel to transpile files
  },
  moduleNameMapper: {
    "^@/context/(.*)$": "<rootDir>/src/context/$1", // Resolve context alias
    "^@/components/(.*)$": "<rootDir>/src/components/$1", // Resolve components alias
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1", // Resolve hooks alias
    "^@/share/(.*)$": "<rootDir>/src/share/$1", // Resolve share alias
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS/SCSS modules
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-icons)/)", // Transform specific modules if needed
  ],
};


