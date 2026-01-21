-- Migration: Extend patients table with status column
-- Description: Add status tracking for patient lifecycle (active, discharged, inactive)

-- Create status enum type
DO $$ BEGIN
  CREATE TYPE patient_status AS ENUM ('active', 'discharged', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS status patient_status DEFAULT 'active';

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
