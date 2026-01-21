# Implementation Tasks: Department Transfer and Patient Reactivation System

## Phase 1: Database Schema and Backend Setup

### 1.1 Extend Database Schema
- [ ] Create migration to add `department_id` and `role` columns to `auth_users` table
- [ ] Create migration to add `status` column to `patients` table (enum: active, discharged, inactive)
- [ ] Create `department_visits` table with columns: id, patient_id, department_id, staff_id, entry_time, exit_time, duration_minutes
- [ ] Create `medical_info` table with columns: id, patient_id, department_id, department_visit_id, drugs_prescribed, diagnostic_tests, health_complaints, referrals, notes, is_locked
- [ ] Create `admin_accounts` table with columns: id, name, email, password_hash, role, department_id, created_by, is_active
- [ ] Create `notifications` table with columns: id, type, recipient_id, patient_id, department_id, title, message, is_read
- [ ] Create `issue_reports` table with columns: id, department_id, patient_id, reported_by, description, severity, status
- [ ] Add immutability constraint to `patient_workflow` table

### 1.2 Create API Endpoint: POST /api/workflow/transfer
- [ ] Extract staff information from session (name, id, department_id)
- [ ] Validate patient_id and to_department_id
- [ ] Check if patient exists and is not already in destination department
- [ ] Update patient's current_department_id
- [ ] Create workflow record with transferred_by from session
- [ ] Return success response with workflow record ID
- [ ] Handle errors: invalid patient, invalid department, missing session, insufficient permissions

### 1.3 Create API Endpoint: POST /api/workflow/reactivate
- [ ] Extract staff information from session
- [ ] Validate patient_id and to_department_id
- [ ] Check if patient status is "discharged" or "inactive"
- [ ] Update patient status to "active"
- [ ] Assign patient to specified department
- [ ] Create workflow record with action_type="reactivation"
- [ ] Return success response with workflow record ID
- [ ] Handle errors: invalid patient, patient already active, invalid department, missing session

### 1.4 Create API Endpoint: GET /api/workflow/history/:patientId
- [ ] Query all workflow records for patient
- [ ] Query all department visits for patient
- [ ] Query all medical information for patient
- [ ] Combine and return complete history
- [ ] Order chronologically by timestamp
- [ ] Include all required fields: transferred_by, from_department, to_department, timestamp, notes, duration, medical_info

### 1.5 Create API Endpoint: GET /api/admin/dashboard
- [ ] Accept optional departmentId query parameter
- [ ] If departmentId provided, filter to that department only
- [ ] Query all workflow records (global or filtered)
- [ ] Query all emergency alerts
- [ ] Query all issue reports
- [ ] Calculate duration for each department visit
- [ ] Query financial approval status
- [ ] Return dashboard data object
- [ ] Implement role-based access control (global admin sees all, department admin sees only their department)

### 1.6 Create API Endpoint: POST /api/admin/register
- [ ] Validate required fields: name, email, password, role
- [ ] Check if email already exists
- [ ] Hash password using argon2
- [ ] Create admin account record
- [ ] Send confirmation notification
- [ ] Return success response with admin ID
- [ ] Handle errors: email exists, invalid role, missing fields, insufficient permissions

### 1.7 Create API Endpoint: POST /api/notifications/emergency
- [ ] Extract staff information from session
- [ ] Validate patient_id and department_id
- [ ] Create notification record for all global admins
- [ ] Create notification record for department admin
- [ ] Create workflow record with action_type="emergency_alert"
- [ ] Return success response
- [ ] Handle errors: invalid patient, invalid department, missing session

### 1.8 Create API Endpoint: POST /api/issues/report
- [ ] Extract staff information from session
- [ ] Validate department_id and severity level
- [ ] Validate description is not empty
- [ ] Create issue_reports record
- [ ] Create notifications for department admin and global admin
- [ ] Create workflow record with action_type="issue_report"
- [ ] Handle file attachments if provided
- [ ] Return success response with report ID
- [ ] Handle errors: invalid department, invalid severity, missing description, missing session

### 1.9 Create API Endpoint: POST /api/medical-info/update
- [ ] Extract staff information from session
- [ ] Validate patient_id and department_id
- [ ] Get current department visit for patient
- [ ] Update medical_info record for current visit
- [ ] Prevent updates if patient has left department (exit_time is set)
- [ ] Return success response
- [ ] Handle errors: invalid patient, invalid department, patient already left, missing session

## Phase 2: Frontend Components

### 2.1 Create TransferButton Component
- [ ] Accept props: patientId, currentDepartmentId, onTransferComplete
- [ ] Render button with transfer icon
- [ ] Disable button if user lacks transfer permissions
- [ ] Open TransferDialog on click
- [ ] Handle loading state during transfer
- [ ] Show success/error messages

### 2.2 Create TransferDialog Component
- [ ] Accept props: patientId, currentDepartmentId, onClose, onTransferComplete
- [ ] Display current department name
- [ ] Fetch and display list of available departments (excluding current)
- [ ] Include optional notes textarea
- [ ] Include optional "Mark as Emergency" checkbox
- [ ] Call transfer API on confirmation
- [ ] Show loading state during API call
- [ ] Show error messages if transfer fails
- [ ] Close dialog on success and call onTransferComplete

### 2.3 Create ReactivationButton Component
- [ ] Accept props: patientId, patientStatus, onReactivationComplete
- [ ] Only render if patientStatus is "discharged" or "inactive"
- [ ] Render button with reactivation icon
- [ ] Open ReactivationDialog on click
- [ ] Handle loading state during reactivation
- [ ] Show success/error messages

### 2.4 Create ReactivationDialog Component
- [ ] Accept props: patientId, onClose, onReactivationComplete
- [ ] Display patient name and current status
- [ ] Fetch and display list of available departments
- [ ] Include optional notes textarea
- [ ] Call reactivation API on confirmation
- [ ] Show loading state during API call
- [ ] Show error messages if reactivation fails
- [ ] Close dialog on success and call onReactivationComplete

### 2.5 Create TransferHistory Component
- [ ] Accept props: patientId
- [ ] Fetch transfer history from API
- [ ] Display transfers in chronological order
- [ ] Show: transferred_by, from_department, to_department, timestamp, notes
- [ ] Calculate and display duration for each transfer
- [ ] Handle loading and error states
- [ ] Show empty state if no transfers

### 2.6 Create DepartmentHistory Component
- [ ] Accept props: patientId
- [ ] Fetch department history from API
- [ ] Display visits in chronological order
- [ ] Show: department name, staff name, entry time, exit time, duration
- [ ] Display medical information for each visit: drugs, tests, complaints, referrals, notes
- [ ] Handle loading and error states
- [ ] Show empty state if no visits

### 2.7 Create AdminDashboard Component
- [ ] Accept props: adminRole, departmentId (optional)
- [ ] Fetch dashboard data from API
- [ ] Display all transfers with staff name, departments, timestamp
- [ ] Display emergency alerts with patient name, department, description
- [ ] Display issue reports with severity, description, status
- [ ] Show department durations and financial approval status
- [ ] Implement filtering by date range
- [ ] Implement filtering by department (for global admins)
- [ ] Handle loading and error states
- [ ] Make rows clickable to view patient details

### 2.8 Create IssueReportButton Component
- [ ] Accept props: departmentId, patientId (optional), onReportSubmitted
- [ ] Render button with report icon
- [ ] Open IssueReportDialog on click
- [ ] Handle loading state
- [ ] Show success/error messages

### 2.9 Create IssueReportDialog Component
- [ ] Accept props: departmentId, patientId (optional), onClose, onSubmit
- [ ] Include description textarea
- [ ] Include severity dropdown (low, medium, high, critical)
- [ ] Include optional file attachment input
- [ ] Call issue report API on submission
- [ ] Show loading state during API call
- [ ] Show error messages if submission fails
- [ ] Close dialog on success and call onSubmit

## Phase 3: Update Existing Components

### 3.1 Update Patient Details Page
- [ ] Add TransferButton component in Quick Actions section
- [ ] Add ReactivationButton component in Quick Actions section (conditional on status)
- [ ] Add TransferHistory component below Quick Actions
- [ ] Add DepartmentHistory component below Transfer History
- [ ] Add IssueReportButton component in header or Quick Actions
- [ ] Fetch and display staff name who transferred patient (from latest workflow record)
- [ ] Handle loading and error states for new components

### 3.2 Update Patient List Page
- [ ] Add Transfer button to each patient row (conditional on status)
- [ ] Add Reactivation button to each patient row (conditional on status)
- [ ] Implement inline transfer dialog (or navigate to details page)
- [ ] Implement inline reactivation dialog (or navigate to details page)
- [ ] Refresh patient list after transfer or reactivation
- [ ] Show success/error messages

### 3.3 Update DepartmentQueue Component
- [ ] Add Transfer button to each patient row
- [ ] Add Reactivation button to each patient row (conditional on status)
- [ ] Implement transfer dialog with department selection
- [ ] Implement reactivation dialog with department selection
- [ ] Automatically capture staff name from session (not "System User")
- [ ] Refresh queue after transfer or reactivation
- [ ] Show success/error messages
- [ ] Add IssueReportButton to component header

### 3.4 Update Dashboard Page
- [ ] Add link to Admin Dashboard for admin users
- [ ] Add link to Department Queue for department staff
- [ ] Show current user's name and department in header
- [ ] Add logout button

### 3.5 Update Auth System
- [ ] Modify login to retrieve and store user's department_id in session
- [ ] Modify login to retrieve and store user's role in session
- [ ] Modify login to retrieve and store user's name in session
- [ ] Ensure session is available to all components and API routes

## Phase 4: Testing

### 4.1 Unit Tests for API Endpoints
- [ ] Test POST /api/workflow/transfer with valid data
- [ ] Test POST /api/workflow/transfer with invalid patient_id
- [ ] Test POST /api/workflow/transfer with invalid department_id
- [ ] Test POST /api/workflow/transfer with missing session
- [ ] Test POST /api/workflow/reactivate with valid data
- [ ] Test POST /api/workflow/reactivate with patient already active
- [ ] Test GET /api/workflow/history/:patientId returns all transfers
- [ ] Test GET /api/admin/dashboard with global admin access
- [ ] Test GET /api/admin/dashboard with department admin access
- [ ] Test POST /api/admin/register with valid data
- [ ] Test POST /api/admin/register with duplicate email
- [ ] Test POST /api/notifications/emergency sends notifications
- [ ] Test POST /api/issues/report creates report and sends notifications
- [ ] Test POST /api/medical-info/update updates medical information

### 4.2 Component Tests
- [ ] Test TransferButton renders and opens dialog
- [ ] Test TransferDialog displays departments and submits transfer
- [ ] Test ReactivationButton renders only for inactive patients
- [ ] Test ReactivationDialog displays departments and submits reactivation
- [ ] Test TransferHistory displays all transfers chronologically
- [ ] Test DepartmentHistory displays all visits with medical information
- [ ] Test AdminDashboard displays correct data for global admin
- [ ] Test AdminDashboard displays correct data for department admin
- [ ] Test IssueReportButton opens dialog
- [ ] Test IssueReportDialog submits report with severity

### 4.3 Property-Based Tests
- [ ] Property 1: Staff Name Auto-Capture - verify transferred_by matches session user
- [ ] Property 2: Transfer Creates Immutable Record - verify record cannot be modified
- [ ] Property 3: Reactivation Status Update - verify status changes to active
- [ ] Property 4: Department Queue Consistency - verify transferred patient removed from queue
- [ ] Property 5: Transfer History Completeness - verify all transfers displayed
- [ ] Property 6: Reactivation Button Visibility - verify button visible only for inactive patients
- [ ] Property 7: Transfer Button Visibility - verify button visible only for active patients
- [ ] Property 8: Session-Based Authorization - verify invalid session fails transfer
- [ ] Property 9: Department History Chronological Order - verify visits ordered by time
- [ ] Property 10: Medical Information Preservation - verify medical info preserved after transfer
- [ ] Property 11: Medical Information Immutability - verify medical info locked after patient leaves
- [ ] Property 12: Admin Dashboard Access Control - verify role-based access
- [ ] Property 13: Emergency Notification Delivery - verify notifications sent to admins
- [ ] Property 14: Issue Report Notification - verify notifications sent
- [ ] Property 15: Reactivated Patient List Inclusion - verify reactivated patient in active list
- [ ] Property 16: Duration Calculation Accuracy - verify duration calculated correctly
- [ ] Property 17: Admin Registration Validation - verify validation of required fields
- [ ] Property 18: Transfer Dialog Department Display - verify correct departments shown
- [ ] Property 19: Reactivation Department Assignment - verify patient assigned to department
- [ ] Property 20: Workflow Record Completeness - verify all required fields present

### 4.4 Integration Tests
- [ ] Test complete transfer flow from UI to database
- [ ] Test complete reactivation flow from UI to database
- [ ] Test admin dashboard with multiple departments and transfers
- [ ] Test notification delivery for emergency alerts
- [ ] Test notification delivery for issue reports
- [ ] Test medical information tracking across multiple departments
- [ ] Test patient appears in correct department queue after transfer
- [ ] Test reactivated patient appears in active patient list

## Phase 5: Deployment and Documentation

### 5.1 Database Migrations
- [ ] Create and test all database migrations
- [ ] Document migration steps
- [ ] Create rollback procedures

### 5.2 API Documentation
- [ ] Document all new API endpoints
- [ ] Include request/response examples
- [ ] Document error codes and messages
- [ ] Document authentication requirements

### 5.3 User Documentation
- [ ] Create user guide for staff on transferring patients
- [ ] Create user guide for staff on reactivating patients
- [ ] Create user guide for admins on dashboard
- [ ] Create user guide for admins on registering new admins
- [ ] Create troubleshooting guide

### 5.4 Deployment Checklist
- [ ] Run all tests and verify passing
- [ ] Run database migrations on staging
- [ ] Deploy to staging environment
- [ ] Run integration tests on staging
- [ ] Deploy to production
- [ ] Monitor for errors and issues
- [ ] Verify all features working in production
