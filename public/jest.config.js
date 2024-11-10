// babel.config.js
module.exports = {
    testEnvironment: 'jsdom',
    presets: ['@babel/preset-env', '@babel/preset-react'],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS files
        '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js', // Mock image files
    },
  };
  