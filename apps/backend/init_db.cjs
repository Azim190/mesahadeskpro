const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;

async function initPostgres(url) {
  const { Pool } = require('pg');
  console.log('🔄 Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString: url,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY,
        office_name TEXT NOT NULL,
        logo_url TEXT,
        primary_color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        permissions JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        iqama_id TEXT NOT NULL UNIQUE,
        phone_number TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role_id UUID NOT NULL REFERENCES roles(id),
        is_active BOOLEAN DEFAULT true NOT NULL,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS otp_verifications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
        project_number TEXT NOT NULL UNIQUE,
        work_type TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0 NOT NULL,
        location_lat TEXT,
        location_lng TEXT,
        location_text TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS project_details (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
        work_type TEXT NOT NULL,
        details_json JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details_json JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    console.log('✅ PostgreSQL tables verified and created successfully!');

    // Seed tenant
    const tenantId = '11111111-1111-1111-1111-111111111111';
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE id = $1', [tenantId]);
    if (tenantRes.rowCount === 0) {
      await pool.query('INSERT INTO tenants (id, office_name) VALUES ($1, $2)', [tenantId, 'Masaha Surveying Office']);
    }

    // Seed roles
    const adminRoleId = '22222222-2222-2222-2222-222222222222';
    const managerRoleId = '33333333-3333-3333-3333-333333333333';
    const staffRoleId = '44444444-4444-4444-4444-444444444444';

    await pool.query(`INSERT INTO roles (id, tenant_id, name, permissions) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`, [adminRoleId, tenantId, 'Admin', JSON.stringify({ manageUsers: true, viewAll: true, editAll: true })]);
    await pool.query(`INSERT INTO roles (id, tenant_id, name, permissions) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`, [managerRoleId, tenantId, 'DepartmentManager', JSON.stringify({ manageUsers: false, viewAll: true, editAll: true })]);
    await pool.query(`INSERT INTO roles (id, tenant_id, name, permissions) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`, [staffRoleId, tenantId, 'Staff', JSON.stringify({ manageUsers: false, viewAll: true, editAll: false })]);

    // Seed default users if not existing
    const passwordHash = bcrypt.hashSync('Password123', 10);
    await pool.query(
      `INSERT INTO users (id, tenant_id, full_name, iqama_id, phone_number, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (iqama_id) DO NOTHING`,
      ['ad111111-1111-1111-1111-111111111111', tenantId, 'Admin User', 'maxpro190@gmail.com', '0500000001', passwordHash, adminRoleId]
    );
    await pool.query(
      `INSERT INTO users (id, tenant_id, full_name, iqama_id, phone_number, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (iqama_id) DO NOTHING`,
      ['ba222222-2222-2222-2222-222222222222', tenantId, 'Manager User', 'manager@masahadesk.com', '0500000002', passwordHash, managerRoleId]
    );
    await pool.query(
      `INSERT INTO users (id, tenant_id, full_name, iqama_id, phone_number, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (iqama_id) DO NOTHING`,
      ['ca333333-3333-3333-3333-333333333333', tenantId, 'Staff Surveyor', 'staff@masahadesk.com', '0500000003', passwordHash, staffRoleId]
    );
    console.log('✅ Default users verified/seeded in PostgreSQL (Password: Password123)');

    const countRes = await pool.query('SELECT count(*) as count FROM users');
    console.log(`📊 PostgreSQL Database Ready! Total Users: ${countRes.rows[0]?.count}`);
    await pool.end();
  } catch (err) {
    console.error('❌ PostgreSQL Initialization error:', err);
    throw err;
  }
}

function initSqlite() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'masaha_backend.db');
  console.log(`🔄 Initializing SQLite database at: ${dbPath}`);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
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

  console.log('✅ SQLite tables created successfully!');

  // Seed default tenant
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const tenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant) {
    db.prepare('INSERT INTO tenants (id, officeName, createdAt) VALUES (?, ?, ?)').run(
      tenantId,
      'Masaha Surveying Office',
      new Date().toISOString()
    );
  }

  // Seed default roles
  const adminRoleId = '22222222-2222-2222-2222-222222222222';
  const managerRoleId = '33333333-3333-3333-3333-333333333333';
  const staffRoleId = '44444444-4444-4444-4444-444444444444';

  const insertRole = db.prepare(
    'INSERT OR IGNORE INTO roles (id, tenantId, name, permissions) VALUES (?, ?, ?, ?)'
  );
  insertRole.run(adminRoleId, tenantId, 'Admin', JSON.stringify({ manageUsers: true, viewAll: true, editAll: true }));
  insertRole.run(managerRoleId, tenantId, 'DepartmentManager', JSON.stringify({ manageUsers: false, viewAll: true, editAll: true }));
  insertRole.run(staffRoleId, tenantId, 'Staff', JSON.stringify({ manageUsers: false, viewAll: true, editAll: false }));

  // Seed users if empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count === 0) {
    const passwordHash = bcrypt.hashSync('Password123', 10);
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, tenantId, fullName, iqamaId, phoneNumber, passwordHash, roleId, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    insertUser.run('ad111111-1111-1111-1111-111111111111', tenantId, 'Admin User', 'maxpro190@gmail.com', '0500000001', passwordHash, adminRoleId, now, now);
    insertUser.run('ma222222-2222-2222-2222-222222222222', tenantId, 'Manager User', 'manager@masahadesk.com', '0500000002', passwordHash, managerRoleId, now, now);
    insertUser.run('st333333-3333-3333-3333-333333333333', tenantId, 'Staff Surveyor', 'staff@masahadesk.com', '0500000003', passwordHash, staffRoleId, now, now);

    console.log('✅ Seeded default accounts:');
    console.log('   - Admin: maxpro190@gmail.com / Password: Password123');
    console.log('   - Manager: manager@masahadesk.com / Password: Password123');
    console.log('   - Staff: staff@masahadesk.com / Password: Password123');
  }

  const users = db.prepare('SELECT id, fullName, iqamaId, phoneNumber, roleId FROM users').all();
  console.log(`\n🎉 SQLite Database Ready! File: ${dbPath}`);
  console.log(`👥 Registered Users (${users.length}):`);
  console.table(users);

  db.close();
}

async function main() {
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    await initPostgres(dbUrl);
  } else {
    initSqlite();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
