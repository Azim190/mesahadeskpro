import { app, safeStorage } from 'electron';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import Database from 'better-sqlite3';

// Path to SQLite database file
const DB_PATH = join(app.getPath('userData'), 'local.db');
const SECURE_STORE_PATH = join(app.getPath('userData'), 'secure-store.json');

// Memory cache for the encryption key
let dbEncryptionKey: Buffer | null = null;

export interface LocalDbClient {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDbProject {
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

export interface LocalDbProjectDetails {
  id: string;
  projectId: string;
  workType: string;
  detailsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDbSyncQueueItem {
  id: number;
  entityType: 'PROJECT' | 'CLIENT' | 'PROJECT_DETAILS';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payloadJson: string;
  payload: unknown;
  status: string;
  attempts: number;
  createdAt: string;
}

interface RawProjectDetailsRow {
  id: string;
  projectId: string;
  workType: string;
  detailsJson: string;
  createdAt: string;
  updatedAt: string;
}

interface RawSyncQueueRow {
  id: number;
  entityType: 'PROJECT' | 'CLIENT' | 'PROJECT_DETAILS';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payloadJson: string;
  status: string;
  attempts: number;
  createdAt: string;
}

// Helper to load or generate the encryption key
function getDatabaseEncryptionKey(): Buffer {
  if (dbEncryptionKey) return dbEncryptionKey;

  let store: Record<string, string> = {};
  try {
    if (fs.existsSync(SECURE_STORE_PATH)) {
      store = JSON.parse(fs.readFileSync(SECURE_STORE_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to read secure store', err);
  }

  const storeKey = 'db_encryption_key';
  let hexKey = '';

  if (store[storeKey]) {
    try {
      const buffer = Buffer.from(store[storeKey], 'base64');
      if (safeStorage.isEncryptionAvailable()) {
        hexKey = safeStorage.decryptString(buffer);
      } else {
        hexKey = buffer.toString('utf8');
      }
    } catch (err) {
      console.error('Failed to decrypt database encryption key from store, generating a new one', err);
    }
  }

  if (!hexKey) {
    // Generate a secure 32-byte key (256 bits)
    const randomKey = crypto.randomBytes(32);
    hexKey = randomKey.toString('hex');
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(hexKey);
        store[storeKey] = encrypted.toString('base64');
      } else {
        store[storeKey] = Buffer.from(hexKey).toString('base64');
      }
      fs.writeFileSync(SECURE_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to store database encryption key securely', err);
    }
  }

  dbEncryptionKey = Buffer.from(hexKey, 'hex');
  return dbEncryptionKey;
}

// AES-256-GCM encryption helper
export function encryptText(text: string | null | undefined): string | null {
  if (text === null || text === undefined) return null;
  try {
    const key = getDatabaseEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return format: iv:ciphertext:authtag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (err) {
    console.error('Encryption failed', err);
    return null;
  }
}

// AES-256-GCM decryption helper
export function decryptText(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;
  try {
    const key = getDatabaseEncryptionKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, ciphertextHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed', err);
    return null;
  }
}

let dbInstance: Database.Database | null = null;

export function initLocalDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const db = new Database(DB_PATH);
  
  // Enable foreign key support
  db.pragma('foreign_keys = ON');

  // Initialize schemas
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      name TEXT NOT NULL,          -- encrypted
      phoneNumber TEXT NOT NULL,   -- encrypted
      notes TEXT,                  -- encrypted
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      clientId TEXT NOT NULL,
      projectNumber TEXT NOT NULL UNIQUE,
      workType TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      locationLat REAL,
      locationLng REAL,
      locationText TEXT,           -- encrypted
      notes TEXT,                  -- encrypted
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(clientId) REFERENCES clients(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS project_details (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL UNIQUE,
      workType TEXT NOT NULL,
      detailsJson TEXT NOT NULL,   -- encrypted JSON payload
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT NOT NULL,     -- 'PROJECT' | 'CLIENT' | 'PROJECT_DETAILS'
      entityId TEXT NOT NULL,
      operation TEXT NOT NULL,      -- 'CREATE' | 'UPDATE' | 'DELETE'
      payloadJson TEXT NOT NULL,    -- serialized JSON representation
      status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'FAILED'
      attempts INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  dbInstance = db;
  console.log(`Local SQLite database initialized successfully at: ${DB_PATH}`);

  /*
  try {
    // Seed mock clients if empty
    const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
    if (clientCount && clientCount.count === 0) {
      db.prepare(`
        INSERT INTO clients (id, tenantId, name, phoneNumber, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'c1111111-1111-1111-1111-111111111111',
        't1111111',
        encryptText('Ahmad Al-Sudairy')!,
        encryptText('0501111111')!,
        encryptText('Regular customer')!,
        new Date().toISOString(),
        new Date().toISOString()
      );

      db.prepare(`
        INSERT INTO clients (id, tenantId, name, phoneNumber, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'c2222222-2222-2222-2222-222222222222',
        't1111111',
        encryptText('Riyadh Real Estate')!,
        encryptText('0502222222')!,
        encryptText('Corporate client')!,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Seeded mock clients in local DB.');
    }

    // Seed mock projects if empty
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
    if (projectCount && projectCount.count === 0) {
      db.prepare(`
        INSERT INTO projects (id, tenantId, clientId, projectNumber, workType, status, progress, locationLat, locationLng, locationText, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'p1111111-1111-1111-1111-111111111111',
        't1111111',
        'c1111111-1111-1111-1111-111111111111',
        'SUR-2026-0001',
        'SURVEY_TRANSFER',
        'PENDING',
        10,
        24.7136,
        46.6753,
        encryptText('Riyadh, Olaya District')!,
        encryptText('Requires urgent upload')!,
        new Date().toISOString(),
        new Date().toISOString()
      );

      db.prepare(`
        INSERT INTO projects (id, tenantId, clientId, projectNumber, workType, status, progress, locationLat, locationLng, locationText, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'p2222222-2222-2222-2222-222222222222',
        't1111111',
        'c1111111-1111-1111-1111-111111111111',
        'SUR-2026-0002',
        'REPORTS',
        'IN_PROGRESS',
        65,
        26.4207,
        50.0888,
        encryptText('Dammam, Corniche')!,
        encryptText('Report under review by manager')!,
        new Date().toISOString(),
        new Date().toISOString()
      );

      db.prepare(`
        INSERT INTO projects (id, tenantId, clientId, projectNumber, workType, status, progress, locationLat, locationLng, locationText, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'p3333333-3333-3333-3333-333333333333',
        't1111111',
        'c2222222-2222-2222-2222-222222222222',
        'SUR-2026-0003',
        'SURVEY_SKETCH',
        'COMPLETED',
        100,
        21.4858,
        39.1925,
        encryptText('Jeddah, Al-Hamra')!,
        encryptText('Sketch completed and delivered to client')!,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Seeded mock projects in local DB.');
    }
  } catch (err) {
    console.error('Failed to seed local database', err);
  }
  */

  return db;
}

// --- DB CRUD OPERATIONS ---

export function getClients(): LocalDbClient[] {
  const db = initLocalDb();
  const rows = db.prepare('SELECT * FROM clients').all() as LocalDbClient[];
  return rows.map((row) => ({
    ...row,
    name: decryptText(row.name) || '',
    phoneNumber: decryptText(row.phoneNumber) || '',
    notes: decryptText(row.notes),
  }));
}

export function upsertClient(client: LocalDbClient, enqueueSync = true): void {
  const db = initLocalDb();
  
  // Check if exists
  const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(client.id);
  const operation = existing ? 'UPDATE' : 'CREATE';

  const encryptedName = encryptText(client.name);
  const encryptedPhone = encryptText(client.phoneNumber);
  const encryptedNotes = encryptText(client.notes || '');

  // Perform in transaction
  const runTransaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO clients (id, tenantId, name, phoneNumber, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phoneNumber = excluded.phoneNumber,
        notes = excluded.notes,
        updatedAt = excluded.updatedAt
    `).run(
      client.id,
      client.tenantId,
      encryptedName,
      encryptedPhone,
      encryptedNotes,
      client.createdAt,
      client.updatedAt
    );

    if (enqueueSync) {
      db.prepare(`
        INSERT INTO sync_queue (entityType, entityId, operation, payloadJson, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'CLIENT',
        client.id,
        operation,
        JSON.stringify(client),
        new Date().toISOString()
      );
    }
  });

  runTransaction();
}

export function deleteClient(id: string, enqueueSync = true): void {
  const db = initLocalDb();
  
  const runTransaction = db.transaction(() => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);

    if (enqueueSync) {
      db.prepare(`
        INSERT INTO sync_queue (entityType, entityId, operation, payloadJson, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'CLIENT',
        id,
        'DELETE',
        JSON.stringify({ id }),
        new Date().toISOString()
      );
    }
  });

  runTransaction();
}

export function getProjects(): (LocalDbProject & { clientName: string; clientPhone: string; projectName?: string; createdBy?: string })[] {
  const db = initLocalDb();
  const rows = db.prepare(`
    SELECT p.*, c.name as clientName, c.phoneNumber as clientPhone, pd.detailsJson
    FROM projects p
    LEFT JOIN clients c ON p.clientId = c.id
    LEFT JOIN project_details pd ON p.id = pd.projectId
    ORDER BY p.createdAt DESC
  `).all() as any[];
  
  return rows.map((row) => {
    let projectName = '';
    let createdBy = '';
    if (row.detailsJson) {
      try {
        const decryptedJson = decryptText(row.detailsJson);
        if (decryptedJson) {
          const parsed = JSON.parse(decryptedJson);
          projectName = parsed.projectName || '';
          createdBy = parsed.createdBy || '';
        }
      } catch (e) {
        console.error('Failed to parse detailsJson for project name/creator:', e);
      }
    }
    return {
      ...row,
      locationText: decryptText(row.locationText),
      notes: decryptText(row.notes),
      clientName: decryptText(row.clientName) || '',
      clientPhone: decryptText(row.clientPhone) || '',
      projectName: projectName || undefined,
      createdBy: createdBy || undefined,
    };
  });
}

export function getProjectById(id: string): (LocalDbProject & { clientName: string; clientPhone: string; projectName?: string; createdBy?: string }) | null {
  const db = initLocalDb();
  const row = db.prepare(`
    SELECT p.*, c.name as clientName, c.phoneNumber as clientPhone, pd.detailsJson
    FROM projects p
    LEFT JOIN clients c ON p.clientId = c.id
    LEFT JOIN project_details pd ON p.id = pd.projectId
    WHERE p.id = ?
  `).get(id) as any | null;

  if (!row) return null;

  let projectName = '';
  let createdBy = '';
  if (row.detailsJson) {
    try {
      const decryptedJson = decryptText(row.detailsJson);
      if (decryptedJson) {
        const parsed = JSON.parse(decryptedJson);
        projectName = parsed.projectName || '';
        createdBy = parsed.createdBy || '';
      }
    } catch (e) {
      console.error('Failed to parse detailsJson for project by id:', e);
    }
  }

  return {
    ...row,
    locationText: decryptText(row.locationText),
    notes: decryptText(row.notes),
    clientName: decryptText(row.clientName) || '',
    clientPhone: decryptText(row.clientPhone) || '',
    projectName: projectName || undefined,
    createdBy: createdBy || undefined,
  };
}

export function upsertProject(project: LocalDbProject, enqueueSync = true): void {
  const db = initLocalDb();
  
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(project.id);
  const operation = existing ? 'UPDATE' : 'CREATE';

  const encryptedLoc = encryptText(project.locationText || '');
  const encryptedNotes = encryptText(project.notes || '');

  const runTransaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO projects (id, tenantId, clientId, projectNumber, workType, status, progress, locationLat, locationLng, locationText, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        clientId = excluded.clientId,
        workType = excluded.workType,
        status = excluded.status,
        progress = excluded.progress,
        locationLat = excluded.locationLat,
        locationLng = excluded.locationLng,
        locationText = excluded.locationText,
        notes = excluded.notes,
        updatedAt = excluded.updatedAt
    `).run(
      project.id,
      project.tenantId,
      project.clientId,
      project.projectNumber,
      project.workType,
      project.status,
      project.progress,
      project.locationLat ?? null,
      project.locationLng ?? null,
      encryptedLoc,
      encryptedNotes,
      project.createdAt,
      project.updatedAt
    );

    if (enqueueSync) {
      db.prepare(`
        INSERT INTO sync_queue (entityType, entityId, operation, payloadJson, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'PROJECT',
        project.id,
        operation,
        JSON.stringify(project),
        new Date().toISOString()
      );
    }
  });

  runTransaction();
}

export function deleteProject(id: string, enqueueSync = true): void {
  const db = initLocalDb();

  const runTransaction = db.transaction(() => {
    // Explicitly delete project details first before the project row
    db.prepare('DELETE FROM project_details WHERE projectId = ?').run(id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (enqueueSync) {
      db.prepare(`
        INSERT INTO sync_queue (entityType, entityId, operation, payloadJson, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'PROJECT',
        id,
        'DELETE',
        JSON.stringify({ id }),
        new Date().toISOString()
      );
    }
  });

  runTransaction();
}

export function getProjectDetails(projectId: string): LocalDbProjectDetails | null {
  const db = initLocalDb();
  const row = db.prepare('SELECT * FROM project_details WHERE projectId = ?').get(projectId) as RawProjectDetailsRow | undefined;
  if (!row) return null;

  const decryptedJson = decryptText(row.detailsJson);
  return {
    id: row.id,
    projectId: row.projectId,
    workType: row.workType,
    detailsJson: decryptedJson ? JSON.parse(decryptedJson) as Record<string, unknown> : {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function upsertProjectDetails(details: LocalDbProjectDetails, enqueueSync = true): void {
  const db = initLocalDb();
  
  const existing = db.prepare('SELECT id FROM project_details WHERE projectId = ?').get(details.projectId);
  const operation = existing ? 'UPDATE' : 'CREATE';

  const encryptedDetails = encryptText(JSON.stringify(details.detailsJson || {}));

  const runTransaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO project_details (id, projectId, workType, detailsJson, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(projectId) DO UPDATE SET
        detailsJson = excluded.detailsJson,
        updatedAt = excluded.updatedAt
    `).run(
      details.id,
      details.projectId,
      details.workType,
      encryptedDetails,
      details.createdAt,
      details.updatedAt
    );

    if (enqueueSync) {
      db.prepare(`
        INSERT INTO sync_queue (entityType, entityId, operation, payloadJson, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'PROJECT_DETAILS',
        details.projectId,
        operation,
        JSON.stringify(details),
        new Date().toISOString()
      );
    }
  });

  runTransaction();
}

// --- SYNC QUEUE OPERATIONS ---

export function getSyncQueue(): LocalDbSyncQueueItem[] {
  const db = initLocalDb();
  const rows = db.prepare('SELECT * FROM sync_queue ORDER BY id ASC').all() as RawSyncQueueRow[];
  return rows.map((row) => ({
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    operation: row.operation,
    payloadJson: row.payloadJson,
    payload: JSON.parse(row.payloadJson),
    status: row.status,
    attempts: row.attempts,
    createdAt: row.createdAt,
  }));
}

export function deleteSyncQueueItem(id: number): void {
  const db = initLocalDb();
  db.prepare('DELETE FROM sync_queue WHERE id = ?').run(id);
}

export function updateSyncQueueStatus(id: number, status: string, attempts: number): void {
  const db = initLocalDb();
  db.prepare('UPDATE sync_queue SET status = ?, attempts = ? WHERE id = ?').run(status, attempts, id);
}

// --- METADATA OPERATIONS ---

export function getMetadata(key: string): string | null {
  const db = initLocalDb();
  const row = db.prepare('SELECT value FROM sync_metadata WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setMetadata(key: string, value: string): void {
  const db = initLocalDb();
  db.prepare(`
    INSERT INTO sync_metadata (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}
