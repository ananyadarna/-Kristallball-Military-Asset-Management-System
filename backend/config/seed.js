import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import db from './db.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function seed() {
  const client = await db.getClient();
  try {
    console.log("Reading schema.sql...");
    // Fix Windows leading slash path issues with file URLs
    const schemaPath = path.join(process.cwd(), 'config', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Initializing database schema...");
    await client.query('BEGIN');
    
    // Drop existing tables if they exist (for clean seed)
    await client.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS expenditures CASCADE;
      DROP TABLE IF EXISTS assignments CASCADE;
      DROP TABLE IF EXISTS transfers CASCADE;
      DROP TABLE IF EXISTS purchases CASCADE;
      DROP TABLE IF EXISTS equipment_types CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS bases CASCADE;
    `);

    // Execute schema sql
    await client.query(schemaSql);
    console.log("Schema initialized. Seeding data...");

    // Seed Bases
    const baseAlpha = await client.query(
      `INSERT INTO bases (name, location) VALUES ($1, $2) RETURNING id`,
      ['Fort Alpha', 'Region Alpha']
    );
    const baseBravo = await client.query(
      `INSERT INTO bases (name, location) VALUES ($1, $2) RETURNING id`,
      ['Fort Bravo', 'Region Bravo']
    );
    const alphaId = baseAlpha.rows[0].id;
    const bravoId = baseBravo.rows[0].id;

    // Seed Equipment Types
    const m4 = await client.query(
      `INSERT INTO equipment_types (name, category) VALUES ($1, $2) RETURNING id`,
      ['M4 Carbine', 'WEAPON']
    );
    const humvee = await client.query(
      `INSERT INTO equipment_types (name, category) VALUES ($1, $2) RETURNING id`,
      ['Humvee', 'VEHICLE']
    );
    const ammo = await client.query(
      `INSERT INTO equipment_types (name, category) VALUES ($1, $2) RETURNING id`,
      ['5.56mm Ammo', 'AMMUNITION']
    );
    const m4Id = m4.rows[0].id;
    const humveeId = humvee.rows[0].id;
    const ammoId = ammo.rows[0].id;

    // Seed Users (hash passwords)
    const adminHash = await bcrypt.hash('AdminPass123!', 10);
    const commanderHash = await bcrypt.hash('CommandPass123!', 10);
    const logisticsHash = await bcrypt.hash('LogisticsPass123!', 10);

    await client.query(
      `INSERT INTO users (username, password_hash, role, base_id) VALUES ($1, $2, $3, $4)`,
      ['admin_user', adminHash, 'ADMIN', null]
    );
    await client.query(
      `INSERT INTO users (username, password_hash, role, base_id) VALUES ($1, $2, $3, $4)`,
      ['commander_alpha', commanderHash, 'BASE_COMMANDER', alphaId]
    );
    await client.query(
      `INSERT INTO users (username, password_hash, role, base_id) VALUES ($1, $2, $3, $4)`,
      ['logistics_officer', logisticsHash, 'LOGISTICS_OFFICER', alphaId]
    );

    // Seed Initial Purchases
    await client.query(
      `INSERT INTO purchases (base_id, equipment_type_id, quantity) VALUES 
       ($1, $2, 100), ($1, $3, 10), ($1, $4, 5000),
       ($5, $2, 50), ($5, $3, 5), ($5, $4, 2000)`,
      [alphaId, m4Id, humveeId, ammoId, bravoId]
    );

    await client.query('COMMIT');
    console.log("Database seeded successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
