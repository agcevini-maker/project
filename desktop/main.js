const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

// La app de escritorio muestra el mismo index.html del prototipo web.
const PAGE = path.join(__dirname, "index.html");

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1000,
    minHeight: 680,
    title: "Sin Miedo",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#0d2a3a",
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });

  win.loadFile(PAGE);
  win.once("ready-to-show", () => { win.maximize(); win.show(); });

  // Los links externos se abren en el navegador, no dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) { e.preventDefault(); shell.openExternal(url); }
  });

  // F11: pantalla completa (para presentar). Esc: salir de pantalla completa.
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === "Escape" && win.isFullScreen()) win.setFullScreen(false);
  });
}

Menu.setApplicationMenu(null);
app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
