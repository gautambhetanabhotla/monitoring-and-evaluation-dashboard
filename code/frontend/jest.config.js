export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.mjs'],
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
    }
};
