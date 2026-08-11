import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { eq, gt, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
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

  // In-memory fallback database
  private mockTenants: DbTenant[] = [];
  private mockRoles: DbRole[] = [];
  private mockUsers: (DbUser & { role: UserRole })[] = [];
  private mockAuditLogs: DbAuditLog[] = [];
  private mockOtpVerifications: DbOtp[] = [];
  private mockClients: DbClient[] = [];
  private mockProjects: DbProject[] = [];
  private mockProjectDetails: DbProjectDetails[] = [];

  async onModuleInit(): Promise<void> {
    await Promise.resolve(); // satisfy require-await
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
      } catch (error) {
        this.logger.error(
          'Failed to connect to PostgreSQL, using in-memory database',
          error,
        );
        this.initializeMockDb();
      }
    } else {
      this.logger.warn(
        'DATABASE_URL not set or invalid. Falling back to In-Memory database.',
      );
      this.initializeMockDb();
    }
  }

  private initializeMockDb(): void {
    const tenantId = '11111111-1111-1111-1111-111111111111';
    this.mockTenants.push({
      id: tenantId,
      officeName: 'Masaha Surveying Office',
      createdAt: new Date(),
    });

    const adminRoleId = '22222222-2222-2222-2222-222222222222';
    const managerRoleId = '33333333-3333-3333-3333-333333333333';
    const staffRoleId = '44444444-4444-4444-4444-444444444444';

    this.mockRoles.push(
      {
        id: adminRoleId,
        tenantId,
        name: UserRole.ADMIN,
        permissions: { manageUsers: true, viewAll: true, editAll: true },
      },
      {
        id: managerRoleId,
        tenantId,
        name: UserRole.DEPARTMENT_MANAGER,
        permissions: { manageUsers: false, viewAll: true, editAll: true },
      },
      {
        id: staffRoleId,
        tenantId,
        name: UserRole.STAFF,
        permissions: { manageUsers: false, viewAll: true, editAll: false },
      },
    );

    // Seed mock users
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Password123', salt);

    this.mockUsers.push(
      {
        id: 'ad111111-1111-1111-1111-111111111111',
        tenantId,
        fullName: 'Admin User',
        iqamaId: 'maxpro190@gmail.com',
        phoneNumber: '0500000001',
        passwordHash,
        roleId: adminRoleId,
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ma222222-2222-2222-2222-222222222222',
        tenantId,
        fullName: 'Manager User',
        iqamaId: 'manager@masahadesk.com',
        phoneNumber: '0500000002',
        passwordHash,
        roleId: managerRoleId,
        role: UserRole.DEPARTMENT_MANAGER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'st333333-3333-3333-3333-333333333333',
        tenantId,
        fullName: 'Staff Surveyor',
        iqamaId: 'staff@masahadesk.com',
        phoneNumber: '0500000003',
        passwordHash,
        roleId: staffRoleId,
        role: UserRole.STAFF,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    this.logger.log(
      'Seeded in-memory database with default accounts (Password123):',
    );
    this.logger.log('- Admin Email: maxpro190@gmail.com');
    this.logger.log('- Manager Email: manager@masahadesk.com');
    this.logger.log('- Staff Email: staff@masahadesk.com');
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
      // Get role name
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

    const user = this.mockUsers.find((u) => u.iqamaId === iqamaId);
    return user || null;
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
    return this.mockUsers.find((u) => u.id === id) || null;
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
    const idx = this.mockUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.mockUsers[idx].lastLoginAt = lastLoginAt;
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
    this.mockAuditLogs.push({
      id: Math.random().toString(),
      tenantId: log.tenantId,
      userId: log.userId,
      action: log.action,
      detailsJson: log.detailsJson,
      timestamp: new Date(),
    });
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
      // Clear any existing OTP for this user
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
    // Clear existing
    this.mockOtpVerifications = this.mockOtpVerifications.filter(
      (otp) => otp.userId !== userId,
    );
    this.mockOtpVerifications.push({
      id: Math.random().toString(),
      userId,
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });
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
    return (
      this.mockOtpVerifications.find((otp) => otp.userId === userId) || null
    );
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

    const idx = this.mockOtpVerifications.findIndex(
      (otp) => otp.userId === userId,
    );
    if (idx !== -1) {
      this.mockOtpVerifications[idx].attempts += 1;
      return this.mockOtpVerifications[idx].attempts;
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
    this.mockOtpVerifications = this.mockOtpVerifications.filter(
      (otp) => otp.userId !== userId,
    );
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

    for (const item of items) {
      const { id, entityType, entityId, operation, payload } = item;
      try {
        if (entityType === 'CLIENT') {
          const clientPayload = payload as DbClient;
          if (operation === 'CREATE' || operation === 'UPDATE') {
            const idx = this.mockClients.findIndex(
              (c) => c.id === clientPayload.id,
            );
            const data: DbClient = {
              id: clientPayload.id,
              tenantId: clientPayload.tenantId,
              name: clientPayload.name,
              phoneNumber: clientPayload.phoneNumber,
              notes: clientPayload.notes || null,
              createdAt: new Date(clientPayload.createdAt),
              updatedAt: new Date(clientPayload.updatedAt),
            };
            if (idx !== -1) {
              this.mockClients[idx] = data;
            } else {
              this.mockClients.push(data);
            }
          } else if (operation === 'DELETE') {
            this.mockClients = this.mockClients.filter(
              (c) => c.id !== entityId,
            );
          }
        } else if (entityType === 'PROJECT') {
          const projectPayload = payload as DbProject;
          if (operation === 'CREATE' || operation === 'UPDATE') {
            const idx = this.mockProjects.findIndex(
              (p) => p.id === projectPayload.id,
            );
            const data: DbProject = {
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
            };
            if (idx !== -1) {
              this.mockProjects[idx] = data;
            } else {
              this.mockProjects.push(data);
            }
          } else if (operation === 'DELETE') {
            this.mockProjects = this.mockProjects.filter(
              (p) => p.id !== entityId,
            );
            this.mockProjectDetails = this.mockProjectDetails.filter(
              (pd) => pd.projectId !== entityId,
            );
          }
        } else if (entityType === 'PROJECT_DETAILS') {
          const detailsPayload = payload as DbProjectDetails;
          if (operation === 'CREATE' || operation === 'UPDATE') {
            const idx = this.mockProjectDetails.findIndex(
              (pd) => pd.projectId === detailsPayload.projectId,
            );
            const data: DbProjectDetails = {
              id: detailsPayload.id,
              projectId: detailsPayload.projectId,
              workType: detailsPayload.workType,
              detailsJson: detailsPayload.detailsJson || {},
              createdAt: new Date(detailsPayload.createdAt),
              updatedAt: new Date(detailsPayload.updatedAt),
            };
            if (idx !== -1) {
              this.mockProjectDetails[idx] = data;
            } else {
              this.mockProjectDetails.push(data);
            }
          } else if (operation === 'DELETE') {
            this.mockProjectDetails = this.mockProjectDetails.filter(
              (pd) => pd.projectId !== entityId,
            );
          }
        }
        successIds.push(id);
      } catch (err) {
        this.logger.error(`Mock Sync failed for item ${id}`, err);
      }
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

    const clientsList = this.mockClients.filter(
      (c) => new Date(c.updatedAt) > since,
    );
    const projectsList = this.mockProjects.filter(
      (p) => new Date(p.updatedAt) > since,
    );
    const projectDetailsList = this.mockProjectDetails.filter(
      (pd) => new Date(pd.updatedAt) > since,
    );

    return {
      clients: clientsList,
      projects: projectsList,
      projectDetails: projectDetailsList,
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
    return this.mockUsers.filter((u) => u.tenantId === tenantId);
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
    } else {
      if (user.roleName === UserRole.ADMIN) {
        roleId = '22222222-2222-2222-2222-222222222222';
      } else if (user.roleName === UserRole.DEPARTMENT_MANAGER) {
        roleId = '33333333-3333-3333-3333-333333333333';
      }

      const newUser: DbUser & { role: UserRole } = {
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

      this.mockUsers.push(newUser);
      return newUser;
    }
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
    } else {
      const idx = this.mockUsers.findIndex((u) => u.id === userId);
      if (idx === -1) return null;

      if (updates.fullName !== undefined)
        this.mockUsers[idx].fullName = updates.fullName;
      if (updates.phoneNumber !== undefined)
        this.mockUsers[idx].phoneNumber = updates.phoneNumber;
      if (updates.isActive !== undefined)
        this.mockUsers[idx].isActive = updates.isActive;
      if (updates.passwordHash !== undefined)
        this.mockUsers[idx].passwordHash = updates.passwordHash;
      if (updates.roleName !== undefined) {
        this.mockUsers[idx].role = updates.roleName;
        let roleId = '44444444-4444-4444-4444-444444444444';
        if (updates.roleName === UserRole.ADMIN)
          roleId = '22222222-2222-2222-2222-222222222222';
        else if (updates.roleName === UserRole.DEPARTMENT_MANAGER)
          roleId = '33333333-3333-3333-3333-333333333333';
        this.mockUsers[idx].roleId = roleId;
      }
      this.mockUsers[idx].updatedAt = updatedAt;
      return this.mockUsers[idx];
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (this.db) {
      const result = await this.db
        .delete(schema.users)
        .where(eq(schema.users.id, userId))
        .returning({ id: schema.users.id });
      return result.length > 0;
    } else {
      const idx = this.mockUsers.findIndex((u) => u.id === userId);
      if (idx === -1) return false;
      this.mockUsers.splice(idx, 1);
      return true;
    }
  }
}
