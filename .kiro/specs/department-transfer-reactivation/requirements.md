# Requirements Document: Department Transfer and Patient Reactivation System

## Introduction

This feature enables healthcare staff to efficiently manage patient transfers between departments and reactivate discharged or inactive patients. The system automatically captures staff information from their registration, ensuring accurate workflow tracking and accountability. Staff members can transfer patients with a single click, and reactivate patients who need to return to active status, with all actions logged in the workflow history.

## Glossary

- **Staff_Member**: A registered user of the system who belongs to a specific department
- **Patient**: An individual receiving healthcare services
- **Department**: A functional unit within the healthcare facility (e.g., Reception, Vitals, Consulting Room, Lab, Pharmacy, Finance, HMO, Wards, Injection/Dressing)
- **Transfer**: The action of moving a patient from one department to another
- **Reactivation**: The action of changing a patient's status from discharged/inactive to active
- **Workflow_Record**: A log entry documenting patient transfers and status changes
- **Department_Queue**: The list of patients currently assigned to a specific department
- **Session**: The authenticated user context containing staff member information
- **Transferred_By**: The staff member who initiated the patient transfer
- **Global_Admin**: A system administrator with access to all departments and all activities
- **Department_Admin**: An administrator assigned to manage a specific department
- **Emergency_Alert**: An immediate notification sent to administrators when a critical situation is reported
- **Issue_Report**: A formal report submitted by staff to alert administrators of problems in their department
- **Department_History**: The complete record of a patient's visits to each department with medical information
- **Medical_Information**: Data associated with a department visit including drugs prescribed, diagnostic tests, health complaints, and referrals

## Requirements

### Requirement 1: Staff Registration with Department

**User Story:** As a system administrator, I want staff members to register with a specific department before accessing the app, so that the system can automatically associate their actions with their department.

#### Acceptance Criteria

1. WHEN a new staff member attempts to access the application, THE System SHALL verify that they have a registered department assignment
2. IF a staff member has no department assignment, THEN THE System SHALL prevent access and display a message directing them to register with a department
3. WHEN a staff member logs in successfully, THE System SHALL retrieve and store their department assignment in the session
4. THE Staff_Member registration record SHALL include: name, email, department_id, and registration status

### Requirement 2: Automatic Staff Name Capture During Transfer

**User Story:** As a staff member, I want my name to be automatically captured when I transfer a patient, so that I don't have to manually enter it and the system maintains accurate accountability.

#### Acceptance Criteria

1. WHEN a staff member initiates a patient transfer, THE System SHALL automatically retrieve the staff member's name from the current session
2. THE Staff_Member's name SHALL be populated in the transfer record without requiring manual input
3. WHEN the transfer is completed, THE Workflow_Record SHALL contain the staff member's name, timestamp, and transfer details
4. THE System SHALL NOT allow manual override of the staff member's name field during transfer

### Requirement 3: Transfer Button Visibility and Functionality

**User Story:** As a staff member, I want to see a prominent transfer button on patient pages, so that I can quickly transfer patients between departments.

#### Acceptance Criteria

1. WHEN viewing a patient's details page, THE System SHALL display a transfer button in a prominent location
2. WHEN viewing the patient list, THE System SHALL display a transfer button or action for each patient
3. WHEN a staff member clicks the transfer button, THE System SHALL open a transfer dialog with department selection
4. WHEN the transfer dialog is displayed, THE System SHALL show the current department and available destination departments
5. WHEN a staff member selects a destination department and confirms, THE System SHALL call the transfer API endpoint with the patient_id, to_department_id, transferred_by, and optional notes

### Requirement 4: Reactivation Button Visibility and Functionality

**User Story:** As a staff member, I want to see a reactivation button for discharged or inactive patients, so that I can quickly bring them back into active status.

#### Acceptance Criteria

1. WHEN viewing a patient with status "discharged" or "inactive", THE System SHALL display a reactivation button
2. WHEN viewing the patient list, THE System SHALL display a reactivation button for discharged or inactive patients
3. WHEN a staff member clicks the reactivation button, THE System SHALL update the patient's status to "active"
4. WHEN a patient is reactivated, THE System SHALL create a workflow record documenting the reactivation action
5. THE Reactivation workflow record SHALL include the staff member's name, timestamp, and reactivation reason (optional notes)

### Requirement 5: Transfer History and Workflow Logging

**User Story:** As a staff member, I want to see the complete transfer history of a patient, so that I can understand the patient's journey through the healthcare facility.

#### Acceptance Criteria

1. WHEN viewing a patient's details page, THE System SHALL display a transfer history section showing all previous transfers
2. WHEN displaying transfer history, THE System SHALL show: transferred_by (staff name), from_department, to_department, timestamp, and notes
3. WHEN a patient is transferred, THE System SHALL create a workflow record in the patient_workflow table
4. WHEN a patient is reactivated, THE System SHALL create a workflow record documenting the reactivation with staff name and timestamp
5. THE Workflow_Record SHALL be immutable after creation (no editing or deletion of historical records)

### Requirement 6: Department Queue Management

**User Story:** As a staff member, I want the department queue to show transfer and reactivation actions for each patient, so that I can manage patient flow efficiently.

#### Acceptance Criteria

1. WHEN viewing the DepartmentQueue component, THE System SHALL display all patients assigned to the current department
2. WHEN viewing each patient in the queue, THE System SHALL display transfer and reactivation action buttons (where applicable)
3. WHEN a patient's status is "discharged" or "inactive", THE System SHALL display the reactivation button instead of the transfer button
4. WHEN a staff member clicks transfer or reactivation from the queue, THE System SHALL perform the action and update the queue display
5. WHEN a patient is transferred out of the department, THE System SHALL remove them from the current department's queue

### Requirement 7: Active Patient List Management

**User Story:** As a staff member, I want reactivated patients to appear in the active patient list, so that I can see all patients who are currently receiving care.

#### Acceptance Criteria

1. WHEN a patient is reactivated, THE System SHALL update their status to "active"
2. WHEN viewing the patients page with active status filter, THE System SHALL include all reactivated patients in the list
3. WHEN a patient is reactivated, THE System SHALL assign them to an appropriate department (as specified during reactivation)
4. THE System SHALL display reactivated patients with their updated status and department assignment

### Requirement 8: Session-Based Staff Information

**User Story:** As a system architect, I want staff information to be reliably available from the session, so that transfer actions can automatically capture accurate staff details.

#### Acceptance Criteria

1. WHEN a staff member logs in, THE System SHALL store their name and department_id in the session
2. WHEN a transfer or reactivation action is initiated, THE System SHALL retrieve staff information from the current session
3. IF session information is unavailable, THEN THE System SHALL display an error message and prevent the transfer or reactivation action
4. THE Session data SHALL be validated on each action to ensure the staff member is still authenticated and authorized

### Requirement 9: Global Admin Dashboard and Activity Monitoring

**User Story:** As a global administrator, I want to see all activities across all departments, so that I can monitor operations and ensure compliance.

#### Acceptance Criteria

1. WHEN a global admin logs in, THE System SHALL display a dashboard showing all patient transfers across all departments
2. WHEN viewing the global admin dashboard, THE System SHALL display: transferred_by (staff name), from_department, to_department, timestamp, and transfer notes
3. WHEN viewing the global admin dashboard, THE System SHALL show the duration each patient spent in each department
4. WHEN viewing the global admin dashboard, THE System SHALL display financial approval status for each patient
5. THE Global_Admin SHALL have access to view all departments and all patient activities regardless of their own department assignment

### Requirement 10: Admin Registration and Management

**User Story:** As a global administrator, I want to register and manage other administrators, so that I can delegate administrative responsibilities.

#### Acceptance Criteria

1. WHEN a global admin accesses the admin management section, THE System SHALL display a list of registered administrators
2. WHEN a global admin clicks "Register New Admin", THE System SHALL open a form to create a new administrator account
3. WHEN registering a new admin, THE System SHALL require: name, email, password, and admin role (global or department-specific)
4. WHEN a new admin is registered, THE System SHALL send a confirmation notification to the global admin
5. THE System SHALL allow global admins to view, edit, and deactivate administrator accounts

### Requirement 11: Emergency Alerts and Notifications

**User Story:** As an administrator, I want to receive immediate notifications when an emergency is reported, so that I can respond quickly to critical situations.

#### Acceptance Criteria

1. WHEN a staff member marks a patient transfer or action as "emergency", THE System SHALL immediately send a notification to all administrators
2. WHEN an emergency notification is sent, THE System SHALL include: patient name, department, staff member name, and emergency description
3. WHEN an admin receives an emergency notification, THE System SHALL display it prominently in the admin dashboard
4. WHEN an admin clicks on an emergency notification, THE System SHALL navigate to the patient's details page with emergency context
5. THE System SHALL log all emergency alerts in the workflow history with timestamp and responding admin information

### Requirement 12: Department Issue Reporting

**User Story:** As a staff member, I want to report issues in my department, so that administrators are immediately notified and can take action.

#### Acceptance Criteria

1. WHEN a staff member is viewing the department queue or patient details, THE System SHALL display a "Report Issue" button
2. WHEN a staff member clicks "Report Issue", THE System SHALL open a form to describe the issue
3. WHEN submitting an issue report, THE System SHALL require: issue description, severity level (low, medium, high, critical), and optional attachments
4. WHEN an issue is reported, THE System SHALL immediately send a notification to the department admin and global admin
5. THE System SHALL create a workflow record documenting the issue report with staff name, timestamp, and issue details

### Requirement 13: Comprehensive Patient Department History

**User Story:** As a staff member, I want to see a complete description of what happened to a patient in each department, so that I can understand their complete medical journey.

#### Acceptance Criteria

1. WHEN viewing a patient's details page, THE System SHALL display a "Department History" section showing all departments the patient visited
2. WHEN viewing the department history, THE System SHALL display for each department: department name, staff member name, entry timestamp, exit timestamp, and duration spent
3. WHEN viewing the department history, THE System SHALL display department-specific notes including: drugs prescribed, diagnostic tests ordered, health complaints documented, and referrals made
4. WHEN a staff member adds notes or prescriptions in their department, THE System SHALL automatically associate them with that department visit
5. THE System SHALL display the complete department history in chronological order with all relevant medical information

### Requirement 14: Patient Medical Information Tracking

**User Story:** As a healthcare provider, I want to track all medical information associated with each department visit, so that I can provide comprehensive care.

#### Acceptance Criteria

1. WHEN a staff member is in a department with a patient, THE System SHALL provide fields to record: drugs prescribed, diagnostic tests ordered, health complaints, and referrals
2. WHEN a patient is transferred to another department, THE System SHALL preserve all medical information from the previous department
3. WHEN viewing a patient's complete history, THE System SHALL display all medical information organized by department visit
4. WHEN a staff member views a patient transferred from another department, THE System SHALL display the previous department's medical information
5. THE System SHALL ensure all medical information is immutable after the patient leaves the department (no editing of historical records)
