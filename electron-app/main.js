const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const { Storage } = require('./server/storage');
const { registerRoutes } = require('./server/routes');

// Initialize the storage
const storage = new Storage();

// Create Express app
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
  const server = await registerRoutes(expressApp, storage);
  const port = server.address().port;
  
  // Load the app from the Express server
  mainWindow.loadURL(`http://localhost:${port}`);
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
  
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