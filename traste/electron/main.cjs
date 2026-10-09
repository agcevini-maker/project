// Traste para computadora: abre la app compilada (dist/) en una ventana propia con Electron.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

// Tamaño y posición de la ventana, para abrirla igual que la última vez.
const boundsFile = () => path.join(app.getPath("userData"), "ventana.json");
function loadBounds() {
  try { return JSON.parse(fs.readFileSync(boundsFile(), "utf8")); } catch { return null; }
}
function saveBounds(win) {
  try {
    fs.writeFileSync(boundsFile(), JSON.stringify({ ...win.getNormalBounds(), maximized: win.isMaximized() }));
  } catch {}
}

function createWindow() {
  const b = loadBounds();
  const win = new BrowserWindow({
    width: b?.width ?? 1360,
    height: b?.height ?? 860,
    x: b?.x,
    y: b?.y,
    minWidth: 960,
    minHeight: 640,
    title: "Traste",
    backgroundColor: "#EDF0EE",
    autoHideMenuBar: true, // el menú aparece con la tecla Alt
    icon: path.join(__dirname, "..", "dist", "icons", "icon-512.png"),
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  if (b?.maximized) win.maximize();
  win.once("ready-to-show", () => win.show());
  win.on("close", () => saveBounds(win));

  // Los enlaces externos se abren en el navegador, no dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }
  });

  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

const menu = Menu.buildFromTemplate([
  {
    label: "Ver",
    submenu: [
      { role: "reload", label: "Recargar" },
      { type: "separator" },
      { role: "zoomIn", label: "Acercar" },
      { role: "zoomOut", label: "Alejar" },
      { role: "resetZoom", label: "Tamaño original" },
      { type: "separator" },
      { role: "togglefullscreen", label: "Pantalla completa" },
    ],
  },
  {
    label: "Ayuda",
    submenu: [
      { label: `Traste ${app.getVersion()}`, enabled: false },
      { role: "toggleDevTools", label: "Herramientas de desarrollo" },
    ],
  },
]);

// Una sola ventana: si la abren de nuevo, se trae al frente la que ya está.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [w] = BrowserWindow.getAllWindows();
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(menu);
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
