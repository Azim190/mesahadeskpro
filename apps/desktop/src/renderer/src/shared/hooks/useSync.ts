import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncQueueItemDto } from '@masahadesk/shared-types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

interface ClientPayload {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectPayload {
  id: string;
  tenantId: string;
  clientId: string;
  projectNumber: string;
  workType: string;
  status: string;
  progress: number;
  locationLat?: number | null;
  locationLng?: number | null;
  locationText?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetailsPayload {
  id: string;
  projectId: string;
  workType: string;
  detailsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
  });

  const syncInProgressRef = useRef(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const runSync = useCallback(async () => {
    if (syncInProgressRef.current) return;
    
    // Check connection first
    const online = await checkConnection();
    if (!online) {
      // Update queue count even if offline
      const queue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];
      setStatus((prev) => ({ ...prev, isOnline: false, pendingCount: queue.length }));
      return;
    }

    const token = await window.api.secureStorage.getItem('accessToken');
    if (!token) {
      // User is not authenticated yet, skip sync
      setStatus((prev) => ({ ...prev, isOnline: true }));
      return;
    }

    syncInProgressRef.current = true;
    setStatus((prev) => ({ ...prev, isOnline: true, isSyncing: true }));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // 1. PUSH local changes
      const queue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];
      if (queue.length > 0) {
        // Map queue items to match backend DTO structure
        const syncItems = queue.map((item) => ({
          id: item.id,
          entityType: item.entityType,
          entityId: item.entityId,
          operation: item.operation,
          payload: item.payload,
          createdAt: item.createdAt,
        }));

        const pushResponse = await fetch(`${apiUrl}/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(syncItems),
        });

        if (pushResponse.ok) {
          const { successIds } = (await pushResponse.json()) as { successIds: number[] };
          // Delete successfully synced items from local SQLite queue
          for (const id of successIds) {
            await window.api.localDb.deleteSyncQueueItem(id);
          }
        }
      }

      // 2. PULL remote changes
      const lastSyncTimestamp = await window.api.localDb.getMetadata('last_sync_timestamp') || new Date(0).toISOString();
      const pullResponse = await fetch(`${apiUrl}/sync/pull?since=${encodeURIComponent(lastSyncTimestamp)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (pullResponse.ok) {
        const data = (await pullResponse.json()) as {
          clients: unknown[];
          projects: unknown[];
          projectDetails: unknown[];
          serverTimestamp: string;
        };
        const activeQueue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];

        // Process pulled clients
        for (const remoteClientRaw of data.clients) {
          const remoteClient = remoteClientRaw as ClientPayload;
          const localConflict = activeQueue.find(
            (q) => q.entityType === 'CLIENT' && q.entityId === remoteClient.id
          );

          if (localConflict) {
            // Conflict resolution: Last-Write-Wins by updatedAt
            const remoteUpdated = new Date(remoteClient.updatedAt).getTime();
            const localUpdated = new Date((localConflict.payload as ClientPayload).updatedAt).getTime();

            if (remoteUpdated > localUpdated) {
              // Remote wins: overwrite local DB and remove local sync queue item
              await window.api.localDb.upsertClient(remoteClient, false);
              await window.api.localDb.deleteSyncQueueItem(localConflict.id);
            }
            // If local wins, we do nothing; the next push cycle will update the server.
          } else {
            // No conflict: upsert normally without queueing a new sync item
            await window.api.localDb.upsertClient(remoteClient, false);
          }
        }

        // Process pulled projects
        for (const remoteProjectRaw of data.projects) {
          const remoteProject = remoteProjectRaw as ProjectPayload;
          const localConflict = activeQueue.find(
            (q) => q.entityType === 'PROJECT' && q.entityId === remoteProject.id
          );

          if (localConflict) {
            const remoteUpdated = new Date(remoteProject.updatedAt).getTime();
            const localUpdated = new Date((localConflict.payload as ProjectPayload).updatedAt).getTime();

            if (remoteUpdated > localUpdated) {
              await window.api.localDb.upsertProject(remoteProject, false);
              await window.api.localDb.deleteSyncQueueItem(localConflict.id);
            }
          } else {
            await window.api.localDb.upsertProject(remoteProject, false);
          }
        }

        // Process pulled project details
        for (const remoteDetailsRaw of data.projectDetails) {
          const remoteDetails = remoteDetailsRaw as ProjectDetailsPayload;
          const localConflict = activeQueue.find(
            (q) => q.entityType === 'PROJECT_DETAILS' && q.entityId === remoteDetails.projectId
          );

          if (localConflict) {
            const remoteUpdated = new Date(remoteDetails.updatedAt).getTime();
            const localUpdated = new Date((localConflict.payload as ProjectDetailsPayload).updatedAt).getTime();

            if (remoteUpdated > localUpdated) {
              await window.api.localDb.upsertProjectDetails(remoteDetails, false);
              await window.api.localDb.deleteSyncQueueItem(localConflict.id);
            }
          } else {
            await window.api.localDb.upsertProjectDetails(remoteDetails, false);
          }
        }

        // Update last sync metadata
        await window.api.localDb.setMetadata('last_sync_timestamp', data.serverTimestamp);
        
        // Update state
        const finalQueue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];
        setStatus({
          isOnline: true,
          isSyncing: false,
          pendingCount: finalQueue.length,
          lastSyncTime: new Date(data.serverTimestamp),
        });
      } else {
        // Pull failed, just update states
        const finalQueue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];
        setStatus((prev) => ({
          ...prev,
          isOnline: true,
          isSyncing: false,
          pendingCount: finalQueue.length,
        }));
      }
    } catch (error) {
      console.error('Error during synchronization:', error);
      const finalQueue = (await window.api.localDb.getSyncQueue()) as SyncQueueItemDto[];
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        isSyncing: false,
        pendingCount: finalQueue.length,
      }));
    } finally {
      syncInProgressRef.current = false;
    }
  }, [checkConnection]);

  useEffect(() => {
    // Initial sync
    runSync();

    // Check online status every 5 seconds, sync every 15 seconds
    const intervalId = setInterval(() => {
      runSync();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [runSync]);

  return {
    ...status,
    triggerSync: runSync,
  };
}
