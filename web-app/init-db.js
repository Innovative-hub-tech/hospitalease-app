#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Creating base tables...\n');

    // Create departments table
    console.log('Creating departments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ departments table created\n');

    // Create auth_users table
    console.log('Creating auth_users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ auth_users table created\n');

    // Create auth_accounts table
    console.log('Creating auth_accounts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(255),
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        password VARCHAR(255),
        UNIQUE(provider, "providerAccountId")
      );
    `);
    console.log('✓ auth_accounts table created\n');

    // Create auth_sessions table
    console.log('Creating auth_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        "sessionToken" VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('✓ auth_sessions table created\n');

    // Create auth_verification_token table
    console.log('Creating auth_verification_token table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_verification_token (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);
    console.log('✓ auth_verification_token table created\n');

    // Create patients table
    console.log('Creating patients table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(10),
        address TEXT,
        current_department_id UUID REFERENCES departments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ patients table created\n');

    // Create patient_workflow table
    console.log('Creating patient_workflow table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patient_workflow (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        from_department_id UUID REFERENCES departments(id),
        to_department_id UUID NOT NULL REFERENCES departments(id),
        transferred_by UUID NOT NULL REFERENCES auth_users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT immutable_workflow CHECK (created_at IS NOT NULL)
      );
    `);
    console.log('✓ patient_workflow table created\n');

    console.log('✓ All base tables created successfully!');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    throw err;
  } finally {
    await client.end();
    await pool.end();
  }
}

initDatabase().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
