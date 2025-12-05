# Plant Disease Detection Mobile App

A modern, professional React Native mobile application powered by Expo SDK 54 for detecting plant diseases using AI. Works seamlessly on both iOS and Android devices.

![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76.3-61dafb)
![License](https://img.shields.io/badge/License-Educational-green)

## 🌟 Features

- **📸 Camera Integration**: Capture plant images directly from your device
- **🖼️ Gallery Support**: Upload existing plant photos
- **🤖 Dual AI Models**: Choose between EfficientNetB0 and ResNet50
- **🎯 34 Disease Classes**: Detect diseases across 9 plant types
- **📊 Confidence Scores**: View prediction accuracy with visual progress bars
- **💊 Smart Recommendations**: Get treatment suggestions for detected diseases
- **📱 Cross-Platform**: Works on iOS and Android
- **🎨 Modern UI**: Clean, professional design with gradients and animations
- **⚡ Real-time Status**: Server connectivity indicator
- **🔄 Error Handling**: Comprehensive error messages and retry options

## 📱 Supported Plants & Diseases

### 34 Disease Classes Across 9 Plants:
- **Apple** (4): Healthy, Rot, Rust, Scab
- **Banana** (3): Healthy, Panama Disease, Sigatoka
- **Corn** (4): Healthy, Leaf Blight, Gray Spot, Rust
- **Pepper Bell** (2): Healthy, Bacterial Spot
- **Potato** (3): Healthy, Early Blight, Late Blight
- **Rice** (4): Healthy, Leaf Blast, Leaf Blight, Brown Spot
- **Strawberry** (2): Healthy, Leaf Scorch
- **Tea** (4): Healthy, Algal Spot, Brown Blight, Red Leaf Spot
- **Tomato** (8): Healthy, Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Mosaic Virus, Septoria Leaf Spot, Target Spot

## 🏗️ Project Structure

```
mobile/
├── App.js                        # Main app entry with navigation
├── package.json                  # SDK 54 dependencies
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js        # Main screen (camera/gallery/model selection)
│   │   └── ResultScreen.js      # Results display with predictions
│   ├── services/
│   │   └── api.js               # API client for backend communication
│   └── config/
│       └── api.js               # API endpoint configuration
└── assets/                       # App icons and images
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Expo Go** app installed on your mobile device (SDK 54)
- **Backend server** running (FastAPI)
- **Same Wi-Fi network** for phone and computer

### Installation

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   - Open `src/config/api.js`
   - Find your computer's IP address:
     - **Windows**: Run `ipconfig` in Command Prompt, look for IPv4 Address
     - **macOS/Linux**: Run `ifconfig` in Terminal, look for inet address
   - Update the API_BASE_URL:
     ```javascript
     // For physical device (recommended)
     export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000';
     
     // For Android Emulator
     export const API_BASE_URL = 'http://10.0.2.2:8000';
     
     // For iOS Simulator  
     export const API_BASE_URL = 'http://localhost:8000';
     ```

4. **Start the Expo development server**:
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

5. **Run on your device**:
   - Open **Expo Go** app on your phone (must be SDK 54)
   - Scan the QR code displayed in the terminal
   - Wait for the app to load

## 📖 Usage Guide

### Step 1: Check Server Status
- Green dot = Backend server is online and ready
- Red dot = Backend server is offline (start the backend)
- Tap the refresh icon (↻) to retry connection

### Step 2: Select AI Model
- Choose between **EfficientNetB0** (lighter, faster) or **ResNet50** (more accurate)
- Radio button shows your current selection

### Step 3: Capture Image
- **Take Photo**: Opens camera to capture a new image
- **Choose from Gallery**: Select an existing image from your photo library

### Step 4: View Results
- See the detected disease with confidence score
- View top 5 possible diagnoses
- Read treatment recommendations
- Tap "Analyze Another" to go back

## 🔧 Configuration

### API Configuration (`src/config/api.js`)

```javascript
export const API_BASE_URL = 'http://192.168.1.6:8000';
```

**Finding Your IP Address:**

**Windows (Command Prompt)**:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., 192.168.1.6)

**macOS/Linux (Terminal)**:
```bash
ifconfig
```
Look for "inet" address under your active network interface (e.g., 192.168.1.6)

**Important**: Both your computer and phone must be on the same Wi-Fi network!

### Expo Configuration (`app.json`)

The app is configured for:
- **Bundle ID (iOS)**: com.plantdisease.detector
- **Package (Android)**: com.plantdisease.detector
- **Permissions**: Camera, Read/Write External Storage
- **Orientation**: Portrait only

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Start with cleared cache
npx expo start --clear

# Run on Android device/emulator
npm run android

# Run on iOS device/simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Key Dependencies (SDK 54 Compatible)

```json
{
  "expo": "~54.0.0",
  "react": "18.2.0",
  "react-native": "0.76.3",
  "expo-camera": "~15.0.16",
  "expo-image-picker": "~15.0.7",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17"
}
```

## 🎨 Design Features

- **Linear Gradients**: Modern gradient backgrounds and buttons
- **Card-Based Layout**: Clean, organized information display
- **Animated Progress Bars**: Visual confidence indicators
- **Status Indicators**: Real-time server connectivity
- **Shadow & Elevation**: Depth and hierarchy in UI
- **Responsive Design**: Adapts to different screen sizes
- **Icon Integration**: Emoji-based icons for visual appeal

## 🐛 Troubleshooting

### Camera/Gallery Not Working
**Problem**: Permissions denied
**Solution**: 
- Go to device Settings → Apps → Expo Go → Permissions
- Enable Camera and Storage permissions

### Cannot Connect to Backend
**Problem**: "Server Offline" message
**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `src/config/api.js` has correct IP address
3. Ensure phone and computer are on same Wi-Fi network
4. Try disabling firewall temporarily
5. For Android emulator, use `http://10.0.2.2:8000`

### Expo Version Mismatch
**Problem**: "SDK version mismatch" error
**Solution**:
- This app requires **Expo SDK 54**
- Update or downgrade Expo Go app to SDK 54 version
- Check package.json shows `"expo": "~54.0.0"`

### App Crashes on Start
**Problem**: App closes immediately after opening
**Solution**:
1. Clear Expo cache: `npx expo start --clear`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Restart Expo server

### Metro Bundler Errors
**Problem**: Bundler fails to load
**Solution**:
```bash
# Clear all caches
npx expo start --clear

# Or manually clear cache
rm -rf .expo node_modules
npm install
```

### Network Issues
**Problem**: Backend not reachable from phone
**Solution**:
1. Ping your computer from phone (if possible)
2. Check Windows Firewall settings
3. Ensure port 8000 is not blocked
4. Try USB debugging instead of Wi-Fi

## 🔐 Permissions Required

### iOS
- Camera
- Photo Library

### Android
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

Permissions are requested at runtime when needed.

## 📊 Performance Tips

1. **Image Quality**: Use quality: 0.8 for good balance between quality and speed
2. **Model Selection**: EfficientNetB0 is faster, ResNet50 is more accurate
3. **Network**: Use Wi-Fi instead of mobile data for faster predictions
4. **Cache**: Clear Expo cache if app becomes slow

## 🚢 Building for Production

### iOS (requires macOS)
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Or use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## 📝 API Integration

The app communicates with the FastAPI backend using these endpoints:

- `GET /health` - Check server status
- `GET /models` - Get available AI models
- `POST /predict` - Analyze plant image
  - Params: `file` (image), `model_name` (string)

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- All screens work on both iOS and Android
- SDK 54 compatibility is maintained
- README is updated for new features

## 📄 License

This project is licensed for educational purposes.

## 👥 Authors

Developed as part of the SIC AI project.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Navigation for seamless navigation
- PyTorch team for pre-trained models
- Plant disease dataset contributors

## 📞 Support

### Common Issues:
1. ✅ **Server Offline**: Start backend with `python backend/main.py`
2. ✅ **Wrong IP**: Update `src/config/api.js` with your computer's IP
3. ✅ **Permissions**: Enable camera/storage in device settings
4. ✅ **SDK Mismatch**: Use Expo Go SDK 54

### Need Help?
- Check the Troubleshooting section above
- Review backend logs for API errors
- Verify network configuration
- Ensure all dependencies are installed correctly

---

**⚠️ Important Reminders:**
- Update `API_BASE_URL` in `src/config/api.js` with your computer's IP address
- Ensure backend server is running before using the app
- Phone and computer must be on the same Wi-Fi network
- Use Expo Go SDK 54 on your mobile device

**Happy plant disease detecting! 🌱**
