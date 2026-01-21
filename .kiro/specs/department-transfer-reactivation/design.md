# Design Document: Department Transfer and Patient Reactivation System

## Overview

The Department Transfer and Patient Reactivation System enhances the existing healthcare workflow by automating staff identification during patient transfers, providing intuitive UI controls for transfers and reactivations, and maintaining comprehensive audit trails. The system integrates with the existing NextAuth authentication, patient workflow tracking, and department queue management to create a seamless experience for healthcare staff and administrators.

Key design principles:
- **Automatic staff capture**: Staff information is retrieved from the authenticated session, eliminating manual entry
- **Immutable audit trail**: All transfers and reactivations are logged and cannot be modified
- **Role-based access**: Different views and capabilities for staff, department admins, and global admins
- **Real-time notifications**: Emergency alerts and issue reports trigger immediate notifications
- **Comprehensive history**: Complete medical journey tracking across all departments

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  Patient Details Page │ Patient List │ Department Queue │ Admin  │
│  Transfer Dialog      │ Reactivation │ Issue Report     │ Dash   │
└────────────┬──────────────────────────────────────────────────┬──┘
             │                                                  │
┌────────────▼──────────────────────────────────────────────────▼──┐
│                    API Layer (Next.js Routes)                     │
├─────────────────────────────────────────────────────────────────┤
│  /api/workflow/transfer    │ /api/workflow/reactivate            │
│  /api/workflow/history     │ /api/admin/dashboard                │
│  /api/admin/register       │ /api/notifications/emergency        │
│  /api/issues/report        │ /api/medical-info/update            │
└────────────┬──────────────────────────────────────────────────┬──┘
             │                                                  │
┌────────────▼──────────────────────────────────────────────────▼──┐
│                    Database Layer (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────────┤
│  users (staff registration)  │ patient_workflow (audit trail)    │
│  patients (status tracking)  │ medical_info (department notes)   │
│  departments                 │ notifications (alerts)            │
│  admin_accounts              │ issue_reports                     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Transfer Flow**:
1. Staff clicks transfer button on patient details or list
2. Transfer dialog opens showing current and destination departments
3. Staff selects destination and optional notes
4. System retrieves staff info from session
5. API call to `/api/workflow/transfer` with patient_id, to_department_id, transferred_by, notes
6. Database creates workflow record and updates patient's current_department
7. UI updates to show new department and refreshes queue
8. Workflow history is updated on patient details page

**Reactivation Flow**:
1. Staff clicks reactivation button on discharged/inactive patient
2. Reactivation dialog opens with department selection
3. Staff selects target department and optional notes
4. System retrieves staff info from session
5. API call to `/api/workflow/reactivate` with patient_id, to_department_id, transferred_by, notes
6. Database updates patient status to "active" and creates workflow record
7. Patient appears in active patient list and assigned department queue
8. Workflow history is updated

**Admin Dashboard Flow**:
1. Global admin logs in and navigates to admin dashboard
2. Dashboard queries all workflow records across all departments
3. Calculates duration for each department visit
4. Displays financial approval status
5. Shows emergency alerts and issue reports
6. Admin can click on any activity to view patient details

## Components and Interfaces

### Frontend Components

#### 1. TransferButton Component
```typescript
interface TransferButtonProps {
  patientId: string;
  currentDepartmentId: string;
  onTransferComplete: () => void;
}

// Renders a button that opens TransferDialog
// Disabled if user lacks transfer permissions
```

#### 2. TransferDialog Component
```typescript
interface TransferDialogProps {
  patientId: string;
  currentDepartmentId: string;
  onClose: () => void;
  onTransferComplete: () => void;
}

// Shows current department and list of available departments
// Includes optional notes field
// Calls transfer API on confirmation
```

#### 3. ReactivationButton Component
```typescript
interface ReactivationButtonProps {
  patientId: string;
  patientStatus: 'active' | 'discharged' | 'inactive';
  onReactivationComplete: () => void;
}

// Renders only if patient status is 'discharged' or 'inactive'
// Opens ReactivationDialog on click
```

#### 4. ReactivationDialog Component
```typescript
interface ReactivationDialogProps {
  patientId: string;
  onClose: () => void;
  onReactivationComplete: () => void;
}

// Shows department selection for reactivation
// Includes optional notes field
// Calls reactivation API on confirmation
```

#### 5. TransferHistory Component
```typescript
interface TransferHistoryProps {
  patientId: string;
}

interface TransferRecord {
  id: string;
  transferredBy: string;
  fromDepartment: string;
  toDepartment: string;
  timestamp: Date;
  notes?: string;
  duration?: number; // in minutes
}

// Displays all transfers in chronological order
// Shows transferred_by, departments, timestamp, notes
```

#### 6. DepartmentHistory Component
```typescript
interface DepartmentHistoryProps {
  patientId: string;
}

interface DepartmentVisit {
  departmentId: string;
  departmentName: string;
  staffName: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number;
  medicalInfo: MedicalInformation;
}

interface MedicalInformation {
  drugsPrescribed: string[];
  diagnosticTests: string[];
  healthComplaints: string[];
  referrals: string[];
  notes: string;
}

// Displays complete department history with medical information
// Organized chronologically
```

#### 7. AdminDashboard Component
```typescript
interface AdminDashboardProps {
  adminRole: 'global' | 'department';
  departmentId?: string;
}

interface DashboardData {
  allTransfers: TransferRecord[];
  emergencyAlerts: EmergencyAlert[];
  issueReports: IssueReport[];
  departmentDurations: DepartmentDuration[];
  financialApprovals: FinancialApproval[];
}

// Shows all activities across departments (global) or single department
// Displays emergency alerts and issue reports
// Shows duration and financial information
```

#### 8. IssueReportButton Component
```typescript
interface IssueReportButtonProps {
  departmentId: string;
  patientId?: string;
  onReportSubmitted: () => void;
}

// Renders button to open IssueReportDialog
// Available on department queue and patient details pages
```

#### 9. IssueReportDialog Component
```typescript
interface IssueReportDialogProps {
  departmentId: string;
  patientId?: string;
  onClose: () => void;
  onSubmit: (report: IssueReportData) => void;
}

interface IssueReportData {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attachments?: File[];
}

// Form to submit issue reports
// Sends notifications to department and global admins
```

### API Endpoints

#### 1. POST /api/workflow/transfer
```typescript
Request {
  patientId: string;
  toDepartmentId: string;
  notes?: string;
  isEmergency?: boolean;
}

Response {
  success: boolean;
  workflowRecordId: string;
  message: string;
}

// Automatically captures transferred_by from session
// Creates immutable workflow record
// Updates patient's current_department
// Sends emergency notification if isEmergency=true
```

#### 2. POST /api/workflow/reactivate
```typescript
Request {
  patientId: string;
  toDepartmentId: string;
  notes?: string;
}

Response {
  success: boolean;
  workflowRecordId: string;
  message: string;
}

// Updates patient status to 'active'
// Assigns to specified department
// Creates workflow record with staff name from session
```

#### 3. GET /api/workflow/history/:patientId
```typescript
Response {
  transfers: TransferRecord[];
  reactivations: ReactivationRecord[];
  departmentVisits: DepartmentVisit[];
}

// Returns complete workflow history for patient
// Includes all transfers, reactivations, and department visits
```

#### 4. GET /api/admin/dashboard
```typescript
Query {
  departmentId?: string; // if not provided, returns all departments
  startDate?: Date;
  endDate?: Date;
}

Response {
  allTransfers: TransferRecord[];
  emergencyAlerts: EmergencyAlert[];
  issueReports: IssueReport[];
  departmentDurations: DepartmentDuration[];
  financialApprovals: FinancialApproval[];
}

// Returns dashboard data for global or department admin
// Filters by department if departmentId provided
```

#### 5. POST /api/admin/register
```typescript
Request {
  name: string;
  email: string;
  password: string;
  role: 'global' | 'department';
  departmentId?: string; // required if role='department'
}

Response {
  success: boolean;
  adminId: string;
  message: string;
}

// Creates new admin account
// Sends confirmation notification
```

#### 6. POST /api/notifications/emergency
```typescript
Request {
  patientId: string;
  departmentId: string;
  description: string;
}

Response {
  success: boolean;
  notificationId: string;
}

// Sends emergency notification to all admins
// Creates workflow record
```

#### 7. POST /api/issues/report
```typescript
Request {
  departmentId: string;
  patientId?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attachments?: File[];
}

Response {
  success: boolean;
  reportId: string;
}

// Creates issue report
// Sends notifications to department and global admins
// Creates workflow record
```

#### 8. POST /api/medical-info/update
```typescript
Request {
  patientId: string;
  departmentId: string;
  drugsPrescribed?: string[];
  diagnosticTests?: string[];
  healthComplaints?: string[];
  referrals?: string[];
  notes?: string;
}

Response {
  success: boolean;
  medicalInfoId: string;
}

// Updates medical information for current department visit
// Associates with current department visit
// Immutable after patient leaves department
```

## Data Models

### Database Schema

#### users table (extended)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  role ENUM('staff', 'department_admin', 'global_admin') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### patients table (extended)
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status ENUM('active', 'discharged', 'inactive') DEFAULT 'active',
  current_department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### patient_workflow table (extended)
```sql
CREATE TABLE patient_workflow (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  action_type ENUM('transfer', 'reactivation', 'emergency_alert', 'issue_report') NOT NULL,
  transferred_by UUID NOT NULL REFERENCES users(id),
  from_department_id UUID REFERENCES departments(id),
  to_department_id UUID REFERENCES departments(id),
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- immutable: no updates allowed after creation
  CONSTRAINT immutable_workflow CHECK (created_at = created_at)
);
```

#### medical_info table (new)
```sql
CREATE TABLE medical_info (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  department_visit_id UUID NOT NULL REFERENCES department_visits(id),
  drugs_prescribed TEXT[],
  diagnostic_tests TEXT[],
  health_complaints TEXT[],
  referrals TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  is_locked BOOLEAN DEFAULT false, -- locked when patient leaves department
  CONSTRAINT immutable_after_lock CHECK (is_locked = false OR updated_at IS NULL)
);
```

#### department_visits table (new)
```sql
CREATE TABLE department_visits (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  staff_id UUID NOT NULL REFERENCES users(id),
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### admin_accounts table (new)
```sql
CREATE TABLE admin_accounts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('global', 'department') NOT NULL,
  department_id UUID REFERENCES departments(id),
  created_by UUID NOT NULL REFERENCES admin_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notifications table (new)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  type ENUM('emergency_alert', 'issue_report', 'admin_registration') NOT NULL,
  recipient_id UUID NOT NULL REFERENCES admin_accounts(id),
  patient_id UUID REFERENCES patients(id),
  department_id UUID REFERENCES departments(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### issue_reports table (new)
```sql
CREATE TABLE issue_reports (
  id UUID PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES departments(id),
  patient_id UUID REFERENCES patients(id),
  reported_by UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Staff Name Auto-Capture
*For any* transfer action initiated by a staff member, the workflow record created SHALL contain the staff member's name from the session, and this name SHALL match the authenticated user's name.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Transfer Creates Immutable Record
*For any* patient transfer, a workflow record SHALL be created with all required fields (transferred_by, from_department, to_department, timestamp, notes), and this record SHALL NOT be modifiable or deletable after creation.
**Validates: Requirements 5.3, 5.5**

### Property 3: Reactivation Status Update
*For any* patient with status "discharged" or "inactive", when reactivation is performed, the patient's status SHALL be changed to "active" and SHALL remain "active" until another status change occurs.
**Validates: Requirements 4.3, 7.1**

### Property 4: Department Queue Consistency
*For any* department queue, after a patient is transferred out, that patient SHALL no longer appear in the queue, and the queue SHALL only contain patients with current_department_id matching the queue's department.
**Validates: Requirements 6.5, 6.1**

### Property 5: Transfer History Completeness
*For any* patient, the transfer history displayed SHALL include all transfers from the patient_workflow table for that patient, ordered chronologically, with all required fields (transferred_by, from_department, to_department, timestamp, notes) present.
**Validates: Requirements 5.1, 5.2**

### Property 6: Reactivation Button Visibility
*For any* patient with status "discharged" or "inactive", the reactivation button SHALL be visible on both the patient details page and patient list, and SHALL NOT be visible for patients with status "active".
**Validates: Requirements 4.1, 4.2**

### Property 7: Transfer Button Visibility
*For any* patient with status "active", the transfer button SHALL be visible on both the patient details page and patient list, and SHALL NOT be visible for patients with status "discharged" or "inactive".
**Validates: Requirements 3.1, 3.2**

### Property 8: Session-Based Authorization
*For any* transfer or reactivation action, if the session is invalid or the staff member is not authenticated, the action SHALL fail with an error message and no workflow record SHALL be created.
**Validates: Requirements 8.2, 8.3, 8.4**

### Property 9: Department History Chronological Order
*For any* patient, the department history displayed SHALL show all department visits in chronological order by entry_time, with each visit containing all required fields (department name, staff name, entry time, exit time, duration, medical information).
**Validates: Requirements 13.1, 13.2, 13.5**

### Property 10: Medical Information Preservation
*For any* patient transfer, all medical information (drugs prescribed, diagnostic tests, health complaints, referrals, notes) from the previous department SHALL be preserved and accessible in the department history after the transfer.
**Validates: Requirements 14.2, 14.4**

### Property 11: Medical Information Immutability
*For any* medical information record associated with a department visit, once the patient leaves that department (exit_time is set), the medical information SHALL NOT be modifiable.
**Validates: Requirements 14.5**

### Property 12: Admin Dashboard Access Control
*For any* global admin, the dashboard SHALL display all transfers, emergency alerts, and issue reports across all departments, while department admins SHALL only see data for their assigned department.
**Validates: Requirements 9.1, 9.5**

### Property 13: Emergency Notification Delivery
*For any* transfer marked as emergency, a notification SHALL be sent to all global admins and the relevant department admin, and the notification SHALL include patient name, department, staff member name, and emergency description.
**Validates: Requirements 11.1, 11.2**

### Property 14: Issue Report Notification
*For any* issue report submitted, notifications SHALL be sent to both the department admin and global admin, and an issue_reports record SHALL be created with all required fields (description, severity, reported_by, timestamp).
**Validates: Requirements 12.4, 12.5**

### Property 15: Reactivated Patient List Inclusion
*For any* patient that is reactivated, when the patients page is filtered to show "active" status, that patient SHALL appear in the list with their updated status and assigned department.
**Validates: Requirements 7.2, 7.4**

### Property 16: Duration Calculation Accuracy
*For any* department visit with both entry_time and exit_time set, the duration_minutes field SHALL equal the difference between exit_time and entry_time in minutes.
**Validates: Requirements 9.3**

### Property 17: Admin Registration Validation
*For any* new admin registration, all required fields (name, email, password, role) SHALL be validated, and if any field is invalid or missing, the registration SHALL fail with an appropriate error message.
**Validates: Requirements 10.3**

### Property 18: Transfer Dialog Department Display
*For any* transfer dialog opened for a patient, the current department SHALL be displayed and the list of available destination departments SHALL include all departments except the current one.
**Validates: Requirements 3.4**

### Property 19: Reactivation Department Assignment
*For any* reactivation action, the patient SHALL be assigned to the department specified during reactivation, and this assignment SHALL be reflected in the patient's current_department_id.
**Validates: Requirements 7.3**

### Property 20: Workflow Record Completeness
*For any* workflow record created (transfer, reactivation, emergency alert, or issue report), all required fields SHALL be present and non-null: action_type, patient_id, transferred_by, timestamp, and action-specific fields.
**Validates: Requirements 2.3, 4.5, 5.4**

## Error Handling

### Transfer Errors
- **Invalid patient ID**: Return 404 with message "Patient not found"
- **Invalid department ID**: Return 400 with message "Department not found"
- **Missing session**: Return 401 with message "Authentication required"
- **Insufficient permissions**: Return 403 with message "You do not have permission to transfer patients"
- **Patient already in destination**: Return 400 with message "Patient is already in this department"

### Reactivation Errors
- **Invalid patient ID**: Return 404 with message "Patient not found"
- **Patient already active**: Return 400 with message "Patient is already active"
- **Invalid department ID**: Return 400 with message "Department not found"
- **Missing session**: Return 401 with message "Authentication required"

### Admin Registration Errors
- **Email already exists**: Return 400 with message "Email already registered"
- **Invalid role**: Return 400 with message "Invalid admin role"
- **Missing required fields**: Return 400 with message "Missing required fields: name, email, password, role"
- **Insufficient permissions**: Return 403 with message "Only global admins can register new admins"

### Issue Report Errors
- **Invalid department ID**: Return 400 with message "Department not found"
- **Invalid severity level**: Return 400 with message "Invalid severity level"
- **Missing description**: Return 400 with message "Issue description is required"
- **Missing session**: Return 401 with message "Authentication required"

## Testing Strategy

### Unit Testing Approach
- Test individual components in isolation (TransferButton, ReactivationButton, etc.)
- Test API endpoints with mock data
- Test error handling for all error scenarios
- Test form validation for admin registration and issue reports
- Test database constraints and immutability rules

### Property-Based Testing Approach
- Use a property-based testing library (e.g., fast-check for TypeScript, Hypothesis for Python)
- Generate random patients, staff members, departments, and transfers
- Verify properties hold across all generated inputs
- Run minimum 100 iterations per property test
- Each property test references a specific design property

### Test Coverage Areas
1. **Transfer Functionality**: Verify transfers create records, update departments, and capture staff names
2. **Reactivation Functionality**: Verify reactivations update status and create records
3. **History Display**: Verify transfer and department history display correctly
4. **Admin Dashboard**: Verify dashboard shows correct data for global and department admins
5. **Notifications**: Verify emergency alerts and issue reports send notifications
6. **Medical Information**: Verify medical information is preserved and immutable
7. **Access Control**: Verify role-based access restrictions
8. **Data Integrity**: Verify workflow records are immutable and complete

### Integration Testing
- Test complete transfer flow from UI to database
- Test complete reactivation flow from UI to database
- Test admin dashboard with multiple departments and transfers
- Test notification delivery for emergency alerts and issue reports
- Test medical information tracking across multiple departments
