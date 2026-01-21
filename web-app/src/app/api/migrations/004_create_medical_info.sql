-- Migration: Create medical_info table
-- Description: Track medical information (drugs, tests, complaints, referrals) for each department visit

CREATE TABLE IF NOT EXISTS medical_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  department_visit_id UUID NOT NULL REFERENCES department_visits(id) ON DELETE CASCADE,
  drugs_prescribed TEXT[],
  diagnostic_tests TEXT[],
  health_complaints TEXT[],
  referrals TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth_users(id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_medical_info_patient_id ON medical_info(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_department_id ON medical_info(department_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_department_visit_id ON medical_info(department_visit_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_is_locked ON medical_info(is_locked);
