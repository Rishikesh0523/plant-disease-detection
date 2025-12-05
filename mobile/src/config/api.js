// API Configuration
// Update this based on your testing environment

// CHANGE THIS BASED ON YOUR SETUP:
// - 'emulator': For Android Emulator
// - 'physical': For Physical Device or Expo Go
// - 'simulator': For iOS Simulator
const DEVICE_TYPE = 'physical'; // <<< CHANGE THIS

const API_URLS = {
  emulator: 'http://10.0.2.2:8000',      // Android Emulator
  simulator: 'http://localhost:8000',     // iOS Simulator
  physical: 'http://192.168.1.4:8000',   // Physical Device (your computer's IP)
};

export const API_BASE_URL = API_URLS[DEVICE_TYPE];
