-- Migration: Create issue_reports table
-- Description: Track issue reports submitted by staff with severity levels and status

-- Create severity enum type
DO $$ BEGIN
  CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create issue status enum type
DO $$ BEGIN
  CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES auth_users(id),
  description TEXT NOT NULL,
  severity issue_severity NOT NULL,
  status issue_status DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_issue_reports_department_id ON issue_reports(department_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_patient_id ON issue_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_reported_by ON issue_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_issue_reports_severity ON issue_reports(severity);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_created_at ON issue_reports(created_at);
