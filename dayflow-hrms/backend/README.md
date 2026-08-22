# DAYFLOW HRMS - Backend (Spring Boot 3)

Enterprise Human Resource Management System backend built with Spring Boot 3, Spring Security, Spring Data JPA, JWT Authentication, and MySQL.

---

## Key Features

1. **Layered Architecture**: Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Database.
2. **Security & Role-Based Access Control**:
   - `ROLE_EMPLOYEE` and `ROLE_HR_ADMIN`.
   - BCrypt password hashing.
   - JWT stateless token validation on all secured endpoints.
3. **Attendance Engine**:
   - Check-in / Check-out with worked hour tallying.
   - **Leave Conflict Invariant**: Immediate check-in is blocked if an approved leave is active today. Prompts an Early Return workflow.
   - **Manual Override**: HR can manually correct attendance with full audit trails (`manuallyOverridden`, `overrideReason`, `overriddenBy`, `overriddenAt`).
4. **Leave Management & Approval Console**:
   - Supports `PAID`, `SICK`, and `UNPAID` leave types.
   - Overlap validations and auto-attendance marking on approval.
5. **Early Return / Recall Workflow**:
   - Handles the edge case where an employee on approved leave returns early to work.
   - Adjusts leave records and unblocks attendance upon HR approval.
6. **Payroll & Loss of Pay (LOP) Engine**:
   - Computes: $\text{Daily Salary} = \frac{\text{Gross Pay}}{\text{Days in Month}}$.
   - Computes: $\text{LOP Deduction} = \text{Daily Salary} \times \text{Unpaid Leave Days}$.
   - Computes: $\text{Final Salary} = \text{Gross Pay} - \text{Tax} - \text{PF} - \text{LOP Deduction}$.
   - Prevents accidental duplicate payroll runs per month unless forced.
7. **Email Notification Service**:
   - SMTP JavaMailSender with development fallback logging.
8. **Audit Logging**:
   - Tracks all sensitive actions (logins, overrides, approvals, salary adjustments).

---

## REST Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register employee account
- `POST /api/auth/login` - Login & obtain JWT
- `POST /api/auth/verify-email` - Verify email token
- `GET /api/auth/me` - Get current session
- `POST /api/auth/logout` - Logout

### Employee Self-Service (`/api/employees`, `/api/attendance`, `/api/leaves`, `/api/payroll`)
- `GET /api/employees/me/profile` - View profile
- `PUT /api/employees/me/profile` - Update phone, address, photo
- `POST /api/attendance/check-in` - Clock in
- `POST /api/attendance/check-out` - Clock out
- `GET /api/attendance/me/today` - Today's status summary
- `GET /api/attendance/me` - Attendance history
- `GET /api/attendance/me/calendar` - Calendar view data
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/me` - My leave applications
- `PUT /api/leaves/{id}` - Modify pending leave
- `POST /api/leaves/{id}/withdraw` - Withdraw pending leave
- `POST /api/early-return` - Request early return from approved leave
- `GET /api/early-return/me` - My early return requests
- `GET /api/payroll/me` - My payroll history
- `GET /api/payroll/me/{month}/payslip` - Detailed payslip

### HR Admin Console (`/api/admin/**`)
- `GET /api/admin/employees` - All employees with optional department filter
- `GET /api/admin/employees/{id}` - Employee details
- `PUT /api/admin/employees/{id}` - Full profile & salary override
- `GET /api/admin/attendance` - Company-wide attendance records
- `POST /api/admin/attendance/override` - Manual attendance override
- `GET /api/admin/leaves` - All leave applications queue
- `POST /api/admin/leaves/{id}/approve` - Approve leave application
- `POST /api/admin/leaves/{id}/reject` - Reject leave application
- `GET /api/admin/early-return` - All early return requests
- `POST /api/admin/early-return/{id}/approve` - Approve early return
- `POST /api/admin/early-return/{id}/reject` - Reject early return
- `GET /api/admin/payroll` - Global payroll records
- `POST /api/admin/payroll/run` - Process monthly payroll
- `POST /api/admin/payroll/recalculate/{userId}/{month}` - Recalculate single payroll
- `GET /api/admin/payroll/salary/{userId}` - View employee salary structure
- `PUT /api/admin/payroll/salary/{userId}` - Update salary structure
- `GET /api/admin/payroll/payslip/{userId}/{month}` - Admin view payslip
- `GET /api/admin/reports/attendance-compliance` - Compliance metrics
- `GET /api/admin/reports/leave-summary` - Leave distribution metrics
- `GET /api/admin/reports/payroll-summary` - Payroll cost breakdown
- `GET /api/admin/audit-logs` - System audit trail

---

## How to Run

### Prerequisites
- JDK 17 or higher
- MySQL Server 8.0 (Running on localhost:3306 or configured in env)

### Build & Run
```bash
cd dayflow-hrms/backend
mvn spring-boot:run
```
