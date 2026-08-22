# DAYFLOW HRMS - Frontend (React.js + Vite)

Modern, responsive web application for DAYFLOW Human Resource Management System built with React 18, React Router 6, Axios, Lucide Icons, and clean CSS design tokens.

---

## Features

- **Role-Guarded Navigation**:
  - Employee Portal: Dashboard, Profile, Daily Clock-In/Out, Personal Calendar, Leave Applications, Early Return Requests, Monthly Payslip Viewer, In-app Notifications.
  - HR Admin Console: Workforce Directory, Full Profile Overrides, Company Attendance Inspection & Manual Overrides, Leave Approval Queue, Early Return Review, Monthly Payroll Execution & Recalculations, Executive Analytical Reports (Compliance, Leaves, Payroll Costs), Audit Logs.
- **Attendance & Leave Invariant Handling**:
  - Check-in on an approved leave day automatically triggers the interactive `EarlyReturnModal` dialog to submit an early return request for HR approval.
  - Real-time time tracker & hours logged counter.
- **Printable Payslips**:
  - High-fidelity payslip template with detailed earnings, tax/PF withholdings, and LOP (Loss of Pay) deductions.
  - Native print-to-PDF formatting.

---

## Directory Structure

```
src/
├── components/
│   ├── attendance/       # Clock-in card, early return modal, table, calendar
│   ├── common/           # Navbar, sidebar, modal, alert, badge, stat card
│   ├── leave/            # Leave application, editing, and approval modals
│   ├── payroll/          # Salary structure modal, payslip modal, payroll table
│   └── reports/          # Analytical charts (compliance, leaves, payroll)
├── context/              # AuthContext, NotificationContext
├── layouts/              # MainLayout, AuthLayout
├── pages/
│   ├── auth/             # Login, Signup, VerifyEmail
│   ├── employee/         # Dashboard, Profile, Attendance, Calendar, Leave, Payroll, Payslip, Notifications
│   └── admin/            # Dashboard, Employees, Attendance, Exceptions, Leave, Payroll, Reports, Alerts, Settings
├── routes/               # AppRoutes, EmployeeRoute, AdminRoute
├── services/             # API clients for auth, attendance, leaves, payroll, reports
└── utils/                # Date and currency formatters, constants
```

---

## Running Locally

```bash
cd dayflow-hrms/frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.
