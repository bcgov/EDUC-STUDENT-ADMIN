const esModules = ['vue-pdf-app', 'v-viewer', 'viewerjs', 'vue-resize-sensor', 'vue-loading-spinner'].join('|');

module.exports = {
  reporters: [
    'default',
    'jest-junit'
  ],
  clearMocks: true,
  setupFiles: [
    '<rootDir>/node_modules/regenerator-runtime/runtime.js',
    '<rootDir>/tests/unit/setup.js'
  ],
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
    'jsx'
  ],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(${esModules}))`],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/plugins/*.*',
    '!src/router.js'
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  testEnvironment: 'jsdom',
};
