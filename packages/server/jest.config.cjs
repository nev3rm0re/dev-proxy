/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    extensionsToTreatAsEsm: ['.ts' ],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
        }]
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(strip-ansi|string-width|chalk|ansi-regex)/)'
    ]
};