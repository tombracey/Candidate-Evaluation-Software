const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

app.on("ready", () => {
  // Deterine environment:
  const isDev = !app.isPackaged || process.env.NODE_ENV === "development";

  // Set backend path accordingly:
  const backendPath = isDev
    ? path.join(__dirname, "../dist/backend") // Development path
    : path.join(process.resourcesPath, "dist/backend"); // Packaged path

  // Start backend:
  console.log(`Running in ${isDev ? "development" : "production"} mode`);
  console.log("Starting backend from:", backendPath);
  console.log("Starting backend from:", backendPath);

  backendProcess = spawn(backendPath);

  backendProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  // Electron window:
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // React build:
  mainWindow.loadFile(path.join(__dirname, "react-app/build/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

console.log("Resolved path to index.html:", path.join(__dirname, "react-app/build/index.html"));