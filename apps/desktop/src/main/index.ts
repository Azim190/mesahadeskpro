import { app, BrowserWindow, shell, ipcMain, safeStorage, dialog } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as localDb from './database';

// Support ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to store encrypted keys
const SECURE_STORE_PATH = join(app.getPath('userData'), 'secure-store.json');

function readSecureStore(): Record<string, string> {
  try {
    if (fs.existsSync(SECURE_STORE_PATH)) {
      const content = fs.readFileSync(SECURE_STORE_PATH, 'utf8');
      return JSON.parse(content) as Record<string, string>;
    }
  } catch (err) {
    console.error('Failed to read secure store file', err);
  }
  return {};
}

function writeSecureStore(store: Record<string, string>): void {
  try {
    fs.writeFileSync(SECURE_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write secure store file', err);
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR load URL in development, static file in production
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Register secure storage IPC handlers
  ipcMain.handle('secure-store:set', (_event, key: string, value: string) => {
    try {
      const store = readSecureStore();
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(value);
        store[key] = encrypted.toString('base64');
      } else {
        // Obfuscation fallback if safeStorage is disabled/unavailable
        store[key] = Buffer.from(value).toString('base64');
      }
      writeSecureStore(store);
      return true;
    } catch (err) {
      console.error(`Failed to set key ${key} in secure store`, err);
      return false;
    }
  });

  ipcMain.handle('secure-store:get', (_event, key: string) => {
    try {
      const store = readSecureStore();
      const base64Value = store[key];
      if (!base64Value) return null;

      const buffer = Buffer.from(base64Value, 'base64');
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(buffer);
      } else {
        return buffer.toString('utf8');
      }
    } catch (err) {
      console.error(`Failed to get key ${key} from secure store`, err);
      return null;
    }
  });

  ipcMain.handle('secure-store:delete', (_event, key: string) => {
    try {
      const store = readSecureStore();
      if (key in store) {
        delete store[key];
        writeSecureStore(store);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Failed to delete key ${key} from secure store`, err);
      return false;
    }
  });

  // Initialize Local SQLite Database
  localDb.initLocalDb();

  // Local Database IPC Handlers
  ipcMain.handle('local-db:clients-list', () => {
    return localDb.getClients();
  });

  ipcMain.handle('local-db:clients-upsert', (_event, client: localDb.LocalDbClient, enqueueSync?: boolean) => {
    return localDb.upsertClient(client, enqueueSync);
  });

  ipcMain.handle('local-db:clients-delete', (_event, id: string, enqueueSync?: boolean) => {
    return localDb.deleteClient(id, enqueueSync);
  });

  ipcMain.handle('local-db:projects-list', () => {
    return localDb.getProjects();
  });

  ipcMain.handle('local-db:projects-get', (_event, id: string) => {
    return localDb.getProjectById(id);
  });

  ipcMain.handle('local-db:projects-upsert', (_event, project: localDb.LocalDbProject, enqueueSync?: boolean) => {
    return localDb.upsertProject(project, enqueueSync);
  });

  ipcMain.handle('local-db:projects-delete', (_event, id: string, enqueueSync?: boolean) => {
    return localDb.deleteProject(id, enqueueSync);
  });

  ipcMain.handle('local-db:project-details-get', (_event, projectId: string) => {
    return localDb.getProjectDetails(projectId);
  });

  ipcMain.handle('local-db:project-details-upsert', (_event, details: localDb.LocalDbProjectDetails, enqueueSync?: boolean) => {
    return localDb.upsertProjectDetails(details, enqueueSync);
  });

  ipcMain.handle('local-db:sync-queue-list', () => {
    return localDb.getSyncQueue();
  });

  ipcMain.handle('local-db:sync-queue-update', (_event, id: number, status: string, attempts: number) => {
    return localDb.updateSyncQueueStatus(id, status, attempts);
  });

  ipcMain.handle('local-db:sync-queue-delete', (_event, id: number) => {
    return localDb.deleteSyncQueueItem(id);
  });

  ipcMain.handle('local-db:metadata-get', (_event, key: string) => {
    return localDb.getMetadata(key);
  });

  ipcMain.handle('local-db:metadata-set', (_event, key: string, value: string) => {
    return localDb.setMetadata(key, value);
  });

  ipcMain.handle('dialog:confirm', async (_event, options: { message: string; title?: string; buttons?: string[] }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const result = focusedWindow
      ? await dialog.showMessageBox(focusedWindow, {
          type: 'question',
          buttons: options.buttons || ['Yes', 'No'],
          defaultId: 0,
          cancelId: 1,
          title: options.title || 'Confirm',
          message: options.message,
        })
      : await dialog.showMessageBox({
          type: 'question',
          buttons: options.buttons || ['Yes', 'No'],
          defaultId: 0,
          cancelId: 1,
          title: options.title || 'Confirm',
          message: options.message,
        });
    return result.response === 0;
  });

  ipcMain.handle('local-db:save-attachment', async (_event, fileName: string, fileBuffer: ArrayBuffer, projectId: string, projectName?: string) => {
    const fileId = crypto.randomUUID();
    const destDir = join(app.getPath('userData'), 'attachments', projectId);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destFileName = `${fileId}-${fileName}`;
    const destPath = join(destDir, destFileName);
    
    // Write buffer to disk
    const buffer = Buffer.from(fileBuffer);
    fs.writeFileSync(destPath, buffer);
    
    const stat = fs.statSync(destPath);

    // Copy to OneDrive if configured
    try {
      let targetOneDriveDir = await localDb.getMetadata('oneDrivePath');
      const newDefaultPath = 'D:\\OneDrive\\مشاريع فرع مكة المكرمة\\قسم أعمال المساحة';
      const oldDefaultPath = join(process.env.OneDrive || join(app.getPath('home'), 'OneDrive'), 'قسم أعمال المساحة');
      
      if (!targetOneDriveDir || targetOneDriveDir === oldDefaultPath || targetOneDriveDir.includes('C:\\Users\\maxpr')) {
        targetOneDriveDir = newDefaultPath;
        await localDb.setMetadata('oneDrivePath', newDefaultPath);
      }

      if (targetOneDriveDir) {
        // Sanitize project name for directory creation (fall back to projectId if empty)
        const folderName = (projectName || 'Unnamed Project').replace(/[\\/:*?"<>|]/g, '_').trim();
        const oneDriveProjectDir = join(targetOneDriveDir, folderName);
        
        if (!fs.existsSync(oneDriveProjectDir)) {
          fs.mkdirSync(oneDriveProjectDir, { recursive: true });
          // Open OneDrive shared folder link so the user can easily "Add shortcut to My files"
          shell.openExternal('https://1drv.ms/f/c/0a257d75be9315f7/IgClaRD1xDsZQrZQWBjQrqSxAcg5Cj0LnhDtzkCJ11pabj0?e=RmZiBI');
        }
        
        const oneDriveDestPath = join(oneDriveProjectDir, fileName);
        fs.writeFileSync(oneDriveDestPath, buffer);
      }
    } catch (e) {
      console.error('Failed to copy attachment to OneDrive:', e);
    }

    return {
      id: fileId,
      fileName,
      filePath: destPath,
      sizeBytes: stat.size,
      uploadedAt: new Date().toISOString(),
    };
  });

  ipcMain.handle('local-db:delete-attachment', async (_event, filePath: string) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  ipcMain.handle('local-db:open-attachment', async (_event, filePath: string) => {
    await shell.openPath(filePath);
  });

  ipcMain.handle('local-db:open-onedrive-folder', async (_event, projectName: string) => {
    try {
      let targetOneDriveDir = await localDb.getMetadata('oneDrivePath');
      const newDefaultPath = 'D:\\OneDrive\\مشاريع فرع مكة المكرمة\\قسم أعمال المساحة';
      const oldDefaultPath = join(process.env.OneDrive || join(app.getPath('home'), 'OneDrive'), 'قسم أعمال المساحة');
      
      if (!targetOneDriveDir || targetOneDriveDir === oldDefaultPath || targetOneDriveDir.includes('C:\\Users\\maxpr')) {
        targetOneDriveDir = newDefaultPath;
        await localDb.setMetadata('oneDrivePath', newDefaultPath);
      }

      if (targetOneDriveDir) {
        // Sanitize project name for directory creation (fall back to 'Unnamed Project' if empty)
        const folderName = (projectName || 'Unnamed Project').replace(/[\\/:*?"<>|]/g, '_').trim();
        const oneDriveProjectDir = join(targetOneDriveDir, folderName);
        
        if (!fs.existsSync(oneDriveProjectDir)) {
          fs.mkdirSync(oneDriveProjectDir, { recursive: true });
        }
        
        await shell.openPath(oneDriveProjectDir);
      }
    } catch (e) {
      console.error('Failed to open OneDrive project folder:', e);
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
