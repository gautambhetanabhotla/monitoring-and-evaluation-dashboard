export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    moduleNameMapper: {
        '/\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    testMatch: ["**/tests/**/*.test.jsx"],
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },
    extensionsToTreatAsEsm: ['.jsx'],
    moduleFileExtensions: ['js', 'jsx', 'mjs'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/',
    ],
};
