-- Migration: Create department_visits table
-- Description: Track patient visits to each department with entry/exit times and duration

CREATE TABLE IF NOT EXISTS department_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  staff_id UUID NOT NULL REFERENCES auth_users(id),
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_department_visits_patient_id ON department_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_department_visits_department_id ON department_visits(department_id);
CREATE INDEX IF NOT EXISTS idx_department_visits_staff_id ON department_visits(staff_id);
CREATE INDEX IF NOT EXISTS idx_department_visits_entry_time ON department_visits(entry_time);
