import {jest} from '@jest/globals';

// Mocked messenger object
global.messenger = {
    // Methods/properties to mock
    messages: { 
        move: jest.fn()
    },
    folders: {
        create: jest.fn(),
        getSubFolders: jest.fn()
    }
  };