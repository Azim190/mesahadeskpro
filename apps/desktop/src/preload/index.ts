import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  ping: () => 'pong',
  secureStorage: {
    setItem: (key: string, value: string): Promise<boolean> =>
      ipcRenderer.invoke('secure-store:set', key, value),
    getItem: (key: string): Promise<string | null> =>
      ipcRenderer.invoke('secure-store:get', key),
    removeItem: (key: string): Promise<boolean> =>
      ipcRenderer.invoke('secure-store:delete', key),
  },
  localDb: {
    getClients: (): Promise<unknown[]> => ipcRenderer.invoke('local-db:clients-list'),
    upsertClient: (client: unknown, enqueueSync?: boolean): Promise<void> =>
      ipcRenderer.invoke('local-db:clients-upsert', client, enqueueSync),
    deleteClient: (id: string, enqueueSync?: boolean): Promise<void> =>
      ipcRenderer.invoke('local-db:clients-delete', id, enqueueSync),
    getProjects: (): Promise<unknown[]> => ipcRenderer.invoke('local-db:projects-list'),
    getProjectById: (id: string): Promise<unknown | null> => ipcRenderer.invoke('local-db:projects-get', id),
    upsertProject: (project: unknown, enqueueSync?: boolean): Promise<void> =>
      ipcRenderer.invoke('local-db:projects-upsert', project, enqueueSync),
    deleteProject: (id: string, enqueueSync?: boolean): Promise<void> =>
      ipcRenderer.invoke('local-db:projects-delete', id, enqueueSync),
    getProjectDetails: (projectId: string): Promise<unknown | null> =>
      ipcRenderer.invoke('local-db:project-details-get', projectId),
    upsertProjectDetails: (details: unknown, enqueueSync?: boolean): Promise<void> =>
      ipcRenderer.invoke('local-db:project-details-upsert', details, enqueueSync),
    getSyncQueue: (): Promise<unknown[]> => ipcRenderer.invoke('local-db:sync-queue-list'),
    updateSyncQueueStatus: (id: number, status: string, attempts: number): Promise<void> =>
      ipcRenderer.invoke('local-db:sync-queue-update', id, status, attempts),
    deleteSyncQueueItem: (id: number): Promise<void> =>
      ipcRenderer.invoke('local-db:sync-queue-delete', id),
    getMetadata: (key: string): Promise<string | null> =>
      ipcRenderer.invoke('local-db:metadata-get', key),
    setMetadata: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke('local-db:metadata-set', key, value),
    saveAttachment: (fileName: string, fileBuffer: ArrayBuffer, projectId: string, projectName?: string): Promise<{
      id: string;
      fileName: string;
      filePath: string;
      sizeBytes: number;
      uploadedAt: string;
    }> => ipcRenderer.invoke('local-db:save-attachment', fileName, fileBuffer, projectId, projectName),
    deleteAttachment: (filePath: string): Promise<void> =>
      ipcRenderer.invoke('local-db:delete-attachment', filePath),
    openAttachment: (filePath: string): Promise<void> =>
      ipcRenderer.invoke('local-db:open-attachment', filePath),
    openOneDriveFolder: (projectName: string): Promise<void> =>
      ipcRenderer.invoke('local-db:open-onedrive-folder', projectName),
  },
  dialog: {
    confirm: (options: { message: string; title?: string; buttons?: string[] }): Promise<boolean> =>
      ipcRenderer.invoke('dialog:confirm', options),
  },
});
