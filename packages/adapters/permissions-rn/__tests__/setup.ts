// Mock react-native before any imports
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

// Mock react-native-permissions before any imports
jest.mock('react-native-permissions', () => {
  const mockCheck = jest.fn();
  const mockRequest = jest.fn();
  const mockOpenSettings = jest.fn();

  return {
    check: mockCheck,
    request: mockRequest,
    openSettings: mockOpenSettings,
    PERMISSIONS: {
      IOS: {
        CAMERA: 'ios.permission.CAMERA',
        PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
        LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
        REMINDERS: 'ios.permission.REMINDERS',
        MICROPHONE: 'ios.permission.MICROPHONE',
        FACE_ID: 'ios.permission.FACE_ID',
      },
      ANDROID: {
        CAMERA: 'android.permission.CAMERA',
        READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      },
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      BLOCKED: 'blocked',
      UNAVAILABLE: 'unavailable',
      LIMITED: 'limited',
    },
  };
});

