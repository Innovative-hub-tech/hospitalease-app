#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    const migrationsDir = path.join(__dirname, 'src/app/api/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Running: ${file}...`);
      try {
        await client.query(sql);
        console.log(`✓ ${file} completed\n`);
      } catch (err) {
        console.error(`✗ ${file} failed:`, err.message);
        throw err;
      }
    }

    console.log('✓ All migrations completed successfully!');
  } finally {
    await client.end();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
