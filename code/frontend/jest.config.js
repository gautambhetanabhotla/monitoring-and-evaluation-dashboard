export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.mjs'],
    moduleNameMapper: {
        '/\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        "/^@heroui(.*)$/": "<rootDir>/node_modules/@heroui$1",
        "/^@heroicons/react(.*)$/": "<rootDir>/node_modules/@heroicons/react$1",
        // "^react-chartjs-2": "<rootDir>/node_modules/react-chartjs-2",
    },
    testMatch: ["**/tests/**/*.test.jsx"],
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
        'node_modules/(?!(react|react-dom|@heroui|@heroicons)/)': 'babel-jest',
    },
    transformIgnorePatterns: [
        "node_modules/(?!(@heroui|@heroicons)/)"
    ],
    extensionsToTreatAsEsm: ['.jsx'],
    moduleFileExtensions: ['js', 'jsx', 'mjs'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
};
