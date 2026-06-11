const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const appIconPath = path.join(__dirname, 'assets', 'icon.icns');

function setAppIcon() {
  const icon = nativeImage.createFromPath(appIconPath);
  if (icon.isEmpty()) return;
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    title: 'PTCG Deck',
    icon: appIconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

ipcMain.handle('save-deck', async (_event, deckData) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '儲存牌組',
    defaultPath: 'my-deck.ptcgdeck',
    filters: [{ name: 'PTCG Deck', extensions: ['ptcgdeck'] }],
  });
  if (canceled || !filePath) return { ok: false };

  fs.writeFileSync(filePath, JSON.stringify(deckData, null, 2), 'utf-8');
  return { ok: true, filePath };
});

ipcMain.handle('open-deck', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '開啟牌組',
    filters: [{ name: 'PTCG Deck', extensions: ['ptcgdeck', 'json'] }],
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return { ok: false };

  const raw = fs.readFileSync(filePaths[0], 'utf-8');
  const deckData = JSON.parse(raw);
  return { ok: true, filePath: filePaths[0], deckData };
});

ipcMain.handle('fetch-image-url', async (_event, url) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, error: 'invalid protocol' };
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'image/*,*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] || 'image/png';
    if (!contentType.startsWith('image/')) {
      return { ok: false, error: 'not an image' };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      ok: true,
      dataUrl: `data:${contentType};base64,${buffer.toString('base64')}`,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('export-pdf', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '匯出 PDF',
    defaultPath: 'ptcg-cards.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false };

  const pdfBuffer = await win.webContents.printToPDF({
    printBackground: true,
    landscape: true,
    pageSize: 'A4',
    margins: { marginType: 'none' },
  });

  fs.writeFileSync(filePath, pdfBuffer);
  return { ok: true, filePath };
});

app.setName('PTCG Deck');

app.whenReady().then(() => {
  setAppIcon();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
