export default {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
};
