import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { eq, gt, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { join, dirname } from 'path';
import Database from 'better-sqlite3';
import { UserRole, SyncQueueItemDto } from '@masahadesk/shared-types';

export interface DbTenant {
  id: string;
  officeName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  createdAt: Date;
}

export interface DbRole {
  id: string;
  tenantId: string;
  name: string;
  permissions: Record<string, unknown>;
}

export interface DbUser {
  id: string;
  tenantId: string;
  fullName: string;
  iqamaId: string;
  phoneNumber: string;
  passwordHash: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbOtp {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

export interface DbClient {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DbProject {
  id: string;
  tenantId: string;
  clientId: string;
  projectNumber: string;
  workType: string;
  status: string;
  progress: number;
  locationLat?: string | null;
  locationLng?: string | null;
  locationText?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DbProjectDetails {
  id: string;
  projectId: string;
  workType: string;
  detailsJson: Record<string, unknown>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DbAuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  detailsJson?: unknown;
  timestamp: Date;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private db: NodePgDatabase<typeof schema> | null = null;
  private sqliteDb: Database.Database | null = null;

  async onModuleInit(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (
      dbUrl &&
      (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))
    ) {
      try {
        const pool = new pg.Pool({ connectionString: dbUrl });
        this.db = drizzle(pool, { schema });
        this.logger.log(
          'Successfully connected to PostgreSQL using Drizzle ORM',
        );
        return;
      } catch (error) {
        this.logger.error(
          'Failed to connect to PostgreSQL, falling back to persistent SQLite database',
          error,
        );
      }
    }

    this.logger.warn(
      'DATABASE_URL not set or not PostgreSQL. Using persistent SQLite database.',
    );
    this.initializeSqliteDb();
  }

  private initializeSqliteDb(): void {
    try {
      const dbPath =
        process.env.SQLITE_DB_PATH ||
        join(process.cwd(), 'data', 'masaha_backend.db');
      
      const dir = dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.sqliteDb = new Database(dbPath);
      this.sqliteDb.pragma('journal_mode = WAL');
      this.sqliteDb.pragma('foreign_keys = ON');

      // Create tables
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY,
          officeName TEXT NOT NULL,
          logoUrl TEXT,
          primaryColor TEXT,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS roles (
          id TEXT PRIMARY KEY,
          tenantId TEXT NOT NULL,
          name TEXT NOT NULL,
          permissions TEXT NOT NULL,
          FOREIGN KEY(tenantId) REFERENCES tenants(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          tenantId TEXT NOT NULL,
          fullName TEXT NOT NULL,
          iqamaId TEXT NOT NULL UNIQUE,
          phoneNumber TEXT NOT NULL,
          passwordHash TEXT NOT NULL,
          roleId TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          lastLoginAt TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY(roleId) REFERENCES roles(id) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS otp_verifications (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          codeHash TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          tenantId TEXT NOT NULL,
          name TEXT NOT NULL,
          phoneNumber TEXT NOT NULL,
          notes TEXT,
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
          locationText TEXT,
          notes TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_details (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL UNIQUE,
          workType TEXT NOT NULL,
          detailsJson TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          tenantId TEXT NOT NULL,
          userId TEXT,
          action TEXT NOT NULL,
          entityType TEXT,
          entityId TEXT,
          detailsJson TEXT,
          timestamp TEXT NOT NULL
        );
      `);

      // Seed initial tenant and roles if not exists
      const tenantId = '11111111-1111-1111-1111-111111111111';
      const existingTenant = this.sqliteDb
        .prepare('SELECT id FROM tenants WHERE id = ?')
        .get(tenantId);
      if (!existingTenant) {
        this.sqliteDb
          .prepare(
            `INSERT INTO tenants (id, officeName, createdAt) VALUES (?, ?, ?)`,
          )
          .run(tenantId, 'Masaha Surveying Office', new Date().toISOString());
      }

      const adminRoleId = '22222222-2222-2222-2222-222222222222';
      const managerRoleId = '33333333-3333-3333-3333-333333333333';
      const staffRoleId = '44444444-4444-4444-4444-444444444444';

      const insertRole = this.sqliteDb.prepare(`
        INSERT OR IGNORE INTO roles (id, tenantId, name, permissions)
        VALUES (?, ?, ?, ?)
      `);
      insertRole.run(
        adminRoleId,
        tenantId,
        UserRole.ADMIN,
        JSON.stringify({ manageUsers: true, viewAll: true, editAll: true }),
      );
      insertRole.run(
        managerRoleId,
        tenantId,
        UserRole.DEPARTMENT_MANAGER,
        JSON.stringify({ manageUsers: false, viewAll: true, editAll: true }),
      );
      insertRole.run(
        staffRoleId,
        tenantId,
        UserRole.STAFF,
        JSON.stringify({ manageUsers: false, viewAll: true, editAll: false }),
      );

      // Seed initial default users only if no users exist
      const userCountRow = this.sqliteDb
        .prepare('SELECT COUNT(*) as count FROM users')
        .get() as { count: number };
      if (!userCountRow || userCountRow.count === 0) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('Password123', salt);
        const now = new Date().toISOString();

        const insertUser = this.sqliteDb.prepare(`
          INSERT INTO users (id, tenantId, fullName, iqamaId, phoneNumber, passwordHash, roleId, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `);

        insertUser.run(
          'ad111111-1111-1111-1111-111111111111',
          tenantId,
          'Admin User',
          'maxpro190@gmail.com',
          '0500000001',
          passwordHash,
          adminRoleId,
          now,
          now,
        );

        insertUser.run(
          'ma222222-2222-2222-2222-222222222222',
          tenantId,
          'Manager User',
          'manager@masahadesk.com',
          '0500000002',
          passwordHash,
          managerRoleId,
          now,
          now,
        );

        insertUser.run(
          'st333333-3333-3333-3333-333333333333',
          tenantId,
          'Staff Surveyor',
          'staff@masahadesk.com',
          '0500000003',
          passwordHash,
          staffRoleId,
          now,
          now,
        );

        this.logger.log(
          'Seeded SQLite persistent database with default accounts (Password123):',
        );
        this.logger.log('- Admin Email: maxpro190@gmail.com');
        this.logger.log('- Manager Email: manager@masahadesk.com');
        this.logger.log('- Staff Email: staff@masahadesk.com');
      }

      this.logger.log(
        `Persistent SQLite database initialized successfully at: ${dbPath}`,
      );
    } catch (err) {
      this.logger.error('Failed to initialize SQLite database', err);
    }
  }

  // --- DB operations wrappers ---

  async findUserByIqamaId(
    iqamaId: string,
  ): Promise<(DbUser & { role: UserRole }) | null> {
    if (this.db) {
      const results = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.iqamaId, iqamaId))
        .limit(1);
      if (results.length === 0) return null;
      const roleResult = await this.db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.id, results[0].roleId))
        .limit(1);
      return {
        ...results[0],
        role: (roleResult[0]?.name as UserRole) || UserRole.STAFF,
      };
    }

    if (this.sqliteDb) {
      const row = this.sqliteDb
        .prepare(
          `
          SELECT u.*, r.name as roleName
          FROM users u
          LEFT JOIN roles r ON u.roleId = r.id
          WHERE u.iqamaId = ?
          LIMIT 1
        `,
        )
        .get(iqamaId) as any | undefined;

      if (!row) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        fullName: row.fullName,
        iqamaId: row.iqamaId,
        phoneNumber: row.phoneNumber,
        passwordHash: row.passwordHash,
        roleId: row.roleId,
        isActive: Boolean(row.isActive),
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        role: (row.roleName as UserRole) || UserRole.STAFF,
      };
    }

    return null;
  }

  async findUserById(
    id: string,
  ): Promise<(DbUser & { role: UserRole }) | null> {
    if (this.db) {
      const results = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      if (results.length === 0) return null;
      const roleResult = await this.db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.id, results[0].roleId))
        .limit(1);
      return {
        ...results[0],
        role: (roleResult[0]?.name as UserRole) || UserRole.STAFF,
      };
    }

    if (this.sqliteDb) {
      const row = this.sqliteDb
        .prepare(
          `
          SELECT u.*, r.name as roleName
          FROM users u
          LEFT JOIN roles r ON u.roleId = r.id
          WHERE u.id = ?
          LIMIT 1
        `,
        )
        .get(id) as any | undefined;

      if (!row) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        fullName: row.fullName,
        iqamaId: row.iqamaId,
        phoneNumber: row.phoneNumber,
        passwordHash: row.passwordHash,
        roleId: row.roleId,
        isActive: Boolean(row.isActive),
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        role: (row.roleName as UserRole) || UserRole.STAFF,
      };
    }

    return null;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const lastLoginAt = new Date();
    if (this.db) {
      await this.db
        .update(schema.users)
        .set({ lastLoginAt })
        .where(eq(schema.users.id, userId));
      return;
    }
    if (this.sqliteDb) {
      this.sqliteDb
        .prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?')
        .run(lastLoginAt.toISOString(), userId);
    }
  }

  async createAuditLog(log: {
    tenantId: string;
    userId: string | null;
    action: string;
    detailsJson?: unknown;
  }): Promise<void> {
    if (this.db) {
      await this.db.insert(schema.auditLogs).values({
        tenantId: log.tenantId,
        userId: log.userId,
        action: log.action,
        detailsJson: log.detailsJson,
      });
      return;
    }
    if (this.sqliteDb) {
      this.sqliteDb
        .prepare(
          `INSERT INTO audit_logs (id, tenantId, userId, action, detailsJson, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          crypto.randomUUID(),
          log.tenantId,
          log.userId || null,
          log.action,
          JSON.stringify(log.detailsJson || {}),
          new Date().toISOString(),
        );
    }
    this.logger.log(
      `[AUDIT LOG] Action: ${log.action}, User: ${log.userId}, Details: ${JSON.stringify(log.detailsJson)}`,
    );
  }

  // --- OTP Verification operations ---

  async saveOtp(
    userId: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void> {
    if (this.db) {
      await this.db
        .delete(schema.otpVerifications)
        .where(eq(schema.otpVerifications.userId, userId));
      await this.db.insert(schema.otpVerifications).values({
        userId,
        codeHash,
        expiresAt,
        attempts: 0,
      });
      return;
    }
    if (this.sqliteDb) {
      this.sqliteDb
        .prepare('DELETE FROM otp_verifications WHERE userId = ?')
        .run(userId);
      this.sqliteDb
        .prepare(
          `INSERT INTO otp_verifications (id, userId, codeHash, expiresAt, attempts, createdAt)
           VALUES (?, ?, ?, ?, 0, ?)`,
        )
        .run(
          crypto.randomUUID(),
          userId,
          codeHash,
          expiresAt.toISOString(),
          new Date().toISOString(),
        );
    }
  }

  async findOtpByUserId(userId: string): Promise<DbOtp | null> {
    if (this.db) {
      const results = await this.db
        .select()
        .from(schema.otpVerifications)
        .where(eq(schema.otpVerifications.userId, userId))
        .limit(1);
      return results[0] || null;
    }
    if (this.sqliteDb) {
      const row = this.sqliteDb
        .prepare('SELECT * FROM otp_verifications WHERE userId = ? LIMIT 1')
        .get(userId) as any | undefined;
      if (!row) return null;
      return {
        id: row.id,
        userId: row.userId,
        codeHash: row.codeHash,
        expiresAt: new Date(row.expiresAt),
        attempts: row.attempts,
        createdAt: new Date(row.createdAt),
      };
    }
    return null;
  }

  async incrementOtpAttempts(userId: string): Promise<number> {
    if (this.db) {
      const current = await this.findOtpByUserId(userId);
      if (!current) return 0;
      const newAttempts = current.attempts + 1;
      await this.db
        .update(schema.otpVerifications)
        .set({ attempts: newAttempts })
        .where(eq(schema.otpVerifications.userId, userId));
      return newAttempts;
    }
    if (this.sqliteDb) {
      const current = await this.findOtpByUserId(userId);
      if (!current) return 0;
      const newAttempts = current.attempts + 1;
      this.sqliteDb
        .prepare('UPDATE otp_verifications SET attempts = ? WHERE userId = ?')
        .run(newAttempts, userId);
      return newAttempts;
    }
    return 0;
  }

  async deleteOtp(userId: string): Promise<void> {
    if (this.db) {
      await this.db
        .delete(schema.otpVerifications)
        .where(eq(schema.otpVerifications.userId, userId));
      return;
    }
    if (this.sqliteDb) {
      this.sqliteDb
        .prepare('DELETE FROM otp_verifications WHERE userId = ?')
        .run(userId);
    }
  }

  // --- SYNC SERVICE OPERATIONS ---

  async pushSyncItems(
    items: SyncQueueItemDto[],
  ): Promise<{ successIds: number[] }> {
    const successIds: number[] = [];

    if (this.db) {
      await this.db.transaction(async (tx) => {
        for (const item of items) {
          const { id, entityType, entityId, operation, payload } = item;
          try {
            if (entityType === 'CLIENT') {
              const clientPayload = payload as DbClient;
              if (operation === 'CREATE' || operation === 'UPDATE') {
                await tx
                  .insert(schema.clients)
                  .values({
                    id: clientPayload.id,
                    tenantId: clientPayload.tenantId,
                    name: clientPayload.name,
                    phoneNumber: clientPayload.phoneNumber,
                    notes: clientPayload.notes || null,
                    createdAt: new Date(clientPayload.createdAt),
                    updatedAt: new Date(clientPayload.updatedAt),
                  })
                  .onConflictDoUpdate({
                    target: schema.clients.id,
                    set: {
                      name: clientPayload.name,
                      phoneNumber: clientPayload.phoneNumber,
                      notes: clientPayload.notes || null,
                      updatedAt: new Date(clientPayload.updatedAt),
                    },
                  });
              } else if (operation === 'DELETE') {
                await tx
                  .delete(schema.clients)
                  .where(eq(schema.clients.id, entityId));
              }
            } else if (entityType === 'PROJECT') {
              const projectPayload = payload as DbProject;
              if (operation === 'CREATE' || operation === 'UPDATE') {
                await tx
                  .insert(schema.projects)
                  .values({
                    id: projectPayload.id,
                    tenantId: projectPayload.tenantId,
                    clientId: projectPayload.clientId,
                    projectNumber: projectPayload.projectNumber,
                    workType: projectPayload.workType,
                    status: projectPayload.status,
                    progress: projectPayload.progress || 0,
                    locationLat: projectPayload.locationLat || null,
                    locationLng: projectPayload.locationLng || null,
                    locationText: projectPayload.locationText || null,
                    notes: projectPayload.notes || null,
                    createdAt: new Date(projectPayload.createdAt),
                    updatedAt: new Date(projectPayload.updatedAt),
                  })
                  .onConflictDoUpdate({
                    target: schema.projects.id,
                    set: {
                      clientId: projectPayload.clientId,
                      workType: projectPayload.workType,
                      status: projectPayload.status,
                      progress: projectPayload.progress || 0,
                      locationLat: projectPayload.locationLat || null,
                      locationLng: projectPayload.locationLng || null,
                      locationText: projectPayload.locationText || null,
                      notes: projectPayload.notes || null,
                      updatedAt: new Date(projectPayload.updatedAt),
                    },
                  });
              } else if (operation === 'DELETE') {
                await tx
                  .delete(schema.projectDetails)
                  .where(eq(schema.projectDetails.projectId, entityId));
                await tx
                  .delete(schema.projects)
                  .where(eq(schema.projects.id, entityId));
              }
            } else if (entityType === 'PROJECT_DETAILS') {
              const detailsPayload = payload as DbProjectDetails;
              if (operation === 'CREATE' || operation === 'UPDATE') {
                await tx
                  .insert(schema.projectDetails)
                  .values({
                    id: detailsPayload.id,
                    projectId: detailsPayload.projectId,
                    workType: detailsPayload.workType,
                    detailsJson: detailsPayload.detailsJson || {},
                    createdAt: new Date(detailsPayload.createdAt),
                    updatedAt: new Date(detailsPayload.updatedAt),
                  })
                  .onConflictDoUpdate({
                    target: schema.projectDetails.projectId,
                    set: {
                      detailsJson: detailsPayload.detailsJson || {},
                      updatedAt: new Date(detailsPayload.updatedAt),
                    },
                  });
              } else if (operation === 'DELETE') {
                await tx
                  .delete(schema.projectDetails)
                  .where(eq(schema.projectDetails.projectId, entityId));
              }
            }
            successIds.push(id);
          } catch (err) {
            this.logger.error(
              `Failed to sync item ${id} of type ${entityType}`,
              err,
            );
          }
        }
      });
      return { successIds };
    }

    if (this.sqliteDb) {
      const db = this.sqliteDb;
      const runTransaction = db.transaction(() => {
        for (const item of items) {
          const { id, entityType, entityId, operation, payload } = item;
          try {
            if (entityType === 'CLIENT') {
              const clientPayload = payload as DbClient;
              if (operation === 'CREATE' || operation === 'UPDATE') {
                db.prepare(`
                  INSERT INTO clients (id, tenantId, name, phoneNumber, notes, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    phoneNumber = excluded.phoneNumber,
                    notes = excluded.notes,
                    updatedAt = excluded.updatedAt
                `).run(
                  clientPayload.id,
                  clientPayload.tenantId,
                  clientPayload.name,
                  clientPayload.phoneNumber,
                  clientPayload.notes || null,
                  new Date(clientPayload.createdAt).toISOString(),
                  new Date(clientPayload.updatedAt).toISOString(),
                );
              } else if (operation === 'DELETE') {
                db.prepare('DELETE FROM clients WHERE id = ?').run(entityId);
              }
            } else if (entityType === 'PROJECT') {
              const projectPayload = payload as DbProject;
              if (operation === 'CREATE' || operation === 'UPDATE') {
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
                  projectPayload.id,
                  projectPayload.tenantId,
                  projectPayload.clientId,
                  projectPayload.projectNumber,
                  projectPayload.workType,
                  projectPayload.status,
                  projectPayload.progress || 0,
                  projectPayload.locationLat ? parseFloat(projectPayload.locationLat) : null,
                  projectPayload.locationLng ? parseFloat(projectPayload.locationLng) : null,
                  projectPayload.locationText || null,
                  projectPayload.notes || null,
                  new Date(projectPayload.createdAt).toISOString(),
                  new Date(projectPayload.updatedAt).toISOString(),
                );
              } else if (operation === 'DELETE') {
                db.prepare('DELETE FROM project_details WHERE projectId = ?').run(entityId);
                db.prepare('DELETE FROM projects WHERE id = ?').run(entityId);
              }
            } else if (entityType === 'PROJECT_DETAILS') {
              const detailsPayload = payload as DbProjectDetails;
              if (operation === 'CREATE' || operation === 'UPDATE') {
                db.prepare(`
                  INSERT INTO project_details (id, projectId, workType, detailsJson, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT(projectId) DO UPDATE SET
                    detailsJson = excluded.detailsJson,
                    updatedAt = excluded.updatedAt
                `).run(
                  detailsPayload.id,
                  detailsPayload.projectId,
                  detailsPayload.workType,
                  JSON.stringify(detailsPayload.detailsJson || {}),
                  new Date(detailsPayload.createdAt).toISOString(),
                  new Date(detailsPayload.updatedAt).toISOString(),
                );
              } else if (operation === 'DELETE') {
                db.prepare('DELETE FROM project_details WHERE projectId = ?').run(entityId);
              }
            }
            successIds.push(id);
          } catch (err) {
            this.logger.error(`SQLite Sync failed for item ${id}`, err);
          }
        }
      });

      runTransaction();
    }

    return { successIds };
  }

  async pullSyncChanges(since: Date): Promise<{
    clients: DbClient[];
    projects: DbProject[];
    projectDetails: DbProjectDetails[];
    serverTimestamp: string;
  }> {
    const serverTimestamp = new Date().toISOString();
    const sinceIso = since.toISOString();

    if (this.db) {
      const clientsList = await this.db
        .select()
        .from(schema.clients)
        .where(gt(schema.clients.updatedAt, since));
      const projectsList = await this.db
        .select()
        .from(schema.projects)
        .where(gt(schema.projects.updatedAt, since));
      const projectDetailsList = await this.db
        .select()
        .from(schema.projectDetails)
        .where(gt(schema.projectDetails.updatedAt, since));

      return {
        clients: clientsList.map((row) => ({
          ...row,
          notes: row.notes || null,
        })),
        projects: projectsList.map((row) => ({
          ...row,
          locationLat: row.locationLat || null,
          locationLng: row.locationLng || null,
          locationText: row.locationText || null,
          notes: row.notes || null,
        })),
        projectDetails: projectDetailsList.map((row) => ({
          ...row,
          detailsJson: row.detailsJson as Record<string, unknown>,
        })),
        serverTimestamp,
      };
    }

    if (this.sqliteDb) {
      const clientsRows = this.sqliteDb
        .prepare('SELECT * FROM clients WHERE updatedAt > ?')
        .all(sinceIso) as any[];
      const projectsRows = this.sqliteDb
        .prepare('SELECT * FROM projects WHERE updatedAt > ?')
        .all(sinceIso) as any[];
      const detailsRows = this.sqliteDb
        .prepare('SELECT * FROM project_details WHERE updatedAt > ?')
        .all(sinceIso) as any[];

      return {
        clients: clientsRows.map((c) => ({
          id: c.id,
          tenantId: c.tenantId,
          name: c.name,
          phoneNumber: c.phoneNumber,
          notes: c.notes || null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        projects: projectsRows.map((p) => ({
          id: p.id,
          tenantId: p.tenantId,
          clientId: p.clientId,
          projectNumber: p.projectNumber,
          workType: p.workType,
          status: p.status,
          progress: p.progress,
          locationLat: p.locationLat !== null ? String(p.locationLat) : null,
          locationLng: p.locationLng !== null ? String(p.locationLng) : null,
          locationText: p.locationText || null,
          notes: p.notes || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        projectDetails: detailsRows.map((d) => ({
          id: d.id,
          projectId: d.projectId,
          workType: d.workType,
          detailsJson: d.detailsJson ? JSON.parse(d.detailsJson) : {},
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        serverTimestamp,
      };
    }

    return {
      clients: [],
      projects: [],
      projectDetails: [],
      serverTimestamp,
    };
  }

  async getAllUsers(
    tenantId: string,
  ): Promise<(DbUser & { role: UserRole })[]> {
    if (this.db) {
      const results = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.tenantId, tenantId));

      const enriched = [];
      for (const u of results) {
        const roleResult = await this.db
          .select()
          .from(schema.roles)
          .where(eq(schema.roles.id, u.roleId))
          .limit(1);
        enriched.push({
          ...u,
          role: (roleResult[0]?.name as UserRole) || UserRole.STAFF,
        });
      }
      return enriched;
    }

    if (this.sqliteDb) {
      const rows = this.sqliteDb
        .prepare(`
          SELECT u.*, r.name as roleName
          FROM users u
          LEFT JOIN roles r ON u.roleId = r.id
          WHERE u.tenantId = ?
          ORDER BY u.createdAt ASC
        `)
        .all(tenantId) as any[];

      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        fullName: row.fullName,
        iqamaId: row.iqamaId,
        phoneNumber: row.phoneNumber,
        passwordHash: row.passwordHash,
        roleId: row.roleId,
        isActive: Boolean(row.isActive),
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        role: (row.roleName as UserRole) || UserRole.STAFF,
      }));
    }

    return [];
  }

  async createUser(
    user: Omit<
      DbUser,
      'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'roleId'
    > & { roleName: UserRole },
  ): Promise<DbUser & { role: UserRole }> {
    const userId = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    let roleId = '44444444-4444-4444-4444-444444444444'; // default Staff
    if (this.db) {
      const roleResult = await this.db
        .select()
        .from(schema.roles)
        .where(
          and(
            eq(schema.roles.tenantId, user.tenantId),
            eq(schema.roles.name, user.roleName),
          ),
        )
        .limit(1);
      if (roleResult.length > 0) {
        roleId = roleResult[0].id;
      }

      const inserted = await this.db
        .insert(schema.users)
        .values({
          id: userId,
          tenantId: user.tenantId,
          fullName: user.fullName,
          iqamaId: user.iqamaId,
          phoneNumber: user.phoneNumber,
          passwordHash: user.passwordHash,
          roleId,
          isActive: user.isActive,
          createdAt,
          updatedAt,
        })
        .returning();

      return {
        ...inserted[0],
        role: user.roleName,
      };
    }

    if (this.sqliteDb) {
      const roleRow = this.sqliteDb
        .prepare('SELECT id FROM roles WHERE tenantId = ? AND name = ? LIMIT 1')
        .get(user.tenantId, user.roleName) as { id: string } | undefined;
      if (roleRow) {
        roleId = roleRow.id;
      } else {
        if (user.roleName === UserRole.ADMIN) {
          roleId = '22222222-2222-2222-2222-222222222222';
        } else if (user.roleName === UserRole.DEPARTMENT_MANAGER) {
          roleId = '33333333-3333-3333-3333-333333333333';
        }
      }

      this.sqliteDb
        .prepare(`
          INSERT INTO users (id, tenantId, fullName, iqamaId, phoneNumber, passwordHash, roleId, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          userId,
          user.tenantId,
          user.fullName,
          user.iqamaId,
          user.phoneNumber,
          user.passwordHash,
          roleId,
          user.isActive ? 1 : 0,
          createdAt.toISOString(),
          updatedAt.toISOString(),
        );

      return {
        id: userId,
        tenantId: user.tenantId,
        fullName: user.fullName,
        iqamaId: user.iqamaId,
        phoneNumber: user.phoneNumber,
        passwordHash: user.passwordHash,
        roleId,
        isActive: user.isActive,
        lastLoginAt: null,
        createdAt,
        updatedAt,
        role: user.roleName,
      };
    }

    throw new Error('Database not initialized');
  }

  async updateUser(
    userId: string,
    updates: Partial<
      Omit<DbUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
    > & { roleName?: UserRole },
  ): Promise<(DbUser & { role: UserRole }) | null> {
    const updatedAt = new Date();

    if (this.db) {
      let roleId: string | undefined;
      if (updates.roleName) {
        const roleResult = await this.db
          .select()
          .from(schema.roles)
          .where(eq(schema.roles.name, updates.roleName))
          .limit(1);
        if (roleResult.length > 0) {
          roleId = roleResult[0].id;
        }
      }

      await this.db
        .update(schema.users)
        .set({
          fullName: updates.fullName,
          phoneNumber: updates.phoneNumber,
          isActive: updates.isActive,
          passwordHash: updates.passwordHash,
          roleId,
          updatedAt,
        })
        .where(eq(schema.users.id, userId));

      return this.findUserById(userId);
    }

    if (this.sqliteDb) {
      const existing = await this.findUserById(userId);
      if (!existing) return null;

      let roleId = existing.roleId;
      if (updates.roleName) {
        const roleRow = this.sqliteDb
          .prepare('SELECT id FROM roles WHERE name = ? LIMIT 1')
          .get(updates.roleName) as { id: string } | undefined;
        if (roleRow) {
          roleId = roleRow.id;
        }
      }

      const newFullName = updates.fullName !== undefined ? updates.fullName : existing.fullName;
      const newPhone = updates.phoneNumber !== undefined ? updates.phoneNumber : existing.phoneNumber;
      const newActive = updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
      const newHash = updates.passwordHash !== undefined ? updates.passwordHash : existing.passwordHash;

      this.sqliteDb
        .prepare(`
          UPDATE users
          SET fullName = ?, phoneNumber = ?, isActive = ?, passwordHash = ?, roleId = ?, updatedAt = ?
          WHERE id = ?
        `)
        .run(
          newFullName,
          newPhone,
          newActive,
          newHash,
          roleId,
          updatedAt.toISOString(),
          userId,
        );

      return this.findUserById(userId);
    }

    return null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (this.db) {
      const result = await this.db
        .delete(schema.users)
        .where(eq(schema.users.id, userId))
        .returning({ id: schema.users.id });
      return result.length > 0;
    }

    if (this.sqliteDb) {
      const info = this.sqliteDb
        .prepare('DELETE FROM users WHERE id = ?')
        .run(userId);
      return info.changes > 0;
    }

    return false;
  }
}
