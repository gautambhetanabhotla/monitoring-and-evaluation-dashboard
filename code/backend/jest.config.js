export default {
    testEnvironment: "node",
    transform: {},
    testMatch: ["**/tests/**/*.test.js"],
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest"
    },
    testEnvironment: "node",
    extensionsToTreatAsEsm: [
        ".jsx",
        ".ts",
        ".tsx"
    ]
};
