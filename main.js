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

function detectImageMime(buffer) {
  if (buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  return null;
}

async function fetchImageBuffer(url, referer) {
  const parsed = new URL(url);
  const originReferer = `${parsed.protocol}//${parsed.host}/`;
  const variants = [url];
  const noQuery = parsed.origin + parsed.pathname;
  if (noQuery !== url) variants.push(noQuery);

  let lastError = 'fetch failed';

  for (const variant of variants) {
    const response = await fetch(variant, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
        Referer: referer || originReferer,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      lastError = `HTTP ${response.status}`;
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    let contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || '';

    if (!contentType.startsWith('image/')) {
      const detected = detectImageMime(buffer);
      if (detected) contentType = detected;
      else {
        lastError = 'not an image';
        continue;
      }
    }

    return { ok: true, contentType, buffer };
  }

  return { ok: false, error: lastError };
}

ipcMain.handle('fetch-image-url', async (_event, url, referer) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, error: 'invalid protocol' };
    }

    const result = await fetchImageBuffer(url, referer);
    if (!result.ok) return result;

    return {
      ok: true,
      dataUrl: `data:${result.contentType};base64,${result.buffer.toString('base64')}`,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('save-pdf-buffer', async (_event, arrayBuffer) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '匯出 PDF',
    defaultPath: 'ptcg-cards.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false };

  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
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
