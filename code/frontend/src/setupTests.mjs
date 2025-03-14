import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';
import React from 'react';

// Add TextEncoder and TextDecoder to the global scope
// These are required by some dependencies but not available in the Jest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
