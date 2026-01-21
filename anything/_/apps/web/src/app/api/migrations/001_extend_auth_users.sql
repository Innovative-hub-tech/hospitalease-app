-- Migration: Extend auth_users table with department_id and role
-- Description: Add department assignment and role columns to track staff department and permissions

-- Add department_id column
ALTER TABLE auth_users 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

-- Add role column with enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('staff', 'department_admin', 'global_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE auth_users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'staff';

-- Create index for faster lookups by department
CREATE INDEX IF NOT EXISTS idx_auth_users_department_id ON auth_users(department_id);
