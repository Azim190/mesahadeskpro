/// <reference types="vite/client" />

interface Window {
  api: {
    platform: string;
    ping: () => string;
    secureStorage: {
      setItem: (key: string, value: string) => Promise<boolean>;
      getItem: (key: string) => Promise<string | null>;
      removeItem: (key: string) => Promise<boolean>;
    };
    localDb: {
      getClients: () => Promise<unknown[]>;
      upsertClient: (client: unknown, enqueueSync?: boolean) => Promise<void>;
      deleteClient: (id: string, enqueueSync?: boolean) => Promise<void>;
      getProjects: () => Promise<unknown[]>;
      getProjectById: (id: string) => Promise<unknown | null>;
      upsertProject: (project: unknown, enqueueSync?: boolean) => Promise<void>;
      deleteProject: (id: string, enqueueSync?: boolean) => Promise<void>;
      getProjectDetails: (projectId: string) => Promise<unknown | null>;
      upsertProjectDetails: (details: unknown, enqueueSync?: boolean) => Promise<void>;
      getSyncQueue: () => Promise<unknown[]>;
      updateSyncQueueStatus: (id: number, status: string, attempts: number) => Promise<void>;
      deleteSyncQueueItem: (id: number) => Promise<void>;
      getMetadata: (key: string) => Promise<string | null>;
      setMetadata: (key: string, value: string) => Promise<void>;
      saveAttachment: (fileName: string, fileBuffer: ArrayBuffer, projectId: string, projectName?: string) => Promise<{
        id: string;
        fileName: string;
        filePath: string;
        sizeBytes: number;
        uploadedAt: string;
      }>;
      deleteAttachment: (filePath: string) => Promise<void>;
      openAttachment: (filePath: string) => Promise<void>;
      openOneDriveFolder: (projectName: string) => Promise<void>;
    };
    dialog: {
      confirm: (options: { message: string; title?: string; buttons?: string[] }) => Promise<boolean>;
    };
  };
}
