export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.mjs'],
    moduleNameMapper: {
        '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(css|less|scss|sass)$': 'jest-transform-stub',
        '^@heroui(.*)$/': '<rootDir>/node_modules/@heroui$1',
        '^@heroicons/react(.*)$/': '<rootDir>/node_modules/@heroicons/react$1',
    },
    testMatch: ["**/tests/**/*.test.jsx"],
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },    
    transformIgnorePatterns: [
        "node_modules/(?!(@heroui|@heroicons|pdfjs-dist|react-pdf)/)"
    ],    
    extensionsToTreatAsEsm: ['.jsx'],
    moduleFileExtensions: ['js', 'jsx', 'mjs'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
};
