# IP Logger Application - Build Instructions

## Mobile App (Android APK)

To build the Android APK:

1. Navigate to the mobile-app directory:
   ```
   cd mobile-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Expo CLI and EAS CLI:
   ```
   npm install -g expo-cli eas-cli
   ```

4. Log in to your Expo account:
   ```
   eas login
   ```

5. Build the APK:
   ```
   npm run build:apk
   ```

6. Once the build is complete, download the APK from the Expo dashboard or the link provided in the console.

## Desktop App (.exe)

To build the desktop application for Windows:

1. Install Electron globally:
   ```
   npm install -g electron electron-packager
   ```

2. Create an electron directory:
   ```
   mkdir -p electron-app
   ```

3. Initialize a new project:
   ```
   cd electron-app
   npm init -y
   ```

4. Install required dependencies:
   ```
   npm install electron electron-packager
   npm install express express-session axios
   ```

5. Copy the web client and server code:
   ```
   cp -r ../client/src ./client
   cp -r ../server ./server
   cp -r ../shared ./shared
   ```

6. Create the main.js file for Electron:
   ```javascript
   const { app, BrowserWindow } = require('electron');
   const path = require('path');
   const express = require('express');
   const { registerRoutes } = require('./server/routes');
   
   const expressApp = express();
   let mainWindow;
   
   async function createWindow() {
     mainWindow = new BrowserWindow({
       width: 1200,
       height: 800,
       icon: path.join(__dirname, 'assets/icon.png'),
       webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
       }
     });
     
     // Start Express server
     const server = await registerRoutes(expressApp);
     const port = server.address().port;
     
     // Load the app from the Express server
     mainWindow.loadURL(`http://localhost:${port}`);
     
     mainWindow.on('closed', function () {
       mainWindow = null;
     });
   }
   
   app.on('ready', createWindow);
   
   app.on('window-all-closed', function () {
     if (process.platform !== 'darwin') app.quit();
   });
   
   app.on('activate', function () {
     if (mainWindow === null) createWindow();
   });
   ```

7. Create a package.json for Electron:
   ```json
   {
     "name": "doxxer-desktop",
     "version": "1.0.0",
     "description": "IP Logger Desktop Application",
     "main": "main.js",
     "scripts": {
       "start": "electron .",
       "package-win": "electron-packager . doxxer --platform=win32 --arch=x64 --out=dist/win --icon=assets/icon.ico --overwrite"
     },
     "author": "『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷",
     "license": "ISC",
     "dependencies": {
       "electron": "^22.0.0",
       "express": "^4.18.2",
       "express-session": "^1.17.3",
       "axios": "^1.6.2"
     },
     "devDependencies": {
       "electron-packager": "^17.1.1"
     }
   }
   ```

8. Build the Windows executable:
   ```
   npm run package-win
   ```

9. The executable will be created in the `dist/win` directory.

## Troubleshooting

### Mobile APK Build
- If you encounter errors during the build process, try running `expo doctor` to check for issues.
- Make sure your Expo account has been verified.
- For Android builds, ensure you have accepted the Android SDK licenses by running `sdkmanager --licenses`.

### Desktop App Build
- If the build fails, check that you have all the required dependencies installed.
- Windows build requires a Windows environment or a virtual machine running Windows.
- For proper icon conversion, make sure to convert the PNG to ICO format for Windows builds.

Created by: 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷