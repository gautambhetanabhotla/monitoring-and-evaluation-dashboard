import globals from 'globals';
import pluginJs from '@eslint/js';
import jest from 'eslint-plugin-jest';

// Create a fixed copy of browser globals
const fixedBrowserGlobals = { ...globals.browser };

// Remove the entry with trailing whitespace
if ('AudioWorkletGlobalScope ' in fixedBrowserGlobals) {
    // Copy the value before deleting
    const value = fixedBrowserGlobals['AudioWorkletGlobalScope '];
    delete fixedBrowserGlobals['AudioWorkletGlobalScope '];
    // Add back with correct name (no trailing space)
    fixedBrowserGlobals['AudioWorkletGlobalScope'] = value;
}

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...fixedBrowserGlobals,
                ...globals.jest,
            },
        },
        plugins: {
            jest: jest,
        },
    },
    pluginJs.configs.recommended,
    {
        files: ['**/*.test.{js,jsx}'], // Add this block to apply Jest plugin to test files
        plugins: {
            jest: jest,
        },
        env: {
            'jest/globals': true,
        },
        rules: {
            ...jest.configs.recommended.rules,
        },
    },
];
