import { app, BrowserWindow, Menu, globalShortcut } from "electron";

import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "projectorapp-icon.png"),
    frame: true,
    // frame: false,
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#00000000',
    //   symbolColor: '#ffffff',
    //   height: 48
    // },
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    fullscreenable: true,
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Restore devtools shortcuts in development mode
  if (VITE_DEV_SERVER_URL) {
    app.whenReady().then(() => {
      globalShortcut.register("CommandOrControl+Shift+I", () => {
        if (win) win.webContents.openDevTools({ mode: "detach" });
      });
      globalShortcut.register("F12", () => {
        if (win) win.webContents.openDevTools({ mode: "detach" });
      });
    });
  }

  // Fullscreen shortcuts - only when Electron windows are focused
  app.whenReady().then(() => {
    const toggleFullscreen = (window: BrowserWindow | null) => {
      if (window) {
        window.setFullScreen(!window.isFullScreen());
      }
    };

    // Only register shortcuts when an Electron window is focused
    const registerFullscreenShortcuts = () => {
      globalShortcut.register("F11", () => {
        toggleFullscreen(BrowserWindow.getFocusedWindow());
      });

      globalShortcut.register("Escape", () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow?.isFullScreen()) {
          focusedWindow.setFullScreen(false);
        }
      });
    };

    const unregisterFullscreenShortcuts = () => {
      globalShortcut.unregister("F11");
      globalShortcut.unregister("Escape");
    };

    // Register shortcuts when any Electron window gains focus
    app.on("browser-window-focus", registerFullscreenShortcuts);
    app.on("browser-window-blur", unregisterFullscreenShortcuts);

    // Initial registration
    registerFullscreenShortcuts();
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Remove default menu
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
