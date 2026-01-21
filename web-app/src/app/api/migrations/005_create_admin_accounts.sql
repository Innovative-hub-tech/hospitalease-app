-- Migration: Create admin_accounts table
-- Description: Manage administrator accounts with role-based access control

-- Create admin role enum type
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('global', 'department');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role admin_role NOT NULL,
  department_id UUID REFERENCES departments(id),
  created_by UUID NOT NULL REFERENCES admin_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts(role);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_department_id ON admin_accounts(department_id);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_is_active ON admin_accounts(is_active);
