-- Migration: Extend patient_workflow table with immutability constraint
-- Description: Add action_type and is_emergency columns, ensure immutability of workflow records

-- Create action type enum
DO $$ BEGIN
  CREATE TYPE workflow_action_type AS ENUM ('transfer', 'reactivation', 'emergency_alert', 'issue_report');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add action_type column
ALTER TABLE patient_workflow 
ADD COLUMN IF NOT EXISTS action_type workflow_action_type DEFAULT 'transfer';

-- Add is_emergency column
ALTER TABLE patient_workflow 
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_patient_workflow_action_type ON patient_workflow(action_type);
CREATE INDEX IF NOT EXISTS idx_patient_workflow_is_emergency ON patient_workflow(is_emergency);
