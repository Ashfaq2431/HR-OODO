# DAYFLOW – HUMAN RESOURCE MANAGEMENT SYSTEM (HRMS)

> Enterprise Full-Stack Web Application for Human Resource Management, Attendance Tracking, Leave Workflows, Early Return Exception Reconciliation, Monthly Payroll Automation (with Loss of Pay / LOP Calculations), Executive Reporting, and Audit Trails.

---

## 1. System Architecture & Tech Stack

```
                                [ DAYFLOW HRMS ]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌─────────────────────────┐                           ┌───────────────────────────┐
│     React Frontend      │                           │    Spring Boot Backend    │
│  (Vite + React Router)  │                           │   (Java 17/21/25 + JPA)   │
└───────────┬─────────────┘                           └─────────────┬─────────────┘
            │                                                       │
            │ REST API (Bearer JWT)                                 │
            └─────────────────────────┬─────────────────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │       MySQL 8.0 Database      │
                       │ (dayflow_hrms: InnoDB Schema) │
                       └───────────────────────────────┘
```

- **Frontend**: React 18, React Router 6, Axios, Lucide React, Modern CSS Design System
- **Backend**: Java Spring Boot 3, Spring Web, Spring Security, Spring Data JPA, JavaMailSender, JJWT (HMAC-SHA256)
- **Database**: MySQL 8.0 (Normalized Relational Schema with Foreign Keys, Cascades, and Indexes)

---

## 2. Default Seed Accounts

The application automatically seeds an HR Director Administrator and 5 realistic cross-functional employees upon first startup:

| Role | Email | Password | Employee ID | Department / Designation |
|---|---|---|---|---|
| **HR Admin** | `admin@dayflow.com` | `Admin@123` | `EMP-ADMIN-001` | Human Resources / HR Director |
| **Employee** | `alex.morgan@dayflow.com` | `Emp@123` | `EMP-2026-001` | Engineering / Senior Backend Engineer |
| **Employee** | `sarah.connor@dayflow.com` | `Emp@123` | `EMP-2026-002` | Engineering / Frontend Tech Lead |
| **Employee** | `david.miller@dayflow.com` | `Emp@123` | `EMP-2026-003` | Product Design / Lead UI/UX Designer |
| **Employee** | `emily.watson@dayflow.com` | `Emp@123` | `EMP-2026-004` | Quality Assurance / QA Engineer |
| **Employee** | `michael.chen@dayflow.com` | `Emp@123` | `EMP-2026-005` | Engineering / DevOps Engineer |

---

## 3. Key Business Workflows & Invariant Rules

### 1. Attendance & Clock-In on Approved Leave (Early Return Exception Workflow)
- **Rule**: If an employee has an `APPROVED` leave for today, attempting to check in is blocked and throws an `APPROVED_LEAVE_CONFLICT` HTTP 409 exception.
- **Workflow**:
  1. The frontend catches this code and automatically opens the interactive **Early Return Modal Dialog**: *"You are currently on approved leave for today. Do you want to request an early return and check in?"*
  2. The employee clicks **"Request Check-In"** and provides a reason.
  3. An `EarlyReturnRequest` record is created (status: `PENDING`) and dispatches in-app and email alerts to HR admins.
  4. In the HR Admin Console (`/admin/early-return`), the administrator reviews the reason and clicks **"Approve & Unblock Check-In"**.
  5. The backend automatically adjusts the leave dates/recalibrates the leave record, removes the attendance block for that date, and notifies the employee.
  6. The employee can now clock in normally (status becomes `PRESENT` with timestamp).

### 2. Loss of Pay (LOP) Payroll Calculation Formula
- **Daily Rate Formula**:
  $$\text{Daily Salary} = \frac{\text{Gross Pay}}{\text{Days in Month}}$$
- **LOP Deduction Formula**:
  $$\text{LOP Deduction} = \text{Daily Salary} \times \text{Unpaid Leave Days in Billing Month}$$
- **Final Net Disbursed Salary**:
  $$\text{Final Salary} = \text{Gross Pay} - \text{Income Tax} - \text{Provident Fund (PF)} - \text{LOP Deduction}$$
- **Safety Guard**: Prevents accidental duplicate payroll runs per billing month unless the administrator explicitly triggers a recalculation.

### 3. Role-Based Field Editing Permissions
- **Employee Self-Service**: Employees can edit **only** their contact details (`phoneNumber`, `homeAddress`, `profilePictureUrl`). All compensation, job title, and department fields are strictly locked.
- **Admin Control**: HR Administrators have full override authorization to modify salary structures, compensation rates, titles, attendance overrides, and audit trails.

---

## 4. Directory Structure

```
dayflow-hrms/
├── database/
│   ├── schema.sql              # Complete MySQL DDL table schema
│   └── sample-data.sql         # Seed data for admin and 5 employees
├── backend/
│   ├── pom.xml                 # Maven configuration
│   ├── src/main/java/com/dayflow/hrms/
│   │   ├── config/             # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/         # Auth, Employee, Attendance, Leave, EarlyReturn, Payroll, Reports
│   │   ├── dto/                # Request/Response data transfer objects
│   │   ├── entity/             # JPA entity models (User, Profile, Attendance, Leave, Payroll, etc.)
│   │   ├── enums/              # System types (Role, Status, LeaveType, etc.)
│   │   ├── exception/          # GlobalExceptionHandler and custom exceptions
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JWT provider, filter, principal, user details service
│   │   ├── service/            # Business logic implementations
│   │   └── util/               # DateUtil and PayrollCalculator
│   ├── src/main/resources/
│   │   └── application.properties
│   └── src/test/java/com/dayflow/hrms/
│       └── service/            # Comprehensive unit and integration test suites
└── frontend/
    ├── package.json            # React dependencies
    ├── vite.config.js          # Vite proxy & build config
    ├── index.html
    └── src/
        ├── components/         # Attendance clock, leave modals, payroll tables, charts
        ├── context/            # AuthContext, NotificationContext
        ├── layouts/            # MainLayout, AuthLayout
        ├── pages/              # Auth, Employee, and Admin views
        ├── routes/             # AppRoutes, ProtectedRoute, EmployeeRoute, AdminRoute
        ├── services/           # Axios API modules
        └── utils/              # Formatters and constants
```

---

## 5. Quick Start Instructions

### Prerequisites
- **Java**: JDK 17+ (or JDK 25)
- **Node.js**: Node 18+ and npm
- **Database**: MySQL Server 8.0+

### Step 1: Database Setup
Execute the schema script in MySQL:
```sql
SOURCE d:/New folder/database/schema.sql;
SOURCE d:/New folder/database/sample-data.sql;
```

### Step 2: Run Backend
```bash
cd "d:/New folder/dayflow-hrms/backend"
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`.

### Step 3: Run Frontend
```bash
cd "d:/New folder/dayflow-hrms/frontend"
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 6. Verification & Automated Test Suite

Run backend test suites:
```bash
cd "d:/New folder/dayflow-hrms/backend"
mvn test
```
Tests cover:
- Authentication & JWT token security
- Attendance clock-in and duplicate prevention
- Approved leave conflict detection (`APPROVED_LEAVE_CONFLICT`)
- Early return review & leave date reconciliation
- Loss of Pay (LOP) daily salary deductions formula
